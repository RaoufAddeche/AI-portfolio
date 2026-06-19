import { useEffect, useState } from "react";
import { Github, Linkedin, Mail, Menu, X, Globe, Check } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useLang } from "../i18n.jsx";
import { SITE } from "../config.js";

const LINKS = [
  { href: "#etudes-de-cas", key: "nav.caseStudies" },
  { href: "#projets", key: "nav.projects" },
  { href: "#parcours", key: "nav.parcours" },
  { href: "#competences", key: "nav.skills" },
  { href: "#avis", key: "nav.testimonials" },
  { href: "#contact", key: "nav.contact" },
];

const ICONS = { github: Github, linkedin: Linkedin, email: Mail };

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

function LangToggle() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Changer de langue / Change language / Cambiar idioma"
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-body transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Globe className="h-4 w-4" strokeWidth={1.75} />
        {current.code.toUpperCase()}
      </button>

      {open && (
        <>
          {/* Capte les clics à l'extérieur pour fermer le menu */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <ul className="absolute right-0 z-50 mt-1.5 min-w-[9rem] overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg">
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-sm transition-colors hover:bg-surface-2 ${
                    l.code === lang ? "font-semibold text-accent" : "text-body hover:text-ink"
                  }`}
                >
                  {l.label}
                  {l.code === lang && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function Navbar({ name, social = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { t } = useLang();
  const initials = (name || SITE.ownerName)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled || menuOpen ? "border-line bg-surface/95 backdrop-blur" : "border-transparent bg-surface"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 font-semibold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-xs font-bold text-white">
            {initials}
          </span>
          <span className="hidden sm:inline">{name || SITE.ownerName}</span>
        </a>

        <div className="flex items-center gap-1">
          {/* Liens desktop */}
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-body transition-colors hover:text-ink"
                >
                  {t(l.key)}
                </a>
              </li>
            ))}
          </ul>
          <span className="mx-2 hidden h-5 w-px bg-line md:block" />

          {/* Réseaux : masqués sur très petit écran (dispo en footer/contact) */}
          <div className="hidden items-center gap-1 sm:flex">
            {social.map((s) => {
              const Icon = ICONS[s.platform];
              if (!Icon) return null;
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target={s.platform === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={s.display_name}
                  className="grid h-9 w-9 place-items-center rounded-md text-body transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </a>
              );
            })}
          </div>

          <LangToggle />
          <ThemeToggle />

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="grid h-9 w-9 place-items-center rounded-md text-body transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      </nav>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <div className="border-t border-line bg-surface md:hidden">
          <ul className="container-page flex flex-col py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-2 py-3 text-sm font-medium text-body transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  {t(l.key)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
