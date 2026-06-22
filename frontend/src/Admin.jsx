import { useCallback, useEffect, useState } from "react";
import {
  Check, EyeOff, Trash2, Mail, Star, FolderGit2, LogOut, BarChart3,
  Eye, Users, Download, MousePointerClick, MessageCircle, Clock, ChevronsDown,
  User, Layers, Milestone, Rocket, MessagesSquare, Sparkles, FileText, Share2,
} from "lucide-react";
import ProfileEditor from "./admin/ProfileEditor.jsx";
import SkillsEditor from "./admin/SkillsEditor.jsx";
import TimelineEditor from "./admin/TimelineEditor.jsx";
import CaseStudiesEditor from "./admin/CaseStudiesEditor.jsx";
import CvAssistant from "./admin/CvAssistant.jsx";
import BlogEditor from "./admin/BlogEditor.jsx";
import SocialEditor from "./admin/SocialEditor.jsx";

const api = (path, token, opts = {}) =>
  fetch(`/api/admin${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", "X-Admin-Token": token, ...opts.headers },
  });

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("adminToken") || "");
  const [authed, setAuthed] = useState(false);
  const [cats, setCats] = useState([]);
  const [tab, setTab] = useState("profil");
  const [error, setError] = useState("");

  const tryAuth = useCallback(async (raw) => {
    const tk = (raw || "").trim(); // évite l'échec si un espace/retour-ligne est collé
    try {
      const res = await api("/check", tk);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCats(data.categories || []);
      setToken(tk);
      setAuthed(true);
      setError("");
      sessionStorage.setItem("adminToken", tk);
    } catch {
      setAuthed(false);
      setError("Token invalide");
    }
  }, []);

  useEffect(() => {
    if (token) tryAuth(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg px-4">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6">
          <h1 className="text-xl font-bold text-ink">Administration</h1>
          <p className="mt-1 text-sm text-muted">Entre ton token d'admin.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              tryAuth(token);
            }}
            className="mt-4 space-y-3"
          >
            <input
              type="password"
              className="field"
              placeholder="ADMIN_TOKEN"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="btn-primary w-full">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  const GROUPS = [
    {
      label: "Contenu",
      tabs: [
        { id: "profil", label: "Profil", Icon: User },
        { id: "cv", label: "Assistant CV", Icon: Sparkles },
        { id: "competences", label: "Compétences", Icon: Layers },
        { id: "parcours", label: "Parcours", Icon: Milestone },
        { id: "cas", label: "Études de cas", Icon: Rocket },
        { id: "blog", label: "Blog", Icon: FileText },
        { id: "reseaux", label: "Réseaux", Icon: Share2 },
      ],
    },
    {
      label: "Modération",
      tabs: [
        { id: "projets", label: "Projets GitHub", Icon: FolderGit2 },
        { id: "avis", label: "Avis", Icon: Star },
        { id: "messages", label: "Messages", Icon: Mail },
        { id: "conversations", label: "Chat", Icon: MessagesSquare },
      ],
    },
    {
      label: "Statistiques",
      tabs: [{ id: "analytics", label: "Analytics", Icon: BarChart3 }],
    },
  ];
  const allTabs = GROUPS.flatMap((g) => g.tabs);
  const current = allTabs.find((t) => t.id === tab) || allTabs[0];
  const CurrentIcon = current.Icon;

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 border-b border-line bg-surface">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <h1 className="shrink-0 font-semibold text-ink">Administration</h1>
          {/* Mobile : menu déroulant groupé */}
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            className="field max-w-[60%] lg:hidden"
          >
            {GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.tabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <a href="/" className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted hover:text-ink" title="Retour au site">
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </a>
        </div>
      </header>

      <div className="container-page flex gap-8 py-8">
        {/* Desktop : barre latérale groupée */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-6">
            {GROUPS.map((g) => (
              <div key={g.label}>
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {g.label}
                </p>
                <div className="space-y-0.5">
                  {g.tabs.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        tab === id
                          ? "bg-accent-soft text-accent"
                          : "text-body hover:bg-surface-2 hover:text-ink"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-center gap-2.5">
            <CurrentIcon className="h-5 w-5 text-accent" strokeWidth={1.75} />
            <h2 className="text-lg font-semibold text-ink">{current.label}</h2>
          </div>
        {tab === "profil" && <ProfileEditor token={token} />}
        {tab === "cv" && <CvAssistant token={token} />}
        {tab === "competences" && <SkillsEditor token={token} />}
        {tab === "parcours" && <TimelineEditor token={token} />}
        {tab === "cas" && <CaseStudiesEditor token={token} />}
        {tab === "blog" && <BlogEditor token={token} />}
        {tab === "reseaux" && <SocialEditor token={token} />}
        {tab === "analytics" && <Analytics token={token} />}
        {tab === "projets" && <Projects token={token} cats={cats} />}
        {tab === "avis" && <Reviews token={token} />}
        {tab === "messages" && <Messages token={token} />}
        {tab === "conversations" && <Conversations token={token} />}
        </main>
      </div>
    </div>
  );
}

function useList(path, token) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(() => {
    setLoading(true);
    api(path, token)
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [path, token]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { items, loading, reload };
}

function Analytics({ token }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api(`/analytics?days=${days}`, token)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [days, token]);

  const fmtTime = (s) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
  const PERIODS = [
    { v: 7, label: "7 j" },
    { v: 30, label: "30 j" },
    { v: 90, label: "90 j" },
  ];

  if (loading && !data) return <p className="text-sm text-muted">Chargement…</p>;
  if (!data) return <p className="text-sm text-red-600">Impossible de charger les analytics.</p>;

  const cards = [
    { label: "Visites", value: data.sessions, Icon: Users },
    { label: "Pages vues", value: data.page_views, Icon: Eye },
    { label: "Clics projets", value: data.project_clicks, Icon: MousePointerClick },
    { label: "Téléchargements CV", value: data.cv_downloads, Icon: Download },
    { label: "Messages reçus", value: data.contacts, Icon: Mail },
    { label: "Chatbot ouvert", value: data.chat_opens, Icon: MessageCircle },
    { label: "Questions au chatbot", value: data.chat_messages, Icon: MessageCircle },
    { label: "Temps moyen / visite", value: fmtTime(data.avg_time_seconds), Icon: Clock },
    { label: "Scroll moyen", value: `${data.avg_scroll_pct} %`, Icon: ChevronsDown },
  ];

  const maxViews = Math.max(1, ...data.daily.map((d) => d.views));
  const maxClicks = Math.max(1, ...data.top_projects.map((p) => p.clicks));

  return (
    <div className="space-y-8">
      <WhoAmI token={token} />
      {/* Sélecteur de période */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Données anonymes (sans cookie), regroupées par visite.
        </p>
        <div className="flex gap-1 rounded-lg border border-line p-1">
          {PERIODS.map((p) => (
            <button
              key={p.v}
              onClick={() => setDays(p.v)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                days === p.v ? "bg-accent text-white" : "text-body hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cartes de stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-2 text-muted">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              <span className="text-xs">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Pages vues par jour */}
      <div className="card">
        <h3 className="text-sm font-semibold text-ink">Pages vues par jour</h3>
        {data.daily.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aucune donnée sur la période.</p>
        ) : (
          <div className="mt-4 flex h-40 items-end gap-1">
            {data.daily.map((d) => (
              <div key={d.day} className="group flex flex-1 flex-col items-center justify-end">
                <div
                  className="w-full rounded-t bg-accent/80 transition-colors group-hover:bg-accent"
                  style={{ height: `${(d.views / maxViews) * 100}%` }}
                  title={`${d.day} · ${d.views} vues`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top projets + référents */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-sm font-semibold text-ink">Projets les plus cliqués</h3>
          {data.top_projects.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Aucun clic pour l'instant.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {data.top_projects.map((p) => (
                <li key={p.label}>
                  <div className="flex justify-between text-sm">
                    <span className="truncate text-body">{p.label}</span>
                    <span className="ml-2 shrink-0 font-medium text-ink">{p.clicks}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(p.clicks / maxClicks) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-ink">Sources de trafic</h3>
          {data.top_referrers.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Aucune donnée sur la période.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {data.top_referrers.map((r) => (
                <li key={r.referrer} className="flex justify-between">
                  <span className="truncate text-body">{r.referrer}</span>
                  <span className="ml-2 shrink-0 font-medium text-ink">{r.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Projects({ token, cats }) {
  const { items, loading, reload } = useList("/portfolio", token);

  const update = async (id, body) => {
    await api(`/portfolio/${id}`, token, { method: "PATCH", body: JSON.stringify(body) });
    reload();
  };

  if (loading) return <p className="text-sm text-muted">Chargement…</p>;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Approuve les projets à afficher publiquement et corrige leur catégorie.
      </p>
      {items.map((p) => (
        <div key={p.id} className="card flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink">{p.title}</p>
            <p className="truncate text-xs text-muted">{p.repo}</p>
          </div>
          <select
            value={p.category || "Autre"}
            onChange={(e) => update(p.id, { category: e.target.value })}
            className="field max-w-[12rem]"
          >
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {p.status === "approved" ? (
            <button onClick={() => update(p.id, { status: "draft" })} className="btn-outline">
              <EyeOff className="h-4 w-4" strokeWidth={1.75} /> Masquer
            </button>
          ) : (
            <button onClick={() => update(p.id, { status: "approved" })} className="btn-primary">
              <Check className="h-4 w-4" strokeWidth={2} /> Approuver
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function Reviews({ token }) {
  const { items, loading, reload } = useList("/testimonials", token);
  const act = async (id, method, body) => {
    await api(`/testimonials/${id}`, token, { method, body: body ? JSON.stringify(body) : undefined });
    reload();
  };
  if (loading) return <p className="text-sm text-muted">Chargement…</p>;
  if (!items.length) return <p className="text-sm text-muted">Aucun avis pour l'instant.</p>;
  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r.id} className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-ink">
                {r.author_name}{" "}
                <span className="text-xs font-normal text-muted">
                  · {r.author_title}
                  {r.author_company ? ` @ ${r.author_company}` : ""}
                </span>
              </p>
              <p className="mt-1 text-sm text-body">“{r.quote}”</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                r.is_published ? "bg-accent-soft text-accent" : "bg-slate-100 text-muted"
              }`}
            >
              {r.is_published ? "publié" : "en attente"}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            {r.is_published ? (
              <button onClick={() => act(r.id, "PATCH", { is_published: false })} className="btn-outline">
                <EyeOff className="h-4 w-4" strokeWidth={1.75} /> Dépublier
              </button>
            ) : (
              <button onClick={() => act(r.id, "PATCH", { is_published: true })} className="btn-primary">
                <Check className="h-4 w-4" strokeWidth={2} /> Publier
              </button>
            )}
            <button onClick={() => act(r.id, "DELETE")} className="btn-ghost text-red-600">
              <Trash2 className="h-4 w-4" strokeWidth={1.75} /> Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Bandeau « ton IP » : permet de la coller dans ANALYTICS_EXCLUDE_IPS.
