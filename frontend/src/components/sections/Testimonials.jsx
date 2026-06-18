import { useEffect, useState } from "react";
import { Quote, Linkedin, Plus, X, Check } from "lucide-react";
import { SectionHead } from "./Timeline";
import { useLang } from "../../i18n.jsx";

export default function Testimonials({ testimonials = [] }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <section id="avis" className="section bg-surface-2">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead
            overline={t("testi.overline")}
            title={t("testi.title")}
            description={t("testi.description")}
          />
          <button onClick={() => setOpen(true)} className="btn-outline">
            <Plus className="h-4 w-4" strokeWidth={1.75} /> {t("testi.leave")}
          </button>
        </div>

        {testimonials.length === 0 ? (
          <p className="mt-10 text-sm text-muted">{t("testi.empty")}</p>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {open && <ReviewModal onClose={() => setOpen(false)} />}
    </section>
  );
}

function Card({ item }) {
  return (
    <figure className="card flex flex-col">
      <Quote className="h-6 w-6 text-accent/30" strokeWidth={1.75} />
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-body">
        “{item.quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="text-sm font-semibold text-ink">{item.author_name}</p>
          <p className="text-xs text-muted">
            {item.author_title}
            {item.author_company ? ` · ${item.author_company}` : ""}
          </p>
        </div>
        {item.author_linkedin_url && (
          <a
            href={item.author_linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-muted transition-colors hover:text-accent"
          >
            <Linkedin className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </a>
        )}
      </figcaption>
    </figure>
  );
}

function ReviewModal({ onClose }) {
  const { t } = useLang();
  const [form, setForm] = useState({
    author_name: "",
    author_title: "",
    author_company: "",
    author_linkedin_url: "",
    quote: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v.trim() || null])
      );
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        className="my-4 w-full max-w-md rounded-2xl border border-line bg-surface shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="text-lg font-semibold text-ink">{t("testi.modal_title")}</h3>
          <button
            onClick={onClose}
            aria-label={t("testi.cancel")}
            className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {status === "sent" ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent">
              <Check className="h-6 w-6" strokeWidth={2} />
            </div>
            <p className="text-sm text-body">{t("testi.thanks")}</p>
            <button onClick={onClose} className="btn-primary mt-6">
              OK
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 px-6 py-5">
            <p className="text-xs text-muted">{t("testi.modal_hint")}</p>
            <Input label={t("testi.f_name")} required value={form.author_name} onChange={update("author_name")} />
            <Input label={t("testi.f_role")} required value={form.author_title} onChange={update("author_title")} />
            <Input label={t("testi.f_company")} value={form.author_company} onChange={update("author_company")} />
            <Input
              label={t("testi.f_linkedin")}
              type="url"
              placeholder="https://www.linkedin.com/in/…"
              value={form.author_linkedin_url}
              onChange={update("author_linkedin_url")}
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">{t("testi.f_quote")}</span>
              <textarea
                className="field min-h-[110px] resize-y"
                required
                minLength={10}
                value={form.quote}
                onChange={update("quote")}
              />
            </label>
            <div className="flex items-center gap-3 pt-1">
              <button type="submit" className="btn-primary" disabled={status === "sending"}>
                {status === "sending" ? t("testi.sending") : t("testi.submit")}
              </button>
              {status === "error" && <span className="text-sm text-red-600">{t("testi.error")}</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input className="field" {...props} />
    </label>
  );
}
