-- ============================================================================
-- PORTFOLIO DATABASE — CONSOLIDATED SCHEMA (DDL ONLY)
-- ============================================================================
-- Single, idempotent schema file. Safe to re-run.
--   - CREATE TABLE IF NOT EXISTS
--   - CREATE INDEX IF NOT EXISTS
--   - CREATE OR REPLACE for functions and views
--   - DROP TRIGGER IF EXISTS before each CREATE TRIGGER (replayable)
-- No data is inserted here — see seed.sql for seed data.
-- ============================================================================


-- ============================================================================
-- CORE TABLES (reconstructed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_items (
  id SERIAL PRIMARY KEY,
  repo VARCHAR(300) UNIQUE NOT NULL,
  title VARCHAR(300) NOT NULL,
  short_pitch TEXT NOT NULL,
  long_desc TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  stack TEXT[] DEFAULT '{}',
  impact TEXT,
  github_url VARCHAR(500) NOT NULL,
  github_stars INTEGER DEFAULT 0,
  github_forks INTEGER DEFAULT 0,
  github_language VARCHAR(100),
  last_commit_date TIMESTAMP,
  ai_confidence_score INTEGER DEFAULT 50,
  status VARCHAR(20) DEFAULT 'draft',  -- draft | approved | published | archived
  human_reviewed BOOLEAN DEFAULT FALSE,
  business_metrics JSONB DEFAULT '{}',
  technical_metrics JSONB DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  complexity_score INTEGER,
  team_size INTEGER,
  project_duration_months INTEGER,
  demo_url VARCHAR(500),
  live_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_events (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMP DEFAULT NOW(),
  source VARCHAR(100) NOT NULL,
  repo VARCHAR(300),
  action VARCHAR(100) NOT NULL,
  payload JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'ok'
);
CREATE INDEX IF NOT EXISTS idx_portfolio_events_ts ON portfolio_events(ts DESC);

CREATE TABLE IF NOT EXISTS portfolio_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);


-- ============================================================================
-- PHASE 1: MVP PORTFOLIO — profile, timeline, skills, social links
-- ============================================================================

-- Profile table (single row with personal information)
CREATE TABLE IF NOT EXISTS profile (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  title VARCHAR(200) NOT NULL,
  bio TEXT,
  hero_pitch TEXT NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  kaggle_url VARCHAR(500),
  photo_url VARCHAR(500),
  location VARCHAR(200),
  availability VARCHAR(100), -- e.g., "Disponible à partir d'Août 2025"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Timeline events (career milestones)
CREATE TABLE IF NOT EXISTS timeline_events (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  end_date DATE, -- For periods (optional)
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'commercial', 'formation', 'alternance', 'certification', 'project'
  icon VARCHAR(50), -- Icon name for frontend (e.g., 'briefcase', 'graduation', 'code')
  metrics JSONB, -- Flexible metrics: {"projects": 12, "hours": 1500, "certifications": 5}
  tags TEXT[], -- Related technologies or keywords
  link_url VARCHAR(500), -- Optional link (certificate, project, etc.)
  display_order INTEGER DEFAULT 0, -- For manual ordering
  is_highlight BOOLEAN DEFAULT FALSE, -- Highlight important milestones
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_events_date ON timeline_events(date);
CREATE INDEX IF NOT EXISTS idx_timeline_events_category ON timeline_events(category);

-- Skills table (for structured skills management)
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'technical', 'business', 'soft', 'tools'
  subcategory VARCHAR(100), -- 'machine-learning', 'data-engineering', 'cloud', 'communication'
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5), -- 1=Beginner, 5=Expert
  years_experience FLOAT,
  description TEXT,
  is_primary BOOLEAN DEFAULT FALSE, -- Highlight primary skills
  icon VARCHAR(50), -- Icon name for frontend
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social links table (flexible for multiple platforms)
CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL, -- 'linkedin', 'github', 'twitter', 'medium', 'kaggle'
  url VARCHAR(500) NOT NULL,
  display_name VARCHAR(100),
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for updating updated_at on profile
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profile_updated_at_trigger ON profile;
CREATE TRIGGER update_profile_updated_at_trigger
    BEFORE UPDATE ON profile
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_updated_at();

-- View for timeline with computed properties
CREATE OR REPLACE VIEW timeline_summary AS
SELECT
    t.*,
    CASE
        WHEN end_date IS NOT NULL THEN
            CONCAT(TO_CHAR(date, 'Mon YYYY'), ' - ', TO_CHAR(end_date, 'Mon YYYY'))
        ELSE
            TO_CHAR(date, 'Mon YYYY')
    END as period_label,
    CASE
        WHEN end_date IS NOT NULL THEN
            EXTRACT(YEAR FROM AGE(end_date, date)) * 12 +
            EXTRACT(MONTH FROM AGE(end_date, date))
        ELSE 0
    END as duration_months
FROM timeline_events t
ORDER BY t.date ASC, t.display_order ASC;


-- ============================================================================
-- PHASE 2: CREDIBILITY & SHOWCASE
-- ============================================================================
-- Tables: projects, blog_posts, testimonials, github_stats, contact_submissions

-- ----------------------------------------
-- 1. PROJECTS TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT,

    -- GitHub Integration
    github_url VARCHAR(500),
    github_repo_name VARCHAR(200),
    github_stars INTEGER DEFAULT 0,
    github_forks INTEGER DEFAULT 0,
    github_language VARCHAR(50),

    -- Project Details
    demo_url VARCHAR(500),
    image_url VARCHAR(500),
    category VARCHAR(50) NOT NULL, -- 'ml', 'data_viz', 'automation', 'web_app', 'analysis'
    tags TEXT[] DEFAULT '{}',
    technologies TEXT[] DEFAULT '{}',

    -- Metrics & Impact
    metrics JSONB DEFAULT '{}', -- e.g., {"accuracy": "94%", "users": "500+", "roi": "30%"}
    business_impact TEXT, -- What problem it solved, business value

    -- Display Settings
    is_featured BOOLEAN DEFAULT FALSE, -- Top 3-5 projects
    is_published BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,

    -- Metadata
    project_date DATE,
    duration_months INTEGER,
    team_size INTEGER DEFAULT 1,
    role VARCHAR(100), -- 'Lead', 'Solo', 'Contributor'

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured, display_order) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category) WHERE is_published = TRUE;

