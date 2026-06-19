// ─────────────────────────────────────────────────────────────────────────
//  Tracking analytics minimal et respectueux de la vie privée.
//  - Pas de cookie ni d'identifiant persistant : un id de session éphémère
//    (sessionStorage) suffit à regrouper les events d'une même visite.
//  - Best-effort : on n'attend pas la réponse et on n'affiche jamais d'erreur
//    au visiteur (le tracking ne doit jamais casser la page).
//  Backend : POST /api/analytics/event  (voir app/routers/analytics.py)
// ─────────────────────────────────────────────────────────────────────────

function sessionId() {
  try {
    let id = sessionStorage.getItem("sid");
    if (!id) {
      // crypto.randomUUID dispo sur tous les navigateurs modernes ; fallback simple sinon.
      id = (crypto?.randomUUID?.() || `s-${Date.now()}-${performance.now()}`).toString();
      sessionStorage.setItem("sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/**
 * Envoie un événement analytics (best-effort, ne lève jamais).
 * @param {string} event_type  ex. "page_view" | "cv_download" | "contact" | "project_view"
 * @param {object} [extra]     champs optionnels : event_category, event_label, target_id…
 */
export function track(event_type, extra = {}) {
  try {
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
