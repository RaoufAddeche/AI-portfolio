import { useCallback, useEffect, useState } from "react";
import { Check, EyeOff, Trash2, Mail, Star, FolderGit2, LogOut } from "lucide-react";

const api = (path, token, opts = {}) =>
  fetch(`/api/admin${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", "X-Admin-Token": token, ...opts.headers },
  });

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("adminToken") || "");
  const [authed, setAuthed] = useState(false);
  const [cats, setCats] = useState([]);
  const [tab, setTab] = useState("projets");
  const [error, setError] = useState("");

  const tryAuth = useCallback(async (tk) => {
    try {
      const res = await api("/check", tk);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCats(data.categories || []);
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

  const TABS = [
    { id: "projets", label: "Projets", Icon: FolderGit2 },
    { id: "avis", label: "Avis", Icon: Star },
    { id: "messages", label: "Messages", Icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line bg-surface">
        <div className="container-page flex h-16 items-center justify-between">
          <h1 className="font-semibold text-ink">Administration</h1>
          <div className="flex items-center gap-1">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  tab === id ? "bg-accent-soft text-accent" : "text-body hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} /> {label}
              </button>
            ))}
            <a href="/" className="ml-2 grid h-9 w-9 place-items-center rounded-md text-muted hover:text-ink" title="Retour au site">
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </a>
          </div>
        </div>
      </header>

      <main className="container-page py-8">
        {tab === "projets" && <Projects token={token} cats={cats} />}
        {tab === "avis" && <Reviews token={token} />}
        {tab === "messages" && <Messages token={token} />}
      </main>
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
