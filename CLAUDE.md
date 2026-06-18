# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an automated portfolio assistant system built with **FastAPI, PostgreSQL, and a React/Vite frontend**. It tracks GitHub repositories, summarizes projects using an LLM API (OpenAI, on-demand), and maintains an up-to-date portfolio with human validation. (Originally built on n8n + Ollama for a school brief — since migrated to a single Python stack.)

**User Profile**: Data Scientist in reconversion (ex-Commercial), 2nd year of alternance, 28 years old.

**Portfolio Objectives**:
1. **CDI Mode**: Showcase technical skills, projects, and career transition for recruiters
2. **Freelance Mode**: Present business-focused case studies, ROI, and services for potential clients

**Key Differentiator**: Hybrid profile combining technical ML/Data skills with business communication expertise.

## Architecture

Docker-based stack — **3 services** (volontairement réduit depuis le brief école) :
- **PostgreSQL 15**: portfolio data + audit log (port 5432)
- **Backend FastAPI**: API Python, package `app/`, pool asyncpg (port 8000)
- **Frontend React/Vite**: dashboard portfolio (port 3000)

> ⚠️ **Retiré** (ne plus référencer) : n8n, Ollama, le sidecar MCP Node/TypeScript.
> - L'automatisation n8n → endpoint `POST /api/github/sync` (déclenché à la demande / cron VPS / GitHub Action).
> - Ollama (LLM local) → API OpenAI à la demande via `app/services/llm.py`.
> - Sidecar GitHub Node → `app/services/github.py`.
> - Les migrations sont gérées par **Alembic** ; le schéma vit dans `backend/sql/schema.sql`.

## Common Commands

### Environment Setup
```bash
# Start the full stack
docker compose up -d

# Stop the stack
docker compose down

# View logs
docker compose logs -f [service_name]

# Check service status
docker compose ps
```

### Database Operations
```bash
# Connect to PostgreSQL
docker exec -it portfolio-db psql -U portfolio_admin -d portfolio

# Backup database
docker exec portfolio-db pg_dump -U portfolio_admin portfolio > backup.sql
```

### Backend (uv)
```bash
cd backend
uv sync                       # crée .venv depuis uv.lock
uv run alembic upgrade head   # applique le schéma
uv run uvicorn app.main:app --reload
uv run ruff check app/        # lint

# Ajouter une dépendance
uv add <package>
```

### Migrations Alembic
```bash
cd backend
uv run alembic upgrade head            # appliquer
uv run alembic revision -m "message"   # nouvelle migration (SQL brut via op.execute)
uv run alembic current                 # version courante
```

## Development Workflow

1. **Setup**: `cp .env.example .env` puis renseigner les secrets
2. **Démarrer**: `docker compose up -d --build` (migrations Alembic auto au boot)
3. **Seed** (1×): `docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backend/sql/seed.sql`
4. **Accès**: portfolio http://localhost:3000 — API http://localhost:8000/docs

## Project Structure

```
├── docker-compose.yml          # dev : db, backend, frontend
├── docker-compose.prod.yml     # prod : + Caddy (HTTPS auto)
├── Caddyfile  ·  DEPLOY.md      # reverse-proxy + guide de déploiement
├── .env / .env.example         # variables d'environnement (.env gitignoré)
├── backend/                    # API FastAPI (uv)
│   ├── app/
│   │   ├── main.py             # factory + lifespan (pool) + routers
│   │   ├── config.py           # Settings (pydantic-settings)
│   │   ├── db.py               # pool asyncpg + dépendance get_db
│   │   ├── models.py           # modèles Pydantic
│   │   ├── i18n.py             # localisation FR/EN
│   │   ├── routers/            # portfolio, profile, showcase, modes,
│   │   │                       #   analytics, exports, social, github,
│   │   │                       #   chat, case_studies, admin
│   │   └── services/           # github.py (API GitHub) + llm.py (OpenAI) + email.py
│   ├── alembic/                # migrations (baseline = sql/schema.sql)
│   ├── sql/                    # schema.sql (DDL) + seed.sql (données réelles)
│   ├── pyproject.toml + uv.lock
│   └── Dockerfile
├── frontend/                   # React + Vite + Tailwind (+ page /admin)
└── volumes/                    # postgres_data (persistance)
```

## Database Schema

The system uses two main tables:
- `portfolio_events`: Audit log for all portfolio operations
- `portfolio_items`: Portfolio entries with status tracking (draft/approved/published)

## Security Notes

