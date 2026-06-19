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
  es: {
    "nav.caseStudies": "Casos de éxito",
    "nav.projects": "Proyectos",
    "nav.parcours": "Trayectoria",
    "nav.skills": "Competencias",
    "nav.contact": "Contacto",

    "hero.cta_projects": "Ver mis proyectos",
    "hero.cta_cv": "Descargar el CV",
    "hero.cta_contact": "Contáctame",

    "cases.overline": "Casos de éxito",
    "cases.title": "Proyectos en producción, bien contados",
    "cases.description": "El contexto, la arquitectura y los resultados — más allá del repositorio.",
    "cases.read": "Leer el caso de éxito",
    "cases.problem": "El problema",
    "cases.approach": "El enfoque",
    "cases.architecture": "Arquitectura",
    "cases.results": "Resultados",
    "cases.stack": "Stack",

    "projects.overline": "Proyectos",
    "projects.title": "Selección de proyectos",
    "projects.description":
      "Extraídos de mis repositorios de GitHub, agrupados por ámbito. Filtra según lo que te interese.",
    "projects.all": "Todos",
    "projects.empty": "Proyectos en proceso de curación.",

    "timeline.overline": "Trayectoria",
    "timeline.title": "De la relación con el cliente a la ingeniería de IA",
    "timeline.experience": "Experiencia profesional",
    "timeline.formation": "Formación",
    "timeline.certifications": "Certificaciones",
    "timeline.today": "actualidad",

    "skills.overline": "Competencias",
    "skills.title": "Stack y experiencia",
    "skills.description":
      "Herramientas y tecnologías que uso a diario, del prototipo a la producción.",

    "contact.overline": "Contacto",
    "contact.title": "Trabajemos juntos",
    "contact.description":
      "¿Una oportunidad, un proyecto o simplemente ganas de hablar de IA y datos? Escríbeme, respondo rápido.",
    "contact.name": "Nombre",
    "contact.email": "Email",
    "contact.subject": "Asunto",
    "contact.message": "Mensaje",
    "contact.send": "Enviar",
    "contact.sending": "Enviando…",
    "contact.sent": "Enviado",
    "contact.error": "Se ha producido un error, inténtalo de nuevo.",

    "nav.testimonials": "Opiniones",
    "testi.overline": "Opiniones",
    "testi.title": "Han trabajado conmigo",
    "testi.description": "Algunas opiniones de personas con las que he colaborado.",
    "testi.leave": "Dejar una opinión",
    "testi.empty": "Sé el primero en dejar una opinión.",
    "testi.modal_title": "Dejar una opinión",
    "testi.modal_hint": "Tu opinión se publicará tras su validación.",
    "testi.f_name": "Tu nombre",
    "testi.f_role": "Puesto / función",
    "testi.f_company": "Empresa (opcional)",
    "testi.f_linkedin": "Perfil de LinkedIn (opcional)",
    "testi.f_quote": "Tu opinión",
    "testi.submit": "Enviar opinión",
    "testi.sending": "Enviando…",
    "testi.thanks": "¡Gracias! Tu opinión se publicará tras su validación.",
    "testi.error": "Se ha producido un error, inténtalo de nuevo.",
    "testi.cancel": "Cancelar",

    "chat.greeting":
      "Hola, soy el asistente de IA de este portafolio. Pregúntame lo que quieras sobre la trayectoria, las competencias o los proyectos de Raouf.",
    "chat.header": "Asistente del portafolio",
    "chat.subtitle": "Impulsado por un LLM · responde sobre Raouf",
    "chat.placeholder": "Tu pregunta…",
    "chat.s1": "¿Cuáles son sus proyectos de IA generativa?",
    "chat.s2": "¿Qué experiencia tiene en producción?",
    "chat.s3": "¿Cuál es su stack técnico?",
    "chat.error": "Lo siento, se ha producido un error. Inténtalo de nuevo.",
    "chat.unavailable": "Lo siento, el servicio no está disponible por el momento.",
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

const CATEGORIES_ES = {
  "IA Générative / LLM": "IA generativa / LLM",
  "IA Agentique": "IA agéntica",
  "Data Science / ML": "Ciencia de datos / ML",
  "Data Engineering": "Ingeniería de datos",
  "MLOps / DevOps": "MLOps / DevOps",
  "Application / Web": "Aplicación / Web",
  Autre: "Otro",
};

const CATEGORY_MAPS = { en: CATEGORIES_EN, es: CATEGORIES_ES };

export function translateCategory(label, lang) {
  return CATEGORY_MAPS[lang]?.[label] || label;
}

const LangContext = createContext({ lang: "fr", setLang: () => {}, t: (k) => k });

const LANGS = ["fr", "en", "es"];

function initialLang() {
  try {
    if (LANGS.includes(localStorage.lang)) return localStorage.lang;
    const nav = (navigator.language || "fr").toLowerCase();
    if (nav.startsWith("en")) return "en";
    if (nav.startsWith("es")) return "es";
    return "fr";
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
