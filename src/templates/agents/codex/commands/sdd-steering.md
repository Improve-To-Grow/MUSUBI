# SDD Steering Command

Generate or update project memory (steering context).

---

## Instructions for Claude

You are executing the `/sdd-steering` command to generate or update the project's steering context.

### What is Steering?

Steering provides **project memory** for all Claude Code skills. It consists of 3 core files that document:

1. **structure.md** - Architecture patterns, directory structure, naming conventions
2. **tech.md** - Technology stack, frameworks, tools
3. **product.md** - Business context, product goals, users

It also includes the ITG delivery policies in `steering/rules/itg/` (ITG Software Delivery Playbook). `musubi init` writes all of them, and `structure.md`, `tech.md` and `product.md` start from the ITG defaults.

### ITG Rules for Steering

- Never remove or overwrite an ITG default. Record a project-specific choice in the `## Deviations from the ITG Playbook` table of `tech.md` (stack, platform, data) or `structure.md` (layout, naming), with the rule id, decision, reason, date and approver.
- WHEN the code contradicts an ITG rule and no deviation is recorded, report it as drift with the rule id (e.g. `ITG-PLT-14`). Do not change the steering files to match the code.
- Never edit `steering/rules/itg/`; those files come from the ITG MUSUBI fork.
- Draw architecture as Mermaid C4 and decision logic as Mermaid `flowchart` (ITG-DEL-12).

### Your Task

**Mode Detection**: Determine which mode to use:

1. **Bootstrap Mode** - No steering files exist
   - Analyze entire codebase
   - Generate initial steering files

2. **Sync Mode** - Steering files exist, codebase has changed
   - Compare current steering with codebase
   - Identify discrepancies
   - Update steering files to match reality

3. **Review Mode** - User wants to review/improve steering
   - Present current steering
   - Suggest improvements
   - Ask user for feedback

---

## Mode 1: Bootstrap (First Time)

### Detection

- `steering/` directory doesn't exist OR
- `steering/structure.md`, `steering/tech.md`, `steering/product.md` don't exist

### Steps

1. **Analyze Codebase** (use Glob, Grep, Read tools extensively):
   - Directory structure
   - File organization patterns
   - Technology stack (package.json, requirements.txt, go.mod, etc.)
   - Frameworks detected
   - Database technologies
   - API patterns
   - Testing frameworks
   - Build tools
   - Deployment configurations

2. **Infer Product Context**:
   - README.md analysis
   - Package descriptions
   - Domain concepts from code
   - User types from code

3. **Generate Steering Files**:

   Create `steering/structure.md` with:
   - Architecture pattern (monolith, microservices, library-first, etc.)
   - Directory organization rules
   - Naming conventions
   - Component boundaries
   - Integration patterns

   Create `steering/tech.md` with:
   - Primary language(s) and versions
   - Frameworks and versions
   - Database(s) and versions
   - API technologies (REST, GraphQL, gRPC)
   - Testing frameworks
   - Build/deployment tools
   - Development tools

   Create `steering/product.md` with:
   - Product vision (inferred from README)
   - Target users (inferred from code)
   - Core capabilities
   - Business domain
   - Success metrics (if available)

4. **Record Project Profile** (constitution "Project Profiles", P-1, P-4):
   - From the architecture pattern, determine the profile:
     - `library`: packages that are published or shared with other projects
     - `cli`: command-line tools
     - `application`: web apps and services deployed as one unit
   - Determine `core_paths` (where feature logic lives), `delivery_paths` (pages, routes, UI, CLI entry points) and, for `application`, `adapter_paths` (request-context code)
   - IF `steering/project.yml` has no `constitution:` block, THEN write it (example for an `application`):

     ```yaml
     constitution:
       profile: application # library | cli | application
       core_paths: [src/lib]
       delivery_paths: [src/app, src/components, src/features, src/middleware]
       adapter_paths: [src/lib/auth]
     ```

     These are the ITG defaults (`steering/structure.md`, "Testable-Core Pattern").

   - IF the block exists, THEN confirm it with the user, and change it only after the user agrees

