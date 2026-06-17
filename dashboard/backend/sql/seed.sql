-- =====================================================================
-- SEED — données réelles (source : CV Raouf Addeche 2026)
-- Rejouable : on repart d'un contenu propre à chaque exécution.
-- Les projets affichés proviennent des vrais repos GitHub (table
-- portfolio_items, alimentée par POST /api/github/sync) — pas d'ici.
-- Témoignages et blog : volontairement vides (à remplir avec du vrai).
-- =====================================================================

TRUNCATE profile, timeline_events, skills, social_links,
         testimonials, blog_posts, projects, case_studies
  RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------
-- PROFIL
-- ---------------------------------------------------------------------
INSERT INTO profile (full_name, title, bio, hero_pitch, email, phone,
                     linkedin_url, github_url, photo_url, location, availability)
VALUES (
  'Raouf Addeche',
  'Ingénieur IA & Data · GenAI Engineer',
  'Passionné par l''IA appliquée et la Data, je conçois des solutions utiles, '
  'pensées pour les usages réels et les besoins métier. Mon expérience en '
  'relation client m''a donné une forte compréhension du terrain, que j''allie '
  'aujourd''hui à des compétences techniques en IA générative, LLM et data engineering.',
  'Développeur IA chez Midas / Mobivia, je conçois des voicebots IA temps réel, '
  'des workflows basés sur les LLM et des outils d''assistance aux développeurs, '
  'déployés en production sur AWS.',
  'addeche.raouf@gmail.com',
  '06.87.89.90.04',
  'https://www.linkedin.com/in/raouf-addeche-706157113/',
  'https://github.com/RaoufAddeche',
  '/raouf.jpg',
  'Lille, France',
  'Mobilité France & International'
);

-- ---------------------------------------------------------------------
-- PARCOURS (timeline)  catégories : commercial | formation | alternance | certification
-- ---------------------------------------------------------------------
INSERT INTO timeline_events (date, end_date, title, description, category, tags, display_order, is_highlight) VALUES
('2017-09-01', NULL, 'BTS Négociation & Relation Client',
 'Efficom Lille. Fondamentaux de la relation commerciale et de l''accompagnement client.',
 'formation', ARRAY['Relation client','Négociation'], 1, FALSE),

('2017-01-01', '2024-12-31', 'Relation client & accompagnement métier',
 'Expérience terrain B2B/B2C : analyse des besoins, accompagnement métier et collaboration '
 'avec des profils opérationnels variés (Onenergy/Sowee–EDF, Orange, Engie, Regicom). '
 'Forte sensibilité aux usages et problématiques terrain.',
 'commercial', ARRAY['B2B','B2C','Conseil'], 2, FALSE),

('2024-01-01', NULL, 'Préqualification Développeur Data / IA',
 'Simplon Hauts-de-France. Remise à niveau et bascule vers le développement Data/IA.',
 'formation', ARRAY['Python','Data'], 3, FALSE),

('2024-09-01', '2026-12-31', 'École Microsoft — Développeur Data / IA',
 'Simplon Hauts-de-France. Data Science, Machine Learning, IA générative et '
 'développement d''applications IA.',
 'formation', ARRAY['Machine Learning','IA générative','Python'], 4, TRUE),

('2025-09-01', NULL, 'Développeur IA — Midas / Mobivia',
 'Conception d''un voicebot IA temps réel (Deepgram, Claude via AWS Bedrock, Cartesia, '
 'Twilio, AWS ECS/DynamoDB) déployé en production sur centres pilotes. Outils d''assistance '
 'développeur, contrôle qualité automatisé avant merge, agents de rétro-documentation et '
 'MCP interne connecté aux APIs métiers.',
 'alternance', ARRAY['LLM','AWS','Voicebot','FastAPI'], 5, TRUE),

('2025-01-01', NULL, 'Certifications Microsoft Azure',
 'Azure Fundamentals (AZ-900) et Azure AI Fundamentals (AI-900).',
 'certification', ARRAY['Azure','AZ-900','AI-900'], 6, FALSE);

-- ---------------------------------------------------------------------
-- COMPÉTENCES  category : technical | business
-- ---------------------------------------------------------------------
INSERT INTO skills (name, category, subcategory, proficiency_level, is_primary) VALUES
-- IA & Machine Learning
('Python',             'technical', 'IA & Machine Learning', 5, TRUE),
('LLMs',               'technical', 'IA & Machine Learning', 5, TRUE),
('Prompt Engineering', 'technical', 'IA & Machine Learning', 5, TRUE),
('LangChain',          'technical', 'IA & Machine Learning', 4, TRUE),
('LangGraph',          'technical', 'IA & Machine Learning', 4, FALSE),
('PyTorch',            'technical', 'IA & Machine Learning', 3, FALSE),
('Scikit-learn',       'technical', 'IA & Machine Learning', 4, FALSE),
-- Backend & APIs
('FastAPI',            'technical', 'Backend & APIs', 5, TRUE),
('Django',             'technical', 'Backend & APIs', 3, FALSE),
('APIs REST',          'technical', 'Backend & APIs', 4, FALSE),
('SQLAlchemy',         'technical', 'Backend & APIs', 4, FALSE),
-- Cloud & DevOps
('AWS',                'technical', 'Cloud & DevOps', 4, TRUE),
('Docker',             'technical', 'Cloud & DevOps', 4, TRUE),
('Git',                'technical', 'Cloud & DevOps', 5, FALSE),
('Prometheus / Grafana','technical','Cloud & DevOps', 3, FALSE),
-- IA conversationnelle & temps réel
('Deepgram (STT)',     'technical', 'IA conversationnelle', 4, FALSE),
('Cartesia (TTS)',     'technical', 'IA conversationnelle', 4, FALSE),
('Twilio',             'technical', 'IA conversationnelle', 4, FALSE),
-- Data & bases de données
('PostgreSQL',         'technical', 'Data & Bases de données', 4, TRUE),
('Pandas / NumPy',     'technical', 'Data & Bases de données', 4, FALSE),
('PySpark',            'technical', 'Data & Bases de données', 3, FALSE),
('MongoDB',            'technical', 'Data & Bases de données', 3, FALSE),
('SQL',                'technical', 'Data & Bases de données', 4, FALSE),
-- Frontend
('React',              'technical', 'Frontend & Interfaces', 4, FALSE),
('Tailwind CSS',       'technical', 'Frontend & Interfaces', 4, FALSE),
('Streamlit',          'technical', 'Frontend & Interfaces', 4, FALSE),
-- Atouts métier
('Vulgarisation technique', 'business', 'Atouts métier', 5, TRUE),
('Compréhension métier',    'business', 'Atouts métier', 5, TRUE),
('Autonomie & adaptabilité','business', 'Atouts métier', 5, FALSE),
('Veille IA & innovation',  'business', 'Atouts métier', 4, FALSE);

