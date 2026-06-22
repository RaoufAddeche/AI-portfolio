import {
  I18nField, TextField, Toggle, LinesField, ArchitectureField, EntityList, col, LANGS,
} from "./lib.jsx";

const BLANK = {
  slug: "",
  title: "",
  subtitle: "",
  company: "",
  role: "",
  period: "",
  summary: "",
  problem: "",
  approach: "",
  architecture: [],
  stack: [],
  results: [],
  tags: [],
  display_order: 0,
  is_published: true,
};

function CaseStudyForm({ draft, set, lang }) {
  const langLabel = LANGS.find((l) => l.code === lang)?.label;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Slug (URL, sans espace)"
          name="slug"
          record={draft}
          set={set}
          hint="ex : voicebot-ia-temps-reel"
        />
        <TextField label="Entreprise" name="company" record={draft} set={set} />
        <TextField label="Rôle" name="role" record={draft} set={set} />
        <TextField label="Période" name="period" record={draft} set={set} hint="ex : 2025 — présent" />
      </div>

      <I18nField label="Titre" base="title" lang={lang} record={draft} set={set} />
      <I18nField label="Sous-titre" base="subtitle" lang={lang} record={draft} set={set} />
      <I18nField label="Résumé" base="summary" lang={lang} record={draft} set={set} textarea rows={3} />
      <I18nField label="Problème" base="problem" lang={lang} record={draft} set={set} textarea rows={3} />
      <I18nField label="Approche" base="approach" lang={lang} record={draft} set={set} textarea rows={4} />

      <LinesField
        label={`Résultats · ${langLabel}`}
        name={col("results", lang)}
        record={draft}
        set={set}
      />
      <ArchitectureField
        label={`Architecture · ${langLabel}`}
        name={col("architecture", lang)}
        record={draft}
        set={set}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <LinesField label="Stack technique" name="stack" record={draft} set={set} />
        <LinesField label="Tags" name="tags" record={draft} set={set} />
      </div>

      <div className="grid items-end gap-4 sm:grid-cols-2">
        <TextField label="Ordre d'affichage" name="display_order" type="number" record={draft} set={set} />
        <Toggle label="Publié (visible sur le site)" name="is_published" record={draft} set={set} />
      </div>
    </>
  );
}

export default function CaseStudiesEditor({ token }) {
  return (
    <EntityList
      token={token}
      path="/case-studies"
      blank={BLANK}
      Form={CaseStudyForm}
      intro="Tes projets en prod racontés en profondeur (problème → approche → résultats)."
      summary={(c) => (
        <>
          <p className="truncate font-medium text-ink">
            {c.title}
            {!c.is_published && (
              <span className="ml-2 align-middle text-xs text-muted">(brouillon)</span>
            )}
          </p>
          <p className="truncate text-xs text-muted">
            {c.company}
            {c.period ? ` · ${c.period}` : ""}
          </p>
        </>
      )}
    />
  );
}