- All sensitive credentials are in `.env` (not committed); no secret hardcoded in code
- The backend requires `DB_PASSWORD` from the environment (no default value)
- The system is designed for local/personal use, deployable on a small VPS

## GitHub Integration (ex-MCP sidecar)

GitHub access lives in the Python backend (`app/services/github.py`), exposed via:
- `GET  /api/github/repos`            — list public repos
- `GET  /api/github/readme?owner&repo` — fetch a README
- `POST /api/github/sync`             — summarize repos via LLM and upsert as `draft`

```bash
curl http://localhost:8000/api/github/repos | jq
curl -X POST "http://localhost:8000/api/github/sync?min_stars=0&limit=10" | jq
```

## Troubleshooting

### Common Issues
- **Docker not found**: Install Docker Desktop from https://www.docker.com/get-started/
- **Port conflicts**: Ensure ports 5432, 8000, and 3000 are available
- **Backend won't start**: vérifier que `.env` contient `DB_PASSWORD` et que la DB est `healthy`
- **Migrations**: `docker compose logs backend` montre la sortie `alembic upgrade head`

### Log Locations
- Backend logs: `docker compose logs backend`
- PostgreSQL logs: `docker compose logs db`
- Frontend logs: `docker compose logs frontend`

## Sync Process (POST /api/github/sync)

1. **Trigger**: appel HTTP manuel, cron VPS, ou GitHub Action (pas de service permanent)
2. **Scan**: `app/services/github.py` liste les repos via l'API GitHub
3. **Filter**: `min_stars`, `include_forks`, `limit` en query params
4. **Analyze**: `app/services/llm.py` génère un résumé via l'API OpenAI
5. **Upsert**: insertion en statut `draft` dans `portfolio_items` (validation humaine requise)
6. **Audit**: chaque opération journalisée dans `portfolio_events`

## AI Configuration

Résumés générés via l'**API OpenAI** (à la demande, aucun LLM local). Modèle par
défaut : `gpt-4o-mini` (configurable via `OPENAI_MODEL`). Voir `app/services/llm.py`.

Portfolio items include:
- Title and short pitch (CV-ready)
- Long description (structured)
- Tags and tech stack
- Impact metrics (when available)
- AI confidence score (0-100)

## 🎯 Development Roadmap - 3 Phases

### ✅ What's Already Built (Backend Foundation)

**Infrastructure**:
- ✅ Docker compose stack (PostgreSQL, FastAPI backend, React frontend)
- ✅ Database schema with portfolio_items, portfolio_events, portfolio_config (Alembic)
- ✅ GitHub sync endpoint (`POST /api/github/sync`) — ex-workflow n8n
- ✅ OpenAI integration for on-demand project summarization (`app/services/llm.py`)
- ✅ GitHub API client in Python (`app/services/github.py`) — ex-sidecar Node
- ✅ Dashboard backend (FastAPI, package `app/` + pool asyncpg) with REST API
- ✅ Dashboard frontend structure (React + Vite + Tailwind)

**Backend API Features**:
- ✅ CRUD operations for portfolio items
- ✅ Statistics and analytics endpoints
- ✅ PDF export functionality
- ✅ Event logging and audit trail

### 🚀 Phase 1: MVP Portfolio (2 weeks) - PRIORITY

**Goal**: Professional landing page showcasing reconversion journey and top projects

**Frontend Components to Build**:
1. **Hero Section** (`components/Hero.jsx`)
   - Professional photo + title: "Data Scientist en Alternance"
   - Elevator pitch highlighting commercial → tech transition
   - CTAs: "Voir mes projets", "Mon parcours", "Me contacter"

2. **Career Timeline** (`components/Timeline.jsx`)
   - Interactive visual timeline (2017-2025)
   - 3 phases: Commercial → Formation Intensive → Alternance
   - Milestones with metrics (X projects, Y certifications, Z hours of code)

3. **Top Projects Showcase** (`components/ProjectShowcase.jsx`)
   - Display 3-5 best projects from database
   - Each project card shows:
     - Title + tagline
     - Tech stack badges
     - GitHub stats (stars, language)
     - Business impact (if applicable)
     - Links to demo/GitHub/article

4. **Skills Section** (`components/Skills.jsx`)
   - **Technical skills**: ML/DL, Data Engineering, Cloud, MLOps
   - **Business skills**: Communication, Vulgarisation, ROI analysis
   - Visual representation (radar chart or skill bars)

5. **Contact Section** (`components/Contact.jsx`)
   - Email, LinkedIn, GitHub links
   - Simple contact form (optional)
   - Download CV button (PDF export)

