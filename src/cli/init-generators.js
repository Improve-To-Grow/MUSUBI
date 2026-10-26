/**
 * MUSUBI Initialization Generators
 *
 * Generator functions for musubi-init.js
 * Extracted to reduce file size and improve maintainability
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * JSON as Prettier formats it with the scaffold's .prettierrc.json, so a new project passes
 * `prettier --check .`: an array of strings stays on one line when it fits in 100 columns
 * @param {object} value
 * @returns {string}
 */
function toPrettierJson(value) {
  const json = JSON.stringify(value, null, 2).replace(
    /^( *)("[^"\n]+": )?\[\n((?: +"[^"\n]*",?\n)+) *\]/gm,
    (block, indent, key = '', items) => {
      const line = `${indent}${key}[${items
        .trim()
        .split(/,?\n\s*/)
        .join(', ')}]`;
      return line.length <= 100 ? line : block;
    }
  );
  return `${json}\n`;
}

/** tsconfig.json of a library or CLI: compiled to dist/ */
const LIBRARY_TSCONFIG = {
  compilerOptions: {
    target: 'ES2022',
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    declaration: true,
    outDir: './dist',
    rootDir: './src',
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist'],
};

/**
 * tsconfig.json of an application: the Next.js one, with the `@/*` alias and strict mode of
 * ITG-GIT-04; bundler resolution also lets musubi-code resolve `@/` imports
 */
const NEXT_TSCONFIG = {
  compilerOptions: {
    target: 'ES2017',
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    incremental: true,
    plugins: [{ name: 'next' }],
    paths: { '@/*': ['./src/*'] },
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules'],
};

/**
 * package.json of an application on the ITG stack (steering/tech.md): Next.js on Cloudflare
 * Workers through OpenNext, with the tools the scaffold's CI runs (Vitest, Playwright, ESLint with
 * eslint-plugin-security, Prettier, knip) and the packages their scaffold configuration loads.
 * Ranges are the current majors that work together: OpenNext needs Next.js 16.4.1 or later and
 * typescript-eslint (through eslint-config-next) supports TypeScript up to 6.0. Packages that code imports later, such as
 * firebase and zod, are added with that code, so knip does not fail on unused dependencies
 * @param {string} name - Package name
 * @param {string} [description] - Project description
 * @returns {object}
 */
function nextPackageJson(name, description = '') {
  return {
    name,
    version: '0.1.0',
    private: true,
    description,
    engines: { node: '>=22' },
    // The create-next-app scripts plus the ones of the Project Setup Guide §10.2
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'eslint',
      'cf:build': 'opennextjs-cloudflare build',
      'cf:preview': 'opennextjs-cloudflare build && opennextjs-cloudflare preview',
      'format:check': 'prettier --check .',
      'audit:catalogue': 'node scripts/checks/check-audit-catalogue.mjs --write',
      typecheck: 'tsc --noEmit',
      test: 'vitest run',
      'test:e2e': 'playwright test',
      knip: 'knip',
    },
    dependencies: {
      next: '^16.4.1',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      typescript: '~6.0.0',
      '@types/node': '^22.0.0',
      '@types/react': '^19.0.0',
      '@opennextjs/cloudflare': '^1.20.0',
      wrangler: '^4.148.0',
      vitest: '^5.0.0',
      '@vitest/coverage-v8': '^5.0.0',
      '@playwright/test': '^1.51.1',
      // ESLint 9, as create-next-app installs it: the React, import and jsx-a11y plugins of
      // eslint-config-next support ESLint up to 9
      eslint: '^9.39.0',
      'eslint-config-next': '^16.4.1',
      'eslint-plugin-security': '^4.0.0',
      prettier: '^3.0.0',
      knip: '^6.0.0',
    },
  };
}

/**
 * Generate language-specific dependency files for single-package projects
 */
async function generateDependencyFiles(primaryLang, answers) {
  const projectName = answers.projectName || 'my-project';
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  if (primaryLang === 'javascript') {
    const application = answers.constitutionProfile === 'application';

    // Check if package.json already exists
    if (!(await fs.pathExists('package.json'))) {
      const packageJson = application
        ? nextPackageJson(safeName, answers.description)
        : {
            name: safeName,
            version: '0.1.0',
            description: answers.description || '',
            type: 'module',
            main: 'dist/index.js',
            types: 'dist/index.d.ts',
            scripts: {
              build: 'tsc',
              test: 'jest',
              lint: 'eslint src/',
              format: 'prettier --write .',
            },
            devDependencies: {
              typescript: '^5.0.0',
              '@types/node': '^20.0.0',
              jest: '^29.0.0',
              '@types/jest': '^29.0.0',
              eslint: '^9.0.0',
              prettier: '^3.0.0',
            },
          };
      await fs.writeFile('package.json', toPrettierJson(packageJson));
    }

    // ITG-GIT-04: the Node version of an application is pinned in .nvmrc
    if (application && !(await fs.pathExists('.nvmrc'))) {
      await fs.writeFile('.nvmrc', '22\n');
    }

    // Generate tsconfig.json
    if (!(await fs.pathExists('tsconfig.json'))) {
      const tsconfig = application ? NEXT_TSCONFIG : LIBRARY_TSCONFIG;
      await fs.writeFile('tsconfig.json', toPrettierJson(tsconfig));
    }
  } else if (primaryLang === 'rust') {
    // Check if Cargo.toml already exists
    if (!(await fs.pathExists('Cargo.toml'))) {
      const cargoToml = `[package]
name = "${safeName}"
version = "0.1.0"
edition = "2021"
description = "${answers.description || ''}"
license = "MIT"

[dependencies]
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
thiserror = "1"
tracing = "0.1"

[dev-dependencies]
tokio-test = "0.4"
`;
      await fs.writeFile('Cargo.toml', cargoToml);

      // Create src/main.rs or src/lib.rs
      await fs.ensureDir('src');
      if (!(await fs.pathExists('src/main.rs')) && !(await fs.pathExists('src/lib.rs'))) {
        const mainRs = `//! ${answers.description || projectName}

fn main() {
    println!("Hello from ${projectName}!");
}
`;
        await fs.writeFile('src/main.rs', mainRs);
      }
    }
  } else if (primaryLang === 'python') {
    // Check if pyproject.toml already exists
    if (!(await fs.pathExists('pyproject.toml'))) {
      const pyprojectToml = `[project]
name = "${safeName}"
version = "0.1.0"
description = "${answers.description || ''}"
requires-python = ">=3.11"
dependencies = []

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "ruff>=0.1",
    "mypy>=1.0",
]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W"]

[tool.mypy]
python_version = "3.11"
strict = true

[tool.pytest.ini_options]
testpaths = ["tests"]
`;
      await fs.writeFile('pyproject.toml', pyprojectToml);

      // Create src directory and __init__.py
      const srcDir = `src/${safeName.replace(/-/g, '_')}`;
      await fs.ensureDir(srcDir);
      if (!(await fs.pathExists(`${srcDir}/__init__.py`))) {
        await fs.writeFile(
          `${srcDir}/__init__.py`,
          `"""${answers.description || projectName}"""\n\n__version__ = "0.1.0"\n`
        );
      }
    }
  } else if (primaryLang === 'go') {
    // Check if go.mod already exists
    if (!(await fs.pathExists('go.mod'))) {
      const goMod = `module github.com/${safeName}

go 1.21

require (
    // Add dependencies here
)
`;
      await fs.writeFile('go.mod', goMod);

      // Create main.go
      await fs.ensureDir('cmd');
      if (!(await fs.pathExists('cmd/main.go'))) {
        const mainGo = `package main

import "fmt"

func main() {
    fmt.Println("Hello from ${projectName}!")
}
`;
        await fs.writeFile('cmd/main.go', mainGo);
      }
    }
  } else if (primaryLang === 'java') {
    // Generate pom.xml for Maven
    if (!(await fs.pathExists('pom.xml'))) {
      const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>${safeName}</artifactId>
    <version>0.1.0</version>
    <packaging>jar</packaging>

    <name>${projectName}</name>
    <description>${answers.description || ''}</description>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
`;
      await fs.writeFile('pom.xml', pomXml);
    }
  } else if (primaryLang === 'csharp') {
    // Generate .csproj file
    const csprojPath = `${projectName}.csproj`;
    if (!(await fs.pathExists(csprojPath))) {
      const csproj = `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Extensions.Logging" Version="8.0.0" />
  </ItemGroup>

</Project>
`;
      await fs.writeFile(csprojPath, csproj);
    }
  }
}

/**
 * Language information for tech.md generation
 */
const LANG_INFO = {
  javascript: {
    name: 'JavaScript/TypeScript',
    version: 'ES2022+ / TypeScript 5.0+',
    runtime: 'Node.js 20+ LTS, Bun, Deno',
    packageManager: 'npm, pnpm, yarn',
    frameworks: 'React, Vue, Next.js, Express, Fastify',
    testing: 'Jest, Vitest, Playwright',
  },
  python: {
    name: 'Python',
    version: '3.11+',
    runtime: 'CPython, PyPy',
    packageManager: 'pip, poetry, uv',
    frameworks: 'FastAPI, Django, Flask',
    testing: 'pytest, unittest',
  },
  rust: {
    name: 'Rust',
    version: '1.75+ stable',
    runtime: 'Native binary',
    packageManager: 'Cargo',
    frameworks: 'Axum, Actix-web, Tokio',
    testing: 'cargo test, criterion',
  },
  go: {
    name: 'Go',
    version: '1.21+',
    runtime: 'Native binary',
    packageManager: 'Go modules',
    frameworks: 'Gin, Echo, Chi',
    testing: 'go test, testify',
  },
  java: {
    name: 'Java/Kotlin',
    version: 'Java 21 LTS / Kotlin 1.9+',
    runtime: 'JVM, GraalVM',
    packageManager: 'Maven, Gradle',
    frameworks: 'Spring Boot, Quarkus, Ktor',
    testing: 'JUnit 5, Kotest',
  },
  csharp: {
    name: 'C#/.NET',
    version: '.NET 8+',
    runtime: '.NET Runtime',
    packageManager: 'NuGet',
    frameworks: 'ASP.NET Core, MAUI',
    testing: 'xUnit, NUnit',
  },
  cpp: {
    name: 'C/C++',
    version: 'C++20',
    runtime: 'Native binary',
    packageManager: 'vcpkg, Conan',
    frameworks: 'Qt, Boost',
    testing: 'GoogleTest, Catch2',
  },
  swift: {
    name: 'Swift',
    version: '5.9+',
    runtime: 'Native binary',
    packageManager: 'Swift Package Manager',
    frameworks: 'SwiftUI, Vapor',
    testing: 'XCTest',
  },
  ruby: {
    name: 'Ruby',
    version: '3.2+',
    runtime: 'CRuby, JRuby',
    packageManager: 'Bundler, RubyGems',
    frameworks: 'Rails, Sinatra',
    testing: 'RSpec, Minitest',
  },
  php: {
    name: 'PHP',
    version: '8.2+',
    runtime: 'PHP-FPM, Swoole',
    packageManager: 'Composer',
    frameworks: 'Laravel, Symfony',
    testing: 'PHPUnit, Pest',
  },
};

/**
 * Generate language-specific tech.md content
 */
function generateTechMd(languages, answers) {
  const isUndecided = languages[0] === 'undecided';
  const date = new Date().toISOString().split('T')[0];

  if (isUndecided) {
    return `# Technology Stack

**Project**: ${answers.projectName}
**Last Updated**: ${date}
**Status**: Technology stack to be determined

---

## Overview

The technology stack for this project has not yet been decided. This document will be updated once the technical decisions are made.

## Decision Criteria

When selecting technologies, consider:

1. **Application Type**: What type of application is being built?
2. **Performance Requirements**: What are the performance constraints?
3. **Team Expertise**: What technologies is the team familiar with?
4. **Ecosystem**: What libraries and tools are available?
5. **Long-term Maintainability**: How well-supported is the technology?

## Candidates Under Consideration

| Aspect | Options | Decision |
|--------|---------|----------|
| Primary Language | TBD | ⏳ Pending |
| Web Framework | TBD | ⏳ Pending |
| Database | TBD | ⏳ Pending |
| Hosting | TBD | ⏳ Pending |

## Next Steps

1. [ ] Define functional requirements
2. [ ] Identify performance constraints
3. [ ] Evaluate team skills
4. [ ] Create proof-of-concept
5. [ ] Make final decision and update this document

---

*Run \`musubi steering\` to update this document after decisions are made.*
`;
  }

  // Generate tech.md for selected languages
  const primaryLang = languages[0];
  const primary = LANG_INFO[primaryLang] || { name: primaryLang, version: 'Latest' };

  let languageTable = `### Programming Languages

| Language | Version | Role | Notes |
|----------|---------|------|-------|
`;

  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i];
    const info = LANG_INFO[lang] || { name: lang, version: 'Latest' };
    const role = i === 0 ? 'Primary' : 'Secondary';
    languageTable += `| ${info.name} | ${info.version} | ${role} | ${info.runtime || ''} |\n`;
  }

  let frameworksSection = '';
  for (const lang of languages) {
    const info = LANG_INFO[lang];
    if (info && info.frameworks) {
      frameworksSection += `
### ${info.name} Ecosystem

- **Package Manager**: ${info.packageManager}
- **Frameworks**: ${info.frameworks}
- **Testing**: ${info.testing}
`;
    }
  }

  return `# Technology Stack

**Project**: ${answers.projectName}
**Last Updated**: ${date}
**Version**: 0.1.0

---

## Overview

${answers.description}

---

## Primary Technologies

${languageTable}
${frameworksSection}

---

## Development Environment

### Required Tools

- Primary language runtime (see above)
- Git 2.40+
- IDE: VS Code / JetBrains / Neovim

### Recommended Extensions

- Language-specific LSP
- Linter/Formatter integration
- Test runner integration

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary Language | ${primary.name} | Selected during project initialization |
| Package Manager | ${primary.packageManager || 'TBD'} | Standard for ${primary.name} |

---

## Dependencies

### Production Dependencies

*To be documented as dependencies are added.*

### Development Dependencies

*To be documented as dependencies are added.*

---

*Generated by MUSUBI SDD - Update with \`musubi steering\`*
`;
}

