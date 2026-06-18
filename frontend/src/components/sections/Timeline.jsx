import { Briefcase, GraduationCap, Building2, Award, Dot } from "lucide-react";
import Reveal from "../Reveal";
import { useLang } from "../../i18n.jsx";

const CAT = {
  commercial: { Icon: Briefcase },
  alternance: { Icon: Building2 },
  formation: { Icon: GraduationCap },
  certification: { Icon: Award },
  project: { Icon: Dot },
};

// On NE mélange PAS : expérience pro / formation / certifications sont distinctes.
const GROUPS = [
  { id: "experience", key: "timeline.experience", cats: ["alternance", "commercial"] },
  { id: "formation", key: "timeline.formation", cats: ["formation"] },
  { id: "certifications", key: "timeline.certifications", cats: ["certification"] },
];

const fmt = (d, lang) =>
  d ? new Date(d).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { month: "short", year: "numeric" }) : null;

export default function Timeline({ events = [] }) {
  const { t, lang } = useLang();
  if (!events.length) return null;

  const byGroup = GROUPS.map((g) => ({
    ...g,
    items: events
      .filter((e) => g.cats.includes(e.category))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
  })).filter((g) => g.items.length > 0);

  const experience = byGroup.filter((g) => g.id === "experience");
  const rest = byGroup.filter((g) => g.id !== "experience");

  return (
    <section id="parcours" className="section bg-surface-2">
      <div className="container-page">
        <SectionHead overline={t("timeline.overline")} title={t("timeline.title")} />

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            {experience.map((g) => (
              <Group key={g.id} group={g} t={t} lang={lang} />
            ))}
          </div>
          <div className="space-y-10">
            {rest.map((g) => (
              <Group key={g.id} group={g} t={t} lang={lang} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Group({ group, t, lang }) {
  const today = t("timeline.today");
  return (
    <Reveal>
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
        {t(group.key)}
      </h3>
      <ol className="relative mt-5 border-l border-line">
        {group.items.map((ev) => {
          const { Icon } = CAT[ev.category] || CAT.project;
          const span = `${fmt(ev.date, lang)} — ${ev.end_date ? fmt(ev.end_date, lang) : today}`;
          return (
            <li key={ev.id} className="relative ml-6 pb-8 last:pb-0">
              <span className="absolute -left-[33px] grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-accent">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="text-xs text-muted">{span}</span>
              <h4 className="mt-1 text-base font-semibold text-ink">{ev.title}</h4>
              {ev.description && (
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body">
                  {ev.description}
                </p>
              )}
              {ev.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {ev.tags.map((tag, i) => (
                    <span key={i} className="chip">
                      {tag}
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