**Backend Enhancements**:
- Add `/api/profile` endpoint for personal info (name, title, bio, social links)
- Add `/api/timeline` endpoint for career milestones
- Enhance `/api/projects` with filtering (top 3, by status, by tag)

**Database Updates**:
```sql
-- Add profile table
CREATE TABLE profile (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(200),
  title VARCHAR(200),
  bio TEXT,
  hero_pitch TEXT,
  email VARCHAR(200),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  photo_url VARCHAR(500)
);

-- Add timeline table
CREATE TABLE timeline_events (
  id SERIAL PRIMARY KEY,
  date DATE,
  title VARCHAR(200),
  description TEXT,
  category VARCHAR(50), -- 'commercial', 'formation', 'alternance'
  metrics JSONB
);
```

**Tasks**:
- [ ] Create profile and timeline tables + seed data
- [ ] Build Hero component with profile data
- [ ] Build Timeline component with animations
- [ ] Build ProjectShowcase pulling from portfolio_items
- [ ] Build Skills section (static for now)
- [ ] Build Contact section
- [ ] Basic routing and navigation
- [ ] Deploy to test environment

**Success Metrics**:
- Portfolio accessible at localhost:3000
- All sections render correctly
- Data flows from PostgreSQL → FastAPI → React
- Mobile responsive
- Load time < 2s

### 🎨 Phase 2: Credibility & Trust (4 weeks)

**Goal**: Add social proof, certifications, blog, and testimonials

**New Features**:

1. **Alternance/Experience Section** (`components/Experience.jsx`)
   - Detailed view of current alternance
   - Company logo, role, period
   - Key missions and achievements
   - Technologies used
   - Business impact with metrics

2. **Certifications & Education** (`components/Certifications.jsx`)
   - Grid of certifications (AWS, TensorFlow, Kaggle, etc.)
   - Education details (school, degree, specialization)
   - Projects from formation

3. **Blog Integration** (`pages/Blog.jsx`)
   - List of articles (stored in database or markdown files)
   - Categories: Reconversion, Tutorials, Projects
   - Example articles:
     - "Comment j'ai appris le ML en 6 mois"
     - "Du commercial à la data science : 5 leçons"
     - "Expliquer la régression logistique simplement"
   - Basic SEO optimization

4. **Testimonials** (`components/Testimonials.jsx`)
   - Quotes from manager, professors, colleagues
   - Photos and titles
   - Stored in database or config file

5. **GitHub Stats Widget** (`components/GitHubStats.jsx`)
   - Integration with GitHub API
   - Contribution heatmap
   - Language breakdown
   - Streak counter
   - Top repositories

6. **Kaggle Integration** (optional)
   - Kaggle rank and medals
   - Link to profile

7. **Work in Progress Section** (`components/WorkInProgress.jsx`)
   - Transparency: show what you're currently learning
   - Progress bars (e.g., "AWS ML Certification - 60%")
   - Upcoming projects

**Backend Enhancements**:
- Add `/api/experiences` endpoint
- Add `/api/certifications` endpoint
- Add `/api/blog/posts` endpoint
- Add `/api/testimonials` endpoint
- GitHub API integration for stats
- Blog post management (CRUD)

**Database Updates**:
```sql
CREATE TABLE experiences (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(200),
  logo_url VARCHAR(500),
  role VARCHAR(200),
  start_date DATE,
  end_date DATE,
  description TEXT,
  missions TEXT[],
  technologies TEXT[],
  impact TEXT
);

CREATE TABLE certifications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  issuer VARCHAR(200),
  issue_date DATE,
  credential_url VARCHAR(500),
  logo_url VARCHAR(500)
);

CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(300),
  slug VARCHAR(300) UNIQUE,
  excerpt TEXT,
  content TEXT,
  category VARCHAR(100),
  tags TEXT[],
  published_date TIMESTAMP,
  updated_at TIMESTAMP,
  read_time_minutes INTEGER,
  views INTEGER DEFAULT 0
);

CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  author_name VARCHAR(200),
  author_role VARCHAR(200),
  author_photo_url VARCHAR(500),
  quote TEXT,
  created_at TIMESTAMP
);
```

**Tasks**:
- [ ] Build all new components
- [ ] Add blog system (markdown support)
- [ ] Write 2-3 initial blog posts
- [ ] Gather testimonials from contacts
- [ ] Integrate GitHub API
- [ ] Add SEO meta tags
- [ ] Create sitemap