/**
 * Project profiles offered by `musubi init` (constitution v1.1, "Project Profiles")
 */
const CONSTITUTION_PROFILE_CHOICES = [
  { name: 'Library (packages that are published or shared)', value: 'library' },
  { name: 'CLI tool', value: 'cli' },
  { name: 'Application (web app or service deployed as one unit)', value: 'application' },
];

/**
 * Pre-filled core, delivery and adapter paths for an application, based on the project layout.
 * They follow the ITG repository layout (ITG Software Delivery Playbook §4.1): shared logic in
 * lib/ is the core, feature folders and middleware are delivery code, lib/auth and the route
 * wrappers in lib/api read the request context.
 * @param {string} projectRoot - Project root
 * @returns {{corePaths: string, deliveryPaths: string, adapterPaths: string}} Comma-separated paths
 */
function defaultApplicationPaths(projectRoot = process.cwd()) {
  const hasSrc = fs.existsSync(path.join(projectRoot, 'src'));
  const hasRootApp = fs.existsSync(path.join(projectRoot, 'app'));
  const base = !hasSrc && hasRootApp ? '' : 'src/';
  return {
    corePaths: `${base}lib`,
    deliveryPaths: ['app', 'components', 'features', 'middleware']
      .map(dir => `${base}${dir}`)
      .join(', '),
    adapterPaths: `${base}lib/auth, ${base}lib/api`,
  };
}

