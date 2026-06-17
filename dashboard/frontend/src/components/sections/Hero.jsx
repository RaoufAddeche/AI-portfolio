import { ArrowRight, Download, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { useLang } from "../../i18n.jsx";

export default function Hero({ profile, loading }) {
  const { t, lang } = useLang();
  if (loading || !profile) return <HeroSkeleton />;

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <section id="top" className="section pt-14 md:pt-20">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
        {/* Texte */}
        <div className="animate-fade-up">
          <p className="overline mb-5">{profile.title}</p>

          <h1 className="text-4xl font-bold leading-[1.08] text-ink sm:text-5xl md:text-6xl">
            {profile.full_name}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-body">
            {profile.hero_pitch}
          </p>

          {/* Faits clés */}
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-body">
            {profile.location && (
              <li className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" strokeWidth={1.75} />
                {profile.location}
              </li>
            )}
            <li className="inline-flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-accent" strokeWidth={1.75} />
              {t("hero.fact_role")}
            </li>
            <li className="inline-flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-accent" strokeWidth={1.75} />
              {t("hero.fact_school")}
            </li>
          </ul>

          {/* CTA */}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#projets" className="btn-primary">
              {t("hero.cta_projects")} <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </a>
            <a href={`/cv-raouf-addeche-${lang}.pdf`} download className="btn-outline">
              <Download className="h-4 w-4" strokeWidth={1.75} /> {t("hero.cta_cv")}
            </a>
            <a href="#contact" className="btn-ghost">
              {t("hero.cta_contact")}
            </a>
          </div>
        </div>

        {/* Portrait / monogramme */}
        <div className="hidden justify-self-end lg:block">
          <div className="relative h-72 w-72 overflow-hidden rounded-2xl border border-line bg-accent-soft">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center">
                <span className="text-7xl font-bold tracking-tight text-accent/80">
                  {initials}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <section className="section pt-14 md:pt-20">
      <div className="container-page max-w-2xl space-y-5">
        <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />
        <div className="h-14 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-20 w-full animate-pulse rounded bg-surface-2" />
        <div className="flex gap-3">
          <div className="h-11 w-40 animate-pulse rounded-md bg-surface-2" />
          <div className="h-11 w-32 animate-pulse rounded-md bg-surface-2" />
        </div>
      </div>
    </section>
  );
}
