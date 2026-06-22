"""Édition du contenu du portfolio depuis la page /admin (protégée par ADMIN_TOKEN).

Couvre le profil/hero, les compétences (stack & savoir-faire), le parcours
(timeline) et les études de cas (« projets en prod »). Contenu trilingue :
le français vit dans les colonnes de base, l'anglais/l'espagnol dans les
colonnes `_en` / `_es` (cf. app/i18n.py). Tout est édité via une liste blanche
de colonnes par table — aucune injection de nom de colonne possible.
"""
import json
from datetime import date

import asyncpg
from fastapi import APIRouter, Depends, HTTPException

from ..db import get_db
from ..security import require_admin
from ..services import cv, llm

router = APIRouter(prefix="/api/admin", tags=["admin-content"], dependencies=[Depends(require_admin)])


def _parse_date(value):
    """Tolère 'YYYY', 'YYYY-MM' et 'YYYY-MM-DD' (le LLM peut ne connaître que l'année)."""
    if not value:
        return None
    parts = str(value).strip().split("-")
    try:
        if len(parts) == 1:
            return date(int(parts[0]), 1, 1)
        if len(parts) == 2:
            return date(int(parts[0]), int(parts[1]), 1)
        return date.fromisoformat(str(value).strip())
    except (ValueError, TypeError):
        return None


# --- Spécification des colonnes éditables par table ---------------------------
# Pour chaque table : l'ensemble des colonnes autorisées + le type de celles qui
# demandent un encodage particulier (tableaux Postgres, JSONB, dates, etc.).
class Spec:
    def __init__(self, table, columns, *, arrays=(), jsons=(), dates=(), ints=(),
                 floats=(), bools=()):
        self.table = table
        self.columns = set(columns)
        self.arrays = set(arrays)
        self.jsons = set(jsons)
        self.dates = set(dates)
        self.ints = set(ints)
        self.floats = set(floats)
        self.bools = set(bools)

    def coerce(self, col, value):
        """Convertit la valeur reçue (JSON) vers le type attendu par asyncpg."""
        if value == "":
            value = None
        if col in self.jsons:
            return json.dumps(value) if value is not None else None
        if col in self.arrays:
            return list(value) if value else []
        if col in self.dates:
            return _parse_date(value)
        if col in self.ints:
            return int(value) if value not in (None, "") else None
        if col in self.floats:
            return float(value) if value not in (None, "") else None
        if col in self.bools:
            return bool(value)
        return value

    def decode(self, row):
        """Normalise une ligne lue : JSONB -> objet Python, tableaux -> list."""
        out = dict(row)
        for col in self.jsons:
            if isinstance(out.get(col), str):
                out[col] = json.loads(out[col]) if out[col] else None
        for col in self.arrays:
            out[col] = list(out[col]) if out.get(col) else []
        return out


def _i18n(base, *langs):
    """('title', 'en', 'es') -> ['title', 'title_en', 'title_es']."""
    return [base, *(f"{base}_{lang}" for lang in langs)]


PROFILE = Spec(
    "profile",
    columns=[
        "full_name", "email", "phone", "linkedin_url", "github_url",
        "kaggle_url", "photo_url", "location",
        *_i18n("title", "en", "es"), *_i18n("bio", "en", "es"),
        *_i18n("hero_pitch", "en", "es"), *_i18n("availability", "en", "es"),
    ],
)

SKILL = Spec(
    "skills",
    columns=[
        "category", "proficiency_level", "years_experience", "description",
        "is_primary", "icon",
        *_i18n("name", "en", "es"), *_i18n("subcategory", "en", "es"),
    ],
    ints=("proficiency_level",), floats=("years_experience",), bools=("is_primary",),
)

TIMELINE = Spec(
    "timeline_events",
    columns=[
        "date", "end_date", "category", "icon", "link_url", "display_order",
        "is_highlight", "tags", "metrics",
        *_i18n("title", "en", "es"), *_i18n("description", "en", "es"),
    ],
    arrays=("tags",), jsons=("metrics",), dates=("date", "end_date"),
    ints=("display_order",), bools=("is_highlight",),
)

