// Configuração: regras do ESLint para o código JavaScript e React
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignora a pasta de build
  globalIgnores(['dist']),
  {
    // Aplica as regras a todos os arquivos .js e .jsx
    files: ['**/*.{js,jsx}'],
    // Conjuntos de regras recomendadas
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    // Variáveis não usadas são erro (exceto nomes iniciados por maiúscula ou _)
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
