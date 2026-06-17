import { SectionHead } from "./Timeline";
import { useLang } from "../../i18n.jsx";

export default function Skills({ skills = [] }) {
  const { t } = useLang();
  if (!skills.length) return null;

  // Regroupe par sous-catégorie en conservant l'ordre d'arrivée.
  const groups = [];
  const index = new Map();
  for (const s of skills) {
    const key = s.subcategory || s.category || "Autres";
    if (!index.has(key)) {
      index.set(key, groups.length);
      groups.push({ key, items: [] });
    }
    groups[index.get(key)].items.push(s);
  }

  return (
    <section id="competences" className="section bg-surface-2">
      <div className="container-page">
        <SectionHead
          overline={t("skills.overline")}
          title={t("skills.title")}
          description={t("skills.description")}
        />

        <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.key}>
              <h3 className="text-sm font-semibold text-ink">{g.key}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <span
                    key={s.id}
                    className={
                      s.is_primary
                        ? "inline-flex items-center rounded-md border border-accent/30 bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
                        : "chip"
                    }
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
