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
  'Ingénieur IA & Data de 28 ans, basé à Lille (mobilité France & international). '
  'Après 7 ans en relation client B2B/B2C, je me suis reconverti vers la data et l''IA '
  'via l''École Microsoft by Simplon. Je conçois des solutions utiles, pensées pour les '
  'usages réels et les besoins métier, en combinant des compétences techniques (IA '
  'générative, LLM, agents IA, data engineering) et une vraie compréhension du terrain. '
  'Langues : français (langue maternelle), anglais professionnel (B2).',
  'Développeur IA chez Midas / Mobivia, je conçois des voicebots IA temps réel, '
  'des workflows basés sur les LLM et des outils d''assistance aux développeurs, '
  'déployés en production sur AWS.',
  'addeche.raouf@gmail.com',
  '06.87.89.90.04',
  'https://www.linkedin.com/in/raouf-addeche-706157113',
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
 'Conception et mise en production de solutions IA sur AWS : voicebot temps réel, agents et '
 'outils internes pour les développeurs. CI/CD, déploiement et sécurité de bout en bout. '
 '(Détail dans les études de cas.)',
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
('MCP',                'technical', 'IA & Machine Learning', 4, TRUE),
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
('Terraform',          'technical', 'Cloud & DevOps', 3, FALSE),
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
-- Dataviz & BI
('Power BI',           'technical', 'Dataviz & BI', 4, FALSE),
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
('linkedin', 'https://www.linkedin.com/in/raouf-addeche-706157113', 'LinkedIn', 2, TRUE),
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

-- =====================================================================
-- TRADUCTIONS ANGLAISES (colonnes _en) — repli FR si absent côté API
-- =====================================================================

-- Profil
UPDATE profile SET
  title_en = 'AI & Data Engineer · GenAI Engineer',
  bio_en = 'Passionate about applied AI and data, I build useful solutions designed around '
    'real-world usage and business needs. My background in client relations gave me a strong '
    'grasp of the field, which I now combine with technical skills in generative AI, LLMs and '
    'data engineering.',
  hero_pitch_en = 'AI Developer at Midas / Mobivia, I build real-time AI voicebots, LLM-based '
    'workflows and developer-assistance tools, deployed in production on AWS.',
  availability_en = 'Available across France & internationally'
WHERE id = 1;

-- Parcours
UPDATE timeline_events SET
  title_en = 'Higher Diploma in Sales & Client Relations',
  description_en = 'Efficom Lille. Fundamentals of commercial relationships and client support.'
WHERE title = 'BTS Négociation & Relation Client';

UPDATE timeline_events SET
  title_en = 'Client Relations & Business Support',
  description_en = 'Field experience in B2B/B2C: needs analysis, business support and '
    'collaboration with diverse operational teams (Onenergy/Sowee–EDF, Orange, Engie, Regicom). '
    'Strong sensitivity to real-world usage and field challenges.'
WHERE title = 'Relation client & accompagnement métier';

UPDATE timeline_events SET
  title_en = 'Data / AI Developer — Pre-qualification',
  description_en = 'Simplon Hauts-de-France. Upskilling and transition into Data/AI development.'
WHERE title = 'Préqualification Développeur Data / IA';

UPDATE timeline_events SET
  title_en = 'Microsoft School — Data / AI Developer',
  description_en = 'Simplon Hauts-de-France. Data Science, Machine Learning, generative AI and '
    'AI application development.'
WHERE title = 'École Microsoft — Développeur Data / IA';

UPDATE timeline_events SET
  title_en = 'AI Developer — Midas / Mobivia',
  description_en = 'Design and production rollout of AI solutions on AWS: real-time voicebot, '
    'agents and internal developer tools. End-to-end CI/CD, deployment and security. '
    '(See the case studies for details.)'
WHERE title = 'Développeur IA — Midas / Mobivia';

UPDATE timeline_events SET
  title_en = 'Microsoft Azure Certifications',
  description_en = 'Azure Fundamentals (AZ-900) and Azure AI Fundamentals (AI-900).'
WHERE title = 'Certifications Microsoft Azure';

