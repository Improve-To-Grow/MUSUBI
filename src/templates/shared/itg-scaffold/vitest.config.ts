import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // The @/* alias of tsconfig.json (ITG-GIT-04)
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // Playwright runs tests/e2e; functions/ is its own package
    exclude: [...configDefaults.exclude, 'tests/e2e/**', 'functions/**'],
    coverage: {
      // `vitest run` fails below the thresholds of the application profile in
      // steering/rules/constitution-levels.yml (ITG-TST-03)
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      thresholds: { lines: 60, functions: 60, branches: 60, statements: 60 },
    },
  },
});
