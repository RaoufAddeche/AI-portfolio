/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette sobre : neutres + un seul accent (bleu nuit).
        ink: "#0f172a",      // titres, texte fort
        body: "#475569",     // texte courant (slate-600)
        line: "#e2e8f0",     // bordures (slate-200)
        accent: {
          DEFAULT: "#1f4e79", // bleu nuit
          hover: "#163a5c",
          soft: "#eef3f8",    // fond teinté très clair
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: {
        content: "72rem", // 1152px : largeur de page cohérente
      },
      letterSpacing: {
        tightish: "-0.015em",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
