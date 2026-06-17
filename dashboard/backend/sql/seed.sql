-- ============================================================================
-- PORTFOLIO DATABASE — CONSOLIDATED SEED DATA (DML ONLY)
-- ============================================================================
-- Single seed file. Run AFTER schema.sql.
-- Contains only data (INSERT / UPDATE). No DDL.
-- ON CONFLICT DO NOTHING is used wherever an obvious unique constraint exists,
-- so the file is safe to re-run for those rows.
-- IMPORTANT: Replace template values with your real information.
-- ============================================================================


-- ============================================================================
-- PHASE 3 BOOTSTRAP SEED (extracted from phase3 schema — must run first because
-- conversion_goals + mode_content_overrides reference portfolio_modes)
-- ============================================================================

-- Default portfolio modes
INSERT INTO portfolio_modes (mode_key, display_name, description, icon, color_primary, is_default, settings) VALUES
('cdi', 'Mode CDI', 'Portfolio orienté recrutement en entreprise', '💼', 'blue', TRUE, '{"focus": "technical_skills", "show_salary": false, "highlight_certifications": true}'),
('freelance', 'Mode Freelance', 'Portfolio orienté missions et clients', '🚀', 'purple', FALSE, '{"focus": "business_impact", "show_rates": true, "highlight_case_studies": true}')
ON CONFLICT (mode_key) DO NOTHING;

-- Default conversion goals
INSERT INTO conversion_goals (goal_name, goal_type, mode_key, target_value) VALUES
('CDI - Contact Form Submission', 'contact', 'cdi', 1),
('CDI - CV Download', 'cv_download', 'cdi', 1),
('CDI - 3+ Projects Viewed', 'project_view', 'cdi', 3),
('Freelance - Contact Form Submission', 'contact', 'freelance', 1),
('Freelance - 2+ Projects Viewed', 'project_view', 'freelance', 2),
('Freelance - 5+ Minutes on Site', 'time_on_site', 'freelance', 300)
ON CONFLICT (goal_name) DO NOTHING;


-- ============================================================================
-- PHASE 1 SEED — profile, timeline, skills, social links
-- ============================================================================

-- Insert profile (single row)
INSERT INTO profile (
    full_name,
    title,
    bio,
    hero_pitch,
    email,
    linkedin_url,
    github_url,
    kaggle_url,
    location,
    availability
) VALUES (
    'Raouf Addeche', -- TODO: Remplacer par votre nom complet
    'Data Scientist en Alternance',
    'Ex-Commercial passionné par l''IA et la Data Science. En reconversion depuis 2 ans, je combine compétences techniques (ML/DL, Python, Cloud) et expertise business (communication, analyse ROI, vulgarisation) pour transformer des problèmes métier en solutions IA concrètes.',
    'Je transforme des problèmes business en solutions IA concrètes. Mon parcours commercial me permet de comprendre vos besoins métier et de les traduire en modèles performants.',
    'raouf.addeche@example.com', -- TODO: Remplacer par votre email
    'https://www.linkedin.com/in/votre-profil', -- TODO: Remplacer
    'https://github.com/votre-username', -- TODO: Remplacer
    'https://www.kaggle.com/votre-username', -- TODO: Remplacer ou NULL
    'Paris, France', -- TODO: Remplacer
    'Disponible à partir d''Août 2025 (fin d''alternance)'
) ON CONFLICT (id) DO NOTHING;

-- Insert timeline events
INSERT INTO timeline_events (date, end_date, title, description, category, icon, metrics, tags, is_highlight, display_order) VALUES

-- Phase Commercial (2017-2022)
('2017-01-01', '2022-12-31', 'Commercial B2B',
 'Expérience de 5+ ans dans la vente de solutions B2B. Développement de compétences en négociation, relation client, analyse de besoins et closing.',
 'commercial', 'briefcase',
 '{"clients": "50+", "revenue": "1M€+", "satisfaction": "95%"}',
 ARRAY['Vente', 'Négociation', 'Relation Client', 'CRM'],
 true, 1),

-- Décision de reconversion
('2022-06-01', NULL, 'Décision de Reconversion',
 'Prise de conscience : passion pour la tech et volonté de créer un impact plus direct avec la data et l''IA.',
 'formation', 'lightbulb',
 NULL,
 ARRAY['Reconversion', 'Motivation'],
 false, 2),

-- Formation intensive (2023)
('2023-01-01', '2023-12-31', 'Formation Intensive Data Science',
 'Formation accélérée en Data Science et Machine Learning : Python, SQL, statistiques, ML/DL, MLOps, Cloud.',
 'formation', 'graduation',
 '{"hours": 1500, "projects": 12, "certifications": 3}',
 ARRAY['Python', 'Machine Learning', 'SQL', 'Deep Learning'],
 true, 3),