-- Compétences (libellés de sous-catégories)
UPDATE skills SET subcategory_en = 'AI & Machine Learning'   WHERE subcategory = 'IA & Machine Learning';
UPDATE skills SET subcategory_en = 'Backend & APIs'          WHERE subcategory = 'Backend & APIs';
UPDATE skills SET subcategory_en = 'Cloud & DevOps'          WHERE subcategory = 'Cloud & DevOps';
UPDATE skills SET subcategory_en = 'Conversational AI'       WHERE subcategory = 'IA conversationnelle';
UPDATE skills SET subcategory_en = 'Data & Databases'        WHERE subcategory = 'Data & Bases de données';
UPDATE skills SET subcategory_en = 'Frontend & Interfaces'   WHERE subcategory = 'Frontend & Interfaces';
UPDATE skills SET subcategory_en = 'Data Viz & BI'           WHERE subcategory = 'Dataviz & BI';
UPDATE skills SET subcategory_en = 'Soft Skills'             WHERE subcategory = 'Atouts métier';

-- Noms des compétences non techniques (les technos restent identiques -> repli FR)
UPDATE skills SET name_en = 'Technical communication'  WHERE name = 'Vulgarisation technique';
UPDATE skills SET name_en = 'Business acumen'          WHERE name = 'Compréhension métier';
UPDATE skills SET name_en = 'Autonomy & adaptability'  WHERE name = 'Autonomie & adaptabilité';
UPDATE skills SET name_en = 'AI watch & innovation'    WHERE name = 'Veille IA & innovation';

-- Études de cas
UPDATE case_studies SET
  title_en = 'Real-time AI voicebot',
  subtitle_en = 'Automated handling of missed calls for Midas centers',
  summary_en = 'An AI voice agent that answers missed calls at the centers, understands the '
    'request and qualifies the customer in real time — deployed in production across pilot centers.',
  problem_en = 'During peak hours and outside opening times, many customer calls go unanswered '
    'at Midas centers: lost appointments and frustration. The challenge: never leave a call '
    'unhandled, without overloading the teams.',
  approach_en = 'Designed a real-time AI voice agent plugged into telephony: it answers the '
    'missed call, transcribes speech, reasons about the request, qualifies the customer and '
    'captures intent (booking, information), then replies with a natural voice — all at '
    'near real-time latency.',
  architecture_en = '[
    {"step": "Incoming call", "tech": "Twilio"},
    {"step": "Speech-to-Text", "tech": "Deepgram"},
    {"step": "Reasoning & dialogue", "tech": "Claude Sonnet · AWS Bedrock"},
    {"step": "Text-to-Speech", "tech": "Cartesia"},
    {"step": "Reply to caller", "tech": "Twilio"}
   ]'::jsonb,
  results_en = ARRAY[
    'Deployed in production across pilot centers',
    'Automated customer qualification of missed calls',
    'Low-latency real-time architecture (STT → LLM → TTS)',
    'Targeting nationwide and European industrialization'
  ]
WHERE slug = 'voicebot-ia-temps-reel';

UPDATE case_studies SET
  title_en = 'Internal AI tools for developers',
  subtitle_en = 'Making development on a legacy codebase faster and more reliable',
  summary_en = 'An ecosystem of AI tools for dev teams: legacy code retro-documentation, '
    'automated pre-merge quality control and an internal MCP connected to business APIs.',
  problem_en = 'A poorly documented legacy codebase (VB.NET), an ongoing migration to '
    'Angular/C# and inconsistent quality before merge requests: friction and risk for the '
    'development teams.',
  approach_en = 'Built AI tools serving developers: retro-documentation agents that analyze '
    'undocumented legacy code, automated quality control before merge (conventions, gaps, '
    'newly introduced anomalies), prompt-engineering workflows for GitHub Copilot / Claude '
    'Code, and an internal MCP centralizing AI usage over business APIs.',
  architecture_en = '[
    {"step": "Undocumented legacy code", "tech": "VB.NET"},
    {"step": "Retro-documentation agents", "tech": "LLM"},
    {"step": "Pre-merge quality control", "tech": "Automated analysis"},
    {"step": "Centralized access to business APIs", "tech": "Internal MCP"}
   ]'::jsonb,
  results_en = ARRAY[
    'Automatic detection of missing conventions and anomalies before merge',
    'Automatic documentation of undocumented legacy code',
    'Support for the VB.NET → Angular/C# migration',
    'AI usage centralized and enriched via an internal MCP'
  ]
