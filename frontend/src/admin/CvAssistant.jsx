import { useState } from "react";
import { Sparkles, Plus, Check, RefreshCw } from "lucide-react";
import { adminApi } from "./lib.jsx";

const SECTIONS = [
  {
    key: "skills",
    title: "Compétences",
    label: (s) => s.name,
    sub: (s) =>
      [s.category, s.subcategory, s.proficiency_level && `niveau ${s.proficiency_level}/5`]
        .filter(Boolean)
        .join(" · "),
  },
  {
    key: "timeline",
    title: "Parcours & certifications",
    label: (t) => t.title,
    sub: (t) =>
      [t.category, t.date && `${t.date}${t.end_date ? ` → ${t.end_date}` : ""}`]
        .filter(Boolean)
        .join(" · "),
  },
  {
    key: "case_studies",
    title: "Projets (études de cas)",
    label: (c) => c.title,
    sub: (c) => [c.company, c.period].filter(Boolean).join(" · "),
  },
];

export default function CvAssistant({ token }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // { skills, timeline, case_studies, counts }
  const [sel, setSel] = useState({}); // { skills: Set, timeline: Set, case_studies: Set }
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [done, setDone] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError("");
    setDone(null);
    try {
      const res = await adminApi("/cv/analyze", token, { method: "POST" });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail || "Échec de l'analyse");
      }
      const d = await res.json();
      setData(d);
      // tout coché par défaut
      setSel({
        skills: new Set(d.skills.map((_, i) => i)),
        timeline: new Set(d.timeline.map((_, i) => i)),
        case_studies: new Set(d.case_studies.map((_, i) => i)),
      });
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key, i) =>
    setSel((s) => {
      const next = new Set(s[key]);
      next.has(i) ? next.delete(i) : next.add(i);
      return { ...s, [key]: next };
    });

  const totalSelected = SECTIONS.reduce((n, { key }) => n + (sel[key]?.size || 0), 0);

  const apply = async () => {
    setApplying(true);
    setError("");
    try {
      const payload = {};
      for (const { key } of SECTIONS) {
        payload[key] = data[key].filter((_, i) => sel[key]?.has(i));
      }
      const res = await adminApi("/cv/apply", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Échec de l'ajout");
      setDone(await res.json());
      setData(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setApplying(false);
    }
  };

  const empty = data && data.counts.skills + data.counts.timeline + data.counts.case_studies === 0;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
          <div className="flex-1">
            <h3 className="font-semibold text-ink">Assistant CV</h3>
            <p className="mt-1 text-sm text-muted">
              Analyse ton CV (cv.pdf) et te propose les compétences, expériences,
              certifications et projets <strong>absents</strong> du portfolio. Rien n'est
              ajouté sans ta validation. Le niveau des compétences est estimé — à ajuster.
            </p>
          </div>
          <button onClick={analyze} disabled={loading} className="btn-primary shrink-0 disabled:opacity-60">
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            )}
            {loading ? "Analyse…" : "Analyser mon CV"}
          </button>
        </div>
        {loading && (
          <p className="mt-3 text-xs text-muted">
            Le LLM lit ton CV, ça peut prendre quelques secondes…
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {done && (
        <div className="card border-accent/40">
          <p className="flex items-center gap-2 font-medium text-ink">
            <Check className="h-4 w-4 text-accent" strokeWidth={2} /> Ajouté :{" "}
            {done.added.skills} compétence(s), {done.added.timeline} étape(s) de parcours,{" "}
            {done.added.case_studies} projet(s).
          </p>
          {done.errors?.length > 0 && (
            <p className="mt-2 text-xs text-red-600">
              {done.errors.length} élément(s) non ajouté(s) (déjà présents ou invalides).
            </p>
          )}
          <p className="mt-2 text-xs text-muted">
            Va dans les onglets Compétences / Parcours / Études de cas pour peaufiner.
          </p>
        </div>
      )}

      {empty && (
        <p className="text-sm text-muted">
          Rien de nouveau à proposer — ton CV est déjà bien couvert ✓
        </p>
      )}

      {data && !empty && (
        <>
          {SECTIONS.map(({ key, title, label, sub }) =>
            data[key].length === 0 ? null : (
              <div key={key} className="card">
                <h3 className="mb-3 text-sm font-semibold text-ink">
                  {title} <span className="text-muted">({data[key].length})</span>
                </h3>
                <ul className="space-y-2">
                  {data[key].map((item, i) => (
                    <li key={i}>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 shrink-0 rounded border-line accent-accent"
                          checked={sel[key]?.has(i) || false}
                          onChange={() => toggle(key, i)}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-ink">{label(item)}</span>
                          {sub(item) && <span className="block text-xs text-muted">{sub(item)}</span>}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}

          <div className="sticky bottom-4 flex items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-sm">
            <button
              onClick={apply}
              disabled={applying || totalSelected === 0}
              className="btn-primary disabled:opacity-60"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              {applying ? "Ajout…" : `Ajouter la sélection (${totalSelected})`}
            </button>
            <button onClick={analyze} className="btn-ghost" disabled={applying}>
              Ré-analyser
            </button>
          </div>
        </>
      )}
    </div>
  );
}