-- Certifications (exemples - à adapter)
('2023-03-15', NULL, 'Certification Python Data Science',
 'Certification en programmation Python pour la Data Science (Pandas, NumPy, Scikit-learn).',
 'certification', 'award',
 '{"score": "95%"}',
 ARRAY['Python', 'Pandas', 'NumPy', 'Scikit-learn'],
 false, 4),

('2023-06-20', NULL, 'Certification Machine Learning',
 'Certification en Machine Learning : algorithmes supervisés, non-supervisés, feature engineering.',
 'certification', 'award',
 '{"score": "92%"}',
 ARRAY['Machine Learning', 'Scikit-learn', 'TensorFlow'],
 false, 5),

-- Projet de fin de formation (exemple)
('2023-11-01', '2023-12-20', 'Projet de Fin de Formation',
 'Développement d''un système de prédiction avec ML : de l''analyse exploratoire au déploiement (FastAPI + Docker).',
 'project', 'code',
 '{"accuracy": "89%", "deployment": "Docker", "api": "FastAPI"}',
 ARRAY['Python', 'Scikit-learn', 'FastAPI', 'Docker'],
 true, 6),

-- Alternance (2024-2025)
('2024-09-01', '2025-08-31', 'Data Scientist en Alternance',
 'Alternance au sein d''une équipe Data Science : développement de modèles ML en production, automatisation de pipelines ETL, reporting et visualisation.',
 'alternance', 'code',
 '{"models_deployed": 3, "pipelines": 5, "team_size": 6}',
 ARRAY['Python', 'Scikit-learn', 'Pandas', 'SQL', 'Docker', 'Git', 'Airflow'],
 true, 7),

-- Certification en cours (exemple)
('2025-01-15', NULL, 'AWS ML Specialty (en cours)',
 'Préparation de la certification AWS Certified Machine Learning - Specialty. Objectif : maîtriser le déploiement de modèles ML sur AWS.',
 'certification', 'award',
 '{"progress": 60}',
 ARRAY['AWS', 'SageMaker', 'Cloud', 'MLOps'],
 false, 8);

-- Insert skills (technical)
INSERT INTO skills (name, category, subcategory, proficiency_level, years_experience, is_primary) VALUES
-- Machine Learning
('Python', 'technical', 'machine-learning', 4, 2, true),
('Scikit-learn', 'technical', 'machine-learning', 4, 2, true),
('TensorFlow', 'technical', 'machine-learning', 3, 1.5, false),
('PyTorch', 'technical', 'machine-learning', 3, 1, false),
('XGBoost', 'technical', 'machine-learning', 4, 1.5, false),
('Feature Engineering', 'technical', 'machine-learning', 4, 2, true),

-- Data Engineering
('SQL', 'technical', 'data-engineering', 4, 2, true),
('Pandas', 'technical', 'data-engineering', 4, 2, true),
('NumPy', 'technical', 'data-engineering', 4, 2, false),
('Apache Airflow', 'technical', 'data-engineering', 3, 1, false),
('ETL/ELT', 'technical', 'data-engineering', 3, 1, false),

-- Cloud & MLOps
('Docker', 'technical', 'mlops', 3, 1.5, false),
('Git', 'technical', 'mlops', 4, 2, true),
('FastAPI', 'technical', 'mlops', 4, 1.5, false),
('MLflow', 'technical', 'mlops', 3, 1, false),
('AWS', 'technical', 'cloud', 2, 0.5, false),

-- Visualization
('Streamlit', 'technical', 'visualization', 4, 1.5, false),
('Plotly', 'technical', 'visualization', 3, 1, false),
('Tableau', 'technical', 'visualization', 3, 1, false),

-- Business Skills
('Vulgarisation Technique', 'business', 'communication', 5, 7, true),
('Analyse ROI', 'business', 'business-analysis', 4, 5, true),
('Compréhension Métier', 'business', 'business-analysis', 5, 7, true),
('Présentation Client', 'business', 'communication', 5, 5, true),
('Négociation', 'business', 'soft-skills', 4, 5, false);

-- Insert social links
INSERT INTO social_links (platform, url, display_name, icon, display_order) VALUES
('linkedin', 'https://www.linkedin.com/in/votre-profil', 'LinkedIn', 'linkedin', 1),
('github', 'https://github.com/votre-username', 'GitHub', 'github', 2),
('kaggle', 'https://www.kaggle.com/votre-username', 'Kaggle', 'kaggle', 3),
('email', 'mailto:raouf.addeche@example.com', 'Email', 'mail', 4);


-- ============================================================================
-- PHASE 2 SEED — projects, blog posts, testimonials, github stats
-- ============================================================================

-- ----------------------------------------
-- 1. PROJECTS (Top 3-5 featured projects)
-- ----------------------------------------

