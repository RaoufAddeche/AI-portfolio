// ─────────────────────────────────────────────────────────────────────────
//  CONFIG DU SITE — édite ce fichier pour faire le portfolio TIEN.
//  (Le contenu — profil, parcours, projets, compétences — vient de la base de
//   données / du seed et de la synchro GitHub. Ici : l'identité + les assets.)
// ─────────────────────────────────────────────────────────────────────────
export const SITE = {
  // Nom affiché (fallback si la base n'a pas encore de profil)
  ownerName: "Raouf Addeche",

  // Fichiers CV servis depuis /public, par langue (mets les tiens dans public/)
  cvFile: {
    fr: "cv-raouf-addeche-fr.pdf",
    en: "cv-raouf-addeche-en.pdf",
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
