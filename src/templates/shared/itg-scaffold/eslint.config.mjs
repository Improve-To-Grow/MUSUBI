// The Next.js defaults plus the ITG rules of the Project Setup Guide §10.4 (ITG-CI-01, §11.9)
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import security from 'eslint-plugin-security';
import { defineConfig, globalIgnores } from 'eslint/config';

// eslint-plugin-security: every recommended rule as an error, except detect-object-injection
const securityRules = Object.fromEntries(
  Object.keys(security.configs.recommended.rules).map(rule => [rule, 'error'])
);
securityRules['security/detect-object-injection'] = 'off';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    '.open-next/**',
    '.wrangler/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
    },
  },
  {
    files: ['src/**', 'functions/**', 'workers/**'],
    plugins: { security },
    rules: securityRules,
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
  {
    // Server code logs through the recorders of src/lib/logs (§9.9)
    files: ['src/app/api/**', 'src/lib/**'],
    rules: { 'no-console': 'error' },
  },
]);