WHERE slug = 'outils-ia-developpeurs';

-- =====================================================================
-- TRADUCCIONES ESPAÑOLAS (columnas _es) — repli FR si absent côté API
-- =====================================================================

-- Perfil
UPDATE profile SET
  title_es = 'Ingeniero de IA y Datos · GenAI Engineer',
  bio_es = 'Ingeniero de IA y Datos de 28 años, residente en Lille (disponibilidad en Francia '
    'e internacional). Tras 7 años en relación con el cliente B2B/B2C, me reorienté hacia los '
    'datos y la IA a través de la École Microsoft by Simplon. Diseño soluciones útiles, pensadas '
    'para los usos reales y las necesidades del negocio, combinando competencias técnicas (IA '
    'generativa, LLM, agentes de IA, ingeniería de datos) con una verdadera comprensión del '
    'terreno. Idiomas: francés (lengua materna), inglés profesional (B2).',
  hero_pitch_es = 'Desarrollador de IA en Midas / Mobivia, diseño voicebots de IA en tiempo real, '
    'flujos de trabajo basados en LLM y herramientas de asistencia para desarrolladores, '
    'desplegados en producción en AWS.',
  availability_es = 'Disponibilidad en Francia e internacional'
WHERE id = 1;

-- Trayectoria
UPDATE timeline_events SET
  title_es = 'Técnico Superior en Negociación y Relación con el Cliente',
  description_es = 'Efficom Lille. Fundamentos de la relación comercial y del acompañamiento al cliente.'
WHERE title = 'BTS Négociation & Relation Client';

UPDATE timeline_events SET
  title_es = 'Relación con el cliente y acompañamiento al negocio',
  description_es = 'Experiencia de campo B2B/B2C: análisis de necesidades, acompañamiento al '
    'negocio y colaboración con perfiles operativos variados (Onenergy/Sowee–EDF, Orange, Engie, '
    'Regicom). Gran sensibilidad por los usos y los retos del terreno.'
WHERE title = 'Relation client & accompagnement métier';

UPDATE timeline_events SET
  title_es = 'Precualificación Desarrollador de Datos / IA',
  description_es = 'Simplon Hauts-de-France. Actualización de conocimientos y transición hacia el '
    'desarrollo de Datos/IA.'
WHERE title = 'Préqualification Développeur Data / IA';

UPDATE timeline_events SET
  title_es = 'Escuela Microsoft — Desarrollador de Datos / IA',
  description_es = 'Simplon Hauts-de-France. Ciencia de datos, Machine Learning, IA generativa y '
    'desarrollo de aplicaciones de IA.'
WHERE title = 'École Microsoft — Développeur Data / IA';

UPDATE timeline_events SET
  title_es = 'Desarrollador de IA — Midas / Mobivia',
  description_es = 'Diseño y puesta en producción de soluciones de IA en AWS: voicebot en tiempo '
    'real, agentes y herramientas internas para desarrolladores. CI/CD, despliegue y seguridad de '
    'extremo a extremo. (Detalles en los casos de éxito.)'
WHERE title = 'Développeur IA — Midas / Mobivia';

UPDATE timeline_events SET
  title_es = 'Certificaciones Microsoft Azure',
  description_es = 'Azure Fundamentals (AZ-900) y Azure AI Fundamentals (AI-900).'
WHERE title = 'Certifications Microsoft Azure';

