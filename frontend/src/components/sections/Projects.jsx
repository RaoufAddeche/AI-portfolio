import { useMemo, useState } from "react";
import { ArrowUpRight, Star, GitFork } from "lucide-react";
import { SectionHead } from "./Timeline";
import { useLang, translateCategory } from "../../i18n.jsx";
import { track } from "../../analytics.js";

const ALL = "__all__";

export default function Projects({ projects = [] }) {
  const { t, lang } = useLang();
  const [active, setActive] = useState(ALL);

  const categories = useMemo(() => {
    const order = [
      "IA Générative / LLM",
      "IA Agentique",
      "Data Science / ML",
      "Data Engineering",
      "MLOps / DevOps",
      "Application / Web",
      "Autre",
    ];
    const present = new Set(projects.map((p) => p.category).filter(Boolean));
    return [ALL, ...order.filter((c) => present.has(c))];
  }, [projects]);

  const filtered = active === ALL ? projects : projects.filter((p) => p.category === active);

  return (
    <section id="projets" className="section">
      <div className="container-page">
        <SectionHead
          overline={t("projects.overline")}
          title={t("projects.title")}
          description={t("projects.description")}
        />

        {categories.length > 2 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={
                  active === c
                    ? "rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-white"
                    : "rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-body transition-colors hover:border-accent hover:text-accent"
                }
              >
                {c === ALL ? t("projects.all") : translateCategory(c, lang)}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">
            {t("projects.empty")}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project: p, lang }) {
  const techs = (p.stack?.length ? p.stack : p.tags || []).slice(0, 4);

  return (
    <a
      href={p.github_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        track("project_click", {
          event_category: "engagement",
          event_label: p.title,
          target_type: "project",
          target_id: p.id,
        })
      }
      className="card group flex flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-ink transition-colors group-hover:text-accent">
          {p.title}
        </h3>
        <ArrowUpRight
          className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent"
          strokeWidth={1.75}
        />
      </div>

      {p.category && (
        <span className="mt-1 text-xs font-medium text-accent">
          {translateCategory(p.category, lang)}
        </span>
      )}

      {p.short_pitch && (
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-body">
          {p.short_pitch}
        </p>
      )}

      {techs.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {techs.map((tech, i) => (
            <span key={i} className="chip">
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-xs text-muted">
        {p.github_language && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {p.github_language}
          </span>
        )}
        {p.github_stars > 0 && (
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5" strokeWidth={1.75} /> {p.github_stars}
          </span>
        )}
        {p.github_forks > 0 && (
          <span className="inline-flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" strokeWidth={1.75} /> {p.github_forks}
          </span>
        )}
      </div>
    </a>
  );
}
