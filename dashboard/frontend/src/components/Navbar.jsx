import { useEffect, useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "#etudes-de-cas", label: "Études de cas" },
  { href: "#projets", label: "Projets" },
  { href: "#parcours", label: "Parcours" },
  { href: "#competences", label: "Compétences" },
  { href: "#contact", label: "Contact" },
];

const ICONS = { github: Github, linkedin: Linkedin, email: Mail };

export default function Navbar({ name, social = [] }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = (name || "RA")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled ? "border-line bg-surface/85 backdrop-blur" : "border-transparent bg-surface"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 font-semibold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-xs font-bold text-white">
            {initials}
          </span>
          <span className="hidden sm:inline">{name || "Raouf Addeche"}</span>
        </a>

        <div className="flex items-center gap-1">
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-body transition-colors hover:text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="mx-2 hidden h-5 w-px bg-line md:block" />
          <div className="flex items-center gap-1">
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
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
