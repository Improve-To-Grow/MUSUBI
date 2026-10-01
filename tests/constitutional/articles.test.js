/**
 * Constitutional Articles: shared definitions and content rules
 *
 * The nine articles of steering/rules/constitution.md (v1.1) and the content-level
 * checks used by the CI checker, the safety guardrail and the project validator.
 */

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const {
  ARTICLES,
  resolveImports,
  checkTestableCore,
  checkAutomationInterface,
  checkEarsFormat,
  checkTraceabilityReferences,
  checkAntiAbstraction,
  checkIntegrationMocks,
  checkProjectMemory,
  checkSimplicityGate,
  countProjects,
} = require('../../src/constitutional/articles');

const applicationProfile = {
  profile: 'application',
  corePaths: ['src/lib'],
  deliveryPaths: ['src/app', 'src/components'],
  adapterPaths: ['src/lib/server'],
};
const cliProfile = { profile: 'cli', corePaths: ['src'], deliveryPaths: ['bin'], adapterPaths: [] };
const ids = findings => findings.map(f => f.requirement);

describe('ARTICLES', () => {
  it('defines the nine articles of the constitution', () => {
    expect(Object.values(ARTICLES).map(a => a.name)).toEqual([
      'Testable-Core Principle',
      'Automation Interface Mandate',
      'Test-First Imperative',
      'EARS Requirements Format',
      'Traceability Mandate',
      'Project Memory',
      'Simplicity Gate',
      'Anti-Abstraction Gate',
      'Integration-First Testing',
    ]);
    expect(ARTICLES.I.constId).toBe('CONST-001');
    expect(ARTICLES.IX.constId).toBe('CONST-009');
    expect(ARTICLES.VII.statement).toContain('at most 3 projects');
  });
});

describe('resolveImports', () => {
  it('resolves relative, @/ and src/ imports to project-relative paths', () => {
    const content = [
      "import { a } from '../../components/a';",
      "import type { B } from '@/app/b';",
      "const c = require('src/app/c');",
      "import x from 'react';",
    ].join('\n');
    expect(resolveImports('src/lib/x/y.ts', content, { srcExists: true })).toEqual([
      'src/components/a',
      'src/app/b',
      'src/app/c',
    ]);
  });
});

describe('Article I: checkTestableCore', () => {
  it('reports core imports from delivery paths as definite (I-3)', () => {
    const findings = checkTestableCore({
      rel: 'src/core/index.js',
      content: "const cli = require('../../bin/tool');",
      profile: cliProfile,
      srcExists: true,
    });
    expect(ids(findings)).toEqual(['I-3']);
    expect(findings[0].definite).toBe(true);
    expect(findings[0].message).toContain('bin/tool');
  });

  it('reports UI code and request-context APIs in core paths of an application (I-A4, I-A5)', () => {
    const ui = checkTestableCore({
      rel: 'src/lib/swr/provider.tsx',
      content: "import { createContext } from 'react';",
      profile: applicationProfile,
      srcExists: true,
    });
    expect(ids(ui)).toEqual(['I-A4']);

    const requestContext = checkTestableCore({
      rel: 'src/lib/auth/session.ts',
      content: "import { cookies } from 'next/headers';",
      profile: applicationProfile,
      srcExists: true,
    });
    expect(ids(requestContext)).toEqual(['I-A5']);
    expect(requestContext[0].advisory).toBe(true);
  });

  it('ignores files outside core paths, adapter paths and tests', () => {
    const content = "import { cookies } from 'next/headers';\nimport '@/components/x';";
    for (const rel of ['src/app/page.tsx', 'src/lib/server/auth.ts', 'src/lib/auth/a.test.ts']) {
      expect(
        checkTestableCore({ rel, content, profile: applicationProfile, srcExists: true })
      ).toEqual([]);
    }
  });
});

describe('Article II: checkAutomationInterface', () => {
  it('reports machine-facing endpoints of an application without schema validation (II-A4)', () => {
    const rel = 'src/app/api/webhooks/n8n/route.ts';
    expect(
      ids(
        checkAutomationInterface({
          rel,
          content: 'export async function POST() {}',
          profile: applicationProfile,
        })
      )
    ).toEqual(['II-A4']);
    expect(
      checkAutomationInterface({
        rel,
        content: "import { z } from 'zod';",
        profile: applicationProfile,
      })
    ).toEqual([]);
    expect(checkAutomationInterface({ rel, content: 'export {}', profile: cliProfile })).toEqual(
      []
    );
  });
});