5. **Create Rules Directory**:
   - Copy constitutional governance files
   - Copy workflow guide
   - Copy EARS format guide
   - Copy the ITG delivery policies to `steering/rules/itg/` (from the ITG fork's `src/templates/shared/steering/rules/itg/`, or run `musubi init`)

### Output

Present summary:

```markdown
## ✅ Steering Bootstrap Complete

Created steering files:

- steering/structure.md
- steering/tech.md
- steering/product.md
- steering/project.yml (constitution profile)
- steering/rules/ (constitution, workflow, EARS)
- steering/rules/itg/ (ITG delivery policies)

### Key Findings:

- **Architecture**: [detected pattern]
- **Profile**: [library | cli | application]
- **Tech Stack**: [primary technologies]
- **Product**: [inferred purpose]

Please review the generated files and adjust as needed.
```

---

## Mode 2: Sync (Update Existing)

### Detection

- Steering files exist
- Codebase may have changed since last steering update

### Steps

1. **Read Current Steering**:
   - Read `steering/structure.md`
   - Read `steering/tech.md`
   - Read `steering/product.md`
   - Read the `constitution:` block in `steering/project.yml`
   - Read `steering/rules/itg/README.md` and the Deviations tables

2. **Analyze Current Codebase**:
   - Same analysis as Bootstrap mode
   - Compare with current steering

3. **Detect Discrepancies**:
   - New technologies added?
   - Architecture changed?
   - New components added?
   - Directory structure evolved?
   - Project profile or core/delivery paths no longer match `steering/project.yml`?
   - Code that breaks an ITG rule without a recorded deviation? (report the rule id)

4. **Update Steering Files** (after approval, VI-6):
   - Present the detected changes and apply them only after the user approves
   - Update sections that changed
   - Preserve sections that are still accurate
   - Add changelog entries
   - Write a missing `constitution:` block; change an existing one only after the user confirms

5. **Generate Sync Report**:

   ```markdown
   ## 🔄 Steering Sync Report

   ### Changes Detected:

   - [Change 1]
   - [Change 2]

   ### Updated Files:

   - steering/structure.md
   - steering/tech.md

   ### No Changes:

   - steering/product.md (still accurate)
   ```

---

## Mode 3: Review (User-Initiated Review)

### Detection

- User explicitly asks to review steering
- OR user wants to improve steering

### Steps

1. **Present Current Steering**:
   - Show current structure.md summary
   - Show current tech.md summary
   - Show current product.md summary

2. **Identify Improvement Opportunities**:
   - Missing information
   - Outdated information
   - Unclear sections
   - Inconsistencies

3. **Ask User for Feedback**:
   - Use AskUserQuestion tool
   - Get user confirmation on changes
   - Update based on feedback

---

## Constitutional Compliance

This command supports **Article VI: Project Memory**:

> Each skill SHALL consult project memory (steering files) before making decisions.

It maintains the steering files that Article VI requires: `steering/structure.md` defines the architecture patterns (VI-1), `steering/tech.md` the technology stack (VI-2) and `steering/product.md` the business context (VI-3). WHEN the architecture, technology stack or business context changes, the project SHALL update the affected steering files (VI-5).

By maintaining accurate steering files, all skills can:

- Make context-aware decisions
- Follow established patterns
- Align with product goals
- Use correct technologies

---

## Example Outputs

### Bootstrap Example

```markdown
## ✅ Steering Bootstrap Complete

### Structure (steering/structure.md)

- **Architecture**: Library-first monorepo
- **Pattern**: Each feature as independent library in `lib/`
- **App Integration**: Next.js app in `app/`
- **Directories**:
  - `lib/` - Reusable libraries
  - `app/` - Next.js application
  - `tests/` - Integration tests

### Constitution Profile (steering/project.yml)

- **Profile**: library (each feature is a standalone library in `lib/`)
- **Core paths**: `lib/`
- **Delivery paths**: `app/`

### Tech Stack (steering/tech.md)

- **Language**: TypeScript (strict), Node 22
- **Framework**: Next.js (App Router) on Cloudflare Workers via OpenNext
- **Database**: Firestore over the Firebase REST client (ITG-DAT-01)
- **API**: Route Handlers through withApiRoute (ITG-SEC-13)
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions + Wrangler
- **Deviations**: none recorded

### Product (steering/product.md)

- **Vision**: SaaS authentication platform
- **Users**: B2B SaaS companies
- **Core Features**: SSO, MFA, user management
```

### Sync Example

```markdown
## 🔄 Steering Sync Report

### Changes Detected:

1. **New Technology**: Cloudflare KV binding added for the rate limiter
2. **Architecture Evolution**: Nightly export moved to a Firebase Function (ITG-INT-06)
3. **New Component**: `src/features/notifications/` added
4. **ITG drift**: `src/app/api/export/route.ts` imports `firebase-admin` (ITG-PLT-14), reported, not documented as a deviation

### Updated:

- ✅ steering/tech.md - Added the KV binding and the Functions job
- ✅ steering/structure.md - Documented background jobs pattern

### No Changes:

- steering/product.md - Product vision unchanged
```

---

## Tool Usage

Use these tools extensively:

1. **Glob**: Find all source files, configs

   ```
   pattern: "**/*.ts"
   pattern: "**/package.json"
   pattern: "**/*.md"
   ```

2. **Grep**: Analyze code patterns

   ```
   pattern: "import.*from"
   pattern: "export.*class"
   pattern: "interface\\s+\\w+"
   ```

3. **Read**: Read key files
   - package.json
   - tsconfig.json
   - README.md
   - docker-compose.yml
   - .env.example

---

## Validation

After generating/updating steering:

1. **Completeness Check**:
   - [ ] All 3 core files present
   - [ ] `constitution:` block in `steering/project.yml` (profile, core_paths, delivery_paths)
   - [ ] Rules directory populated

2. **Accuracy Check**:
   - [ ] Technologies match package.json
   - [ ] Architecture matches codebase structure
   - [ ] Product context aligns with README

3. **Consistency Check**:
   - [ ] No contradictions between files
   - [ ] Steering aligns with constitutional articles

---

## Next Steps After Steering

Once steering is complete, users can:

1. Review and adjust steering files manually
2. Proceed with requirements analysis: `/sdd-requirements [feature]`
3. Use any skill (they will now have project context)

---

**Execution**: Begin steering generation/update now.