function WhoAmI({ token }) {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    api("/whoami", token)
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setInfo(null));
  }, [token]);
  if (!info?.ip) return null;
  return (
    <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs text-muted">
      Ton IP actuelle : <span className="font-mono text-body">{info.ip}</span>{" "}
      {info.excluded ? (
        <span className="text-accent">· exclue des stats ✓</span>
      ) : (
        <span>
          · non exclue — ajoute-la à <span className="font-mono">ANALYTICS_EXCLUDE_IPS</span> dans
          le .env pour ne plus te compter.
        </span>
      )}
    </div>
  );
}

function Conversations({ token }) {
  const { items, loading, reload } = useList("/conversations", token);
  const [hideOwner, setHideOwner] = useState(true);
  const del = async (id) => {
    await api(`/conversations/${id}`, token, { method: "DELETE" });
    reload();
  };
  if (loading) return <p className="text-sm text-muted">Chargement…</p>;
  const shown = hideOwner ? items.filter((c) => !c.is_owner) : items;
  const fmt = (d) => new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  return (
    <div className="space-y-4">
      <WhoAmI token={token} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Historique des échanges avec le chatbot ({shown.length} affiché
          {shown.length > 1 ? "s" : ""}).
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line accent-accent"
            checked={hideOwner}
            onChange={(e) => setHideOwner(e.target.checked)}
          />
          Masquer mes conversations
        </label>
      </div>
      {!shown.length ? (
        <p className="text-sm text-muted">Aucune conversation.</p>
      ) : (
        shown.map((c) => (
          <div key={c.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-muted">
                  {fmt(c.created_at)} · <span className="font-mono">{c.session_id}</span>
                  {c.is_owner && <span className="ml-2 text-accent">(toi)</span>}
                </p>
                <p className="mt-1 font-medium text-ink">{c.question}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-body">{c.answer}</p>
              </div>
              <button onClick={() => del(c.id)} className="btn-ghost shrink-0 text-red-600">
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Messages({ token }) {
  const { items, loading, reload } = useList("/contacts", token);
  const del = async (id) => {
    await api(`/contacts/${id}`, token, { method: "DELETE" });
    reload();
  };
  if (loading) return <p className="text-sm text-muted">Chargement…</p>;
  if (!items.length) return <p className="text-sm text-muted">Aucun message.</p>;
  return (
    <div className="space-y-3">
      {items.map((m) => (
        <div key={m.id} className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-ink">
                {m.name}{" "}
                <a href={`mailto:${m.email}`} className="text-xs font-normal text-accent">
                  {m.email}
                </a>
              </p>
              {m.subject && <p className="text-xs text-muted">{m.subject}</p>}
            </div>
            <button onClick={() => del(m.id)} className="btn-ghost text-red-600">
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-body">{m.message}</p>
        </div>
      ))}
    </div>
  );
}