-- ----------------------------------------
-- 2. BLOG POSTS TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    excerpt TEXT NOT NULL, -- SEO meta description
    content TEXT NOT NULL, -- Markdown or HTML

    -- SEO & Metadata
    meta_title VARCHAR(70),
    meta_description VARCHAR(160),
    keywords TEXT[] DEFAULT '{}',
    cover_image_url VARCHAR(500),

    -- Categorization
    category VARCHAR(50) NOT NULL, -- 'tutorial', 'case_study', 'opinion', 'technical'
    tags TEXT[] DEFAULT '{}',
    read_time_minutes INTEGER,

    -- Engagement
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,

    -- Publishing
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at DESC) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_blog_featured ON blog_posts(is_featured) WHERE is_published = TRUE;

-- ----------------------------------------
-- 3. TESTIMONIALS TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    author_name VARCHAR(200) NOT NULL,
    author_title VARCHAR(200) NOT NULL,
    author_company VARCHAR(200),
    author_photo_url VARCHAR(500),
    author_linkedin_url VARCHAR(500),

    -- Testimonial Content
    quote TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars

    -- Context
    relationship VARCHAR(100), -- 'client', 'colleague', 'manager', 'mentor'
    project_context VARCHAR(200), -- What project/context was this for
    date_given DATE,

    -- Display Settings
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured, display_order) WHERE is_published = TRUE;