-- Project 1: ML Model for Business Prediction
INSERT INTO projects (
    title, slug, short_description, long_description,
    github_url, github_repo_name, github_language,
    category, tags, technologies,
    metrics, business_impact,
    is_featured, is_published, display_order,
    project_date, duration_months, team_size, role
) VALUES (
    'Prédiction de Churn Client avec ML',
    'churn-prediction-ml',
    'Modèle de Machine Learning pour prédire le désabonnement client avec 92% de précision',
    'Développement d''un pipeline complet de Machine Learning pour identifier les clients à risque de churn. Le modèle utilise des algorithmes d''ensemble (Random Forest + XGBoost) et analyse 50+ features comportementales. L''API REST permet l''intégration avec les outils CRM existants.',
    'https://github.com/votre-username/churn-prediction',
    'churn-prediction',
    'Python',
    'ml',
    ARRAY['Machine Learning', 'Data Science', 'Business Impact'],
    ARRAY['Python', 'Scikit-learn', 'XGBoost', 'FastAPI', 'Docker'],
    '{"accuracy": "92%", "clients_saved": "150+", "roi": "+25%", "api_uptime": "99.8%"}',
    'Réduction de 25% du taux de churn en permettant des interventions proactives sur les clients à risque. Économie estimée de 500K€/an pour l''entreprise.',
    TRUE, -- featured
    TRUE, -- published
    1, -- display order
    '2024-06-01',
    4, -- 4 months
    1, -- solo
    'Lead Developer'
) ON CONFLICT (slug) DO NOTHING;

-- Project 2: Data Visualization Dashboard
INSERT INTO projects (
    title, slug, short_description, long_description,
    github_url, github_repo_name, github_language,
    category, tags, technologies,
    metrics, business_impact,
    is_featured, is_published, display_order,
    project_date, duration_months, team_size, role
) VALUES (
    'Dashboard Analytics Temps Réel',
    'realtime-analytics-dashboard',
    'Dashboard interactif pour visualiser les KPIs business en temps réel avec Python et Streamlit',
    'Dashboard full-stack permettant aux managers de suivre les métriques business critiques en temps réel. Intégration avec PostgreSQL, calculs automatisés, et alertes configurables. Interface intuitive développée avec Streamlit.',
    'https://github.com/votre-username/analytics-dashboard',
    'analytics-dashboard',
    'Python',
    'data_viz',
    ARRAY['Data Visualization', 'Business Intelligence', 'Dashboards'],
    ARRAY['Python', 'Streamlit', 'Plotly', 'PostgreSQL', 'Pandas'],
    '{"users": "50+", "dashboards": "12", "refresh_rate": "real-time", "uptime": "99.5%"}',
    'Permet aux équipes commerciales de prendre des décisions data-driven en temps réel. Réduit le temps d''analyse de 80% (de 2h à 20 minutes par semaine).',
    TRUE, -- featured
    TRUE,
    2,
    '2024-03-01',
    3,
    2,
    'Co-Lead'
) ON CONFLICT (slug) DO NOTHING;

-- Project 3: Automation Tool
INSERT INTO projects (
    title, slug, short_description, long_description,
    github_url, github_repo_name, github_language,
    demo_url,
    category, tags, technologies,
    metrics, business_impact,
    is_featured, is_published, display_order,
    project_date, duration_months, team_size, role
) VALUES (
    'Automatisation Portfolio avec Workflows + AI',
    'automated-portfolio',
    'Système d''automatisation intelligent pour gérer un portfolio professionnel via workflows et LLMs',
    'Architecture complète d''automatisation orchestrant des workflows, Ollama pour l''analyse IA locale, et PostgreSQL pour le stockage. Le système scanne automatiquement GitHub, génère des résumés de projets avec des LLMs, et met à jour le portfolio avec validation humaine.',
    'https://github.com/votre-username/portfolio-automation',
    'portfolio-automation',
    'Python',
    'https://votre-portfolio.com',
    'automation',
    ARRAY['Automation', 'AI/ML', 'Full Stack'],
    ARRAY['Docker', 'PostgreSQL', 'Ollama', 'FastAPI', 'React'],
    '{"workflows": "5+", "automation_rate": "90%", "time_saved": "10h/week"}',
    'Réduit le temps de maintenance du portfolio de 10h/semaine à 1h. Le système permet de garder le portfolio toujours à jour automatiquement.',
    TRUE, -- featured
    TRUE,
    3,
    '2025-01-01',
    2,
    1,
    'Solo Creator'
) ON CONFLICT (slug) DO NOTHING;