**Success Metrics**:
- At least 3 blog posts published
- 2-3 testimonials displayed
- GitHub stats updating daily
- Blog posts indexable by search engines

### ⚡ Phase 3: Advanced Features & Differentiation (8 weeks)

**Goal**: Dual-mode portfolio, AI features, analytics, and full automation

**Major Features**:

1. **Dual Mode Toggle** (`components/ModeToggle.jsx`)
   - Switch between CDI and Freelance views
   - Different content/sections per mode:
     - **CDI Mode**: Projects, skills, open source, publications, culture fit
     - **Freelance Mode**: Case studies, services, pricing, testimonials, ROI calculator

2. **Services & Pricing Page** (Freelance mode) (`pages/Services.jsx`)
   - Service packages:
     - "Audit Data/IA" (2-5 days)
     - "POC/MVP" (2-4 weeks)
     - "Production Deployment" (1-3 months)
     - "Team Training" (1 week)
   - Pricing indication (TJM or "Sur devis")
   - Clear process: Discovery → Development → Deployment
   - Calendly integration for booking

3. **Case Studies Page** (Freelance mode) (`pages/CaseStudies.jsx`)
   - Business-focused project presentations
   - Each case study includes:
     - Client context (industry, size)
     - Business problem (non-technical)
     - Solution delivered
     - Measurable results (€, %, time saved)
     - Client testimonial

4. **Interactive Demos** (`pages/Demos.jsx`)
   - Embedded Streamlit/Gradio apps
   - "Try it yourself" section
   - Link to Jupyter notebooks (Colab)
   - API playground

5. **AI-Powered Features**:
   - **Resume Tailoring** (`features/ResumeTailor.jsx`):
     - User pastes job posting
     - LLM generates customized resume highlighting relevant projects
     - Downloadable PDF
   - **Skill Matcher** (`features/SkillMatcher.jsx`):
     - Compare your skills vs job requirements
     - Show match percentage
     - Suggest projects to highlight
   - **ROI Calculator** (Freelance) (`features/ROICalculator.jsx`):
     - Client inputs (data volume, current costs, etc.)
     - Calculate potential savings with AI solution
     - Lead generation tool

6. **Chatbot FAQ** (`components/Chatbot.jsx`)
   - Embedded chat widget
   - Answers common questions:
     - Experience level
     - Availability
     - Technologies
     - Pricing (freelance)
   - Powered by Ollama or OpenAI

7. **Analytics Dashboard** (Admin only) (`pages/Admin.jsx`)
   - Views per page
   - Most viewed projects
   - Traffic sources
   - Contact form submissions
   - CDI vs Freelance mode usage
   - Geographic distribution

8. **Advanced n8n Automation**:
   - Auto-update GitHub stats daily
   - Weekly digest of new projects
   - Auto-publish approved projects to Notion
   - Send weekly analytics report via email
   - Social media auto-posting (LinkedIn, Twitter)

**Backend Enhancements**:
- Add `/api/mode` endpoint to track current mode (CDI/Freelance)
- Add `/api/services` endpoint for service packages
- Add `/api/case-studies` endpoint
- Add `/api/ai/tailor-resume` endpoint (LLM integration)
- Add `/api/ai/match-skills` endpoint
- Add `/api/ai/calculate-roi` endpoint
- Add `/api/analytics` endpoints for admin dashboard
- Add `/api/chatbot` endpoint for FAQ
- Event tracking (page views, clicks, mode switches)

