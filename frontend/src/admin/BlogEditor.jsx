import { TextField, Toggle, Field, LinesField, EntityList } from "./lib.jsx";

const BLANK = {
  title: "",
  slug: "",
  category: "tutorial",
  excerpt: "",
  content: "",
  tags: [],
  keywords: [],
  cover_image_url: "",
  read_time_minutes: null,
  published_at: null,
  is_published: false,
  is_featured: false,
};

function BlogForm({ draft, set }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Titre" name="title" record={draft} set={set} />
        <TextField label="Slug (URL)" name="slug" record={draft} set={set} hint="ex : apprendre-le-ml" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Catégorie" hint="tutorial · case_study · opinion · technical">
          <input
            className="field"
            list="blog-categories"
            value={draft.category ?? ""}
            onChange={(e) => set("category", e.target.value)}
          />
          <datalist id="blog-categories">
            <option value="tutorial" />
            <option value="case_study" />
            <option value="opinion" />
            <option value="technical" />
          </datalist>
        </Field>
        <TextField label="Temps de lecture (min)" name="read_time_minutes" type="number" record={draft} set={set} />
        <TextField label="Date de publication" name="published_at" type="date" record={draft} set={set} />
      </div>
      <Field label="Extrait (résumé / SEO)">
        <textarea className="field" rows={2} value={draft.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} />
      </Field>
      <Field label="Contenu (Markdown)">
        <textarea className="field font-mono text-xs" rows={14} value={draft.content ?? ""} onChange={(e) => set("content", e.target.value)} />
      </Field>
      <TextField label="Image de couverture (URL)" name="cover_image_url" record={draft} set={set} />
      <div className="grid gap-4 sm:grid-cols-2">
        <LinesField label="Tags" name="tags" record={draft} set={set} />
        <LinesField label="Mots-clés (SEO)" name="keywords" record={draft} set={set} />
      </div>
      <div className="flex flex-wrap gap-6">
        <Toggle label="Publié" name="is_published" record={draft} set={set} />
        <Toggle label="Mis en avant" name="is_featured" record={draft} set={set} />
      </div>
    </>
  );
}

export default function BlogEditor({ token }) {
  return (
    <EntityList
      token={token}
      path="/blog"
      blank={BLANK}
      Form={BlogForm}
      i18n={false}
      intro="Tes articles de blog (Markdown). Non publié = brouillon invisible sur le site."
      summary={(p) => (
        <>
          <p className="truncate font-medium text-ink">
            {p.title || "(sans titre)"}
            {!p.is_published && <span className="ml-2 align-middle text-xs text-muted">(brouillon)</span>}
            {p.is_featured && <span className="ml-2 align-middle text-xs text-accent">★</span>}
          </p>
          <p className="truncate text-xs text-muted">
            {p.category}
            {p.read_time_minutes ? ` · ${p.read_time_minutes} min` : ""}
          </p>
        </>
      )}
    />
  );
}