-- Competencias (etiquetas de subcategorías)
UPDATE skills SET subcategory_es = 'IA y Machine Learning'      WHERE subcategory = 'IA & Machine Learning';
UPDATE skills SET subcategory_es = 'Backend y APIs'             WHERE subcategory = 'Backend & APIs';
UPDATE skills SET subcategory_es = 'Cloud y DevOps'             WHERE subcategory = 'Cloud & DevOps';
UPDATE skills SET subcategory_es = 'IA conversacional'          WHERE subcategory = 'IA conversationnelle';
UPDATE skills SET subcategory_es = 'Datos y bases de datos'     WHERE subcategory = 'Data & Bases de données';
UPDATE skills SET subcategory_es = 'Frontend e interfaces'      WHERE subcategory = 'Frontend & Interfaces';
UPDATE skills SET subcategory_es = 'Visualización de datos y BI' WHERE subcategory = 'Dataviz & BI';
UPDATE skills SET subcategory_es = 'Competencias transversales' WHERE subcategory = 'Atouts métier';

-- Nombres de competencias no técnicas (las tecnologías quedan igual -> repli FR)
UPDATE skills SET name_es = 'Divulgación técnica'                       WHERE name = 'Vulgarisation technique';
UPDATE skills SET name_es = 'Comprensión del negocio'                   WHERE name = 'Compréhension métier';
UPDATE skills SET name_es = 'Autonomía y adaptabilidad'                 WHERE name = 'Autonomie & adaptabilité';
UPDATE skills SET name_es = 'Vigilancia tecnológica e innovación en IA' WHERE name = 'Veille IA & innovation';

-- Casos de éxito
UPDATE case_studies SET
  title_es = 'Voicebot de IA en tiempo real',
  subtitle_es = 'Gestión automatizada de las llamadas perdidas de los centros Midas',
  summary_es = 'Un agente de voz con IA que atiende las llamadas perdidas de los centros, entiende '
    'la solicitud y cualifica al cliente en tiempo real — desplegado en producción en centros piloto.',
  problem_es = 'En las horas punta y fuera del horario, muchas llamadas de clientes quedan sin '
    'respuesta en los centros Midas: citas perdidas y frustración. El reto: no dejar ninguna '
    'llamada sin atender, sin sobrecargar a los equipos.',
  approach_es = 'Diseño de un agente de voz con IA en tiempo real conectado a la telefonía: atiende '
    'la llamada perdida, transcribe el habla, razona sobre la solicitud, cualifica al cliente y '
    'capta la intención (concertar cita, información), y luego responde con una voz natural — todo '
    'con una latencia casi en tiempo real.',
  architecture_es = '[
    {"step": "Llamada entrante", "tech": "Twilio"},
    {"step": "Transcripción (STT)", "tech": "Deepgram"},
    {"step": "Razonamiento y diálogo", "tech": "Claude Sonnet · AWS Bedrock"},
    {"step": "Síntesis de voz (TTS)", "tech": "Cartesia"},
    {"step": "Respuesta al llamante", "tech": "Twilio"}
   ]'::jsonb,
  results_es = ARRAY[
    'Desplegado en producción en centros piloto',
    'Cualificación automatizada de clientes en las llamadas perdidas',
    'Arquitectura en tiempo real de baja latencia (STT → LLM → TTS)',
    'Objetivo de industrialización a escala nacional y europea'
  ]
WHERE slug = 'voicebot-ia-temps-reel';

UPDATE case_studies SET
  title_es = 'Herramientas internas de IA para desarrolladores',
  subtitle_es = 'Hacer el desarrollo sobre una base de código legacy más rápido y fiable',
  summary_es = 'Un ecosistema de herramientas de IA para los equipos de desarrollo: '
    'retro-documentación de código legacy, control de calidad automatizado antes del merge y un '
    'MCP interno conectado a las APIs del negocio.',
  problem_es = 'Una base de código legacy (VB.NET) poco documentada, una migración en curso hacia '
    'Angular/C# y una calidad heterogénea antes de las merge requests: fricción y riesgo para los '
    'equipos de desarrollo.',
  approach_es = 'Implementación de herramientas de IA al servicio de los desarrolladores: agentes '
    'de retro-documentación que analizan el código legacy no documentado, un control de calidad '
    'automatizado antes del merge (convenciones, desviaciones, anomalías introducidas), flujos de '
    'prompt engineering para GitHub Copilot / Claude Code, y un MCP interno que centraliza el uso '
    'de la IA sobre las APIs del negocio.',
  architecture_es = '[
    {"step": "Código legacy no documentado", "tech": "VB.NET"},
    {"step": "Agentes de retro-documentación", "tech": "LLM"},
    {"step": "Control de calidad antes del merge", "tech": "Análisis automatizado"},
    {"step": "Acceso centralizado a las APIs del negocio", "tech": "MCP interno"}
   ]'::jsonb,
  results_es = ARRAY[
    'Detección automática de convenciones ausentes y anomalías antes del merge',
    'Documentación automática de un código legacy no documentado',
    'Apoyo a la migración VB.NET → Angular/C#',
    'Uso de IA centralizado y enriquecido mediante un MCP interno'
  ]
