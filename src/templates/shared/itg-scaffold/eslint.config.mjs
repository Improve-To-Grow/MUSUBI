// ESLint with eslint-plugin-security over src/, functions/ and workers/ (ITG-CI-01, §11.9)
import js from '@eslint/js';
import security from 'eslint-plugin-security';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      '.next/',
      '.open-next/',
      '.wrangler/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      'next-env.d.ts',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  { ...security.configs.recommended, files: ['src/**', 'functions/**', 'workers/**'] },
  {
    files: ['**/*.mjs', '**/*.cjs', '*.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    // firebase-admin runs only in functions/ and in the operator scripts (ITG-PLT-14)
    files: ['src/**', 'workers/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['firebase-admin', 'firebase-admin/*'],
              message: 'Reach Firebase through src/lib/firebase-rest (ITG-PLT-14)',
            },
          ],
        },
      ],
    },
  },
]);
