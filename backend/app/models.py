"""Modèles Pydantic partagés par les routers."""
from datetime import date, datetime

from pydantic import BaseModel, Field


# ---------- Portfolio (items auto-générés depuis GitHub) ----------
class BusinessMetrics(BaseModel):
    revenue_impact: str | None = None
    cost_savings: str | None = None
    users_reached: str | None = None
    efficiency_gain: str | None = None


class TechnicalMetrics(BaseModel):
    performance_improvement: str | None = None
    code_coverage: str | None = None
    response_time: str | None = None
    uptime: str | None = None


class PortfolioItem(BaseModel):
    id: int
    repo: str
    title: str
    short_pitch: str
    long_desc: str
    tags: list[str]
    stack: list[str]
    impact: str | None = None
    github_url: str
    github_stars: int | None = None
    github_forks: int | None = None
    github_language: str | None = None
    last_commit_date: datetime | None = None
    ai_confidence_score: int | None = None
    status: str
    created_at: datetime
    updated_at: datetime
    human_reviewed: bool
    business_metrics: dict = {}
    technical_metrics: dict = {}
    achievements: list[str] = []
    complexity_score: int | None = None
    team_size: int | None = None
    project_duration_months: int | None = None
    demo_url: str | None = None
    live_url: str | None = None
    category: str | None = None


class PortfolioStats(BaseModel):
    total_projects: int
    approved_projects: int
    draft_projects: int
    avg_confidence: float
    total_stars: int
    top_languages: list[dict]


class PortfolioEvent(BaseModel):
    id: int
    ts: datetime
    source: str
    repo: str | None = None
    action: str
    payload: dict | None = None
    status: str


# ---------- Phase 1 : profil / timeline / skills ----------
class Profile(BaseModel):
    id: int
    full_name: str
    title: str
    bio: str | None
    hero_pitch: str
    email: str | None
    phone: str | None
    linkedin_url: str | None
    github_url: str | None
    kaggle_url: str | None
    photo_url: str | None
    location: str | None
    availability: str | None
    cv_url_fr: str | None = None
    cv_url_en: str | None = None
    cv_url_es: str | None = None
    created_at: datetime
    updated_at: datetime


class TimelineEvent(BaseModel):
    id: int
    date: date
    end_date: date | None
    title: str
    description: str | None
    category: str
    icon: str | None
    metrics: dict | None
    tags: list[str]
    link_url: str | None
    display_order: int
    is_highlight: bool
    created_at: datetime


class Skill(BaseModel):
    id: int
    name: str
    category: str
    subcategory: str | None
    proficiency_level: int | None
    years_experience: float | None
    description: str | None
    is_primary: bool
    icon: str | None
    created_at: datetime


class SocialLink(BaseModel):
    id: int
    platform: str
    url: str
    display_name: str | None
    icon: str | None
    display_order: int
    is_active: bool
    created_at: datetime


# ---------- Phase 2 : projets / blog / témoignages ----------
class Project(BaseModel):
    id: int
    title: str
    slug: str
    short_description: str
    long_description: str | None
    github_url: str | None
    github_repo_name: str | None
    github_stars: int | None
    github_forks: int | None
    github_language: str | None
    demo_url: str | None
    image_url: str | None
    category: str
    tags: list[str]
    technologies: list[str]
    metrics: dict | None
    business_impact: str | None
    is_featured: bool
    is_published: bool
    display_order: int
    project_date: date | None
    duration_months: int | None
    team_size: int | None
    role: str | None
    created_at: datetime
    updated_at: datetime


class BlogPost(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: str
    content: str
    meta_title: str | None
    meta_description: str | None
    keywords: list[str]
    cover_image_url: str | None
    category: str
    tags: list[str]
    read_time_minutes: int | None
    view_count: int
    like_count: int
    is_published: bool
    is_featured: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime


class Testimonial(BaseModel):
    id: int
    author_name: str
    author_title: str
    author_company: str | None
    author_photo_url: str | None
    author_linkedin_url: str | None
    quote: str
    rating: int | None
    relationship: str | None
    project_context: str | None
    date_given: date | None
    is_featured: bool
    is_published: bool
    display_order: int
    created_at: datetime
    updated_at: datetime


class GitHubStats(BaseModel):
    id: int
    username: str
    total_repos: int
    total_stars: int
    total_forks: int
    followers: int
    following: int
    total_contributions_year: int
    current_streak_days: int
    longest_streak_days: int
    languages: dict
    top_repos: list[dict]
    last_fetched_at: datetime
    created_at: datetime
    updated_at: datetime


class CaseStudy(BaseModel):
    id: int
    slug: str
    title: str
    subtitle: str | None = None
    company: str | None = None
    role: str | None = None
    period: str | None = None
    summary: str
    problem: str | None = None
    approach: str | None = None
    architecture: list[dict] = []
    stack: list[str] = []
    results: list[str] = []
    tags: list[str] = []
    is_published: bool
    display_order: int
    created_at: datetime


class ContactSubmission(BaseModel):
    name: str
    email: str
    company: str | None = None
    subject: str | None = None
    message: str
    contact_reason: str | None = None


class TestimonialSubmission(BaseModel):
    author_name: str = Field(..., min_length=2, max_length=200)
    author_title: str = Field(..., min_length=2, max_length=200)
    author_company: str | None = Field(None, max_length=200)
    author_linkedin_url: str | None = Field(None, max_length=500)
    relationship: str | None = Field(None, max_length=200)
    quote: str = Field(..., min_length=10, max_length=1500)


# ---------- Phase 3 : dual mode + analytics ----------
class PortfolioMode(BaseModel):
    id: int
    mode_key: str
    display_name: str
    description: str | None
    icon: str | None
    color_primary: str | None
    is_default: bool
    is_active: bool
    settings: dict
    created_at: datetime
    updated_at: datetime


class AnalyticsEvent(BaseModel):
    session_id: str
    event_type: str
    event_category: str | None = None
    event_label: str | None = None
    event_value: int | None = None
    portfolio_mode: str | None = None
    page_url: str | None = None
    referrer_url: str | None = None
    target_type: str | None = None
    target_id: int | None = None
    metadata: dict | None = None


class VisitorSession(BaseModel):
    landing_page: str | None = None
    landing_mode: str | None = None
    referrer_source: str | None = None
    utm_source: str | None = None
    utm_medium: str | None = None
    utm_campaign: str | None = None
    user_agent: str | None = None
    device_type: str | None = None
    browser: str | None = None
    os: str | None = None
    screen_resolution: str | None = None
    ip_address: str | None = None
