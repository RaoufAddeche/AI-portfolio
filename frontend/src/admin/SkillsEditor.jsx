import { I18nField, TextField, Toggle, Field, EntityList } from "./lib.jsx";

const BLANK = {
  name: "",
  category: "technical",
  subcategory: "",
  proficiency_level: 4,
  years_experience: null,
  description: "",
  icon: "",
  is_primary: false,
};

function SkillForm({ draft, set, lang }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <I18nField label="Nom" base="name" lang={lang} record={draft} set={set} />
        <I18nField
          label="Sous-catégorie"
          base="subcategory"
          lang={lang}
          record={draft}
          set={set}
          hint="ex : machine-learning, cloud, communication"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Catégorie" hint="technical · business · soft · tools">
          <input
            className="field"
            list="skill-categories"
            value={draft.category ?? ""}
            onChange={(e) => set("category", e.target.value)}
          />
          <datalist id="skill-categories">
            <option value="technical" />
            <option value="business" />
            <option value="soft" />
            <option value="tools" />
          </datalist>
        </Field>
        <TextField
          label="Niveau (1–5)"
          name="proficiency_level"
          type="number"
          record={draft}
          set={set}
        />
        <TextField
          label="Années d'expérience"
          name="years_experience"
          type="number"
          record={draft}
          set={set}
        />
      </div>
      <TextField label="Icône (nom lucide, optionnel)" name="icon" record={draft} set={set} />
      <Field label="Description (optionnel)">
        <textarea
          className="field"
          rows={2}
          value={draft.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>
      <Toggle label="Compétence mise en avant (primary)" name="is_primary" record={draft} set={set} />
    </>
  );
}

export default function SkillsEditor({ token }) {
  return (
    <EntityList
      token={token}
      path="/skills"
      blank={BLANK}
      Form={SkillForm}
      intro="Ton stack et tes savoir-faire, regroupés par catégorie sur le site."
      summary={(s) => (
        <>
          <p className="truncate font-medium text-ink">
            {s.name}
            {s.is_primary && <span className="ml-2 align-middle text-xs text-accent">★</span>}
          </p>
          <p className="truncate text-xs text-muted">
            {s.category}
            {s.subcategory ? ` · ${s.subcategory}` : ""}
            {s.proficiency_level ? ` · niveau ${s.proficiency_level}/5` : ""}
          </p>
        </>
      )}
    />
  );
}
