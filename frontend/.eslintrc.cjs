/* Configuration ESLint (format .eslintrc pour ESLint 8.x).
   Linter du frontend : `npm run lint`. */
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  rules: {
    // On n'utilise pas prop-types (projet sans typage runtime).
    'react/prop-types': 'off',
    // App en français : les apostrophes en clair dans le JSX sont volontaires.
    'react/no-unescaped-entities': 'off',
    // Les `catch {}` volontairement vides sont autorisés (best-effort : tracking, localStorage…).
    'no-empty': ['error', { allowEmptyCatch: true }],
    // Confort HMR uniquement : on tolère les fichiers qui exportent un provider + des helpers (ex. i18n.jsx).
    'react-refresh/only-export-components': 'off',
  },
}
