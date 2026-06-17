import { Briefcase, GraduationCap, Building2, Award, Dot } from "lucide-react";
import Reveal from "../Reveal";

const CAT = {
  commercial: { Icon: Briefcase, label: "Expérience" },
  formation: { Icon: GraduationCap, label: "Formation" },
  alternance: { Icon: Building2, label: "Alternance" },
  certification: { Icon: Award, label: "Certification" },
  project: { Icon: Dot, label: "Projet" },
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : null;

function period(ev) {
  const start = fmt(ev.date);
  const end = ev.end_date ? fmt(ev.end_date) : "aujourd’hui";
  return `${start} — ${end}`;
}

export default function Timeline({ events = [] }) {
  if (!events.length) return null;

  return (
    <section id="parcours" className="section bg-slate-50">
      <div className="container-page">
        <SectionHead overline="Parcours" title="De la relation client à l’ingénierie IA" />

        <ol className="relative mt-12 border-l border-line">
          {events.map((ev) => {
            const { Icon, label } = CAT[ev.category] || CAT.project;
            return (
              <li key={ev.id} className="relative ml-6 pb-10 last:pb-0">
                <span className="absolute -left-[33px] grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-accent">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-accent">
                    {label}
                  </span>
                  <span className="text-xs text-slate-400">{period(ev)}</span>
                </div>

                <h3 className="mt-1.5 text-lg font-semibold text-ink">{ev.title}</h3>
                {ev.description && (
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body">
                    {ev.description}
                  </p>
                )}

                {ev.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ev.tags.map((t, i) => (
                      <span key={i} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function SectionHead({ overline, title, description }) {
  return (
    <Reveal className="max-w-2xl">
      <p className="overline">{overline}</p>
      <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base leading-relaxed text-body">{description}</p>}
    </Reveal>
  );
}