-- ---------------------------------------------------------------------
-- LIENS SOCIAUX
-- ---------------------------------------------------------------------
INSERT INTO social_links (platform, url, display_name, display_order, is_active) VALUES
('github',   'https://github.com/RaoufAddeche',          'GitHub',   1, TRUE),
('linkedin', 'https://www.linkedin.com/in/raouf-addeche-706157113/', 'LinkedIn', 2, TRUE),
('email',    'mailto:addeche.raouf@gmail.com',           'Email',    3, TRUE);

-- ---------------------------------------------------------------------
-- ÉTUDES DE CAS (projets phares — source : CV / expérience Midas)
-- ---------------------------------------------------------------------
INSERT INTO case_studies
  (slug, title, subtitle, company, role, period, summary, problem, approach,
   architecture, stack, results, tags, display_order)
VALUES
(
  'voicebot-ia-temps-reel',
  'Voicebot IA temps réel',
  'Prise en charge automatisée des appels manqués des centres Midas',
  'Midas / Mobivia', 'Développeur IA', '2025 — présent',
  'Un agent vocal IA qui décroche les appels manqués des centres, comprend la demande '
  'et qualifie le client en temps réel — déployé en production sur centres pilotes.',
  'Aux heures de pointe et en dehors des horaires, de nombreux appels clients restent '
  'sans réponse dans les centres Midas : autant de rendez-vous perdus et de frustration. '
  'L''enjeu : ne plus laisser un appel sans prise en charge, sans alourdir les équipes.',
  'Conception d''un agent vocal IA temps réel branché sur la téléphonie : il décroche '
  'l''appel manqué, transcrit la parole, raisonne sur la demande, qualifie le client et '
  'capte l''intention (prise de RDV, information), puis répond avec une voix naturelle — '
  'le tout avec une latence proche du temps réel.',
  '[
    {"step": "Appel entrant", "tech": "Twilio"},
    {"step": "Transcription (STT)", "tech": "Deepgram"},
    {"step": "Raisonnement & dialogue", "tech": "Claude Sonnet · AWS Bedrock"},
    {"step": "Synthèse vocale (TTS)", "tech": "Cartesia"},
    {"step": "Réponse à l''appelant", "tech": "Twilio"}
   ]'::jsonb,
  ARRAY['Python','Twilio','Deepgram','AWS Bedrock','Claude Sonnet','Cartesia','AWS ECS','DynamoDB'],
  ARRAY[
    'Déployé en production sur centres pilotes',
    'Qualification client automatisée des appels manqués',
    'Architecture temps réel à faible latence (STT → LLM → TTS)',
    'Objectif d''industrialisation à l''échelle nationale et européenne'
  ],
  ARRAY['IA Conversationnelle','Temps réel','AWS','LLM'],
  1
),
(
  'outils-ia-developpeurs',
  'Outils IA internes pour développeurs',
  'Fiabiliser et accélérer le dev sur une base de code legacy',
  'Midas / Mobivia', 'Développeur IA', '2025 — présent',
  'Un écosystème d''outils IA pour les équipes de dev : rétro-documentation de code '
  'legacy, contrôle qualité automatisé avant merge et MCP interne connecté aux APIs métiers.',
  'Une base de code legacy (VB.NET) peu documentée, une migration vers Angular/C# en cours '
  'et une qualité hétérogène avant les merge requests : autant de friction et de risque '
  'pour les équipes de développement.',
  'Mise en place d''outils IA au service des devs : des agents de rétro-documentation qui '
  'analysent le code legacy non documenté, un contrôle qualité automatisé avant merge '
  '(conventions, écarts, anomalies introduites), des workflows de prompt engineering pour '
  'GitHub Copilot / Claude Code, et un MCP interne centralisant les usages IA sur les APIs métiers.',
  '[
    {"step": "Code legacy non documenté", "tech": "VB.NET"},
    {"step": "Agents de rétro-documentation", "tech": "LLM"},
    {"step": "Contrôle qualité avant merge", "tech": "Analyse automatisée"},
    {"step": "Accès centralisé aux APIs métiers", "tech": "MCP interne"}
   ]'::jsonb,
  ARRAY['Python','LLMs','MCP','GitHub Copilot','Claude Code','Prompt Engineering'],
  ARRAY[
    'Détection automatique des conventions manquantes et anomalies avant merge',
    'Documentation automatique d''un code legacy non documenté',
    'Accompagnement de la migration VB.NET → Angular/C#',
    'Usages IA centralisés et enrichis via un MCP interne'
  ],
  ARRAY['IA Agentique','Developer Tooling','MCP'],
  2
);