describe('Article IV: checkEarsFormat', () => {
  const rel = 'storage/specs/auth-requirements.md';

  it('accepts the five EARS patterns', () => {
    const content = [
      '# Requirements',
      '',
      '- **REQ-AUTH-001** WHEN a user submits valid credentials, the Auth Service SHALL issue a session.',
      '',
      'REQ-AUTH-002: WHILE a session is active, the Dashboard SHALL show the user name.',
      '',
      'IF the password is wrong 3 times, THEN the Auth Service SHALL lock the account.',
      '',
      'WHERE SSO is enabled, the Login Page SHALL redirect to the identity provider.',
      '',
      'The Auth Service SHALL hash passwords with bcrypt.',
      '',
      '```',
      'System SHALL be ignored inside code blocks',
      '```',
    ].join('\n');
    expect(checkEarsFormat({ rel, content })).toEqual([]);
  });

  it('reports statements outside the EARS patterns and IF without THEN (IV-1)', () => {
    const content = 'System SHALL send email.\n\nIF the token expires, the API SHALL return 401.';
    const findings = checkEarsFormat({ rel, content });
    expect(ids(findings)).toEqual(['IV-1']);
    expect(findings[0].message).toContain('2 requirement');
  });

  it('reports ambiguous keywords (IV-2)', () => {
    const content = 'WHEN a user logs in, the system SHALL respond quickly where it should.';
    expect(ids(checkEarsFormat({ rel, content }))).toEqual(['IV-2']);
  });

  it('reports a requirements document without SHALL statements (IV-1)', () => {
    expect(ids(checkEarsFormat({ rel, content: 'Users can log in.' }))).toEqual(['IV-1']);
  });

  it('only checks requirements documents', () => {
    expect(checkEarsFormat({ rel: 'README.md', content: 'Nothing here' })).toEqual([]);
  });
});

describe('Article V: checkTraceabilityReferences', () => {
  it('requires a requirement ID in source files (V-2) and tests (V-4)', () => {
    expect(ids(checkTraceabilityReferences({ rel: 'src/a.js', content: 'const a = 1;' }))).toEqual([
      'V-2',
    ]);
    expect(
      ids(checkTraceabilityReferences({ rel: 'tests/a.test.js', content: "test('a', () => {});" }))
    ).toEqual(['V-4']);
  });

  it('accepts requirement IDs and @requirement tags', () => {
    for (const content of [
      '// REQ-AUTH-001',
      '/** @requirement login */',
      '/** Requirement: R */',
    ]) {
      expect(checkTraceabilityReferences({ rel: 'src/a.js', content })).toEqual([]);
    }
  });

  it('skips index and config files', () => {
    expect(checkTraceabilityReferences({ rel: 'src/index.js', content: '' })).toEqual([]);
    expect(checkTraceabilityReferences({ rel: 'jest.config.js', content: '' })).toEqual([]);
  });
});

describe('Article VIII: checkAntiAbstraction', () => {
  it('reports possible abstraction layers (VIII-2)', () => {
    for (const content of [
      'class DatabaseWrapper {}',
      'abstract class Repo {}',
      'class A extends BaseService {}',
      'class A implements ServiceFactory {}',
    ]) {
      expect(ids(checkAntiAbstraction({ rel: 'src/a.ts', content }))).toEqual(['VIII-2']);
    }
  });

  it('ignores tests and declared adapter paths', () => {
    const content = 'class HttpWrapper {}';
    expect(checkAntiAbstraction({ rel: 'src/a.test.ts', content })).toEqual([]);
    expect(
      checkAntiAbstraction({ rel: 'src/lib/server/a.ts', content, profile: applicationProfile })
    ).toEqual([]);
  });
});

describe('Article IX: checkIntegrationMocks', () => {
  const rel = 'tests/integration/orders.test.js';

  it('reports unjustified mocks in integration tests (IX-4, IX-5)', () => {
    const findings = checkIntegrationMocks({ rel, content: "jest.mock('../src/db');" });
    expect(ids(findings)).toEqual(['IX-5']);
    expect(findings[0].message).toContain('../src/db');
  });

  it('accepts justified mocks, allowed services and unit tests', () => {
    expect(
      checkIntegrationMocks({
        rel,
        content: "// IX-5: no test environment\njest.mock('../src/db');",
      })
    ).toEqual([]);
    expect(checkIntegrationMocks({ rel, content: "jest.mock('openai');" })).toEqual([]);
    expect(
      checkIntegrationMocks({
        rel: 'tests/unit/orders.test.js',
        content: "jest.mock('../src/db');",
      })
    ).toEqual([]);
  });
});

describe('project-level rules', () => {
  let root;

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-articles-'));
  });

  afterEach(async () => {
    await fs.remove(root);
  });

  it('Article VI: reports missing steering files (VI-1..VI-3)', async () => {
    await fs.outputFile(path.join(root, 'steering/tech.md'), '# Tech');
    expect(ids(checkProjectMemory(root))).toEqual(['VI-1', 'VI-3']);
  });

  it('Article VII: counts deployable units and reports more than 3 without approval (VII-1, VII-2)', async () => {
    await fs.outputFile(path.join(root, 'package.json'), '{}');
    for (const name of ['a', 'b', 'c']) {
      await fs.outputFile(path.join(root, 'packages', name, 'package.json'), '{}');
    }
    expect(countProjects(root)).toBe(4);
    expect(ids(checkSimplicityGate(root))).toEqual(['VII-2']);

    await fs.outputFile(path.join(root, 'steering/complexity-tracking.md'), '# Approved');
    expect(checkSimplicityGate(root)).toEqual([]);
  });
});

describe('Article V: checkDesignCoverage (V-5)', () => {
  const { checkDesignCoverage } = require('../../src/constitutional/articles');

  it('requires a table that lists requirement IDs', () => {
    expect(
      checkDesignCoverage({ content: '# Design\n\nREQ-1 is handled by the service.' })
    ).toEqual([expect.objectContaining({ requirement: 'V-5' })]);
    expect(
      checkDesignCoverage({
        content: '| Requirement | Component |\n|---|---|\n| REQ-ORD-001 | Orders |',
      })
    ).toEqual([]);
  });
});