-- Project 4: SQL Analysis for E-commerce
INSERT INTO projects (
    title, slug, short_description, long_description,
    github_url, github_repo_name, github_language,
    category, tags, technologies,
    metrics, business_impact,
    is_featured, is_published, display_order,
    project_date, duration_months, team_size, role
) VALUES (
    'Analyse E-commerce avec SQL & Python',
    'ecommerce-sql-analysis',
    'Analyses approfondies des données e-commerce pour optimiser les ventes et le taux de conversion',
    'Projet d''analyse data pour un site e-commerce. Utilisation de SQL complexe (CTEs, Window Functions) pour extraire les insights, et Python pour la visualisation. Analyses : segmentation client RFM, analyse panier, funnel de conversion, et prédiction de LTV.',
    'https://github.com/votre-username/ecommerce-analysis',
    'ecommerce-analysis',
    'Python',
    'analysis',
    ARRAY['Data Analysis', 'SQL', 'Business Strategy'],
    ARRAY['SQL', 'Python', 'PostgreSQL', 'Jupyter', 'Pandas', 'Seaborn'],
    '{"queries": "50+", "insights": "15", "conversion_increase": "+12%"}',
    'Identification de 3 segments clients clés qui génèrent 70% du CA. Optimisation du funnel qui a augmenté le taux de conversion de 12%.',
    FALSE, -- not featured (top 3 only)
    TRUE,
    4,
    '2023-11-01',
    2,
    1,
    'Data Analyst'
) ON CONFLICT (slug) DO NOTHING;

-- Project 5: API REST with FastAPI
INSERT INTO projects (
    title, slug, short_description, long_description,
    github_url, github_repo_name, github_language,
    category, tags, technologies,
    metrics, business_impact,
    is_featured, is_published, display_order,
    project_date, duration_months, team_size, role
) VALUES (
    'API REST pour Portfolio Dynamique',
    'portfolio-api-fastapi',
    'API backend complète avec FastAPI pour gérer un portfolio professionnel dynamique',
    'API REST moderne avec FastAPI permettant de gérer toutes les données du portfolio (profil, timeline, projets, blog, témoignages). Documentation auto-générée avec Swagger, validation Pydantic, et intégration PostgreSQL asynchrone.',
    'https://github.com/votre-username/portfolio-api',
    'portfolio-api',
    'Python',
    'web_app',
    ARRAY['Backend', 'API', 'Web Development'],
    ARRAY['FastAPI', 'Python', 'PostgreSQL', 'asyncpg', 'Pydantic', 'Docker'],
    '{"endpoints": "25+", "response_time": "<50ms", "uptime": "99.9%"}',
    'Architecture backend scalable permettant de gérer un portfolio entièrement data-driven. Performance optimale et documentation complète pour intégrations futures.',
    FALSE,
    TRUE,
    5,
    '2025-01-15',
    1,
    1,
    'Backend Developer'
) ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------
-- 2. BLOG POSTS (Articles techniques)
-- ----------------------------------------

-- Article 1: Reconversion Data Science
INSERT INTO blog_posts (
    title, slug, excerpt, content,
    meta_title, meta_description, keywords,
    category, tags, read_time_minutes,
    is_published, is_featured, published_at
) VALUES (
    'De Commercial à Data Scientist : Mon Parcours de Reconversion en 2 Ans',
    'reconversion-commercial-data-scientist',
    'Comment j''ai réussi ma transition professionnelle du commerce vers la Data Science en 2 ans : formations, challenges, et conseils pratiques.',
    '# De Commercial à Data Scientist : Mon Parcours

À 26 ans, après 5 ans dans le commerce, j''ai décidé de tout plaquer pour me reconvertir en Data Science...

## Les Motivations
- Passion pour les chiffres et l''analyse
- Envie de combiner business et tech
- Impact mesurable des décisions data-driven

## Le Parcours
**Année 1 : Formation Intensive**
- 1500h de formation (Python, ML, SQL)
- 12 projets concrets
- 3 certifications obtenues

**Année 2 : Alternance**
- Application en contexte réel
- Projets ML en production
- Veille technologique continue

## Les Défis
1. **Syndrome de l''imposteur** : Normal et temporaire
2. **Courbe d''apprentissage** : Steep mais gérable
3. **Réseau professionnel** : À reconstruire from scratch

## Mes Conseils
✅ Choisir une formation avec projets concrets
✅ Construire un portfolio dès le début
✅ Networker dans la communauté data
✅ Ne pas négliger le business knowledge (votre atout !)

## Résultats après 2 ans
- 15+ projets ML/Data en portfolio
- CDI ou Freelance : les deux portes ouvertes
- Salaire : +40% vs commerce

**La reconversion est possible !** Votre expérience business est un ÉNORME atout en Data Science.',
    'Reconversion Commercial → Data Scientist : Guide Complet',
    'Découvrez comment réussir votre reconversion de commercial à data scientist en 2 ans : formations, projets, défis et conseils pratiques.',
    ARRAY['reconversion', 'data science', 'carrière', 'formation', 'commercial'],
    'case_study',
    ARRAY['Career', 'Data Science', 'Reconversion', 'Business'],
    8, -- 8 min read
    TRUE,
    TRUE, -- featured article
    '2025-01-15 10:00:00'
) ON CONFLICT (slug) DO NOTHING;

