import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  {
    // Things ESLint should never look at.
    ignores: ['dist', 'node_modules', 'coverage', 'supabase/.temp', 'docs'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Tracked tech-debt (Phase C): a few WIP pages auto-select a default via
      // setState-in-effect. Surface it as a warning so it stays visible without
      // blocking CI while those pages are refactored to the derived-state pattern.
      'react-hooks/set-state-in-effect': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Allow intentionally-unused vars prefixed with underscore.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Node-context config files.
    files: ['*.config.{js,ts}', 'vite.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    // Test files get the Vitest/jsdom globals.
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
)
