import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { adminApi, I18nField, TextField, LangSwitch, Flash, useFlash, UploadButton } from "./lib.jsx";

export default function ProfileEditor({ token }) {
  const [draft, setDraft] = useState(null);
  const [lang, setLang] = useState("fr");
  const [saving, setSaving] = useState(false);
  const [flash, show] = useFlash();

  useEffect(() => {
    adminApi("/profile", token)
      .then((r) => r.json())
      .then(setDraft)
      .catch(() => setDraft(null));
  }, [token]);

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await adminApi("/profile", token, {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Échec de l'enregistrement");
      }
      setDraft(await res.json());
      show("ok", "Profil enregistré ✓");
    } catch (e) {
      show("error", e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!draft) return <p className="text-sm text-muted">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          La phrase d'accroche du portfolio (« hero »), la bio et les coordonnées.
        </p>
        <LangSwitch lang={lang} setLang={setLang} />
      </div>

      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-ink">Accroche & présentation</h3>
        <I18nField label="Titre" base="title" lang={lang} record={draft} set={set} />
        <I18nField
          label="Phrase d'accroche (hero)"
          base="hero_pitch"
          lang={lang}
          record={draft}
          set={set}
          textarea
          rows={3}
        />
        <I18nField label="Bio" base="bio" lang={lang} record={draft} set={set} textarea rows={5} />
        <I18nField
          label="Disponibilité"
          base="availability"
          lang={lang}
          record={draft}
          set={set}
          hint="ex : « Mobilité France & International »"
        />
      </div>

      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-ink">Identité & coordonnées</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nom complet" name="full_name" record={draft} set={set} />
          <TextField label="Localisation" name="location" record={draft} set={set} />
          <TextField label="Email" name="email" type="email" record={draft} set={set} />
          <TextField label="Téléphone" name="phone" record={draft} set={set} />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-ink">Liens</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="LinkedIn" name="linkedin_url" record={draft} set={set} />
          <TextField label="GitHub" name="github_url" record={draft} set={set} />
          <TextField label="Kaggle" name="kaggle_url" record={draft} set={set} />
          <TextField label="Photo (URL)" name="photo_url" record={draft} set={set} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <UploadButton
            token={token}
            kind="photo"
            accept="image/*"
            label="Téléverser une photo"
            onUploaded={(url) => set("photo_url", url)}
          />
          {draft.photo_url && (
            <img src={draft.photo_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
          )}
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-ink">CV (PDF)</h3>
        <p className="text-xs text-muted">
          Le CV téléversé alimente le bouton « Télécharger le CV » et la base de
          connaissance du chatbot.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { kind: "cv_fr", field: "cv_url_fr", label: "CV français" },
            { kind: "cv_en", field: "cv_url_en", label: "CV anglais" },
            { kind: "cv_es", field: "cv_url_es", label: "CV espagnol" },
          ].map(({ kind, field, label }) => (
            <div key={kind} className="space-y-2">
              <span className="block text-xs font-medium text-muted">{label}</span>
              <UploadButton
                token={token}
                kind={kind}
                accept="application/pdf"
                label="Téléverser le PDF"
                onUploaded={(url) => set(field, url)}
              />
              {draft[field] && (
                <a href={draft[field]} target="_blank" rel="noreferrer" className="block text-xs text-accent">
                  Voir le fichier actuel
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
          <Save className="h-4 w-4" strokeWidth={2} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <Flash flash={flash} />
      </div>
    </div>
  );
}
