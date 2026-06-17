import { useState } from "react";
import { Github, Linkedin, Mail, MapPin, Send, Check } from "lucide-react";

const ICONS = { github: Github, linkedin: Linkedin, email: Mail };

export default function Contact({ profile, social = [] }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container-page grid gap-12 lg:grid-cols-2">
        {/* Colonne gauche */}
        <div>
          <p className="overline">Contact</p>
          <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">Travaillons ensemble</h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-body">
            Une opportunité, une mission ou simplement envie d’échanger sur l’IA et la data ?
            Écrivez-moi, je réponds rapidement.
          </p>

          <div className="mt-8 space-y-3 text-sm">
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-3 text-body transition-colors hover:text-ink"
              >
                <Mail className="h-4 w-4 text-accent" strokeWidth={1.75} />
                {profile.email}
              </a>
            )}
            {profile?.location && (
              <p className="flex items-center gap-3 text-body">
                <MapPin className="h-4 w-4 text-accent" strokeWidth={1.75} />
                {profile.location}
                {profile.availability ? ` · ${profile.availability}` : ""}
              </p>
            )}
          </div>

          <div className="mt-6 flex gap-2">
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
                  className="grid h-10 w-10 place-items-center rounded-md border border-line text-body transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={submit} className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Nom</span>
              <input className="field" required value={form.name} onChange={update("name")} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
              <input
                type="email"
                className="field"
                required
                value={form.email}
                onChange={update("email")}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Sujet</span>
            <input className="field" value={form.subject} onChange={update("subject")} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Message</span>
            <textarea
              className="field min-h-[120px] resize-y"
              required
              value={form.message}
              onChange={update("message")}
            />
          </label>

          <div className="flex items-center gap-4">
            <button type="submit" className="btn-primary" disabled={status === "sending"}>
              {status === "sent" ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={2} /> Envoyé
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" strokeWidth={1.75} />
                  {status === "sending" ? "Envoi…" : "Envoyer"}
                </>
              )}
            </button>
            {status === "error" && (
              <span className="text-sm text-red-600">Une erreur est survenue, réessayez.</span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
