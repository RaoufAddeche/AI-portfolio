import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Save, ChevronDown, ChevronRight, X } from "lucide-react";

// Appel à l'API admin (toujours avec le token).
export const adminApi = (path, token, opts = {}) =>
  fetch(`/api/admin${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", "X-Admin-Token": token, ...opts.headers },
  });

// Langues éditables. Le français est la colonne de base ; en/es ont un suffixe.
export const LANGS = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

// Nom de colonne pour une langue donnée : col('title','fr')='title', col('title','en')='title_en'.
export const col = (base, lang) => (lang === "fr" ? base : `${base}_${lang}`);

export function LangSwitch({ lang, setLang }) {
  return (
    <div className="inline-flex gap-1 rounded-lg border border-line p-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
            lang === l.code ? "bg-accent text-white" : "text-body hover:text-ink"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

// Champ texte multilingue : se branche sur la colonne de la langue active.
export function I18nField({ label, base, lang, record, set, textarea, rows = 3, hint }) {
  const c = col(base, lang);
  const langLabel = LANGS.find((l) => l.code === lang)?.label;
  return (
    <Field label={`${label} · ${langLabel}`} hint={hint}>
      {textarea ? (
        <textarea
          className="field"
          rows={rows}
          value={record[c] ?? ""}
          onChange={(e) => set(c, e.target.value)}
        />
      ) : (
        <input
          className="field"
          value={record[c] ?? ""}
          onChange={(e) => set(c, e.target.value)}
        />
      )}
    </Field>
  );
}

export function TextField({ label, name, record, set, type = "text", hint }) {
  return (
    <Field label={label} hint={hint}>
      <input
        className="field"
        type={type}
        value={record[name] ?? ""}
        onChange={(e) => set(name, e.target.value)}
      />
    </Field>
  );
}

export function Toggle({ label, name, record, set }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-line accent-accent"
        checked={!!record[name]}
        onChange={(e) => set(name, e.target.checked)}
      />
      <span className="text-sm text-body">{label}</span>
    </label>
  );
}

// Liste de chaînes éditée comme un texte (un élément par ligne).
export function LinesField({ label, name, record, set, hint = "Un élément par ligne", rows = 4 }) {
  const value = Array.isArray(record[name]) ? record[name].join("\n") : "";
  return (
    <Field label={label} hint={hint}>
      <textarea
        className="field"
        rows={rows}
        value={value}
        onChange={(e) => set(name, e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
      />
    </Field>
  );
}

// Éditeur de schéma d'architecture : liste de paires { step, tech }.
export function ArchitectureField({ label, name, record, set }) {
  const steps = Array.isArray(record[name]) ? record[name] : [];
  const update = (i, key, val) => {
    const next = steps.map((s, idx) => (idx === i ? { ...s, [key]: val } : s));
    set(name, next);
  };
  const add = () => set(name, [...steps, { step: "", tech: "" }]);
  const remove = (i) => set(name, steps.filter((_, idx) => idx !== i));
  return (
    <Field label={label} hint="Chaque étape du pipeline : libellé + techno">
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="field flex-1"
              placeholder="Étape (ex : Transcription)"
              value={s.step ?? ""}
              onChange={(e) => update(i, "step", e.target.value)}
            />
            <input
              className="field flex-1"
              placeholder="Techno (ex : Deepgram)"
              value={s.tech ?? ""}
              onChange={(e) => update(i, "tech", e.target.value)}
            />
            <button type="button" onClick={() => remove(i)} className="btn-ghost text-red-600 px-2">
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ))}
        <button type="button" onClick={add} className="btn-outline text-sm">
          <Plus className="h-4 w-4" strokeWidth={2} /> Ajouter une étape
        </button>
      </div>
    </Field>
  );
}

// Bandeau de statut (succès / erreur) éphémère.
export function useFlash() {
  const [flash, setFlash] = useState(null);
  const show = useCallback((type, text) => setFlash({ type, text }), []);
  return [flash, show];
}

export function Flash({ flash }) {
  if (!flash) return null;
  return (
    <p className={`text-sm ${flash.type === "error" ? "text-red-600" : "text-accent"}`}>
      {flash.text}
    </p>
  );
}

/**
 * Liste générique CRUD (compétences, parcours, études de cas).
 * - path        : base d'API (ex : "/skills")
 * - summary(it) : rendu compact d'un élément replié
 * - Form        : composant ({ draft, set, lang }) qui rend le formulaire
 * - blank       : gabarit d'un nouvel élément
 * - intro       : phrase d'aide en tête de section
 */
export function EntityList({ token, path, summary, Form, blank, intro }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [lang, setLang] = useState("fr");
  const [flash, show] = useFlash();
  const [saving, setSaving] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    adminApi(path, token)
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [path, token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const edit = (item) => {
    setOpenId(item.id);
    setDraft({ ...item });
  };
  const close = () => {
    setOpenId(null);
    setDraft(null);
  };
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const isNew = openId === "new";
      const res = await adminApi(isNew ? path : `${path}/${openId}`, token, {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Échec de l'enregistrement");
      }
      show("ok", "Enregistré ✓");
      close();
      reload();
    } catch (e) {
      show("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer cet élément ? Cette action est définitive.")) return;
    await adminApi(`${path}/${id}`, token, { method: "DELETE" });
    if (openId === id) close();
    reload();
  };

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{intro}</p>
        <button
          onClick={() => {
            setOpenId("new");
            setDraft({ ...blank });
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" strokeWidth={2} /> Ajouter
        </button>
      </div>

      {openId === "new" && draft && (
        <div className="card border-accent/40">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Nouvel élément</h3>
            <LangSwitch lang={lang} setLang={setLang} />
          </div>
          <div className="space-y-4">
            <Form draft={draft} set={set} lang={lang} />
          </div>
          <SaveBar saving={saving} onSave={save} onCancel={close} flash={flash} />
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="card">
          <div className="flex items-start justify-between gap-3">
            <button
              onClick={() => (openId === item.id ? close() : edit(item))}
              className="flex min-w-0 flex-1 items-start gap-2 text-left"
            >
              {openId === item.id ? (
                <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              ) : (
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              )}
              <div className="min-w-0">{summary(item)}</div>
            </button>
            <button onClick={() => remove(item.id)} className="btn-ghost shrink-0 text-red-600">
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          {openId === item.id && draft && (
            <div className="mt-4 border-t border-line pt-4">
              <div className="mb-4 flex justify-end">
                <LangSwitch lang={lang} setLang={setLang} />
              </div>
              <div className="space-y-4">
                <Form draft={draft} set={set} lang={lang} />
              </div>
              <SaveBar saving={saving} onSave={save} onCancel={close} flash={flash} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SaveBar({ saving, onSave, onCancel, flash }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <button onClick={onSave} disabled={saving} className="btn-primary disabled:opacity-60">
        <Save className="h-4 w-4" strokeWidth={2} /> {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
      <button onClick={onCancel} className="btn-ghost">
        Annuler
      </button>
      <Flash flash={flash} />
    </div>
  );
}