/**
 * Build the `constitution:` block of steering/project.yml
 * @param {object} options - { profile, corePaths, deliveryPaths, adapterPaths } (paths comma-separated)
 * @returns {string} YAML
 */
function buildConstitutionYml({ profile, corePaths, deliveryPaths, adapterPaths } = {}) {
  const toList = value =>
    (value || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  const flow = items => `[${items.join(', ')}]`;

  const lines = [
    '# Constitution profile: decides how Articles I and II apply',
    '# (see "Project Profiles" in steering/rules/constitution.md)',
    'constitution:',
    `  profile: ${profile || 'library'} # library | cli | application`,
  ];
  if (profile === 'application') {
    lines.push(
      `  core_paths: ${flow(toList(corePaths))} # where feature logic lives`,
      `  delivery_paths: ${flow(toList(deliveryPaths))} # pages, routes, UI`,
      `  adapter_paths: ${flow(toList(adapterPaths))} # request-context code`
    );
  } else {
    lines.push('  # core_paths default to [lib, packages] (P-3)');
  }
  if (profile === 'application') {
    // ITG-GIT-13: the Article VII code limits fail CI instead of being reported as warnings
    lines.push('  levels: # per-article overrides (P-6)', '    CONST-007: critical');
  } else {
    lines.push('  # levels: # optional per-article override (P-6), e.g. CONST-001: critical');
  }
  return `${lines.join('\n')}\n`;
}

/**
 * Build steering/project.yml in schema 2.0, which `musubi-config validate` checks
 * @param {object} answers - init answers: projectName, description, languages, constitution profile and paths
 * @param {object|null} [externalSpec] - external specification read by init
 * @returns {string} YAML
 */
function buildProjectYml(answers, externalSpec = null) {
  // Double-quoted YAML scalars are JSON strings, so a description with ':' or '#' stays intact
  const quote = value => JSON.stringify(String(value ?? ''));
  const languages = (answers.languages || []).filter(lang => lang !== 'undecided');
  const lines = [
    '# MUSUBI Project Configuration (schema 2.0, checked by musubi-config validate)',
    'schema_version: "2.0"',
    `project_name: ${quote(answers.projectName)}`,
    `description: ${quote(answers.description)}`,
    'version: "0.1.0"',
    `package_type: ${answers.constitutionProfile || 'library'}`,
    '',
    languages.length > 0
      ? `languages: [${languages.join(', ')}]`
      : '# languages: [] # undecided, add them once chosen',
    '',
    buildConstitutionYml({
      profile: answers.constitutionProfile,
      corePaths: answers.corePaths,
      deliveryPaths: answers.deliveryPaths,
      adapterPaths: answers.adapterPaths,
    }),
  ];
  if (externalSpec && !externalSpec.error) {
    const { metadata } = externalSpec;
    lines.push(
      '# External Specification Reference',
      'external_specs:',
      `  - source: ${quote(externalSpec.source)}`,
      `    type: ${quote(externalSpec.type)}`,
      `    format: ${quote(metadata.format || 'unknown')}`,
      `    title: ${quote(metadata.summary?.title || 'External Specification')}`,
      `    fetched_at: ${quote(metadata.fetchedAt || metadata.readAt || 'N/A')}`,
      ''
    );
  }
  lines.push(
    'metadata:',
    `  created_at: ${quote(new Date().toISOString())}`,
    `  musubi_version: ${quote(require('../../package.json').version)}`
  );
  return `${lines.join('\n')}\n`;
}

module.exports = {
  generateDependencyFiles,
  generateTechMd,
  LANG_INFO,
  CONSTITUTION_PROFILE_CHOICES,
  defaultApplicationPaths,
  buildConstitutionYml,
  buildProjectYml,
};
