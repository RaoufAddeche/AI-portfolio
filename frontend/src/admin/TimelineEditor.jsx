import { I18nField, TextField, Toggle, Field, LinesField, EntityList } from "./lib.jsx";

const CATEGORIES = ["commercial", "formation", "alternance", "certification", "project"];

const BLANK = {
  date: "",
  end_date: null,
  title: "",
  description: "",
  category: "alternance",
  icon: "",
  link_url: "",
  tags: [],
  display_order: 0,
  is_highlight: false,
};

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { year: "numeric", month: "short" });
}

function TimelineForm({ draft, set, lang }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Date de début" name="date" type="date" record={draft} set={set} />
        <TextField
          label="Date de fin (optionnel)"
          name="end_date"
          type="date"
          record={draft}
          set={set}
        />
      </div>
      <I18nField label="Titre" base="title" lang={lang} record={draft} set={set} />
      <I18nField
        label="Description"
        base="description"
        lang={lang}
        record={draft}
        set={set}
        textarea
        rows={3}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Catégorie">
          <select
            className="field"
            value={draft.category ?? ""}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <TextField label="Icône (optionnel)" name="icon" record={draft} set={set} />
        <TextField
          label="Ordre d'affichage"
          name="display_order"
          type="number"
          record={draft}
          set={set}
        />
      </div>
      <TextField label="Lien (optionnel)" name="link_url" record={draft} set={set} />
      <LinesField label="Tags" name="tags" record={draft} set={set} rows={3} />
      <Toggle label="Étape mise en avant (highlight)" name="is_highlight" record={draft} set={set} />
    </>
  );
}

export default function TimelineEditor({ token }) {
  return (
    <EntityList
      token={token}
      path="/timeline"
      blank={BLANK}
      Form={TimelineForm}
      intro="Ton parcours : expériences, formations, certifications…"
      summary={(t) => (
        <>
          <p className="truncate font-medium text-ink">
            {t.title}
            {t.is_highlight && <span className="ml-2 align-middle text-xs text-accent">★</span>}
          </p>
          <p className="truncate text-xs text-muted">
            {fmtDate(t.date)}
            {t.end_date ? ` → ${fmtDate(t.end_date)}` : ""} · {t.category}
          </p>
        </>
      )}
    />
  );
}