WHERE slug = 'outils-ia-developpeurs';

-- =====================================================================
-- 3e ÉTUDE DE CAS (agent support) + OWNERSHIP PROD sur les cas existants
-- Bloc idempotent (INSERT-if-not-exists + overwrite) — FR/EN/ES.
-- =====================================================================

INSERT INTO case_studies
  (slug, title, subtitle, company, role, period, summary, problem, approach,
   architecture, stack, results, tags, display_order)
SELECT
  'agent-ia-support',
  $x$Agent IA d'assistance au support$x$,
  $x$Triage et résolution assistée des tickets FreshService chez Midas$x$,
  $x$Midas / Mobivia$x$,
  $x$Développeur IA$x$,
  $x$2026 — présent$x$,
  $x$Un agent IA intégré à Claude Code qui, à partir d'un ID de ticket FreshService, agrège ticket, base de connaissances, code et tickets similaires, puis trie (N1/N2/N3) et propose une piste de résolution sourcée — en lecture seule, le développeur valide.$x$,
  $x$Traiter un ticket de support est chronophage : comprendre la demande, juger son niveau, retrouver le bon article de la base de connaissances ou fouiller le code, repérer les cas déjà résolus. D'où du temps perdu et des réponses hétérogènes d'un développeur à l'autre.$x$,
  $x$Un package Python qui transforme Claude Code en assistant de support. Une slash command « /ticket <id> » orchestre quatre serveurs MCP maison en lecture seule (FreshService pour les tickets et la base de connaissances, GitLab pour les quatre applications Midas, Git et système de fichiers pour le code local) ainsi que des sous-agents dédiés. Un scoring déterministe en Python évalue la complétude du ticket et les signaux de niveau ; le LLM décide N1/N2/N3 et rédige : renvoi vers la base de connaissances en N1, piste de résolution sourcée en N2/N3, ou « challenge » lorsque le ticket est trop pauvre. Un index sémantique local des tickets clôturés retrouve les cas similaires, rafraîchi chaque nuit. CI/CD sur GitLab et distribution interne via pipx.$x$,
  $x$[
    {"step": "Ticket (ID)", "tech": "FreshService"},
    {"step": "Agrégation : ticket, KB, code, similaires", "tech": "MCP (FreshService/GitLab/Git/FS)"},
    {"step": "Scoring & signaux de niveau", "tech": "Python (déterministe)"},
    {"step": "Décision N1/N2/N3 & rédaction", "tech": "Claude Code"},
    {"step": "Proposition sourcée — le dev valide", "tech": "Human-in-the-loop"}
   ]$x$::jsonb,
  ARRAY['Python','Claude Code','MCP','FreshService API','GitLab','SQLite','Embeddings','GitLab CI','pipx'],
  ARRAY[
    $x$Triage N1/N2/N3 automatisé, avec réponse sourcée (KB, code, tickets similaires)$x$,
    $x$Quatre serveurs MCP maison (FreshService, GitLab, Git, Filesystem) en lecture seule$x$,
    $x$Lecture seule et human-in-the-loop : le développeur garde le contrôle$x$,
    $x$CI/CD GitLab et distribution interne via pipx ; mise en production visée au T3 2026$x$
  ],
  ARRAY['IA Agentique','Developer Tooling','MCP','Support'],
  3
