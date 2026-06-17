import { Briefcase, GraduationCap, Building2, Award, Dot } from "lucide-react";
import Reveal from "../Reveal";

const CAT = {
  commercial: { Icon: Briefcase },
  alternance: { Icon: Building2 },
  formation: { Icon: GraduationCap },
  certification: { Icon: Award },
  project: { Icon: Dot },
};

// On NE mélange PAS : expérience pro / formation / certifications sont distinctes.
const GROUPS = [
  { title: "Expérience professionnelle", cats: ["alternance", "commercial"] },
  { title: "Formation", cats: ["formation"] },
  { title: "Certifications", cats: ["certification"] },
];

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : null;

function period(ev) {
  const start = fmt(ev.date);
  const end = ev.end_date ? fmt(ev.end_date) : "aujourd’hui";
  return `${start} — ${end}`;
}

export default function Timeline({ events = [] }) {
  if (!events.length) return null;

  const byGroup = GROUPS.map((g) => ({
    ...g,
    items: events
      .filter((e) => g.cats.includes(e.category))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
  })).filter((g) => g.items.length > 0);

  const experience = byGroup.filter((g) => g.title === "Expérience professionnelle");
  const rest = byGroup.filter((g) => g.title !== "Expérience professionnelle");

  return (
    <section id="parcours" className="section bg-surface-2">
      <div className="container-page">
        <SectionHead overline="Parcours" title="De la relation client à l’ingénierie IA" />

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            {experience.map((g) => (
              <Group key={g.title} group={g} />
            ))}
          </div>
          <div className="space-y-10">
            {rest.map((g) => (
              <Group key={g.title} group={g} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Group({ group }) {
  return (
    <Reveal>
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
        {group.title}
      </h3>
      <ol className="relative mt-5 border-l border-line">
        {group.items.map((ev) => {
          const { Icon } = CAT[ev.category] || CAT.project;
          return (
            <li key={ev.id} className="relative ml-6 pb-8 last:pb-0">
              <span className="absolute -left-[33px] grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-accent">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="text-xs text-muted">{period(ev)}</span>
              <h4 className="mt-1 text-base font-semibold text-ink">{ev.title}</h4>
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
    </Reveal>
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