-- ----------------------------------------
-- 4. GITHUB STATS TABLE (Cache)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS github_stats (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,

    -- Profile Stats
    total_repos INTEGER DEFAULT 0,
    total_stars INTEGER DEFAULT 0,
    total_forks INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,

    -- Contribution Stats
    total_contributions_year INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,

    -- Language Breakdown (JSONB)
    languages JSONB DEFAULT '{}', -- e.g., {"Python": 45, "JavaScript": 30, "SQL": 25}

    -- Top Repositories (cached)
    top_repos JSONB DEFAULT '[]', -- Array of {name, stars, language, description}

    -- Cache Metadata
    last_fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_github_username ON github_stats(username);

-- ----------------------------------------
-- 5. CONTACT FORM SUBMISSIONS TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    company VARCHAR(200),
    subject VARCHAR(300),
    message TEXT NOT NULL,

    -- Context
    contact_reason VARCHAR(50), -- 'freelance', 'cdi', 'collaboration', 'question'

    -- Status
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'read', 'replied', 'archived'
    admin_notes TEXT,

    -- Metadata
    ip_address VARCHAR(50),
    user_agent TEXT,
    referrer_url VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status, created_at DESC);

-- ----------------------------------------
-- PHASE 2 UPDATED_AT TRIGGERS
-- ----------------------------------------

-- Projects trigger
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_projects_updated_at();

-- Blog posts trigger
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_blog_updated_at ON blog_posts;
CREATE TRIGGER trigger_blog_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_blog_updated_at();

-- Testimonials trigger
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_testimonials_updated_at ON testimonials;
CREATE TRIGGER trigger_testimonials_updated_at
BEFORE UPDATE ON testimonials
FOR EACH ROW
EXECUTE FUNCTION update_testimonials_updated_at();

-- GitHub stats trigger
CREATE OR REPLACE FUNCTION update_github_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_github_stats_updated_at ON github_stats;
CREATE TRIGGER trigger_github_stats_updated_at
BEFORE UPDATE ON github_stats
FOR EACH ROW
EXECUTE FUNCTION update_github_stats_updated_at();

-- Contact submissions trigger
CREATE OR REPLACE FUNCTION update_contact_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_contact_updated_at ON contact_submissions;
CREATE TRIGGER trigger_contact_updated_at
BEFORE UPDATE ON contact_submissions
FOR EACH ROW
EXECUTE FUNCTION update_contact_updated_at();

COMMENT ON TABLE projects IS 'Phase 2: Top technical projects with GitHub integration and business impact metrics';
COMMENT ON TABLE blog_posts IS 'Phase 2: Technical blog articles for SEO and thought leadership';
COMMENT ON TABLE testimonials IS 'Phase 2: Social proof from clients, colleagues, and managers';
COMMENT ON TABLE github_stats IS 'Phase 2: Cached GitHub profile statistics (refreshed via cron/webhook)';
COMMENT ON TABLE contact_submissions IS 'Phase 2: Contact form submissions for freelance/CDI inquiries';


-- ============================================================================
-- PHASE 3: DUAL MODE (CDI vs FREELANCE) + ADVANCED ANALYTICS
-- ============================================================================
-- Tables: portfolio_modes, mode_content_overrides, analytics_events,
--         visitor_sessions, conversion_goals
-- NOTE: seed rows for portfolio_modes and conversion_goals live in seed.sql.