CASE_STUDY = Spec(
    "case_studies",
    columns=[
        "slug", "company", "role", "period", "display_order", "is_published",
        "stack", "tags",
        *_i18n("title", "en", "es"), *_i18n("subtitle", "en", "es"),
        *_i18n("summary", "en", "es"), *_i18n("problem", "en", "es"),
        *_i18n("approach", "en", "es"), *_i18n("results", "en", "es"),
        *_i18n("architecture", "en", "es"),
    ],
    arrays=("stack", "tags", "results", "results_en", "results_es"),
    jsons=("architecture", "architecture_en", "architecture_es"),
    ints=("display_order",), bools=("is_published",),
)


# --- Constructeurs SQL génériques ---------------------------------------------
def _build_update(spec, payload):
    """Construit (clause SET, valeurs) à partir des champs autorisés."""
    sets, values, i = [], [], 0
    for key, raw in payload.items():
        if key not in spec.columns:
            continue
        i += 1
        sets.append(f"{key} = ${i}")
        values.append(spec.coerce(key, raw))
    return sets, values


def _build_insert(spec, payload):
    cols, placeholders, values, i = [], [], [], 0
    for key, raw in payload.items():
        if key not in spec.columns:
            continue
        i += 1
        cols.append(key)
        placeholders.append(f"${i}")
        values.append(spec.coerce(key, raw))
    return cols, placeholders, values


async def _list(spec, conn, order):
    rows = await conn.fetch(f"SELECT * FROM {spec.table} ORDER BY {order}")
    return [spec.decode(r) for r in rows]


async def _update(spec, item_id, payload, conn):
    sets, values = _build_update(spec, payload)
    if not sets:
        raise HTTPException(status_code=400, detail="Aucun champ valide à mettre à jour")
    values.append(item_id)
    try:
        row = await conn.fetchrow(
            f"UPDATE {spec.table} SET {', '.join(sets)} WHERE id = ${len(values)} RETURNING *",
            *values,
        )
    except asyncpg.PostgresError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    if not row:
        raise HTTPException(status_code=404, detail="Introuvable")
    return spec.decode(row)


async def _create(spec, payload, conn):
    cols, placeholders, values = _build_insert(spec, payload)
    if not cols:
        raise HTTPException(status_code=400, detail="Aucun champ valide")
    try:
        row = await conn.fetchrow(
            f"INSERT INTO {spec.table} ({', '.join(cols)}) "
            f"VALUES ({', '.join(placeholders)}) RETURNING *",
            *values,
        )
    except asyncpg.PostgresError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return spec.decode(row)


