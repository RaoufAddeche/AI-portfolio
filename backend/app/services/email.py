"""Envoi d'emails transactionnels via l'API Resend (notification de contact)."""
import httpx

from ..config import get_settings

_RESEND_URL = "https://api.resend.com/emails"


async def send_contact_notification(
    name: str, email: str, subject: str | None, message: str
) -> bool:
    """Notifie par email un nouveau message de contact. Best-effort.

    Renvoie True si envoyé, False si non configuré. Lève en cas d'erreur réseau/API
    (l'appelant gère l'exception pour ne pas casser la soumission).
    """
    settings = get_settings()
    if not settings.resend_api_key:
        return False

    subj = f"[Portfolio] Nouveau message de {name}"
    if subject:
        subj += f" — {subject}"
    body = (
        f"Nom : {name}\n"
        f"Email : {email}\n"
        f"Sujet : {subject or '(aucun)'}\n\n"
        f"{message}\n"
    )
    payload = {
        "from": settings.contact_from,
        "to": [settings.contact_notify_to],
        "reply_to": email,  # répondre = écrire directement au visiteur
        "subject": subj,
        "text": body,
    }
    return await _send(payload)


async def send_testimonial_notification(
    author: str, role: str, company: str | None, quote: str, approve_url: str | None
) -> bool:
    """Notifie un nouvel avis en attente de modération, avec lien d'approbation."""
    settings = get_settings()
    if not settings.resend_api_key:
        return False

    who = f"{author} — {role}" + (f" @ {company}" if company else "")
    body = f"Nouvel avis en attente de validation :\n\n{who}\n\n« {quote} »\n\n"
    if approve_url:
        body += f"Approuver (le rendre public) :\n{approve_url}\n"
    else:
        body += "(Lien d'approbation indisponible : ADMIN_TOKEN non configuré.)\n"

    payload = {
        "from": settings.contact_from,
        "to": [settings.contact_notify_to],
        "subject": f"[Portfolio] Avis à valider — {author}",
        "text": body,
    }
    return await _send(payload)


async def _send(payload: dict) -> bool:
    settings = get_settings()
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            _RESEND_URL,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json=payload,
        )
        resp.raise_for_status()
    return True