-- ----------------------------------------
-- 1. PORTFOLIO MODES TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_modes (
    id SERIAL PRIMARY KEY,
    mode_key VARCHAR(50) UNIQUE NOT NULL, -- 'cdi' or 'freelance'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color_primary VARCHAR(20), -- e.g., 'blue' for CDI, 'purple' for Freelance
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Mode-specific settings
    settings JSONB DEFAULT '{}', -- Custom settings per mode

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------
-- 2. MODE CONTENT OVERRIDES TABLE
-- ----------------------------------------
-- Allows customizing content per mode (hero pitch, project descriptions, etc.)
CREATE TABLE IF NOT EXISTS mode_content_overrides (
    id SERIAL PRIMARY KEY,
    mode_key VARCHAR(50) NOT NULL REFERENCES portfolio_modes(mode_key) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'hero_pitch', 'project_description', 'bio', etc.
    content_id INTEGER, -- ID of the content (e.g., project_id, NULL for global like hero)
    override_field VARCHAR(100) NOT NULL, -- Field to override (e.g., 'short_description', 'title')
    override_value TEXT NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0, -- Higher priority wins if multiple overrides

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(mode_key, content_type, content_id, override_field)
);

CREATE INDEX IF NOT EXISTS idx_mode_overrides_lookup ON mode_content_overrides(mode_key, content_type, content_id) WHERE is_active = TRUE;

-- ----------------------------------------
-- 3. ANALYTICS EVENTS TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL, -- Links to visitor_sessions

    -- Event details
    event_type VARCHAR(50) NOT NULL, -- 'page_view', 'click', 'project_view', 'contact_submit', etc.
    event_category VARCHAR(50), -- 'navigation', 'engagement', 'conversion'
    event_label VARCHAR(200), -- Descriptive label
    event_value INTEGER, -- Optional numeric value

    -- Context
    portfolio_mode VARCHAR(50), -- 'cdi', 'freelance', or NULL
    page_url VARCHAR(500),
    referrer_url VARCHAR(500),

    -- Target (what was interacted with)
    target_type VARCHAR(50), -- 'project', 'blog_post', 'button', etc.
    target_id INTEGER, -- ID of the target entity

    -- Metadata
    metadata JSONB DEFAULT '{}', -- Additional data (scroll depth, time on page, etc.)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_mode ON analytics_events(portfolio_mode, created_at DESC);

-- ----------------------------------------
-- 4. VISITOR SESSIONS TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS visitor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Session info
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_duration_seconds INTEGER DEFAULT 0,

    -- Initial context
    landing_page VARCHAR(500),
    landing_mode VARCHAR(50), -- Which mode they landed in
    referrer_source VARCHAR(200), -- 'google', 'linkedin', 'direct', etc.
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Device & browser
    user_agent TEXT,
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_resolution VARCHAR(50),

    -- Location (optional)
    ip_address VARCHAR(50),
    country_code VARCHAR(10),
    city VARCHAR(100),

    -- Engagement metrics
    page_views INTEGER DEFAULT 1,
    projects_viewed INTEGER DEFAULT 0,
    blog_posts_viewed INTEGER DEFAULT 0,
    contact_submitted BOOLEAN DEFAULT FALSE,
    cv_downloaded BOOLEAN DEFAULT FALSE,

    -- Mode switching
    mode_switches INTEGER DEFAULT 0, -- How many times they toggled mode
    modes_viewed TEXT[], -- Array of modes visited

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_landing_mode ON visitor_sessions(landing_mode, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_referrer ON visitor_sessions(referrer_source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_updated ON visitor_sessions(updated_at DESC);

-- ----------------------------------------
-- 5. MODE-SPECIFIC PROJECT TAGS
-- ----------------------------------------
-- Extend projects table to support mode filtering
ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_modes TEXT[] DEFAULT ARRAY['cdi', 'freelance'];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS mode_priority JSONB DEFAULT '{"cdi": 0, "freelance": 0}';

COMMENT ON COLUMN projects.target_modes IS 'Which modes should display this project (cdi, freelance, or both)';
COMMENT ON COLUMN projects.mode_priority IS 'Display priority per mode (higher = shown first)';

-- ----------------------------------------
-- 6. MODE-SPECIFIC BLOG TAGS
-- ----------------------------------------
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS target_modes TEXT[] DEFAULT ARRAY['cdi', 'freelance'];

-- ----------------------------------------
-- 7. CONVERSION GOALS TABLE
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS conversion_goals (
    id SERIAL PRIMARY KEY,
    goal_name VARCHAR(100) UNIQUE NOT NULL,
    goal_type VARCHAR(50) NOT NULL, -- 'contact', 'cv_download', 'project_view', 'time_on_site'
    target_value NUMERIC, -- e.g., 5 for "5 projects viewed"

    -- Mode-specific
    mode_key VARCHAR(50) REFERENCES portfolio_modes(mode_key),

    -- Tracking
    total_completions INTEGER DEFAULT 0,
    completions_this_month INTEGER DEFAULT 0,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------
-- PHASE 3 UPDATED_AT TRIGGERS
-- ----------------------------------------

-- Portfolio modes trigger
CREATE OR REPLACE FUNCTION update_portfolio_modes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_portfolio_modes_updated_at ON portfolio_modes;
CREATE TRIGGER trigger_portfolio_modes_updated_at
BEFORE UPDATE ON portfolio_modes
FOR EACH ROW
EXECUTE FUNCTION update_portfolio_modes_updated_at();

-- Mode content overrides trigger
CREATE OR REPLACE FUNCTION update_mode_content_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mode_content_overrides_updated_at ON mode_content_overrides;
CREATE TRIGGER trigger_mode_content_overrides_updated_at
BEFORE UPDATE ON mode_content_overrides
FOR EACH ROW
EXECUTE FUNCTION update_mode_content_overrides_updated_at();

-- Visitor sessions trigger
CREATE OR REPLACE FUNCTION update_visitor_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.session_duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - NEW.first_seen_at))::INTEGER;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_visitor_sessions_updated_at ON visitor_sessions;
CREATE TRIGGER trigger_visitor_sessions_updated_at
BEFORE UPDATE ON visitor_sessions
FOR EACH ROW
EXECUTE FUNCTION update_visitor_sessions_updated_at();

-- Conversion goals trigger
CREATE OR REPLACE FUNCTION update_conversion_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_conversion_goals_updated_at ON conversion_goals;
CREATE TRIGGER trigger_conversion_goals_updated_at
BEFORE UPDATE ON conversion_goals
FOR EACH ROW
EXECUTE FUNCTION update_conversion_goals_updated_at();

-- ----------------------------------------
-- ANALYTICS VIEWS
-- ----------------------------------------

-- View: Daily analytics summary
CREATE OR REPLACE VIEW analytics_daily_summary AS
SELECT
    DATE(created_at) as date,
    portfolio_mode,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events
GROUP BY DATE(created_at), portfolio_mode, event_type
ORDER BY date DESC, event_count DESC;

-- View: Mode comparison
CREATE OR REPLACE VIEW mode_performance_comparison AS
SELECT
    landing_mode,
    COUNT(*) as total_sessions,
    AVG(session_duration_seconds) as avg_duration_seconds,
    AVG(page_views) as avg_page_views,
    SUM(CASE WHEN contact_submitted THEN 1 ELSE 0 END) as total_contacts,
    SUM(CASE WHEN cv_downloaded THEN 1 ELSE 0 END) as total_cv_downloads,
    ROUND(100.0 * SUM(CASE WHEN contact_submitted THEN 1 ELSE 0 END) / COUNT(*), 2) as contact_conversion_rate
FROM visitor_sessions
WHERE landing_mode IS NOT NULL
GROUP BY landing_mode;

COMMENT ON TABLE portfolio_modes IS 'Phase 3: Portfolio modes (CDI vs Freelance)';
COMMENT ON TABLE mode_content_overrides IS 'Phase 3: Mode-specific content customization';
COMMENT ON TABLE analytics_events IS 'Phase 3: User interaction tracking for analytics';
COMMENT ON TABLE visitor_sessions IS 'Phase 3: Visitor session tracking and attribution';
COMMENT ON TABLE conversion_goals IS 'Phase 3: Conversion goal definitions and tracking';