**Database Updates**:
```sql
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  duration VARCHAR(100),
  price_range VARCHAR(100),
  description TEXT,
  deliverables TEXT[]
);

CREATE TABLE case_studies (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES portfolio_items(id),
  client_industry VARCHAR(200),
  client_size VARCHAR(100),
  business_problem TEXT,
  solution TEXT,
  results TEXT,
  roi_percentage INTEGER,
  testimonial TEXT,
  visible_in_freelance_mode BOOLEAN DEFAULT TRUE
);

CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  event_type VARCHAR(100), -- 'page_view', 'project_click', 'mode_switch', 'contact_submit'
  event_data JSONB,
  user_agent TEXT,
  ip_address VARCHAR(50),
  referrer TEXT
);

CREATE TABLE chatbot_conversations (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100),
  question TEXT,
  answer TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

**Tasks**:
- [ ] Implement mode toggle with state management
- [ ] Build all Freelance-specific pages
- [ ] Build AI-powered features (resume tailor, skill matcher, ROI calc)
- [ ] Integrate Ollama for chatbot
- [ ] Build analytics dashboard
- [ ] Add event tracking throughout app
- [ ] Create case studies from existing projects
- [ ] Set up Calendly integration
- [ ] Automate social media posting
- [ ] SEO optimization and sitemap
- [ ] Performance optimization (lazy loading, caching)
- [ ] Add dark mode
- [ ] Mobile app (PWA)

**Success Metrics**:
- Mode toggle working smoothly
- AI features generating value (resume downloads, skill matches)
- Analytics tracking all key events
- At least 3 case studies published
- Chatbot answering 80%+ of FAQs correctly
- Page load time < 1.5s
- Lighthouse score > 90

## Implementation Strategy

### Tech Stack Decisions

**Frontend**:
- React 18 + Vite (already set up)
- Tailwind CSS for styling
- React Router for navigation
- Context API or Zustand for state management
- Framer Motion for animations
- Recharts or D3.js for data visualization
- React Markdown for blog posts

**Backend**:
- FastAPI (already set up)
- asyncpg for PostgreSQL
- Pydantic for validation
- ReportLab for PDF generation
- httpx for external API calls

**AI/ML**:
- Ollama for local LLM inference
- LangChain for prompt management (optional)
- OpenAI API as fallback (optional)

**Analytics**:
- Custom event tracking (PostgreSQL)
- Google Analytics 4 (optional)
- Plausible or Umami (privacy-friendly alternative)

### Deployment Strategy

**Development** (current):
- Docker Compose locally
- localhost:3000 (frontend), localhost:8000 (backend)

**Staging** (Phase 2):
- Deploy to VPS or cloud (DigitalOcean, Hetzner, AWS)
- Subdomain: staging.votre-domaine.dev

**Production** (Phase 3):
- Custom domain: votre-prenom-nom.dev or .com
- CDN for static assets (Cloudflare)
- SSL certificate (Let's Encrypt)
- Automated backups (PostgreSQL)
- Monitoring (Sentry, Uptime Robot)

### Priority Matrix

**Must Have (Phase 1)**:
- Hero + Timeline + Projects + Skills + Contact
- Data flow: DB → API → Frontend
- Mobile responsive
- Basic SEO

**Should Have (Phase 2)**:
- Blog with 3+ posts
- Testimonials
- GitHub stats
- Certifications
- Experience section

**Nice to Have (Phase 3)**:
- Dual mode toggle
- AI features
- Analytics dashboard
- Chatbot
- Advanced automation

### Weekly Breakdown (Phase 1)

**Week 1**:
- Day 1-2: Database schema updates (profile, timeline)
- Day 3-4: Backend API endpoints
- Day 5-7: Hero + Timeline components

**Week 2**:
- Day 1-3: ProjectShowcase + Skills components
- Day 4-5: Contact section + routing
- Day 6-7: Testing, bug fixes, responsive design

## Current Status

- ✅ **Phase 1 COMPLETE**: Hero, Timeline, Profile API, Full data flow
- ✅ **Phase 2 COMPLETE**: Projects, Blog, Testimonials, Skills, Contact Form
- ✅ **Phase 3 COMPLETE**: Dual Mode (CDI/Freelance), Analytics, Content Overrides
- ✅ **Migration**: stack n8n+Ollama+sidecar Node → stack Python unique (FastAPI + uv + Alembic)

## Automation (replaces the old n8n workflows)

L'ancienne automatisation n8n (4 workflows) est remplacée par :
- **Sync GitHub** : `POST /api/github/sync` — à câbler sur un cron VPS ou une GitHub Action
- **Analytics / notifications** : exposés via l'API (`/api/analytics/*`), à consommer
  par un cron externe si besoin de digests email/Slack

## Quick Start

```bash
# 1. Configurer puis démarrer (migrations Alembic auto au boot du backend)
cp .env.example .env          # renseigner DB / GitHub / OpenAI
docker compose up -d --build

# 2. Charger les données d'exemple (une fois)
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  < backend/sql/seed.sql

# 3. Accès
#   Portfolio   : http://localhost:3000
#   Backend API : http://localhost:8000/docs
#   Santé       : http://localhost:8000/health
```

Développement backend hors Docker : voir la section **Common Commands → Backend (uv)**.

## Next Steps

1. **Personnaliser les données** : éditer `backend/sql/seed.sql`
2. **Câbler la synchro GitHub** : cron VPS ou GitHub Action sur `POST /api/github/sync`
3. **Déployer** : VPS via `docker compose` (3 conteneurs)