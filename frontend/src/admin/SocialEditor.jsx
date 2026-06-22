import { TextField, Toggle, Field, EntityList } from "./lib.jsx";

const BLANK = {
  platform: "",
  url: "",
  display_name: "",
  icon: "",
  display_order: 0,
  is_active: true,
};

function SocialForm({ draft, set }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Plateforme" hint="linkedin · github · twitter · kaggle · medium…">
          <input
            className="field"
            list="social-platforms"
            value={draft.platform ?? ""}
            onChange={(e) => set("platform", e.target.value)}
          />
          <datalist id="social-platforms">
            <option value="linkedin" />
            <option value="github" />
            <option value="twitter" />
            <option value="kaggle" />
            <option value="medium" />
          </datalist>
        </Field>
        <TextField label="Nom affiché" name="display_name" record={draft} set={set} />
      </div>
      <TextField label="URL" name="url" record={draft} set={set} hint="https://…" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Icône (optionnel)" name="icon" record={draft} set={set} />
        <TextField label="Ordre d'affichage" name="display_order" type="number" record={draft} set={set} />
      </div>
      <Toggle label="Actif (visible sur le site)" name="is_active" record={draft} set={set} />
    </>
  );
}

export default function SocialEditor({ token }) {
  return (
    <EntityList
      token={token}
      path="/social"
      blank={BLANK}
      Form={SocialForm}
      i18n={false}
      intro="Tes liens (LinkedIn, GitHub…) affichés dans le pied de page et le contact."
      summary={(s) => (
        <>
          <p className="truncate font-medium text-ink">
            {s.platform}
            {!s.is_active && <span className="ml-2 align-middle text-xs text-muted">(masqué)</span>}
          </p>
          <p className="truncate text-xs text-muted">{s.url}</p>
        </>
      )}
    />
  );
}
