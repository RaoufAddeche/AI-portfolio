import { createContext, useContext, useEffect, useState } from "react";

const STRINGS = {
  fr: {
    "nav.caseStudies": "Études de cas",
    "nav.projects": "Projets",
    "nav.parcours": "Parcours",
    "nav.skills": "Compétences",
    "nav.contact": "Contact",

    "hero.cta_projects": "Voir mes projets",
    "hero.cta_cv": "Télécharger le CV",
    "hero.cta_contact": "Me contacter",

    "cases.overline": "Études de cas",
    "cases.title": "Des projets en production, racontés",
    "cases.description": "Le contexte, l’architecture et les résultats — au-delà du dépôt de code.",
    "cases.read": "Lire l’étude de cas",
    "cases.problem": "Le problème",
    "cases.approach": "L’approche",
    "cases.architecture": "Architecture",
    "cases.results": "Résultats",
    "cases.stack": "Stack",

    "projects.overline": "Projets",
    "projects.title": "Sélection de projets",
    "projects.description":
      "Issus de mes dépôts GitHub, regroupés par domaine. Filtrez selon ce qui vous intéresse.",
    "projects.all": "Tous",
    "projects.empty": "Projets en cours de curation.",

    "timeline.overline": "Parcours",
    "timeline.title": "De la relation client à l’ingénierie IA",
    "timeline.experience": "Expérience professionnelle",
    "timeline.formation": "Formation",
    "timeline.certifications": "Certifications",
    "timeline.today": "aujourd’hui",

    "skills.overline": "Compétences",
    "skills.title": "Stack & savoir-faire",
    "skills.description":
      "Outils et technologies que j’utilise au quotidien, du prototypage à la mise en production.",

    "contact.overline": "Contact",
    "contact.title": "Travaillons ensemble",
    "contact.description":
      "Une opportunité, une mission ou simplement envie d’échanger sur l’IA et la data ? Écrivez-moi, je réponds rapidement.",
    "contact.name": "Nom",
    "contact.email": "Email",
    "contact.subject": "Sujet",
    "contact.message": "Message",
    "contact.send": "Envoyer",
    "contact.sending": "Envoi…",
    "contact.sent": "Envoyé",
    "contact.error": "Une erreur est survenue, réessayez.",

    "nav.testimonials": "Avis",
    "testi.overline": "Avis",
    "testi.title": "Ils ont travaillé avec moi",
    "testi.description": "Quelques retours de personnes avec qui j’ai collaboré.",
    "testi.leave": "Laisser un avis",
    "testi.empty": "Soyez le premier à laisser un avis.",
    "testi.modal_title": "Laisser un avis",
    "testi.modal_hint": "Votre avis sera publié après validation.",
    "testi.f_name": "Votre nom",
    "testi.f_role": "Poste / fonction",
    "testi.f_company": "Entreprise (optionnel)",
    "testi.f_linkedin": "Profil LinkedIn (optionnel)",
    "testi.f_quote": "Votre avis",
    "testi.submit": "Envoyer l’avis",
    "testi.sending": "Envoi…",
    "testi.thanks": "Merci ! Votre avis sera publié après validation.",
    "testi.error": "Une erreur est survenue, réessayez.",
    "testi.cancel": "Annuler",

    "chat.greeting":
      "Bonjour, je suis l'assistant IA de ce portfolio. Posez-moi une question sur le parcours, les compétences ou les projets de Raouf.",
    "chat.header": "Assistant du portfolio",
    "chat.subtitle": "Propulsé par un LLM · répond sur Raouf",
    "chat.placeholder": "Votre question…",
    "chat.s1": "Quels sont ses projets en IA générative ?",
    "chat.s2": "Quelle est son expérience en production ?",
    "chat.s3": "Quelle est sa stack technique ?",
    "chat.error": "Désolé, une erreur est survenue. Réessayez.",
    "chat.unavailable": "Désolé, le service est momentanément indisponible.",
  },
  en: {
    "nav.caseStudies": "Case studies",
    "nav.projects": "Projects",
    "nav.parcours": "Journey",
    "nav.skills": "Skills",
    "nav.contact": "Contact",

    "hero.cta_projects": "View my projects",
    "hero.cta_cv": "Download CV",
    "hero.cta_contact": "Get in touch",

    "cases.overline": "Case studies",
    "cases.title": "Production projects, told properly",
    "cases.description": "The context, the architecture and the results — beyond the repo.",
    "cases.read": "Read the case study",
    "cases.problem": "The problem",
    "cases.approach": "The approach",
    "cases.architecture": "Architecture",
    "cases.results": "Results",
    "cases.stack": "Stack",

    "projects.overline": "Projects",
    "projects.title": "Selected projects",
    "projects.description":
      "From my GitHub repositories, grouped by domain. Filter by what interests you.",
    "projects.all": "All",
    "projects.empty": "Projects being curated.",

    "timeline.overline": "Journey",
    "timeline.title": "From client relations to AI engineering",
    "timeline.experience": "Professional experience",
    "timeline.formation": "Education",
    "timeline.certifications": "Certifications",
    "timeline.today": "present",

    "skills.overline": "Skills",
    "skills.title": "Stack & expertise",
    "skills.description":
      "Tools and technologies I use daily, from prototyping to production.",

    "contact.overline": "Contact",
    "contact.title": "Let’s work together",
    "contact.description":
      "An opportunity, a project, or just want to talk AI and data? Drop me a line, I reply quickly.",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.subject": "Subject",
    "contact.message": "Message",
    "contact.send": "Send",
    "contact.sending": "Sending…",
    "contact.sent": "Sent",
    "contact.error": "Something went wrong, please try again.",

    "nav.testimonials": "Reviews",
    "testi.overline": "Testimonials",
    "testi.title": "They worked with me",
    "testi.description": "A few words from people I’ve collaborated with.",
    "testi.leave": "Leave a review",
    "testi.empty": "Be the first to leave a review.",
    "testi.modal_title": "Leave a review",
    "testi.modal_hint": "Your review will be published after moderation.",
    "testi.f_name": "Your name",
    "testi.f_role": "Role / title",
    "testi.f_company": "Company (optional)",
    "testi.f_linkedin": "LinkedIn profile (optional)",
    "testi.f_quote": "Your review",
    "testi.submit": "Submit review",
    "testi.sending": "Sending…",
    "testi.thanks": "Thanks! Your review will be published after moderation.",
    "testi.error": "Something went wrong, please try again.",
    "testi.cancel": "Cancel",

    "chat.greeting":
      "Hi, I'm this portfolio's AI assistant. Ask me anything about Raouf's journey, skills or projects.",
    "chat.header": "Portfolio assistant",
    "chat.subtitle": "Powered by an LLM · answers about Raouf",
    "chat.placeholder": "Your question…",
    "chat.s1": "What are his generative-AI projects?",
    "chat.s2": "What is his production experience?",
    "chat.s3": "What is his tech stack?",
    "chat.error": "Sorry, something went wrong. Please try again.",
    "chat.unavailable": "Sorry, the service is momentarily unavailable.",
  },
};

// Libellés de catégories (le filtre conserve la valeur FR stockée, on traduit l'affichage).
const CATEGORIES_EN = {
  "IA Générative / LLM": "Generative AI / LLM",
  "IA Agentique": "Agentic AI",
  "Data Science / ML": "Data Science / ML",
  "Data Engineering": "Data Engineering",
  "MLOps / DevOps": "MLOps / DevOps",
  "Application / Web": "Application / Web",
  Autre: "Other",
};

export function translateCategory(label, lang) {
  return lang === "en" ? CATEGORIES_EN[label] || label : label;
}

const LangContext = createContext({ lang: "fr", setLang: () => {}, t: (k) => k });

function initialLang() {
  try {
    if (localStorage.lang === "en" || localStorage.lang === "fr") return localStorage.lang;
    return (navigator.language || "fr").toLowerCase().startsWith("en") ? "en" : "fr";
  } catch {
    return "fr";
  }
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    try {
      localStorage.lang = lang;
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => STRINGS[lang][key] ?? STRINGS.fr[key] ?? key;
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
