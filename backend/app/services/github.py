"""Client GitHub (remplace l'ancien sidecar Node/TypeScript).

Liste les repos, lit les README et les détails d'un repo via l'API GitHub.
"""
import httpx

from ..config import get_settings

GH_API = "https://api.github.com"
_UA = "portfolio-assistant/1.0"


def _headers(accept: str = "application/vnd.github+json") -> dict[str, str]:
    settings = get_settings()
    if not settings.github_token:
        raise RuntimeError("GITHUB_TOKEN n'est pas configuré dans l'environnement")
    return {
        "Authorization": f"Bearer {settings.github_token}",
        "Accept": accept,
        "User-Agent": _UA,
    }


async def list_repos() -> list[dict]:
    settings = get_settings()
    if not settings.github_username:
        raise RuntimeError("GITHUB_USERNAME n'est pas configuré")
    url = f"{GH_API}/users/{settings.github_username}/repos"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            url, headers=_headers(), params={"per_page": 100, "sort": "pushed"}
        )
        resp.raise_for_status()
        return resp.json()


async def get_readme(owner: str, repo: str) -> str:
    url = f"{GH_API}/repos/{owner}/{repo}/readme"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, headers=_headers("application/vnd.github.v3.raw"))
        if resp.status_code == 404:
            return ""
        resp.raise_for_status()
        return resp.text


async def get_repo_details(owner: str, repo: str) -> dict:
    url = f"{GH_API}/repos/{owner}/{repo}"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, headers=_headers())
        resp.raise_for_status()
        return resp.json()