async def _delete(spec, item_id, conn):
    result = await conn.execute(f"DELETE FROM {spec.table} WHERE id = $1", item_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Introuvable")
    return {"success": True}


# --- Profil (ligne unique) ----------------------------------------------------
@router.get("/profile")
async def get_profile(conn: asyncpg.Connection = Depends(get_db)):
    row = await conn.fetchrow("SELECT * FROM profile ORDER BY id LIMIT 1")
    if not row:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    return PROFILE.decode(row)


@router.put("/profile")
async def update_profile(payload: dict, conn: asyncpg.Connection = Depends(get_db)):
    sets, values = _build_update(PROFILE, payload)
    if not sets:
        raise HTTPException(status_code=400, detail="Aucun champ valide à mettre à jour")
    row = await conn.fetchrow(
        f"UPDATE profile SET {', '.join(sets)} "
        "WHERE id = (SELECT id FROM profile ORDER BY id LIMIT 1) RETURNING *",
        *values,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    return PROFILE.decode(row)


# --- Compétences --------------------------------------------------------------
@router.get("/skills")
async def list_skills(conn: asyncpg.Connection = Depends(get_db)):
    return await _list(SKILL, conn, "category, proficiency_level DESC NULLS LAST, name")


@router.post("/skills")
async def create_skill(payload: dict, conn: asyncpg.Connection = Depends(get_db)):
    return await _create(SKILL, payload, conn)


@router.patch("/skills/{item_id}")
async def update_skill(item_id: int, payload: dict, conn: asyncpg.Connection = Depends(get_db)):
    return await _update(SKILL, item_id, payload, conn)


@router.delete("/skills/{item_id}")
async def delete_skill(item_id: int, conn: asyncpg.Connection = Depends(get_db)):
    return await _delete(SKILL, item_id, conn)


# --- Parcours (timeline) ------------------------------------------------------
@router.get("/timeline")
async def list_timeline(conn: asyncpg.Connection = Depends(get_db)):
    return await _list(TIMELINE, conn, "date ASC, display_order ASC")


@router.post("/timeline")
async def create_timeline(payload: dict, conn: asyncpg.Connection = Depends(get_db)):
    return await _create(TIMELINE, payload, conn)


@router.patch("/timeline/{item_id}")
async def update_timeline(item_id: int, payload: dict, conn: asyncpg.Connection = Depends(get_db)):
    return await _update(TIMELINE, item_id, payload, conn)


@router.delete("/timeline/{item_id}")
async def delete_timeline(item_id: int, conn: asyncpg.Connection = Depends(get_db)):
    return await _delete(TIMELINE, item_id, conn)


# --- Études de cas (projets en prod) ------------------------------------------
@router.get("/case-studies")
async def list_case_studies(conn: asyncpg.Connection = Depends(get_db)):
    return await _list(CASE_STUDY, conn, "display_order ASC, created_at DESC")


@router.post("/case-studies")
async def create_case_study(payload: dict, conn: asyncpg.Connection = Depends(get_db)):
    return await _create(CASE_STUDY, payload, conn)


@router.patch("/case-studies/{item_id}")
async def update_case_study(item_id: int, payload: dict, conn: asyncpg.Connection = Depends(get_db)):
    return await _update(CASE_STUDY, item_id, payload, conn)


@router.delete("/case-studies/{item_id}")
async def delete_case_study(item_id: int, conn: asyncpg.Connection = Depends(get_db)):
    return await _delete(CASE_STUDY, item_id, conn)


# --- Assistant CV : extraction LLM + déduplication -----------------------------
async def _existing(conn, table, column):
    rows = await conn.fetch(f"SELECT {column} AS v FROM {table}")
    return {(r["v"] or "").strip().lower() for r in rows}


@router.post("/cv/analyze")
async def cv_analyze(conn: asyncpg.Connection = Depends(get_db)):
    """Lit le CV, en extrait compétences/parcours/projets via le LLM, et ne renvoie
    que les éléments ABSENTS de la base (suggestions à valider)."""
    cv_text = await cv.get_cv_text()
    if not cv_text:
        raise HTTPException(status_code=503, detail="CV introuvable ou illisible (cv.pdf)")
    try:
        data = await llm.extract_cv_data(cv_text)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Échec de l'analyse LLM : {exc}") from exc

    skill_names = await _existing(conn, "skills", "name")
    timeline_titles = await _existing(conn, "timeline_events", "title")
    cs_slugs = await _existing(conn, "case_studies", "slug")
    cs_titles = await _existing(conn, "case_studies", "title")

    def _new(items, key, seen):
        out = []
        for it in items:
            val = (it.get(key) or "").strip().lower()
            if val and val not in seen:
                out.append(it)
                seen.add(val)  # évite les doublons internes à la réponse LLM
        return out

    skills = _new(data["skills"], "name", set(skill_names))
    timeline = _new(data["timeline"], "title", set(timeline_titles))
    case_studies = [
        cs for cs in data["case_studies"]
        if (cs.get("slug") or "").strip().lower() not in cs_slugs
        and (cs.get("title") or "").strip().lower() not in cs_titles
    ]
    return {
        "skills": skills,
        "timeline": timeline,
        "case_studies": case_studies,
        "counts": {
            "skills": len(skills),
            "timeline": len(timeline),
            "case_studies": len(case_studies),
        },
    }


@router.post("/cv/apply")
async def cv_apply(payload: dict, conn: asyncpg.Connection = Depends(get_db)):
    """Insère les suggestions cochées. Chaque élément est tenté indépendamment."""
    specs = {"skills": SKILL, "timeline": TIMELINE, "case_studies": CASE_STUDY}
    added, errors = {}, []
    for kind, spec in specs.items():
        added[kind] = 0
        for item in payload.get(kind, []):
            cols, placeholders, values = _build_insert(spec, item)
            if not cols:
                continue
            try:
                await conn.execute(
                    f"INSERT INTO {spec.table} ({', '.join(cols)}) "
                    f"VALUES ({', '.join(placeholders)})",
                    *values,
                )
                added[kind] += 1
            except asyncpg.PostgresError as exc:
                errors.append({"kind": kind, "item": item.get("name") or item.get("title"),
                               "error": str(exc)})
    return {"added": added, "errors": errors}
