module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/templates/**',  // Exclude templates from coverage
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  testPathIgnorePatterns: [
    '[\\\\/]node_modules[\\\\/]',
    // E2E scripts call process.exit() and need a live Ollama / large fixture setup.
    // Run them directly: node tests/e2e/ollama-e2e.test.js
    // Separator-agnostic so the pattern also matches Windows paths.
    '[\\\\/]tests[\\\\/]e2e[\\\\/]'
  ],
  verbose: true,
  // Prevent coverage worker issues with temp directories
  maxWorkers: 1,
  // Force exit after tests complete (handles pending timers in swarm tests)
  forceExit: true
};
