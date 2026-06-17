# 🚀 Présentation - Portfolio Automatisé avec n8n

## 🎯 Concept du Projet

Un **portfolio intelligent et automatisé** qui se met à jour automatiquement depuis GitHub et s'adapte à deux profils :
- **Mode CDI** : Pour les recruteurs (focus technique, projets, compétences)
- **Mode Freelance** : Pour les clients (focus business, ROI, cas d'usage)

---

## 📊 Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 UTILISATEURS                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              📱 Portfolio Dashboard (React)                 │
│                   http://localhost:3000                     │
│  - Toggle CDI/Freelance                                     │
│  - Projets dynamiques                                       │
│  - Blog, Testimonials, Contact                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              🔧 Backend API (FastAPI)                       │
│                   http://localhost:8000                     │
│  - 36 endpoints REST                                        │
│  - CRUD projets, blog, analytics                            │
│  - Export PDF                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              🗄️ PostgreSQL Database                        │
│  - projects (projets GitHub)                                │
│  - blog_posts (articles)                                    │
│  - analytics_events (tracking)                              │
│  - contact_submissions (formulaires)                        │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
                    ┌─────────┴─────────┐
                    │                   │
         ┌──────────▼──────────┐   ┌───▼──────────┐
         │  ⚙️ n8n Workflows   │   │  🤖 OpenAI   │
         │  Automatisation     │   │  GPT-4o-mini │
         └─────────────────────┘   └──────────────┘
                    ▲
                    │
         ┌──────────┴──────────┐
         │   🐙 GitHub API     │
         │   Repos publics     │
         └─────────────────────┘
```

---

## 🗄️ Base de Données PostgreSQL

### **Tables principales**

| Table | Description | Utilité |
|-------|-------------|---------|
| **`projects`** | Projets GitHub synchronisés | Affichage portfolio, stats GitHub (stars, forks) |
| **`blog_posts`** | Articles de blog | Section blog du portfolio |
| **`profile`** | Infos personnelles | Hero section (nom, bio, photo, liens) |
| **`timeline_events`** | Parcours professionnel | Timeline de reconversion |
| **`testimonials`** | Témoignages clients/collègues | Social proof |
| **`contact_submissions`** | Formulaires de contact | Leads et messages entrants |
| **`analytics_events`** | Tracking visiteurs | Suivi clics, pages vues, conversions |
| **`visitor_sessions`** | Sessions utilisateurs | Analyse comportement (CDI vs Freelance) |

### **Flux de données**

```
GitHub → n8n → OpenAI → PostgreSQL → FastAPI → React
```

---

## ⚙️ Les 4 Workflows n8n

### **1. 🔄 GitHub Sync (toutes les 6 heures)**

**Objectif** : Importer automatiquement les nouveaux projets GitHub

**Étapes** :
1. 📥 Récupère la liste de tes repos GitHub (via API)
2. 🔍 Filtre les repos pertinents (pas de forks, avec des stars)
3. 📄 Télécharge le README de chaque repo
4. 🤖 Envoie à OpenAI GPT-4o-mini pour générer :
   - Titre accrocheur
   - Description courte (pour les cards)
   - Description longue (pour les détails)
   - Technologies détectées
   - Catégorie (ML, Data Viz, Automation, etc.)
5. 💾 Insère dans PostgreSQL (table `projects`)
6. ✅ Projets disponibles dans le portfolio (en mode brouillon)

**Résultat** : Ton portfolio se met à jour automatiquement quand tu publies un nouveau projet sur GitHub !

---

### **2. 👥 Visitor Notifications (toutes les 15 minutes)**

**Objectif** : Être alerté en temps réel des visiteurs sur le portfolio

**Étapes** :
1. 🔍 Récupère les sessions des 15 dernières minutes
2. 📊 Agrège les stats :
   - Nombre de visiteurs
   - Mode CDI vs Freelance
   - Pages vues, projets consultés
   - Sources de trafic (Google, LinkedIn, Direct)
   - Engagement (temps passé, pages vues)
3. 📬 Récupère les nouveaux contacts (formulaire)
4. ✉️ Formate et envoie une notification (console n8n pour l'instant)
5. ✅ Marque les contacts comme "notifiés"

**Résultat** : Tu sais qui visite ton portfolio, d'où ils viennent, et ce qu'ils consultent.

---

### **3. 📊 Analytics Daily Digest (tous les jours à 9h00)**

**Objectif** : Rapport quotidien des performances du portfolio

**Étapes** :
1. 📈 Calcule les stats d'hier :
   - Nombre de sessions
   - Pages vues, clics projets
   - Taux d'engagement (clics / vues)
   - Contacts, téléchargements CV
2. 🔝 Top 5 des projets les plus consultés (24h)
3. 📊 Tendance sur 7 jours (sessions, contacts, conversion)
4. 👥 Stats visiteurs par mode (CDI/Freelance)
5. 📝 Génère un rapport formaté

**Résultat** : Un rapport quotidien pour suivre l'évolution du trafic et identifier les projets qui intéressent.

---

### **4. 🔍 Content Review (toutes les 12 heures)**

**Objectif** : Alerter sur le contenu en attente de publication

**Étapes** :
1. 📝 Récupère les projets non publiés (`is_published = false`)
2. ✍️ Récupère les articles de blog en brouillon
3. 🆕 Récupère les projets récemment mis à jour (dernières 12h)
4. 📋 Compile une liste de review
5. 🔔 Génère une alerte si du contenu nécessite une action

**Résultat** : Tu n'oublies jamais de valider et publier les projets auto-importés depuis GitHub.

---

## 🎨 Fonctionnalités du Portfolio

### **Mode Toggle CDI / Freelance**

| Fonctionnalité | Mode CDI | Mode Freelance |
|----------------|----------|----------------|
| **Projets affichés** | Projets techniques avec code | Cas d'usage business avec ROI |
| **Ton du contenu** | Technique, détaillé | Business, orienté résultats |
| **Call-to-Action** | "Me contacter pour un poste" | "Demander un devis" |
| **Métriques** | GitHub stars, technologies | Temps économisé, coût réduit |

### **Sections du Portfolio**

1. **Hero** : Photo, titre, pitch d'accroche
2. **Timeline** : Parcours de reconversion (Commercial → Data Scientist)
3. **Projets** : Cards dynamiques avec filtres (catégorie, technologie)
4. **Blog** : Articles techniques et retours d'expérience
5. **Testimonials** : Témoignages de managers/clients
6. **Skills** : Compétences techniques et business
7. **Contact** : Formulaire + liens sociaux
8. **Analytics** : Dashboard admin pour suivre les stats

---

## 🔐 Sécurité et Configuration

### **Variables d'environnement (.env)**

```env
# PostgreSQL
POSTGRES_USER=portfolio_admin
POSTGRES_PASSWORD=********          # secret, jamais commité (voir .env.example)
POSTGRES_DB=portfolio

# OpenAI (résumés de projets à la demande)
OPENAI_API_KEY=sk-...               # secret, jamais commité

# GitHub
GITHUB_TOKEN=ghp_YOUR_GITHUB_TOKEN_HERE
```

---

## 🚀 Démarrage Rapide

```bash
# 1. Lancer tous les services
docker compose up -d

# 2. Accéder aux services
Portfolio:  http://localhost:3000
API Docs:   http://localhost:8000/docs
n8n:        http://localhost:5678

# 3. Importer les workflows dans n8n
# - 1_github_sync_simple.json
# - 2_visitor_notifications.json
# - 3_analytics_fixed.json
# - 4_content_review_fixed.json

# 4. Activer les workflows
# Cliquer sur "Activate" dans l'interface n8n
```

---

## 📈 Métriques Trackées

### **Analytics Events**

| Événement | Description |
|-----------|-------------|
| `page_view` | Visite d'une page |
| `project_click` | Clic sur un projet |
| `contact_submit` | Envoi formulaire contact |
| `cv_download` | Téléchargement CV |
| `mode_switch` | Toggle CDI ↔ Freelance |

### **Visitor Sessions**

- Mode d'arrivée (CDI/Freelance)
- Source de trafic (Google, LinkedIn, Direct, Autre)
- Pages vues, projets consultés
- Conversion (contact envoyé, CV téléchargé)

---

## 🎯 Points Forts du Projet

### **1. Automatisation Complète**
- ✅ Projets GitHub synchronisés automatiquement
- ✅ Descriptions générées par IA (gain de temps)
- ✅ Tracking analytics en temps réel
- ✅ Notifications visiteurs et contacts

### **2. Adaptabilité CDI/Freelance**
- ✅ Un seul portfolio, deux cibles
- ✅ Contenu adapté au contexte
- ✅ Métriques pour comprendre son audience

### **3. Stack Technique Moderne**
- ✅ React + Tailwind (frontend moderne)
- ✅ FastAPI (backend performant)
- ✅ PostgreSQL (données structurées)
- ✅ n8n (workflows sans code)
- ✅ Docker (déploiement facile)

### **4. Data-Driven**
- ✅ Analytics détaillées
- ✅ A/B testing possible (CDI vs Freelance)
- ✅ Optimisation continue basée sur les données

---

## 🔮 Évolutions Possibles

### **Court Terme**
- [ ] Notifications Slack/Telegram au lieu de console n8n
- [ ] Export automatique vers Notion
- [ ] Auto-posting LinkedIn des nouveaux projets

### **Moyen Terme**
- [ ] Chatbot IA pour répondre aux questions
- [ ] Recommandations de projets basées sur le profil visiteur
- [ ] Formulaire de contact enrichi avec qualification automatique

### **Long Terme**
- [ ] Multi-langue (FR/EN)
- [ ] Système de blog CMS intégré
- [ ] Génération automatique de cas clients pour mode Freelance
- [ ] Intégration CRM (HubSpot, Pipedrive)

---

## 💡 Cas d'Usage Concrets

### **Scénario 1 : Nouveau Projet GitHub**
1. Tu publies un nouveau repo sur GitHub avec des stars
2. n8n détecte le repo (workflow 1)
3. OpenAI génère une description professionnelle
4. Le projet apparaît en brouillon dans le dashboard
5. Tu valides et publies → visible sur le portfolio

### **Scénario 2 : Visite d'un Recruteur**
1. Un recruteur arrive via LinkedIn (mode CDI)
2. Il consulte 3 projets ML
3. Il télécharge ton CV
4. Tu reçois une notification (workflow 2)
5. Le lendemain à 9h, rapport avec ses actions (workflow 3)

### **Scénario 3 : Lead Freelance**
1. Un client potentiel arrive via Google (mode Freelance)
2. Il consulte des cas d'usage business
3. Il remplit le formulaire de contact
4. Tu reçois une alerte immédiate (workflow 2)
5. Les infos sont stockées dans `contact_submissions`

---

## 🛠️ Stack Technique Détaillée

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Frontend** | React 18 + Vite + Tailwind CSS | Interface utilisateur moderne |
| **Backend** | FastAPI (Python) | API REST performante |
| **Base de données** | PostgreSQL 15 | Stockage structuré |
| **Automatisation** | n8n | Workflows sans code |
| **IA** | OpenAI GPT-4o-mini | Génération de descriptions |
| **Containerisation** | Docker + Docker Compose | Déploiement multi-services |
| **Reverse Proxy** | Nginx | Serveur web frontend |

---

## 📞 Liens Utiles

| Service | URL | Credentials |
|---------|-----|-------------|
| **Portfolio** | http://localhost:3000 | - |
| **API Docs** | http://localhost:8000/docs | - |
| **n8n** | http://localhost:5678 | `n8n_admin_user` / `O2Zd...` |
| **PostgreSQL** | localhost:5432 | `admin_user_db` / `O2Zd...` |

---

## 🎓 Résumé en 3 Points

1. **Portfolio intelligent** qui se met à jour automatiquement depuis GitHub avec descriptions générées par IA
2. **Dual-mode CDI/Freelance** pour cibler deux audiences différentes avec le même portfolio
3. **Analytics complètes** pour comprendre qui visite, d'où ils viennent, et ce qui les intéresse

**En gros** : Un portfolio qui travaille pour toi 24/7, pendant que toi tu codes ! 😎

---

## ❓ Questions Fréquentes

**Q: Combien coûte l'API OpenAI ?**
R: ~0,01€ par projet analysé (très peu avec GPT-4o-mini)

**Q: Peut-on désactiver les workflows ?**
R: Oui, dans n8n, toggle "Active" sur OFF

**Q: Les données sont-elles sécurisées ?**
R: Oui, tout est en local. PostgreSQL avec mot de passe fort. Pas d'exposition publique.

**Q: Peut-on ajouter d'autres sources que GitHub ?**
R: Oui, n8n peut se connecter à GitLab, Bitbucket, ou même scraper ton site web.

**Q: Faut-il des compétences en code ?**
R: Non pour utiliser. Un peu de SQL/Python pour personnaliser.

---

**Créé avec ❤️ pour automatiser mon portfolio et me concentrer sur ce qui compte : coder !**
