# Déploiement (VPS + Docker + Caddy + HTTPS)

Stack : `db` + `backend` + `frontend` (internes) derrière **Caddy** (80/443, HTTPS
automatique via Let's Encrypt). Cohabite avec d'autres services sur le VPS.

VPS cible : `trader@46.225.117.160` (IP statique).

---

## 1. Domaine — sous-domaine DuckDNS (gratuit)

1. Va sur https://www.duckdns.org → connecte-toi (GitHub/Google).
2. Crée un sous-domaine, ex. **`raoufaddeche`** → il devient `raoufaddeche.duckdns.org`.
3. Dans le champ **current ip**, mets l'IP du VPS : `46.225.117.160` → **update ip**.
4. Vérifie : `dig +short raoufaddeche.duckdns.org` doit renvoyer `46.225.117.160`.

> Plus tard, pour un vrai domaine : il suffira de changer `DOMAIN` dans `.env` et de
> faire pointer le domaine (A record) vers l'IP. Caddy re-génère le certificat tout seul.

## 2. Ouvrir les ports 80/443

Sur le VPS (et/ou le pare-feu du fournisseur) :
```bash
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp   # si ufw est actif
```
Vérifie aussi le **firewall côté hébergeur** (panel) : 80 et 443 ouverts en entrée.

## 3. Cloner le projet sur le VPS

```bash
ssh trader@46.225.117.160
git clone https://github.com/RaoufAddeche/AI-portfolio.git portfolio
cd portfolio
git checkout refactor/uv-fastapi-stack   # (ou main une fois la PR fusionnée)
```
> Repo privé ? Utilise un *token* HTTPS ou une *deploy key* SSH.

## 4. Créer le `.env` de prod

```bash
cp .env.example .env
nano .env
```
Renseigne **avec des secrets neufs** (régénère ceux exposés ailleurs) :
```ini
POSTGRES_USER=portfolio_admin
POSTGRES_PASSWORD=<openssl rand -hex 24>
POSTGRES_DB=portfolio

GITHUB_TOKEN=<ton token GitHub>
GITHUB_USERNAME=RaoufAddeche

OPENAI_API_KEY=<ta clé OpenAI>
OPENAI_MODEL=gpt-4o-mini

RESEND_API_KEY=<ta clé Resend>
CONTACT_NOTIFY_TO=addeche.raouf@gmail.com

SYNC_TOKEN=<openssl rand -hex 24>
ADMIN_TOKEN=<openssl rand -hex 24>

DOMAIN=raoufaddeche.duckdns.org
```
Génère vite les secrets : `openssl rand -hex 24`

## 5. Lancer

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
- Les migrations Alembic s'appliquent au démarrage du backend.
- Caddy obtient le certificat HTTPS en ~30 s (port 80 doit être joignable).

Charge les données d'exemple (profil, parcours, skills, études de cas) **une fois** :
```bash
docker compose -f docker-compose.prod.yml exec -T db \
  psql -U portfolio_admin -d portfolio < dashboard/backend/sql/seed.sql
```

## 6. Vérifier

```bash
curl -I https://raoufaddeche.duckdns.org                 # 200 + HTTPS
curl -s https://raoufaddeche.duckdns.org/api/profile     # JSON du profil (après le seed)
```
Ouvre **https://raoufaddeche.duckdns.org** 🎉

## 7. Remplir le portfolio

1. **Synchroniser les repos** (génère les suggestions de projets) :
   ```bash
   curl -X POST "https://raoufaddeche.duckdns.org/api/github/sync?limit=50" \
     -H "X-Sync-Token: <SYNC_TOKEN>"
   ```
2. **Curer** : va sur `https://raoufaddeche.duckdns.org/admin`, entre `ADMIN_TOKEN`,
   approuve les projets à afficher et corrige les catégories.

## Mises à jour ultérieures
```bash
cd portfolio && git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Exploitation
- Logs : `docker compose -f docker-compose.prod.yml logs -f backend`
- Sauvegarde DB : `docker compose -f docker-compose.prod.yml exec -T db pg_dump -U portfolio_admin portfolio > backup.sql`
- Sync auto : configure le secret `PORTFOLIO_API_URL` + `PORTFOLIO_SYNC_TOKEN` dans GitHub
  (Settings → Secrets) pour activer le workflow `.github/workflows/sync-portfolio.yml`.