WHERE NOT EXISTS (SELECT 1 FROM case_studies WHERE slug = 'agent-ia-support');

UPDATE case_studies SET
  title_en = $x$AI support-desk assistant$x$,
  subtitle_en = $x$Triage and assisted resolution of FreshService tickets at Midas$x$,
  summary_en = $x$An AI agent embedded in Claude Code that, from a FreshService ticket ID, aggregates the ticket, knowledge base, code and similar tickets, then triages (L1/L2/L3) and proposes a sourced resolution path — read-only, the developer validates.$x$,
  problem_en = $x$Handling a support ticket is time-consuming: understanding the request, judging its level, finding the right KB article or digging through code, spotting already-solved cases. Hence wasted time and inconsistent answers from one developer to another.$x$,
  approach_en = $x$A Python package that turns Claude Code into a support assistant. A "/ticket <id>" slash command orchestrates four in-house read-only MCP servers (FreshService for tickets and the knowledge base, GitLab for the four Midas apps, Git and the filesystem for local code) along with dedicated sub-agents. Deterministic Python scoring assesses ticket completeness and level signals; the LLM decides L1/L2/L3 and writes the answer: redirect to the KB for L1, a sourced resolution path for L2/L3, or a "challenge" when the ticket is too thin. A local semantic index of closed tickets retrieves similar cases, refreshed nightly. CI/CD on GitLab and internal distribution via pipx.$x$,
  architecture_en = $x$[
    {"step": "Ticket (ID)", "tech": "FreshService"},
    {"step": "Aggregation: ticket, KB, code, similar", "tech": "MCP (FreshService/GitLab/Git/FS)"},
    {"step": "Scoring & level signals", "tech": "Python (deterministic)"},
    {"step": "L1/L2/L3 decision & drafting", "tech": "Claude Code"},
    {"step": "Sourced proposal — the dev validates", "tech": "Human-in-the-loop"}
   ]$x$::jsonb,
  results_en = ARRAY[
    $x$Automated L1/L2/L3 triage with a sourced answer (KB, code, similar tickets)$x$,
    $x$Four in-house read-only MCP servers (FreshService, GitLab, Git, Filesystem)$x$,
    $x$Read-only and human-in-the-loop: the developer stays in control$x$,
    $x$GitLab CI/CD and internal pipx distribution; production rollout targeted Q3 2026$x$
  ],
  title_es = $x$Agente de IA para el soporte$x$,
  subtitle_es = $x$Triaje y resolución asistida de tickets de FreshService en Midas$x$,
  summary_es = $x$Un agente de IA integrado en Claude Code que, a partir del ID de un ticket de FreshService, agrega el ticket, la base de conocimiento, el código y los tickets similares, luego clasifica (N1/N2/N3) y propone una vía de resolución documentada — en solo lectura, el desarrollador valida.$x$,
  problem_es = $x$Tratar un ticket de soporte lleva tiempo: entender la solicitud, juzgar su nivel, encontrar el artículo adecuado de la base de conocimiento o rebuscar en el código, detectar los casos ya resueltos. De ahí el tiempo perdido y respuestas heterogéneas de un desarrollador a otro.$x$,
  approach_es = $x$Un paquete Python que convierte Claude Code en un asistente de soporte. Un slash command «/ticket <id>» orquesta cuatro servidores MCP propios en solo lectura (FreshService para los tickets y la base de conocimiento, GitLab para las cuatro aplicaciones de Midas, Git y sistema de archivos para el código local) junto con subagentes dedicados. Un scoring determinista en Python evalúa la completitud del ticket y las señales de nivel; el LLM decide N1/N2/N3 y redacta: derivación a la base de conocimiento en N1, una vía de resolución documentada en N2/N3, o un «challenge» cuando el ticket es demasiado pobre. Un índice semántico local de los tickets cerrados recupera los casos similares, actualizado cada noche. CI/CD en GitLab y distribución interna mediante pipx.$x$,
  architecture_es = $x$[
    {"step": "Ticket (ID)", "tech": "FreshService"},
    {"step": "Agregación: ticket, KB, código, similares", "tech": "MCP (FreshService/GitLab/Git/FS)"},
    {"step": "Scoring y señales de nivel", "tech": "Python (determinista)"},
    {"step": "Decisión N1/N2/N3 y redacción", "tech": "Claude Code"},
    {"step": "Propuesta documentada — el dev valida", "tech": "Human-in-the-loop"}
   ]$x$::jsonb,
  results_es = ARRAY[
    $x$Triaje N1/N2/N3 automatizado, con respuesta documentada (KB, código, tickets similares)$x$,
    $x$Cuatro servidores MCP propios en solo lectura (FreshService, GitLab, Git, Filesystem)$x$,
    $x$Solo lectura y human-in-the-loop: el desarrollador mantiene el control$x$,
    $x$CI/CD en GitLab y distribución interna vía pipx; puesta en producción prevista para el T3 2026$x$
  ]
