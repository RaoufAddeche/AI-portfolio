import { useEffect, useState } from "react";
import { ArrowRight, X, Check, ChevronRight } from "lucide-react";
import { SectionHead } from "./Timeline";

export default function CaseStudies({ studies = [] }) {
  const [selected, setSelected] = useState(null);

  // Bloque le scroll du body quand le modal est ouvert.
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  if (!studies.length) return null;

  return (
    <section id="etudes-de-cas" className="section">
      <div className="container-page">
        <SectionHead
          overline="Études de cas"
          title="Des projets en production, racontés"
          description="Le contexte, l’architecture et les résultats — au-delà du dépôt de code."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {studies.map((cs) => (
            <button
              key={cs.id}
              onClick={() => setSelected(cs)}
              className="card group text-left"
            >
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                {cs.company && <span className="font-medium text-accent">{cs.company}</span>}
                {cs.period && <span>· {cs.period}</span>}
              </div>
              <h3 className="mt-2 text-xl font-semibold text-ink group-hover:text-accent">
                {cs.title}
              </h3>
              {cs.subtitle && <p className="mt-1 text-sm text-body">{cs.subtitle}</p>}
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-body">{cs.summary}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {cs.tags.slice(0, 4).map((t, i) => (
                  <span key={i} className="chip">
                    {t}
                  </span>
                ))}
              </div>

              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                Lire l’étude de cas
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {selected && <CaseModal study={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

function CaseModal({ study, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="my-4 w-full max-w-2xl rounded-2xl border border-line bg-surface shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="sticky top-0 flex items-start justify-between gap-4 rounded-t-2xl border-b border-line bg-surface/90 px-6 py-5 backdrop-blur">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
              {study.company && <span className="font-medium text-accent">{study.company}</span>}
              {study.role && <span>· {study.role}</span>}
              {study.period && <span>· {study.period}</span>}
            </div>
            <h3 className="mt-1 text-2xl font-bold text-ink">{study.title}</h3>
            {study.subtitle && <p className="mt-1 text-sm text-body">{study.subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="space-y-8 px-6 py-7">
          {study.problem && <Block label="Le problème" text={study.problem} />}
          {study.approach && <Block label="L’approche" text={study.approach} />}

          {study.architecture?.length > 0 && (
            <div>
              <p className="overline mb-4">Architecture</p>
              <div className="flex flex-col gap-2">
                {study.architecture.map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg border border-line bg-surface-2 px-4 py-3">
                      <p className="text-sm font-medium text-ink">{a.step}</p>
                      {a.tech && <p className="mt-0.5 text-xs text-accent">{a.tech}</p>}
                    </div>
                    {i < study.architecture.length - 1 && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted" strokeWidth={2} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {study.results?.length > 0 && (
            <div>
              <p className="overline mb-4">Résultats</p>
              <ul className="space-y-2.5">
                {study.results.map((r, i) => (
                  <li key={i} className="flex gap-3 text-sm text-body">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {study.stack?.length > 0 && (
            <div>
              <p className="overline mb-3">Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {study.stack.map((t, i) => (
                  <span key={i} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Block({ label, text }) {
  return (
    <div>
      <p className="overline mb-2">{label}</p>
      <p className="text-sm leading-relaxed text-body">{text}</p>
    </div>
  );
}
