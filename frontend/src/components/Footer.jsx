import { Github, Linkedin, Mail } from "lucide-react";
import { SITE } from "../config.js";

const ICONS = { github: Github, linkedin: Linkedin, email: Mail };

export default function Footer({ profile, social = [] }) {
  const name = profile?.full_name || SITE.ownerName;
  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} {name}
        </p>
        <div className="flex gap-2">
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
                className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