WHERE slug = 'agent-ia-support';

UPDATE case_studies SET
  stack = ARRAY['Python','Twilio','Deepgram','AWS Bedrock','Claude Sonnet','Cartesia','AWS ECS','DynamoDB','GitLab CI'],
  results = ARRAY[
    $x$Déployé en production sur centres pilotes$x$,
    $x$Qualification client automatisée des appels manqués$x$,
    $x$Architecture temps réel à faible latence (STT → LLM → TTS)$x$,
    $x$CI/CD (GitLab), déploiement AWS, gestion des secrets et sécurité applicative de bout en bout$x$,
    $x$Objectif d'industrialisation à l'échelle nationale et européenne$x$
  ],
  results_en = ARRAY[
    $x$Deployed in production across pilot centers$x$,
    $x$Automated customer qualification of missed calls$x$,
    $x$Low-latency real-time architecture (STT → LLM → TTS)$x$,
    $x$End-to-end ownership of CI/CD (GitLab), AWS deployment, secrets management and application security$x$,
    $x$Targeting nationwide and European industrialization$x$
  ],
  results_es = ARRAY[
    $x$Desplegado en producción en centros piloto$x$,
    $x$Cualificación automatizada de clientes en las llamadas perdidas$x$,
    $x$Arquitectura en tiempo real de baja latencia (STT → LLM → TTS)$x$,
    $x$CI/CD (GitLab), despliegue en AWS, gestión de secretos y seguridad de la aplicación de extremo a extremo$x$,
    $x$Objetivo de industrialización a escala nacional y europea$x$
  ]
WHERE slug = 'voicebot-ia-temps-reel';

UPDATE case_studies SET
  stack = ARRAY['Python','LLMs','MCP','GitHub Copilot','Claude Code','Prompt Engineering','GitLab CI'],
  results = ARRAY[
    $x$Détection automatique des conventions manquantes et anomalies avant merge$x$,
    $x$Documentation automatique d'un code legacy non documenté$x$,
    $x$Accompagnement de la migration VB.NET → Angular/C#$x$,
    $x$CI/CD GitLab et sécurité intégrées au cycle de développement$x$,
    $x$Usages IA centralisés et enrichis via un MCP interne$x$
  ],
  results_en = ARRAY[
    $x$Automatic detection of missing conventions and anomalies before merge$x$,
    $x$Automatic documentation of undocumented legacy code$x$,
    $x$Support for the VB.NET → Angular/C# migration$x$,
    $x$GitLab CI/CD and security woven into the development lifecycle$x$,
    $x$AI usage centralized and enriched via an internal MCP$x$
  ],
  results_es = ARRAY[
    $x$Detección automática de convenciones ausentes y anomalías antes del merge$x$,
    $x$Documentación automática de un código legacy no documentado$x$,
    $x$Apoyo a la migración VB.NET → Angular/C#$x$,
    $x$CI/CD en GitLab y seguridad integradas en el ciclo de desarrollo$x$,
    $x$Uso de IA centralizado y enriquecido mediante un MCP interno$x$
  ]
WHERE slug = 'outils-ia-developpeurs';
