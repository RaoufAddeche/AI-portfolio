// ─────────────────────────────────────────────────────────────────────────
//  CONFIG DU SITE — édite ce fichier pour faire le portfolio TIEN.
//  (Le contenu — profil, parcours, projets, compétences — vient de la base de
//   données / du seed et de la synchro GitHub. Ici : l'identité + les assets.)
// ─────────────────────────────────────────────────────────────────────────
export const SITE = {
  // Nom affiché (fallback si la base n'a pas encore de profil)
  ownerName: "Raouf Addeche",

  // Fichiers CV servis depuis /public, par langue (mets les tiens dans public/).
  // Mets `null` pour une langue tant que le PDF n'existe pas : le Hero retombe
  // alors automatiquement sur le CV FR (évite un lien cassé / 404).
  cvFile: {
    fr: "cv-raouf-addeche-fr.pdf",
    en: "cv-raouf-addeche-en.pdf",
  },

  // ── SEO ── Tout ce qui finit dans le <head>, robots.txt et sitemap.xml est
  // généré à partir d'ici au build (voir vite.config.js). Édite UNIQUEMENT ce
  // bloc : pas besoin de toucher index.html. Laisse `sameAs` vide si tu ne veux
  // pas exposer tes réseaux dans les données structurées Google.
  seo: {
    siteUrl: "https://raoufaddeche.duckdns.org", // sans slash final
    title: "Raouf Addeche — Ingénieur IA & Data",
    description:
      "GenAI Engineer. Voicebots IA temps réel, workflows LLM et applications data en production.",
    jobTitle: "Ingénieur IA & Data",
    image: "/raouf.jpg", // chemin relatif depuis public/ (rendu absolu au build)
    locale: "fr_FR",
    sameAs: [
      "https://github.com/RaoufAddeche",
      "https://www.linkedin.com/in/raouf-addeche-706157113",
    ],
  },

  // Petits "faits clés" affichés sous le pitch du hero (par langue).
  // icon : "briefcase" | "school" | "pin" (autre = puce neutre)
  heroFacts: {
    fr: [
      { icon: "briefcase", text: "Développeur IA — Midas / Mobivia" },
      { icon: "school", text: "Simplon × Microsoft (2024–2026)" },
    ],
    en: [
      { icon: "briefcase", text: "AI Developer — Midas / Mobivia" },
      { icon: "school", text: "Simplon × Microsoft (2024–2026)" },
    ],
  },
};
