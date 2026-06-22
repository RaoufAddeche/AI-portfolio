// ─────────────────────────────────────────────────────────────────────────
//  Tracking analytics minimal et respectueux de la vie privée.
//  - Pas de cookie ni d'identifiant persistant : un id de session éphémère
//    (sessionStorage) suffit à regrouper les events d'une même visite.
//  - session_id est un UUID (la colonne analytics_events.session_id est de type
//    UUID côté Postgres) : on génère un vrai UUID v4, avec repli sans crypto.
//  - Best-effort : on n'attend pas la réponse et on n'affiche jamais d'erreur
//    au visiteur (le tracking ne doit jamais casser la page).
//  Backend : POST /api/analytics/event  (voir app/routers/analytics.py)
// ─────────────────────────────────────────────────────────────────────────

function uuidv4() {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch {
    /* secure context indispo : on retombe sur la version manuelle */
  }
  // Repli RFC-4122 v4 (suffisant pour grouper une session).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function sessionId() {
  try {
    let id = sessionStorage.getItem("sid");
    if (!id) {
      id = uuidv4();
      sessionStorage.setItem("sid", id);
    }
    return id;
  } catch {
    return uuidv4();
  }
}

// ── Opt-out : ne pas se compter soi-même ──────────────────────────────────
// Visiter ?noanalytics pose un flag persistant (localStorage) ; ?analytics le
// retire. Tant qu'il est posé, track() ne fait rien sur ce navigateur.
const OPTOUT_KEY = "analytics_optout";

export function isOptedOut() {
  try {
    const params = new URLSearchParams(location.search);
    if (params.has("noanalytics")) {
      localStorage.setItem(OPTOUT_KEY, "1");
      console.info("[analytics] désactivé pour ce navigateur (opt-out).");
    }
    if (params.has("analytics")) {
      localStorage.removeItem(OPTOUT_KEY);
      console.info("[analytics] réactivé pour ce navigateur.");
    }
    return localStorage.getItem(OPTOUT_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Envoie un événement analytics (best-effort, ne lève jamais).
 * @param {string} event_type  ex. "page_view" | "cv_download" | "contact"
 *                             | "project_click" | "chat_open" | "chat_message"
 *                             | "scroll_depth" | "time_on_page"
 * @param {object} [extra]     champs optionnels : event_category, event_label,
 *                             event_value, target_type, target_id…
 */
export function track(event_type, extra = {}) {
  try {
    if (isOptedOut()) return; // visiteur exclu (toi) : on ne compte rien
    const body = JSON.stringify({
      session_id: sessionId(),
      event_type,
      page_url: location.pathname,
      referrer_url: document.referrer || null,
      ...extra,
    });
    // sendBeacon survit à la navigation/fermeture d'onglet ; fetch en repli.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/event", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* le tracking ne doit jamais casser l'expérience */
  }
}

/**
 * Mesure l'engagement de la visite, à appeler une seule fois au chargement :
 *  - profondeur de scroll : envoie un palier (25/50/75/100 %) la 1re fois atteint ;
 *  - temps passé : envoie la durée (secondes) quand l'onglet se ferme/se masque.
 */
export function initEngagement() {
  if (typeof window === "undefined") return;
  if (isOptedOut()) return; // pas d'écouteurs si on est exclu
  const start = Date.now();

  // ── Profondeur de scroll (paliers, une seule fois chacun) ──
  const milestones = [25, 50, 75, 100];
  let sent = 0; // index du prochain palier à franchir
  const onScroll = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    const pct = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    while (sent < milestones.length && pct >= milestones[sent]) {
      track("scroll_depth", { event_value: milestones[sent], event_category: "engagement" });
      sent++;
    }
    if (sent >= milestones.length) window.removeEventListener("scroll", onScroll);
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // ── Temps passé (envoyé une fois, à la fermeture/masquage de l'onglet) ──
  let timeSent = false;
  const sendTime = () => {
    if (timeSent) return;
    timeSent = true;
    const seconds = Math.round((Date.now() - start) / 1000);
    if (seconds > 0 && seconds < 3600) {
      track("time_on_page", { event_value: seconds, event_category: "engagement" });
    }
  };
  // pagehide couvre la fermeture ; visibilitychange couvre le passage en arrière-plan (mobile).
  window.addEventListener("pagehide", sendTime);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sendTime();
  });
}