-- Article 2: ML en production
INSERT INTO blog_posts (
    title, slug, excerpt, content,
    meta_title, meta_description, keywords,
    category, tags, read_time_minutes,
    is_published, is_featured, published_at
) VALUES (
    'Déployer un Modèle ML en Production : Le Guide Pratique',
    'deployer-ml-production-guide',
    'Les étapes essentielles pour passer d''un notebook Jupyter à un modèle ML déployé en production avec FastAPI et Docker.',
    '# Déployer un Modèle ML en Production

Vous avez un modèle qui marche en local ? Parfait. Maintenant, comment le mettre en production ?

## Architecture Recommandée
```
Modèle Trained → FastAPI → Docker → Cloud (AWS/Azure/GCP)
```

## Étapes Clés

### 1. Préparer le Modèle
- Sérialiser avec joblib ou pickle
- Versionner le modèle (MLflow)
- Tester sur données réelles

### 2. Créer l''API
```python
from fastapi import FastAPI
import joblib

app = FastAPI()
model = joblib.load("model.pkl")

@app.post("/predict")
def predict(data: InputData):
    prediction = model.predict(data.to_array())
    return {"prediction": prediction}
```

### 3. Dockeriser
```dockerfile
FROM python:3.11-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

### 4. Monitoring
- Logs détaillés
- Métriques de performance (latence, throughput)
- Drift detection (données + prédictions)

## Checklist Production
- [ ] Tests unitaires (>80% coverage)
- [ ] Documentation API (Swagger)
- [ ] Gestion erreurs et validations
- [ ] Rate limiting
- [ ] Logs structurés (JSON)
- [ ] Health check endpoint
- [ ] CI/CD pipeline

**Le ML en production n''est pas juste du code. C''est de l''engineering.**',
    'Déployer un Modèle ML en Production avec FastAPI et Docker',
    'Guide pratique complet pour déployer un modèle Machine Learning en production : API, Docker, monitoring et bonnes pratiques.',
    ARRAY['machine learning', 'production', 'fastapi', 'docker', 'mlops'],
    'tutorial',
    ARRAY['Machine Learning', 'MLOps', 'FastAPI', 'Docker', 'Production'],
    12,
    TRUE,
    TRUE,
    '2025-01-10 09:00:00'
) ON CONFLICT (slug) DO NOTHING;

-- Article 3: SQL avancé
INSERT INTO blog_posts (
    title, slug, excerpt, content,
    meta_title, meta_description, keywords,
    category, tags, read_time_minutes,
    is_published, is_featured, published_at
) VALUES (
    'SQL Avancé pour Data Scientists : CTEs, Window Functions et Optimisations',
    'sql-avance-data-scientists',
    'Maîtrisez les techniques SQL avancées essentielles pour tout Data Scientist : CTEs, Window Functions, et optimisation de requêtes.',
    '# SQL Avancé pour Data Scientists

SQL n''est pas juste SELECT FROM WHERE. Voici les techniques qui font la différence.

## 1. CTEs (Common Table Expressions)
```sql
WITH monthly_sales AS (
    SELECT
        DATE_TRUNC(''month'', order_date) as month,
        SUM(amount) as revenue
    FROM orders
    GROUP BY 1
),
growth AS (
    SELECT
        month,
        revenue,
        LAG(revenue) OVER (ORDER BY month) as prev_month,
        revenue - LAG(revenue) OVER (ORDER BY month) as growth
    FROM monthly_sales
)
SELECT * FROM growth;
```

## 2. Window Functions
Les plus utiles :
- `ROW_NUMBER()` : Ranking sans ex-aequo
- `RANK()` : Ranking avec ex-aequo
- `LAG()/LEAD()` : Valeurs précédentes/suivantes
- `SUM() OVER()` : Cumulative sums

## 3. Optimisation
### Avant (lent)
```sql
SELECT * FROM orders WHERE YEAR(order_date) = 2024;
```

### Après (rapide)
```sql
SELECT * FROM orders
WHERE order_date >= ''2024-01-01''
  AND order_date < ''2025-01-01'';
```

## Pourquoi c''est crucial ?
- 80% du temps d''un DS est de la data prep
- SQL bien écrit = 100x plus rapide que Pandas
- Moins de données = moins de RAM = meilleurs perfs

**Investir dans SQL, c''est investir dans votre productivité.**',
    'SQL Avancé pour Data Scientists : CTEs et Window Functions',
    'Techniques SQL avancées indispensables : CTEs, Window Functions, optimisations pour requêtes 100x plus rapides.',
    ARRAY['sql', 'data science', 'analytics', 'performance', 'database'],
    'tutorial',
    ARRAY['SQL', 'Data Science', 'Analytics', 'Database'],
    10,
    TRUE,
    FALSE,
    '2025-01-05 14:00:00'
) ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------
-- 3. TESTIMONIALS (Social Proof)
-- ----------------------------------------

-- Testimonial 1: Manager
INSERT INTO testimonials (
    author_name, author_title, author_company,
    author_linkedin_url,
    quote, rating,
    relationship, project_context, date_given,
    is_featured, is_published, display_order
) VALUES (
    'Sophie Martin',
    'Head of Data Science',
    'TechCorp France',
    'https://linkedin.com/in/sophie-martin-example',
    'Raouf a démontré une capacité exceptionnelle à traduire des problèmes business complexes en solutions ML concrètes. Son background commercial est un atout majeur : il comprend les enjeux métier et communique efficacement avec les stakeholders non-techniques. Le modèle de churn prediction qu''il a développé nous fait économiser 500K€/an.',
    5,
    'manager',
    'Projet ML Churn Prediction',
    '2024-12-15',
    TRUE, -- featured
    TRUE,
    1
);

-- Testimonial 2: Colleague
INSERT INTO testimonials (
    author_name, author_title, author_company,
    author_linkedin_url,
    quote, rating,
    relationship, project_context, date_given,
    is_featured, is_published, display_order
) VALUES (
    'Marc Dubois',
    'Senior Data Engineer',
    'TechCorp France',
    'https://linkedin.com/in/marc-dubois-example',
    'Travailler avec Raouf a été un plaisir. Il est rigoureux, autonome, et toujours curieux d''apprendre. Son code est propre, bien documenté, et il suit les bonnes pratiques MLOps. Il a rapidement monté en compétences sur FastAPI et Docker pour déployer nos modèles en production.',
    5,
    'colleague',
    'Collaboration équipe Data',
    '2024-11-20',
    TRUE,
    TRUE,
    2
);

-- Testimonial 3: Client (Freelance)
INSERT INTO testimonials (
    author_name, author_title, author_company,
    author_linkedin_url,
    quote, rating,
    relationship, project_context, date_given,
    is_featured, is_published, display_order
) VALUES (
    'Jean Dupont',
    'CEO',
    'StartupXYZ',
    'https://linkedin.com/in/jean-dupont-example',
    'Raouf nous a aidés à construire notre premier dashboard analytics. Il a su comprendre nos besoins business, proposer une solution adaptée, et livrer dans les temps. Communication claire, proactivité, et résultats au rendez-vous. Je le recommande vivement pour des missions data/ML.',
    5,
    'client',
    'Mission freelance Dashboard Analytics',
    '2024-10-30',
    TRUE,
    TRUE,
    3
);

-- Testimonial 4: Mentor
INSERT INTO testimonials (
    author_name, author_title, author_company,
    author_linkedin_url,
    quote, rating,
    relationship, project_context, date_given,
    is_featured, is_published, display_order
) VALUES (
    'Dr. Pierre Laurent',
    'Lead Data Scientist & Mentor',
    'DataAcademy',
    'https://linkedin.com/in/pierre-laurent-example',
    'J''ai suivi Raouf pendant sa formation intensive en Data Science. Parmi les 50 élèves de la promo, il s''est démarqué par sa détermination, son pragmatisme, et sa capacité à aller au-delà des exercices demandés. Sa reconversion depuis le commerce lui donne une vision unique du métier.',
    5,
    'mentor',
    'Formation Data Science intensive',
    '2023-12-10',
    FALSE,
    TRUE,
    4
);

-- ----------------------------------------
-- 4. GITHUB STATS (Initial seed - updated via API)
-- ----------------------------------------

INSERT INTO github_stats (
    username,
    total_repos, total_stars, total_forks,
    followers, following,
    total_contributions_year, current_streak_days, longest_streak_days,
    languages,
    top_repos,
    last_fetched_at
) VALUES (
    'votre-username', -- CHANGE THIS
    25, -- total repos
    150, -- total stars
    30, -- total forks
    50, -- followers
    40, -- following
    800, -- contributions this year
    15, -- current streak
    45, -- longest streak
    '{"Python": 45, "JavaScript": 25, "SQL": 15, "TypeScript": 10, "Other": 5}'::jsonb,
    '[
        {"name": "churn-prediction", "stars": 50, "language": "Python", "description": "ML model for customer churn prediction"},
        {"name": "analytics-dashboard", "stars": 35, "language": "Python", "description": "Real-time analytics dashboard with Streamlit"},
        {"name": "portfolio-automation", "stars": 30, "language": "Python", "description": "Automated portfolio with workflows and AI"},
        {"name": "ecommerce-analysis", "stars": 20, "language": "Python", "description": "E-commerce data analysis with SQL"},
        {"name": "portfolio-api", "stars": 15, "language": "Python", "description": "FastAPI backend for dynamic portfolio"}
    ]'::jsonb,
    CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;


-- ============================================================================
-- PHASE 3 SEED — content overrides, mode targeting, demo analytics
-- ============================================================================

-- ----------------------------------------
-- 1. MODE CONTENT OVERRIDES
-- ----------------------------------------

-- Hero pitch overrides
INSERT INTO mode_content_overrides (mode_key, content_type, content_id, override_field, override_value, priority) VALUES
(
    'cdi',
    'hero_pitch',
    NULL,
    'hero_pitch',
    'Data Scientist Full-Stack avec 2 ans d''expérience en ML/IA et 5+ ans de background business. Je transforme des problèmes complexes en solutions data-driven concrètes. Spécialisé en Python, Machine Learning, et déploiement de modèles en production.',
    10
),
(
    'freelance',
    'hero_pitch',
    NULL,
    'hero_pitch',
    'Expert Data Science & ML disponible en freelance pour accompagner vos projets IA. Mon profil hybride Tech + Business me permet de comprendre vos enjeux métier et de livrer des solutions qui génèrent du ROI mesurable. Intervention rapide, résultats concrets.',
    10
)
ON CONFLICT (mode_key, content_type, content_id, override_field) DO NOTHING;

-- Title overrides
INSERT INTO mode_content_overrides (mode_key, content_type, content_id, override_field, override_value, priority) VALUES
(
    'cdi',
    'title',
    NULL,
    'title',
    'Data Scientist Full-Stack • En recherche CDI',
    10
),
(
    'freelance',
    'title',
    NULL,
    'title',
    'Data Scientist Freelance • Missions ML/IA',
    10
)
ON CONFLICT (mode_key, content_type, content_id, override_field) DO NOTHING;

-- Project 1 overrides (Churn Prediction)
INSERT INTO mode_content_overrides (mode_key, content_type, content_id, override_field, override_value, priority) VALUES
(
    'cdi',
    'project',
    1,
    'short_description',
    'Pipeline ML complet pour prédire le churn client avec 92% de précision. Démontration de mes compétences en ML engineering, feature engineering, et déploiement FastAPI.',
    5
),
(
    'freelance',
    'project',
    1,
    'short_description',
    'Solution ML qui a permis à mon client de réduire son churn de 25% et d''économiser 500K€/an. ROI prouvé en 4 mois. Intervention complète de l''analyse au déploiement.',
    5
)
ON CONFLICT (mode_key, content_type, content_id, override_field) DO NOTHING;

-- Project 2 overrides (Dashboard)
INSERT INTO mode_content_overrides (mode_key, content_type, content_id, override_field, override_value, priority) VALUES
(
    'cdi',
    'project',
    2,
    'short_description',
    'Dashboard interactif temps réel avec Streamlit et PostgreSQL. Compétences démontrées : data viz, backend optimization, UX design pour stakeholders non-techniques.',
    5
),
(
    'freelance',
    'project',
    2,
    'short_description',
    'Dashboard qui a transformé la prise de décision de l''équipe commerciale : réduction de 80% du temps d''analyse (2h → 20min/semaine). Solution clé en main déployée en 3 mois.',
    5
)
ON CONFLICT (mode_key, content_type, content_id, override_field) DO NOTHING;

-- Availability overrides
INSERT INTO mode_content_overrides (mode_key, content_type, content_id, override_field, override_value, priority) VALUES
(
    'cdi',
    'availability',
    NULL,
    'availability',
    'Disponible à partir d''Août 2025 pour un CDI',
    10
),
(
    'freelance',
    'availability',
    NULL,
    'availability',
    'Disponible immédiatement • TJM selon mission',
    10
)
ON CONFLICT (mode_key, content_type, content_id, override_field) DO NOTHING;

-- ----------------------------------------
-- 2. UPDATE PROJECTS TARGET MODES
-- ----------------------------------------

-- Project 1: Churn Prediction - Both modes, higher priority for Freelance
UPDATE projects SET
    target_modes = ARRAY['cdi', 'freelance'],
    mode_priority = '{"cdi": 5, "freelance": 10}'::jsonb
WHERE id = 1;

-- Project 2: Dashboard - Both modes, balanced
UPDATE projects SET
    target_modes = ARRAY['cdi', 'freelance'],
    mode_priority = '{"cdi": 8, "freelance": 9}'::jsonb
WHERE id = 2;

-- Project 3: Portfolio Automation - More CDI-focused (shows technical skills)
UPDATE projects SET
    target_modes = ARRAY['cdi', 'freelance'],
    mode_priority = '{"cdi": 10, "freelance": 5}'::jsonb
WHERE id = 3;

-- Project 4: E-commerce Analysis - More Freelance-focused (business results)
UPDATE projects SET
    target_modes = ARRAY['cdi', 'freelance'],
    mode_priority = '{"cdi": 6, "freelance": 8}'::jsonb
WHERE id = 4;

-- Project 5: API FastAPI - CDI-focused (technical depth)
UPDATE projects SET
    target_modes = ARRAY['cdi'],
    mode_priority = '{"cdi": 9, "freelance": 0}'::jsonb
WHERE id = 5;

-- ----------------------------------------
-- 3. UPDATE BLOG TARGET MODES
-- ----------------------------------------

-- Article 1: Reconversion - Both modes
UPDATE blog_posts SET target_modes = ARRAY['cdi', 'freelance'] WHERE id = 1;

-- Article 2: ML Production - CDI-focused
UPDATE blog_posts SET target_modes = ARRAY['cdi', 'freelance'] WHERE id = 2;

-- Article 3: SQL - Both modes
UPDATE blog_posts SET target_modes = ARRAY['cdi', 'freelance'] WHERE id = 3;

-- ----------------------------------------
-- 4. EXAMPLE ANALYTICS SESSIONS (Demo data)
-- ----------------------------------------

-- Sample session 1: CDI recruiter
INSERT INTO visitor_sessions (
    id, landing_page, landing_mode, referrer_source,
    utm_source, utm_campaign,
    device_type, browser, os,
    page_views, projects_viewed, cv_downloaded,
    modes_viewed, session_duration_seconds,
    first_seen_at, last_seen_at
) VALUES (
    gen_random_uuid(),
    '/portfolio',
    'cdi',
    'linkedin',
    'linkedin',
    'job_posting_senior_ds',
    'desktop',
    'Chrome',
    'Windows 10',
    8,
    4,
    TRUE,
    ARRAY['cdi'],
    420, -- 7 minutes
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '7 minutes'
);

-- Sample session 2: Freelance client
INSERT INTO visitor_sessions (
    id, landing_page, landing_mode, referrer_source,
    utm_source, utm_campaign,
    device_type, browser, os,
    page_views, projects_viewed, contact_submitted,
    modes_viewed, mode_switches, session_duration_seconds,
    first_seen_at, last_seen_at
) VALUES (
    gen_random_uuid(),
    '/portfolio',
    'freelance',
    'google',
    'google',
    'data_scientist_freelance',
    'desktop',
    'Firefox',
    'macOS',
    12,
    5,
    TRUE,
    ARRAY['freelance', 'cdi'],
    1, -- Switched once to see CDI mode
    780, -- 13 minutes
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '13 minutes'
);

-- Sample session 3: Casual visitor (mobile)
INSERT INTO visitor_sessions (
    id, landing_page, landing_mode, referrer_source,
    device_type, browser, os,
    page_views, projects_viewed,
    modes_viewed, session_duration_seconds,
    first_seen_at, last_seen_at
) VALUES (
    gen_random_uuid(),
    '/portfolio',
    'cdi',
    'direct',
    'mobile',
    'Safari',
    'iOS',
    3,
    1,
    ARRAY['cdi'],
    90, -- 1.5 minutes
    CURRENT_TIMESTAMP - INTERVAL '3 hours',
    CURRENT_TIMESTAMP - INTERVAL '3 hours' + INTERVAL '90 seconds'
);

-- ----------------------------------------
-- 5. SAMPLE ANALYTICS EVENTS
-- ----------------------------------------

-- Example events for demo
DO $$
DECLARE
    v_session_id UUID;
BEGIN
    -- Get a sample session ID
    SELECT id INTO v_session_id FROM visitor_sessions LIMIT 1;

    IF v_session_id IS NOT NULL THEN
        -- Page view events
        INSERT INTO analytics_events (session_id, event_type, event_category, event_label, portfolio_mode, page_url) VALUES
        (v_session_id, 'page_view', 'navigation', 'Hero Section', 'cdi', '/portfolio'),
        (v_session_id, 'page_view', 'navigation', 'Projects Section', 'cdi', '/portfolio#projects'),
        (v_session_id, 'page_view', 'navigation', 'Contact Section', 'cdi', '/portfolio#contact');

        -- Engagement events
        INSERT INTO analytics_events (session_id, event_type, event_category, event_label, target_type, target_id, portfolio_mode) VALUES
        (v_session_id, 'click', 'engagement', 'Project Card Clicked', 'project', 1, 'cdi'),
        (v_session_id, 'project_view', 'engagement', 'Churn Prediction Project', 'project', 1, 'cdi');

        -- Conversion events
        INSERT INTO analytics_events (session_id, event_type, event_category, event_label, event_value, portfolio_mode) VALUES
        (v_session_id, 'cv_download', 'conversion', 'CV Downloaded', 1, 'cdi');
    END IF;
END $$;
