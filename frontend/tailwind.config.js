/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Tokens sémantiques pilotés par variables CSS (voir index.css).
        // Ils basculent automatiquement en dark mode via .dark.
        bg: v("--bg"),
        surface: { DEFAULT: v("--surface"), 2: v("--surface-2") },
        ink: v("--ink"),
        body: v("--body"),
        muted: v("--muted"),
        line: v("--line"),
        accent: { DEFAULT: v("--accent"), hover: v("--accent-hover"), soft: v("--accent-soft") },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: { content: "72rem" },
      letterSpacing: { tightish: "-0.015em" },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-up": "fadeUp 0.5s ease-out both" },
    },
  },
  plugins: [],
};
