---
title: ITG Software Delivery Playbook
subtitle: Delivery standard for AI-focused platforms built on Next.js, Firebase, Cloudflare Workers, Azure Communication Services, Gemini / Vertex AI and n8n
version: 2.1
date: 2026-10-08
---

# ITG Software Delivery Playbook

**Version 2.1 — October 2026**

Delivery standard for AI-focused platforms built on Next.js, Firebase, Cloudflare Workers, Azure Communication Services, Gemini / Vertex AI and n8n.

## Purpose

This playbook defines how Improve to Grow (ITG) plans, builds, tests, deploys, monitors, secures and maintains software products for clients.

Its goal is simple: every project should move through a consistent, professional delivery system. The client may change and the scope may change, but the operating standard should not.

**Scope.** This playbook applies to every project started from this version onward. It describes the target state for a new project, not the history of older ones.

**Deviation.** A project team may deviate from a default rule when the project's domain justifies it. The deviation must be documented in the project's `documentation/` folder (see §1.5) and, when it affects architecture or stack, in the MUSUBI steering files (see §3.3). Silent deviation is not allowed.

**Source of truth and versioning.** The Markdown source of this playbook is canonical; the PDF is generated from it. The playbook and the ITG MUSUBI fork (`Improve-To-Grow/MUSUBI`, branch `ITG-adjustments`) are kept in sync:

- Every decision change is applied to both in the same change set: this document, and the fork's steering templates, constitution and scaffolding.
- The fork carries a copy of this document at `docs/itg/ITG_Software_Delivery_Playbook.md`; the two files must be identical.
- This playbook has a version (`X.Y`, header of this document) and a changelog (`PLAYBOOK_CHANGELOG.md`). A playbook change bumps the version, adds a changelog entry, and is released in the fork as the next `-itg.N` package version whose `CHANGELOG.md` names the playbook version it implements.

---

# 1. Core Principles

## 1.1 Client as the Hero, ITG as the Guide

Every product we build should help the client achieve a business outcome. ITG is not just a technical supplier. ITG acts as a strategic guide that turns business goals into reliable digital systems.

Before building, we clarify:

- What business problem are we solving?
- Who is the user?
- What outcome should the platform create?
- What does success look like?
- What risks must be managed?

## 1.2 Standardized Delivery, Flexible Execution

Every project follows the same delivery framework:

1. Discovery
2. Scope definition
3. Technical architecture (via MUSUBI steering, §3.3)
4. Sprint 0 setup
5. Development
6. QA and security review
7. Deployment
8. Monitoring
9. Maintenance
10. Handover

The implementation may differ per client, but the process stays consistent.

## 1.3 Security and Reliability by Default

Security, logging, testing, backups and access control are not optional extras. They are part of the product.

A feature is not done unless it is:

- Specified (EARS requirements, §3.2)
- Built test-first (§7.1)
- Reviewed
- Secured
- Logged (every API route, §9)
- Documented where necessary
- Deployed to staging and verified

## 1.4 Automate Repetitive Work

Manual processes create risk. Anything repeated more than twice should be considered for automation: deployment, testing, backup checks, dependency scanning, release notes, monitoring alerts.

Automation lives in code first. n8n is reserved for large or frequently changing workflows (§2.2.2).

## 1.5 Documentation Is Part of Delivery

If the team cannot explain how something works, it is not finished.

Documentation is split by lifecycle:

| Home | Content | Why |
|---|---|---|
| **Repository — `steering/` and `storage/` (MUSUBI)** | Architecture patterns, technology stack, product context, EARS requirements, C4 design and ADRs, task breakdowns, traceability matrix | Must move with the code and with the spec; validated by `musubi validate` |
| **Repository — `documentation/`** | `SECURITY.md`, `AUDIT_LOGGING.md`, `DATABASE.md`, `OPERATIONS.md`, `INTEGRATIONS.md`, `RELEASE_PROCESS.md`, `hardening/` (§1.6), migration READMEs, query runbooks | Engineering docs rot unless they are versioned and PR-reviewed with the code |
| **ClickUp** | Project brief, scope, sprint planning, sign-off checklists (security review, deployment, QA), client handover packet, integration owner registry, backup / restore status | Delivery docs need to move with project state |
| **Microsoft OneDrive** | Client-provided assets and large binary files | Not code |

Default ITG rule: *engineering docs in the repository, delivery docs in ClickUp.* A project may override when a client contractually requires all artifacts in a single location.

## 1.6 Dated Hardening Documents

Significant security or architecture decisions get a dated write-up in `documentation/hardening/`:

```
documentation/hardening/<TOPIC>_HARDENING_<YYYY-MM-DD>.md
documentation/hardening/README.md        # index: one line per doc + runbook links
```

Each document captures:

- What changed
- Why (rationale, threat model, trade-offs)
- Validation commands run after the change
- Residual risk
- Follow-ups

Why: rationale rots faster than code. A dated capture prevents teams from re-litigating old decisions; the index README is the cold-walk-in entry point for new developers.

---

# 2. Standard Technology Stack and Platform

## 2.1 Default Stack

| Layer | Default technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript |
| Server-side application logic | Next.js Route Handlers (`src/app/api/**/route.ts`); Server Actions only for form mutations that never need to be called outside the UI |
| Hosting / runtime | Cloudflare Workers via OpenNext (§2.2) |
| Authentication | Firebase Authentication, roles in custom claims (§11.3) |
| Primary database | Firestore |
| Large relational data | PostgreSQL on the ITG-managed VPS, only when the decision matrix (§2.3) requires it |
| Structured and audit logs | ITG log-ingest service + logs-console (§9) |
| File storage | Cloudflare R2 (default) or Firebase Storage when Firebase Storage rules are the simpler fit |
| Transactional email | Azure Communication Services (ACS) Email, called from application code (§2.4.1) |
| AI services | Gemini models **through Vertex AI only** (never the public Gemini API, so that client data is not used for model training; §11.10) |
| Scheduled jobs | Firebase Functions (scheduled) for backups and nightly jobs; Cloudflare Cron Triggers for Worker-side jobs |
| Workflow automation | n8n, for large or frequently changing workflows only (§2.2.2) |
| Error tracking | Runtime logs + `error_events` in the central log store; Sentry optional for critical platforms (§2.1.2) |
| CI/CD | GitHub Actions + Wrangler (§8) |
| Source control | GitHub, organization `Improve-To-Grow` |
| Project management | ClickUp |
| Specification | MUSUBI (Specification Driven Development), ITG fork (§3.3) |
| Design | Claude Design; output is implemented with the shadcn/ui component language (§2.1.5) |
| Secrets and configuration | GitHub Environments (`staging`, `production`) → Wrangler secrets (§2.1.4) |

### 2.1.1 PostgreSQL

PostgreSQL is not part of the default application stack. Firestore is the default. Use PostgreSQL only when §2.3 says so (large datasets, relational reporting, complex filtering, heavy batch updates).

When a project needs PostgreSQL, it uses a database on the shared ITG PostgreSQL instance (one instance per VPS, one database per project, one database user per project with only the permissions it needs). Never create a separate PostgreSQL server per project.

The central logs database is operated by ITG as a platform service. Applications never connect to it directly (§9.3).

### 2.1.2 Error Tracking

Sentry is optional. For most projects, runtime logs (Cloudflare observability, Firebase, Functions) plus the `error_events` table in the central log store are sufficient. Add Sentry when the platform is business-critical, errors must be grouped and prioritized automatically, or frontend runtime errors must be visible after release.

### 2.1.3 Design

Designs are produced with Claude Design and handed over as component-level specifications. Implementation uses the shadcn/ui + Tailwind component language (§2.1.5), so that a design maps one-to-one onto existing primitives. Design files, exported assets and client-provided brand material live in Microsoft OneDrive.

### 2.1.4 Secrets and Configuration

GitHub Environments are the single source of configuration for deployed environments.

Rules:

- Two environments per repository: `staging` and `production`. Each has its own Secrets and Variables.
- `NEXT_PUBLIC_*` keys are Variables (they end up in the client bundle). Everything else is a Secret.
- No secrets in source code, in `wrangler.jsonc` or in committed env files. `.env.example` is committed with key names and defaults only.
- CI reads the environment's Secrets and Variables, passes `NEXT_PUBLIC_*` to the build and pushes the rest to the Worker with `wrangler secret bulk` (§8.2.1). Nothing else writes secrets to Cloudflare.
- Server-side secrets are never exposed to the frontend.
- Rotate secrets when team members leave or vendors change.
- Separate database and log-ingest credentials per project.

Use an external secret manager (e.g. Google Secret Manager) only when secrets must be shared with systems outside GitHub Actions and Cloudflare, or when compliance requires automated rotation.

### 2.1.5 UI and Library Standard

| Concern | Standard |
|---|---|
| Component library | shadcn/ui on Radix primitives, generated into `src/components/ui` |
| Styling | Tailwind CSS, theming through CSS variables in `globals.css` |
| Icons / toasts | lucide-react / sonner |
| Forms | react-hook-form + zod resolvers |
| Server state | TanStack Query |
| Client state | React Context for auth and app-wide state; no Redux |
| Internationalization | Only when the product is multilingual: next-intl with a `[locale]` segment and messages under `src/locales/<locale>/<page>.json` (one file per page). Single-language products have no `[locale]` segment and no message files; copy lives in the components. |
| Validation | zod schemas for every route input and every form |
| Data tables / charts | TanStack Table / Recharts |

Why one library set: Claude Design output, code review, and reuse between projects all get cheaper when every project speaks the same component language.

## 2.2 Hosting: Cloudflare Workers

Every Next.js application is deployed to Cloudflare Workers through OpenNext (`@opennextjs/cloudflare`). There is no VPS, Vercel, Netlify or Firebase Hosting deployment for application code.

| Use case | Platform |
|---|---|
| Next.js application (pages + API) | Cloudflare Workers via OpenNext |
| Scheduled jobs that need `firebase-admin` (backups, exports) | Firebase Functions (Node 22) in `functions/` |
| Worker-side scheduled jobs | Cloudflare Cron Triggers |
| Large or frequently changing workflows | n8n (§2.2.2) |
| Long-running or Python-based services | Google Cloud Run, only when the workload cannot live in a Worker or a Function |
| Static assets and uploads | Cloudflare R2 (default) or Firebase Storage |
| Customer domains | Cloudflare for SaaS (§2.2.3) |

### 2.2.1 Workers Runtime Constraints and Firebase Access

Cloudflare Workers run V8 isolates, not Node.js. This has consequences that every project must respect from day one.

**Firebase on Workers.** The `firebase-admin` server SDK does not run on Workers (it depends on gRPC and Node-only modules). The Firebase *client* SDK runs normally in the browser. Therefore:

- Application server code (route handlers, middleware, server components) talks to Firebase through its REST APIs via a project-owned client in `src/lib/firebase-rest/`:
  - `verify-id-token.ts` — ID token verification against Google's public keys (JOSE / WebCrypto)
  - `auth-admin.ts` — custom claims, user lookup, session cookie minting via the Identity Toolkit API
  - `firestore.ts` — Firestore REST CRUD and structured queries
  - `storage.ts` — signed URLs and object operations
- `firebase-admin` is used only inside `functions/` (Firebase Functions), which runs on Node.
- This project-owned client is an accepted abstraction under MUSUBI constitution article VIII-4 (vendor SDK cannot run on the target runtime). The constraint is recorded in `storage/design/*.md` as required by VIII-5.

**Other constraints:**

- `postinstall` runs the jose patch script required by the Cloudflare build.
- Use `unpdf` for PDF parsing, not `pdf-parse`. Avoid libraries that need `fs`, `net` or `child_process`.
- In-memory state (rate limiters, caches) is per isolate and not shared. Use Cloudflare bindings (KV, Durable Objects, Rate Limiting) or Firestore for anything that must be consistent (§11.6).
- Bundle size limits apply (3 MiB compressed on the free plan, 10 MiB on paid). Keep heavy SDKs out of the Worker.

**`wrangler.jsonc` contract:**

```jsonc
{
  "name": "<app>",
  "main": ".open-next/worker.js",
  "compatibility_date": "<date>",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "observability": { "enabled": true },
  "vars": { "APP_ENV": "staging" },
  "env": {
    "staging":    { "name": "<app>-staging",    "vars": { "APP_ENV": "staging" } },
    "production": { "name": "<app>-production", "vars": { "APP_ENV": "production" } }
  }
  // R2 / KV / rate-limit bindings per environment go here. Never secrets.
}
```

### 2.2.2 Background Jobs and n8n

Default order of preference:

1. **Application code.** Sending an email, calling a webhook, calling one third-party API, enriching one record: these live in the application (route handler, Server Action or Cron Trigger). They are versioned, tested and logged like any other code.
2. **Firebase Functions / Cron Triggers** for scheduled work.
3. **n8n** for workflows that are large (many steps, many systems) or that change often and benefit from a visual editor: multi-step lead enrichment, CRM synchronization chains, campaign orchestration.

n8n workflows are still subject to the integration rules: HMAC-signed webhooks in both directions (§11.9, §12.3), a registry entry in ClickUp and a `documentation/INTEGRATIONS.md` section. Production workflows are separate copies from staging workflows.

### 2.2.3 Customer Domains via Cloudflare for SaaS

Clients keep their DNS provider. ITG does not take over NS records.

- Staging is served on `<app>-staging.improvetogrow.com`.
- Production is served on the client's domain as a **Cloudflare for SaaS custom hostname** in the ITG zone. The client adds one CNAME (and the ownership-verification TXT record) at their provider.
- Certificates are issued and renewed by Cloudflare. No manual certificate handling.
- The custom hostname and its fallback origin are recorded in `documentation/OPERATIONS.md`.

### 2.2.4 Environments and Naming

There are exactly three environments. There is no shared "development" environment: development happens on the developer's machine.

| | local | staging | production |
|---|---|---|---|
| Where | developer machine, `next dev` | Cloudflare Worker | Cloudflare Worker |
| Git branch | `feature/*`, `hotfix/*` | `staging` | `master` |
| GitHub Environment | — | `staging` | `production` |
| Firebase project | uses the staging project | `<app>-staging` | `<app>-production` |
| Worker name | — | `<app>-staging` | `<app>-production` |
| `APP_ENV` | `local` | `staging` | `production` |
| Hostname | `localhost:3000` | `<app>-staging.improvetogrow.com` | client domain (SaaS) |
| Local env file | `.env.local` | `.env.development.local` (holds the staging values) | `.env.production.local` (holds the production values) |

Rules:

- Both deployed environments are created in Sprint 0, not later.
- Production stays clean: no test users, no sample data, no developer accounts beyond the admin seat the client approves.
- Firestore rules, indexes, Storage rules and migrations are always deployed to both environments in the same change.
- Local development connects to the staging Firebase project. Developers never hold production credentials locally unless they are running a documented production operation.

## 2.3 Database Decision Matrix

| Requirement | Firestore | PostgreSQL |
|---|---|---|
| Realtime app data, user profiles, app state | Yes | Sometimes |
| Simple dashboards | Yes | Sometimes |
| Hundreds of thousands of records, large imports | No | Yes |
| Complex filtering and relational reporting | Limited | Yes |
| Frequent batch updates, strong transactional logic | Limited | Yes |
| AI enrichment pipelines over large datasets | Sometimes | Yes |
| Structured, audit and AI-usage logs | No | Central log store (§9), not a project database |

General rule: Firestore for product development, user data and app state. PostgreSQL only when the data is large, relational or reporting-heavy. The decision is recorded in `steering/tech.md`.

## 2.4 Third-Party Integrations

Examples: Azure Communication Services, Vertex AI, Google Search API, CRM APIs, payment APIs, Apollo, Skylead.

Rules:

- Never expose private API keys in the frontend. All third-party calls go through server-side code.
- Call the vendor SDK or REST API directly from a service module under `src/features/<domain>/api/` or `src/lib/<vendor>/`. Do **not** build a generic wrapper layer over the SDK (MUSUBI article VIII). A project-owned client is justified only when the SDK cannot run on Workers (VIII-4), and then it is documented in the design.
- Every integration has a section in `documentation/INTEGRATIONS.md` (§12.1) and an entry in the ClickUp integration registry.
- Every failed call is recorded as an `integration.*.failed` event (§9).
- Sensitive data from third-party APIs is stored only when necessary.

### 2.4.1 Transactional Email: Azure Communication Services

All transactional email — authentication emails (verification, password reset, invitations), notifications, reports — is sent through Azure Communication Services Email from application code.

- Clients do not move their DNS or NS records and ITG does not take SMTP credentials from client mail servers. The sending domain is verified in ITG's ACS resource; the client adds the SPF, DKIM and (if required) DMARC TXT records at their provider.
- The email module lives in `src/lib/email/`: an ACS REST client with WebCrypto HMAC request signing (connection string or Entra client-credentials), typed templates under `src/lib/email/templates/`, and a `sendEmail()` entry point.
- When the ACS variables are not configured (local without email), sending is skipped and logged as `integration.email.skipped`, never thrown.
- Every send is recorded as `integration.email.sent` / `.failed` with the message id and template name, never the body or the recipient address (§9.6).
- Firebase's built-in email templates are not used; auth flows generate the action link via the Identity Toolkit REST API and send it through ACS so that branding and logging are consistent.

## 2.5 External Integration Data Shape (Guidance)

When the application mirrors data from an external API, decide the storage shape per project based on how the data will be queried:

- If the payload is large, the schema is unstable or alias fields vary, storing the raw payload in a JSONB column plus a few typed columns for indexing is a good pattern. Keep one upsert helper per integration so that field mapping lives in one place.
- If the data is small and stable, normalize it into the domain model.

This is guidance, not a rule. Record the choice in `storage/design/`.

---

# 3. Project Lifecycle

## 3.1 Discovery

Understand the business problem before defining the technical solution. Required outputs: client business goal, target users, main workflows, key pain points, success metrics, technical constraints, data sensitivity level, integration requirements, and an AI-readiness assessment when relevant. These feed `steering/product.md`.

## 3.2 Scope Definition

Before development starts, define MVP scope, out-of-scope items, key screens, core data objects, external integrations, risks and assumptions, and delivery milestones.

User stories are written as **EARS requirements** (MUSUBI article IV) with `REQ-<AREA>-<NNN>` identifiers, generated with `/sdd-requirements <feature>`. Each requirement has acceptance criteria and is traceable to design, code and tests (article V).

## 3.3 Architecture via MUSUBI

ITG uses MUSUBI (Specification Driven Development) through its own fork:

```
npm install -g github:Improve-To-Grow/MUSUBI#ITG-adjustments
musubi init            # in the new repository, Claude Code platform
```

The fork is initialized with the ITG profile: `constitution.profile: application`, ITG default stack in the steering templates, and the CI check scripts from this playbook. When this playbook changes, the fork's `ITG-adjustments` branch is updated in the same change set.

MUSUBI artifacts replace the former standalone architecture document:

| Artifact | Content |
|---|---|
| `steering/product.md` | Business context, users, goals (from Discovery) |
| `steering/tech.md` | Stack, runtime constraints, database decision, integrations, environments |
| `steering/structure.md` | Repository layout, module boundaries, naming |
| `steering/rules/constitution.md` | The nine constitutional articles with the ITG profile |
| `steering/rules/itg/*.md` | The policies of this playbook as agent rules: `ITG-*` rule ids, Mermaid decision diagrams, checklists |
| `storage/specs/<feature>-requirements.md` | EARS requirements |
| `storage/design/<feature>-design.md` | Mermaid C4 context / container / component views, ADRs, requirements coverage matrix, runtime-constraint clients (VIII-5) |
| `storage/tasks/<feature>-tasks.md` | Task breakdown mapped to requirements |
| `storage/traceability/matrix.md` | Generated by `musubi trace matrix --format markdown --output storage/traceability/matrix.md` |

Diagrams in steering and design files are Mermaid: C4 (`C4Context`, `C4Container`, `C4Component`, `C4Deployment`) for architecture and `flowchart` for decision logic. Agents and reviewers read the same diagram instead of long if/else prose.

The architecture index in ClickUp links to these files. The following topics must be covered across `steering/tech.md` and the design documents before Sprint 0 closes: system overview, authentication and authorization, data model, external integrations, AI services, file storage, logging, backup and recovery, security considerations, deployment flow, open risks.

## 3.4 Sprint 0

Sprint 0 is the technical foundation sprint. No feature development starts before it is complete.

- [ ] GitHub repository created in `Improve-To-Grow`, `master` and `staging` branches, README
- [ ] `musubi init` run; `steering/*.md` filled; constitution profile `application`
- [ ] PR template, CODEOWNERS, `.nvmrc` (Node 22), Prettier, ESLint with `lint:security`, knip
- [ ] CI pipeline with the required checks (§8.1) gating merges
- [ ] GitHub Environments `staging` and `production` with Secrets and Variables
- [ ] Firebase projects `<app>-staging` and `<app>-production` (Auth, Firestore, App Check, Storage if used)
- [ ] Firestore rules, indexes and Storage rules deployed to both projects
- [ ] `wrangler.jsonc` with `staging` and `production` environments; first deploy of both Workers
- [ ] Staging hostname on `improvetogrow.com`; production custom hostname via Cloudflare for SaaS when the client domain is known
- [ ] R2 bucket (or Storage) per environment
- [ ] ACS email sender configured for staging; production sender domain verification requested from the client
- [ ] Log-ingest credentials per environment; logger, audit recorder and PII redactor wired; first `app.started` event visible in logs-console
- [ ] `withApiRoute` wrapper, auth guards, rate limiting, `ApiRouteError` in place with one example route
- [ ] Vitest + Playwright configured; one unit test and one E2E smoke test passing in CI
- [ ] Backup Function scheduled for both Firebase projects; restore test scheduled
- [ ] `documentation/` skeleton created; ClickUp project structure created
- [ ] PostgreSQL database and user created only if §2.3 requires it

## 3.5 Migration Discipline

Applies to every project that uses PostgreSQL. Firestore projects apply the same discipline to rules, indexes and data backfills.

- Numbered files: `database/migrations/0001_<name>.sql`, `0002_<name>.sql`, …
- Each migration wrapped in `BEGIN; … COMMIT;`, each `CREATE` uses `IF NOT EXISTS` so re-runs are no-ops.
- `database/schema.sql` is kept in sync as the canonical source for a fresh database; migrations are append-only forward steps.
- Migrations are applied to staging before the code that depends on them is merged to `staging`, and to production before the merge to `master`.

Why: ad-hoc changes drift between environments and break audit. A numbered, idempotent log gives every environment the same shape on demand and lets reviewers spot schema changes in PR review.

---

# 4. Git and Repository Standards

## 4.1 Repository Structure

One Next.js application per repository, organized by feature:

```
src/app/…                          pages and layouts (src/app/[locale]/… only in multilingual products)
src/app/api/**/route.ts            API route handlers
src/components/ui/                 shadcn/ui primitives
src/components/layout/             shells, navigation
src/features/<domain>/             one folder per feature:
  components/  hooks/  api/  types.ts  (and *.test.ts next to the code)
src/lib/auth/                      session, claims, guards
src/lib/audit/  src/lib/logs/      recorders, redactor, allowlist
src/lib/firebase-rest/             Firebase REST client (§2.2.1)
src/lib/email/                     ACS client and templates
src/lib/runtime-config.ts          the only place that reads process.env
src/lib/utils/
src/middleware/                    withAuth, withRole, withApiRoute, api-errors
src/types/<domain>/<entity>.ts     one file per entity, grouped by domain; no single index.ts that holds everything
src/locales/<locale>/<page>.json   next-intl messages, one file per page (multilingual products only)
functions/                         Firebase Functions (scheduled jobs)
scripts/ci/                        CI helpers (env materialization, deploy helpers)
scripts/checks/                    CI gate scripts (route guards, route logging)
database/                          schema.sql, migrations/ (if PostgreSQL)
steering/  storage/                MUSUBI
documentation/                     engineering docs (§1.5), hardening/ (§1.6)
tests/e2e/                         Playwright specs
```

Rules: path alias `@/*` → `src/*`; `strict: true`; types are split by domain and entity (`src/types/<domain>/<entity>.ts`, re-exported by a small `src/types/<domain>/index.ts`) so that a type change is reviewable in one small file; a feature folder is self-contained so that removing the feature removes one folder; shared code is promoted to `src/lib` or `src/components/ui` only when a second feature needs it.

A monorepo (`apps/`, `packages/`) is used only when several deployable applications share packages. It is not the default.

## 4.2 Branching Strategy

```
master       production — every merge deploys to production
staging      staging    — every merge deploys to staging
feature/*    short-lived feature branches, from staging
hotfix/*     urgent production fixes, from master, merged back into staging
```

Flow: `feature/<slug>-<clickup-id>` → PR into `staging` → CI + review → merge (staging deploy) → QA on staging → PR `staging` into `master` → merge (production deploy) → smoke test.

Feature branch names carry the ClickUp task id: `feature/meeting-rsvp-869et4322`. Hotfixes: `hotfix/<slug>-<clickup-id>`.

## 4.3 Commits and Versioning

- Commits follow Conventional Commits: `type(scope): summary` with `feat`, `fix`, `refactor`, `chore`, `docs`, `ci`, `test`, `security`. The ClickUp id goes in the body or the scope.
- `CHANGELOG.md` follows Keep a Changelog. Every PR adds an entry under *Unreleased*; CI fails a PR that changes `src/` without touching the changelog.
- Version is `X.Y.Z` in `package.json`: X for breaking or contractual changes, Y for features, Z for fixes. The release commit is `release: X.Y.Z — <summary>` and moves *Unreleased* under the version heading. A git tag `vX.Y.Z` is created on `master`.

## 4.4 Pull Request Rules

Every code change goes through a pull request. Requirements: clear title, linked ClickUp task, description, screenshots for UI changes, at least one reviewer, all required CI checks green (§8.1). Direct pushes to `staging` and `master` are blocked (branch protection when the GitHub plan allows it; otherwise the deploy workflow refuses pushes that did not come from a merged PR, §8.2.1).

### Pull Request Template

```markdown
## Summary
What changed and why. ClickUp: <link>

## Target
- [ ] staging
- [ ] master (production) — requires QA sign-off on staging

## Checklist
- [ ] CI green (typecheck, lint, lint:security, tests, build, route checks, knip)
- [ ] Environment variables added to the GitHub Environment (if any)
- [ ] No secrets committed
- [ ] CHANGELOG.md updated
- [ ] New or changed routes emit audit / app events
- [ ] Old code path removed (no dead code left behind)
- [ ] Firestore rules / migrations updated for both environments (if any)
```

## 4.5 Code Review Standards

Reviewers check:

- Does the code solve the requirement it is traced to (`REQ-*` id in the PR)?
- Is the implementation as simple as it can be? Is anything duplicated that already exists in `src/lib` or `src/components/ui`?
- Are permissions read from claims and checked in the route wrapper?
- Are errors handled with typed `ApiRouteError`s and logged?
- Are tests included and did they come first?
- Is sensitive data kept out of logs?
- Did the change leave dead code, unused exports, stale flags or old migrations behind?
- Is the user experience clear? In a multilingual product, is every user-facing string in `src/locales/`?

## 4.6 Code Quality Rules

These rules are enforced by MUSUBI (constitution article VII) and by CI; they are not stylistic preferences.

| Rule | Limit / check |
|---|---|
| File length | ≤ 500 lines of code (non-blank, non-comment) |
| Function length | ≤ 50 lines |
| Imports per file | ≤ 10 distinct modules (index files exempt) |
| Reuse | Small, composable units. A second copy of the same logic is a review blocker; extract to `src/lib` or the feature folder. |
| No legacy left behind | When a behavior changes, the old code path, flag, migration helper, message key and test are removed in the same PR. Compatibility shims need an expiry date in a code comment and a ClickUp task. |
| Dead code | `knip` runs in CI; unused files, exports and dependencies fail the build. |
| Traceability | `musubi validate` and `musubi gaps` run in CI; requirements without tests, or code without a requirement, are reported on the PR. |
| Formatting | Prettier, `format:check` in CI. |

Why: AI-assisted development produces code quickly; the limit on file and function size keeps every unit reviewable, and the dead-code gate keeps the codebase from accumulating paths nobody owns.

---

# 5. ClickUp Delivery Structure

## 5.1 Workspace Structure

```
Workspace: ITG
  Space: Client Projects
    Folder: <Client Name>
      List: <Project Name>
        Epics · Features · Tasks · Bugs · Releases
```

## 5.2 Task Statuses

Backlog → Ready for Sprint → In Progress → Code Review → QA (staging) → Client Review → Ready for Production → Done · Blocked

## 5.3 Task Types

Epic, Feature, Task, Bug, Technical Debt, Research, Security, Infrastructure, Documentation, Release.

## 5.4 Standard Task Template

```markdown
## Requirement
REQ-<AREA>-<NNN> (link to storage/specs/<feature>-requirements.md)
EARS statement, one line.

## Business Goal
Why this matters to the client.

## Acceptance Criteria
- [ ] …

## Technical Notes
Implementation details, dependencies, constraints. Design: storage/design/<feature>-design.md

## Data / Security Impact
Data model, rules, claims, privacy.

## Tests
- [ ] Unit (written first)   - [ ] E2E   - [ ] Manual QA on staging
```

## 5.5 Definition of Ready

A task can enter a sprint only when its EARS requirement and acceptance criteria exist, the business value is understood, the technical approach is clear enough, the required design (Claude Design output) is available, dependencies are identified, an estimate is added and an owner is assigned.

## 5.6 Definition of Done

A task is done only when: the requirement is traced to code and tests, tests were written first and pass, CI is green (§8.1), code is reviewed, logs and audit events are emitted, old code is removed, documentation and CHANGELOG are updated, the feature is verified on staging, and manual QA is completed where needed.

---

# 6. Sprint and Meeting Rhythm

## 6.1 Sprint Length

Default sprint length: one week. A weekly rhythm keeps delivery focused and creates fast feedback loops.

## 6.2 Standard Meetings

Two meetings only.

| Meeting | Frequency | Duration | Agenda |
|---|---|---|---|
| Sprint Planning | Weekly | 45–60 min | 1. Review last sprint: what shipped, what slipped, one improvement action. 2. Select the sprint goal. 3. Plan and assign the week's tasks (refinement happens here). 4. Note risks, dependencies and the release target. |
| Daily Standup | Daily (or 3×/week for small teams) | 10–15 min | What blocks the sprint goal? What moves a task closer to staging today? Who needs help? |

Technical design discussions happen asynchronously in the PR or in `storage/design/`, or as an ad-hoc call when a decision is blocked. Client demos are scheduled per milestone, not weekly.

## 6.3 Sprint Planning Output

Every sprint defines a sprint goal, committed tasks, stretch tasks, risks, dependencies and a release target. The improvement action from the review is tracked as a task.

---

# 7. Testing Standards

## 7.1 Test-First

Testing is part of development, not a phase at the end. ITG follows MUSUBI constitution article III:

1. Write a failing test for the behavior (**Red**).
2. Write the minimal code that makes it pass (**Green**).
3. Refactor with all tests passing (**Blue**).

Every EARS requirement maps to at least one test that references its `REQ-*` id. Coverage thresholds come from `steering/rules/constitution-levels.yml` for the `application` profile and are enforced by `musubi validate` in CI.

## 7.2 Test Levels

| Level | Tool | Purpose |
|---|---|---|
| Static checks | TypeScript, ESLint (+ eslint-plugin-security), Prettier, knip | Code quality, security lint, dead code |
| Unit tests | Vitest | Functions, services, route handlers, feature logic |
| Component tests | Vitest + React Testing Library (optional) | Complex reusable components |
| Integration tests | Vitest against the real staging Firebase project | Auth, Firestore rules, REST client, email, log-ingest |
| E2E tests | Playwright | Critical user journeys in the browser against a local or staging build |
| Security tests | Dependency audit + security checklist (§11.14) | Security risks |
| Manual QA | ClickUp checklist on staging | Final human verification |

Playwright is the priority for business-critical flows. React Testing Library is optional.

## 7.3 Real Services, No Emulator

Integration tests run against real services (MUSUBI article IX): the staging Firebase project, the staging log-ingest endpoint and vendor sandboxes. The Firebase Emulator is not used. Mocks are allowed only for LLM providers, paid external APIs and services without a test environment, and each mock is justified in the test file.

Rules:

- Test data lives in the staging project under a test tenant / prefix and is cleaned up by the test run.
- Production is never a test target.
- CI uses the `staging` GitHub Environment for integration and E2E runs.

## 7.4 Required Coverage of Flows

Every production project tests: login and logout, role-based access and permission-denied states, tenant isolation where multi-tenant, main CRUD flows, file upload and download, external API integrations, AI calls, payment flow if applicable, error and empty states, and the email sending path.

Required E2E journeys: user signs in; user creates / updates / imports records; AI feature produces a result; admin changes a user's role; unauthorized user is blocked.

## 7.5 Manual QA Checklist (staging)

- [ ] Main user flows · auth · permissions
- [ ] Responsive layout · empty / error states · form validation
- [ ] External integrations and email delivery
- [ ] AI outputs checked where relevant
- [ ] No visible console errors
- [ ] Expected events visible in logs-console

---

# 8. CI/CD Standards

## 8.1 Required CI Checks

Every pull request into `staging` or `master` runs the following, and the merge is gated on all of them:

| Check | Command | Notes |
|---|---|---|
| Install | `npm ci` | Node 22 from `.nvmrc` |
| Typecheck | `tsc --noEmit` | |
| Lint | `eslint .` | `no-console` is an error under `src/app/api` and `src/lib` |
| Security lint | `lint:security` | eslint-plugin-security on auth / api / lib / middleware / functions, `--max-warnings=0` |
| Format | `prettier --check .` | |
| Unit + integration tests | `vitest run` | Required, not optional |
| Build | `opennextjs-cloudflare build` | Catches Workers-incompatible imports early |
| Dependency audit | `npm audit --omit=dev --audit-level=high` | Production dependencies; `functions/` audited separately |
| Route guards | `scripts/checks/check-route-guards.mjs` | Every `route.ts` uses `withApiRoute` with an auth guard or an explicit `public` marker |
| Route logging | `scripts/checks/check-route-logging.mjs` | Every `route.ts` emits at least one audit or app event; new routes without one fail |
| Dead code | `knip` | Unused files, exports, dependencies |
| Constitution | `musubi validate` | Article VII limits, traceability gaps |
| Changelog | `scripts/checks/check-changelog.mjs` | `CHANGELOG.md` changed when `src/` changed |

Recommended but not gating: Playwright E2E on every PR (gating for PRs into `master`), Lighthouse budget.

Why: tests and checks that do not block merge decay. The route checks turn "every endpoint is guarded and logged" from a review reminder into a build failure.

## 8.2 Deployment Flow

```
feature/* ──PR──▶ staging ──auto deploy──▶ <app>-staging ──QA──▶ PR ──▶ master ──auto deploy──▶ <app>-production ──▶ smoke test ──▶ monitoring
```

### 8.2.1 Deploy Pipeline Contract

One workflow, `.github/workflows/deploy.yml`:

- **Triggers:** push to `staging` deploys staging; push to `master` deploys production; `workflow_dispatch` with an `environment` input for manual re-deploys.
- **Resolve job:** maps branch → GitHub Environment, refuses mismatches, and for production checks the actor against an allow-list and (on manual runs) requires the literal input `deploy-production`. `concurrency: deploy-<environment>` prevents overlapping deploys.
- **Steps:**
  1. `npm ci`
  2. Verify (the §8.1 checks, or reuse the PR run)
  3. Materialize configuration from the GitHub Environment: `NEXT_PUBLIC_*` Variables are written to `.env.production` for the build; all Secrets are written to a temporary JSON file
  4. `opennextjs-cloudflare build`
  5. `wrangler secret bulk <file> --env <environment>`
  6. `cloudflare/wrangler-action` deploy `--env <environment>`
  7. Delete temporary files; write the deployed version and URL to the job summary
- **Fixed names:** secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`; variable `DEPLOY_URL`.
- **Firebase Functions** are deployed by a separate job in the same workflow (`firebase deploy --only functions --project <app>-<environment>`) when `functions/` changed.
- **Firestore rules and indexes** are deployed by the same workflow when they changed, to the matching Firebase project.

GitHub plan note: private repositories on the GitHub Free plan have no branch protection or environment reviewers. The resolve job provides the production guard in that case. When the organization is on Team or higher, branch protection on `master` and `staging` plus a required reviewer on the `production` environment are added, and the allow-list stays as defense in depth.

## 8.3 Production Deployment Rules

A merge into `master` requires: green CI, an approved PR, QA sign-off on staging, the security checklist completed when the change touches auth, data access or integrations, migrations applied to production (§3.5), a rollback plan for risky changes (previous Worker version is kept; `wrangler rollback` is the default rollback), and release notes for client-facing changes.

## 8.4 Smoke Test After Deploy

- [ ] App loads · login works · main dashboard loads
- [ ] Main workflow works · external APIs respond · an email is delivered
- [ ] `app.deployed` event and the first user events visible in logs-console
- [ ] No errors in Cloudflare observability for the first 15 minutes

---

# 9. Logging and Observability

## 9.1 Principles

Logs must help the team understand what happened, when, who triggered it and whether action is needed. Logs are structured, searchable, safe and cost-aware.

- **Every API route logs.** Each `route.ts` emits at least one event through the route wrapper: an audit event for privileged or data-changing actions, an app event otherwise, and `.denied` / `.failed` variants on failure. CI enforces this (§8.1).
- **Identifiers, not identities.** Log rows carry user ids, organization ids and resource ids. They never carry names, email addresses, phone numbers or message bodies. The redactor (§9.6) is the last line of defense, not the first.
- **Append-only.** Application code never updates or deletes log rows. Retention pruning is a platform job (§9.7).
- **Fire-and-forget on the request path.** A log write never blocks or fails a user request. Writes are scheduled with `ctx.waitUntil`; failures go to the runtime logger and are swallowed.

## 9.2 Log Categories

| Category | Where | Purpose |
|---|---|---|
| Runtime logs | Cloudflare observability, Firebase / Functions logs | Technical debugging, request traces |
| Audit events (`audit_log`) | Central log store | Who did what, when, to which resource |
| App events (`app_events`) | Central log store | Important product and business events |
| Integration events (`integration_events`) | Central log store | Third-party and n8n calls, email sends, webhook receipts, failures |
| AI usage events (`ai_usage_events`) | Central log store | Model, tokens, cost estimate, result status — never prompts or outputs |
| Error events (`error_events`) | Central log store (+ Sentry when enabled) | Caught 5xx errors and uncaught exceptions |

## 9.3 The Central Log Store: log-ingest and logs-console

ITG operates one central PostgreSQL log store as a platform service. Applications never hold a database connection to it. Instead:

```
Application (Worker / Function)
  └─ recorder (src/lib/logs, src/lib/audit)
       └─ HTTPS POST, HMAC-signed, batched, fire-and-forget
            └─ ITG log-ingest service  ──INSERT-only──▶  db_itg_logs
                                                            └─ logs-console (admin UI)
```

- Each project gets a `LOG_INGEST_URL` and a per-environment `LOG_INGEST_SECRET`. The ingest service stamps `app_id` and `environment` from the credential, not from the payload.
- Batches are capped (50 rows / 256 KB); delivery is at-most-once. When the ingest variables are not set (local), the recorder is a no-op that prints to the console.
- **logs-console** is the admin UI for all projects: search by app, environment, action prefix, actor id, resource id and request id; incident queries (§15.4); retention settings per action bucket (§9.7); DSAR export (§13.5).
- Database-side concerns (schema, CHECK constraints, partitioning, pooling, roles, pruning jobs) belong to the platform and are documented in the log-ingest repository, not in application repositories. Appendix B summarizes them for reference.

## 9.4 Action Names

Lowercase dotted names, `<domain>.<resource>.<verb>`, validated by the recorder (`^[a-z0-9]+(\.[a-z0-9_]+)+$`) and by the store.

Every privileged action emits matching lifecycle variants:

```
admin.claim.set            # success
admin.claim.set.denied     # caller lacked permission
admin.claim.set.failed     # exception during execution
```

Why: one prefix query (`action LIKE 'admin.claim.set%'`) returns the whole attempt history. Each project keeps its action catalogue in `documentation/AUDIT_LOGGING.md`.

Standard prefixes: `auth.*`, `admin.*`, `org.*`, `integration.<vendor>.*`, `integration.email.*`, `integration.webhook.*`, `ai.*`, `export.*`, `app.*` (lifecycle: `app.started`, `app.deployed`), plus domain prefixes per project.

## 9.5 Required Fields

Every event carries:

```
id · occurred_at · app_id · environment · action
actor_user_id (nullable for system events) · actor_org_id (nullable)
resource_type · resource_id (nullable)
ip_address · user_agent · request_id
metadata (JSON, allowlisted + redacted)
```

There is no `actor_email`, `actor_name` or similar column. Identity is resolved in logs-console by id when an operator needs it.

## 9.6 Metadata: Allowlist, Redactor, Fingerprints

- **Allowlist.** High-risk namespaces (`auth.*`, `admin.*`, `integration.credential.*`) register the metadata keys they may carry; the recorder drops anything else. Unregistered actions pass through the redactor only, so adoption is incremental.
- **Redactor.** Runs on every event. Drops values whose key contains: password, passcode, pin, secret, token, apikey, api_key, privatekey, authorization, cookie, credential, mfasecret, totpsecret, refreshtoken, accesstoken, idtoken, sessiontoken, bearer, emailbody, messagebody, htmlbody, rawbody, phonenumber, mobilephone, ssn, tax_id, **email, name, displayname, firstname, lastname, fullname**. Scrubs values shaped like vendor tokens (Stripe, GitHub, Slack, AWS, Google API, Twilio), JWTs, long opaque base64 / hex strings, phone numbers and email addresses. Limits: string length 1024, depth 6, 32 keys per object; never throws.
- **Fingerprints.** Prompts, generated AI content, message bodies and any multi-KB text are never stored. Store `{ length, sha256, preview }` where preview is the first ≈80 characters and is itself passed through the redactor.
- **Diffs.** For update events, record before/after for changed typed fields only; for large JSON blobs record only the list of changed key names, capped at 30 with a `truncated` flag.

## 9.7 Retention

Retention is configured per action-prefix bucket in logs-console. Defaults for a new project:

| Bucket | Window | Rationale |
|---|---|---|
| `auth.*`, `admin.*`, `org.*`, `integration.credential.*` | 24 months | Security forensics, privilege-change history |
| Domain data actions (`lead.*`, `task.*`, `note.*`, `campaign.*`, `bulk.*`, `export.*`, …) | 12 months | Business operational window |
| `ai.*`, `prompt.*` | 12 months | AI provenance |
| `integration.sync.*`, `integration.outbound.*`, `integration.webhook.*`, `integration.email.*` | 6 months | High volume, low signal |
| `error_events`, `app_events` | 6 months | Operational |

Pruning is run by the platform nightly in bounded batches and records an `audit.pruned` event with per-bucket counts, so "did the prune run?" is itself answerable from the log.

## 9.8 GDPR and Audit Logs

Audit records are not deleted on erasure requests. Article 17 GDPR carves out "compliance with a legal obligation" as grounds for retention. The data subject is entitled to a copy of their audit footprint (Article 15) through the DSAR export in logs-console (rows where the subject was the actor or the affected resource, capped and marked `truncated` when needed). The export itself is audited (`admin.dsar.export`). This position is stated in every project's privacy notice. Because rows hold only ids, erasure of the user profile does not leave personal data in the log store.

## 9.9 Logger and Environment Access

- Every module uses `createLogger('<module-id>')` from `src/lib/logger.ts` for runtime logs. `console.*` is a lint error under `src/app/api` and `src/lib`. Module ids are kebab-case: `api-<path>` for routes, `<name>-service` for services.
- Caught errors that return a 5xx call `logger.error`, which forwards to `error_events`. Uncaught errors are captured in `instrumentation.ts` (`onRequestError`).
- Environment variables are parsed once in `src/lib/runtime-config.ts` with zod. Feature code never reads `process.env` directly.
- Log levels: `debug` (local only), `info`, `warn`, `error`, `critical`.

## 9.10 What to Log and What Not to Log

Log: authentication events, permission failures, business actions, integration calls and failures, email sends, AI calls (counts and cost), background job status, import / export status, payment events, security-relevant actions, deployments.

Never log: passwords, keys, tokens, cookies, card data, names, email addresses, phone numbers, free-text personal data, client documents, raw prompts or model outputs, raw email or message bodies, webhook bodies containing PII (log counts and resource ids only).

## 9.11 Client-attested Events

Some events exist only in the browser SDK (MFA enrollment, certain auth failures). Expose one beacon endpoint with a small enum of allowed event types; post-login events require a verified session, pre-auth events require the login-guard cookie issued after Turnstile; the server stamps actor id, IP and user agent; reason codes are validated against a strict character class; rate-limited per IP; the client uses `navigator.sendBeacon` with a `fetch({ keepalive: true })` fallback.

---

# 10. Backup and Recovery Standards

## 10.1 Principles

A backup is only useful if it can be restored. Every production project defines what is backed up, frequency, retention, storage location, recovery process, responsible owner and restore-test frequency in `documentation/OPERATIONS.md`.

## 10.2 Backup Policy

| Resource | Strategy |
|---|---|
| Firestore | Nightly managed export by a scheduled Firebase Function in `functions/` to a GCS bucket in the same project; `BACKUP_RETENTION_DAYS` applied by the same Function; both Firebase projects covered |
| Firebase Auth users | Exported nightly by the same Function (hashed credentials included) so that accounts can be restored with the data |
| PostgreSQL (if used) | Automated nightly dump on the ITG-managed VPS, off-host copy, retention per project |
| R2 / Storage | Object versioning or lifecycle rules where the data is not reproducible |
| Configuration | `wrangler.jsonc`, rules, indexes, `.env.example` in git; Secrets and Variables in GitHub Environments |
| Source | Git history on GitHub |

## 10.3 Recovery Objectives

Each project defines RPO (maximum acceptable data loss) and RTO (maximum acceptable recovery time). Default: RPO 24 hours, RTO 4 hours.

## 10.4 Restore Testing

At least once per month for critical projects, quarterly otherwise: restore the latest export into the staging Firebase project, verify the application reads the restored data and core workflows work, and record the result in ClickUp.

## 10.5 Backup Checklist

- [ ] Backup Function deployed to both Firebase projects · retention set · bucket lifecycle set
- [ ] Auth export included · PostgreSQL dump enabled (if used) · Storage versioning considered
- [ ] Restore process documented in `OPERATIONS.md` · restore test scheduled · owner assigned

---

# 11. Security Standards

## 11.1 Principles

Security is applied from the start. Defaults: users access only what they need; systems expose only what is required; secrets are never in code; external services sit behind server-side logic; sensitive data is minimized; identity is read from signed tokens, never from the database.

## 11.2 Authentication

Default: Firebase Authentication, accessed from the server through the REST client (§2.2.1).

Required:

- Secure login flow with Cloudflare Turnstile on every public auth form (login, signup, password reset, invitation accept) and Firebase App Check on every API call.
- **TOTP MFA is mandatory for admin roles**, enforced server-side (`FORCE_ADMIN_MFA`), not just offered.
- Email verification where accounts are self-registered.
- Password policy (length, character classes) and password history (no reuse of the last N) enforced server-side.
- All auth emails through ACS (§2.4.1).
- Disabled / deleted user handling: a disabled user's session is rejected on the next request, not at expiry.

## 11.3 Authorization: Roles in Custom Claims

If the application has more than one kind of user, it defines roles. A typical set is `owner`, `admin`, `manager`, `member`, `viewer`; projects pick the roles their domain needs. A single-user-type application has no role system and must not invent one.

Roles and every other value that gates access (admin flag, organization id, team id, seat id) are stored **only as Firebase custom claims** on the user and read **only from the verified ID token or session cookie**:

- The database never holds a role field. There is no `users/{uid}.role`, no mirror, no cache.
- Server code never looks a role up in Firestore or PostgreSQL, and never re-synchronizes claims from a document on each request.
- Request bodies, query strings and headers are never a source of identity or role.
- Role changes go through one admin endpoint that sets the claim, emits `admin.claim.set`, and revokes the user's refresh tokens so the new claim takes effect at the next token refresh.

Why: database mirrors lag and can be tampered with; claims are signed by the auth provider and verified on every request.

Every protected action checks: is the user authenticated; does the user have the required role; (multi-tenant only) does the user belong to the tenant and is the resource within it.

## 11.4 Tenant Isolation

For multi-tenant systems, every record includes tenant ownership (`organizationId` / `tenantId`); tenant scope comes from the claim; queries are scoped server-side, never only in the frontend; Firestore rules enforce the same scope.

## 11.5 Sessions

- APIs are called with the Firebase ID token in `Authorization: Bearer`, verified per request.
- Server-rendered routes are gated by a server-signed Firebase **session cookie** (`HttpOnly`, `Secure`, `SameSite=Lax`), minted after ID-token verification, verified in middleware on every navigation, cleared on logout after pre-verification so the revocation can be audit-attributed. A cookie that merely contains JSON is not a session.
- Idle timeout and absolute lifetime are set per project (defaults: 30 minutes idle, 12 hours absolute for admin apps; 14 days for consumer apps).

## 11.6 API Route Contract

Every `src/app/api/**/route.ts` is implemented through one wrapper. Nothing else exports a handler.

```ts
export const POST = withApiRoute('api-admin-users-create', withRole('admin', handler), {
  rateLimit: 'write',
  schema: createUserSchema,       // zod, body + query
});
```

The wrapper provides, in order:

1. Request id (`x-request-id`, generated or propagated) and the request logger
2. App Check verification
3. Authentication (ID token or session cookie) and the auth guard (`withAuth`, `withRole('<role>')`, `withTenant`, or an explicit `public: true`)
4. Rate limiting by profile (`auth`, `read`, `write`, `admin`, `ai`) using a Cloudflare Rate Limiting binding or a persistent store; in-memory limiting is only an additional best-effort layer
5. Body-size limit and zod validation of body and query
6. The handler
7. Typed errors: `ApiRouteError` helpers `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `tooManyRequests`; anything else becomes a generic 500 and an `error_events` row. Status codes are never derived from message text.
8. Response envelope: `{ success: true, data }` or `{ success: false, error: { code, message } }`
9. Automatic event: the route's audit or app event, with `.denied` on guard failure and `.failed` on exception

Route ids follow `api-<path>-<verb>`. The CI checks in §8.1 verify that every route uses the wrapper, a guard, and emits an event.

## 11.7 Firebase Security Rules

Firestore and Storage rules are deny-by-default and **server-write-only**: clients may read what the rules scope to them, but every write goes through an API route. Rules enforce authenticated access, tenant scope from the claim, role checks where needed, and file type and size limits. Rules are tested against the staging project in CI and deployed to both projects in the same change.

## 11.8 App Check and Turnstile

Firebase App Check is enabled in production and verified server-side in the route wrapper. Turnstile protects public auth forms (§11.2); its token is bound to an action name and verified server-side with the expected hostname list.

## 11.9 Webhooks

Outbound: every webhook carries `X-<App>-Webhook-Signature: v1,sha256=<hex>` computed as HMAC-SHA256 over `<timestamp>.<rawBody>` and `X-<App>-Webhook-Timestamp`; per-route secrets; receivers reject timestamps older than ≈5 minutes.

Inbound: verify the provider's signature before reading the body; reject failures with a generic 4xx; log `integration.webhook.received` / `.received.failed` with a reason code and resource id only.

## 11.10 AI Security

Gemini models are called **only through Vertex AI** with a project service account in the client's or ITG's Google Cloud project. The public Gemini API (API-key based, `generativelanguage.googleapis.com`) is not used in any environment, because its terms allow prompts to be used for model training; Vertex AI does not. CI fails on an import of `@google/generative-ai` or a `GEMINI_API_KEY` variable.

Prompt-injection review for every feature that feeds user content to a model; personal-data minimization at the prompt boundary; output validation where the output drives a privileged action; per-tenant cost and usage limits; abuse detection; prompts and outputs are fingerprinted, never stored (§9.6).

## 11.11 Security Lint and Code Rules

`lint:security` runs eslint-plugin-security with `--max-warnings=0` over `src/app/api`, `src/lib`, `src/middleware` and `functions/`, as a separate CI step. The `eval` / `new Function` / `javascript:` family is banned globally. Dependency audit runs on every PR (§8.1) and weekly in full.

## 11.12 CSP and Headers

Production CSP is built at compile time in `next.config.ts`; adding a script, font or connect target requires a code change and PR review. HSTS, `X-Frame-Options: DENY`, nosniff, COOP, CORP and a restrictive Permissions-Policy are set in middleware for production. API responses use `default-src 'none'`. CORS uses an explicit `ALLOWED_ORIGINS` list.

## 11.13 Diagnostic Endpoints and Feature Kill Switches

Diagnostic routes are disabled by default and return 404 (not 401/403) when disabled; owner-only and rate-limited when enabled; audited through the wrapper.

`NEXT_PUBLIC_DISABLED_FEATURES` lists features to switch off per environment: the navigation item is hidden and the page and API return 404.

## 11.14 Security Release Checklist

- [ ] Auth, authorization and (if multi-tenant) tenant isolation checked
- [ ] Roles read from claims only; no role field in the database
- [ ] Admin MFA enforced · Turnstile on public auth forms · App Check verified
- [ ] Firestore + Storage rules reviewed, server-write-only, deployed to both projects
- [ ] Every route through `withApiRoute` with a guard and zod schema (CI green)
- [ ] Secrets only in GitHub Environments; `.env.example` current
- [ ] Outbound webhooks signed; inbound webhooks verified
- [ ] CSP built at compile time; HSTS in middleware
- [ ] `lint:security` and dependency audit green
- [ ] Redactor active; no names or emails in events (checked in logs-console on staging)
- [ ] AI calls go through Vertex AI only; no Gemini API key anywhere
- [ ] Privacy notice states the audit-log retention position

---

# 12. External Integration Standards

Every integration has a section in `documentation/INTEGRATIONS.md` and an entry in the ClickUp integration registry.

## 12.1 Integration Documentation Template

```markdown
## Integration: <Service>
Purpose · Owner · Authentication method · Endpoints used
Data sent / received / stored · Rate limits · Error handling · Retry policy (§12.2)
Webhooks (inbound verification, outbound signing, §11.9) · Cost risks · Security notes
Events emitted (integration.<vendor>.*) · Environment variables (names only)
```

## 12.2 Retry Policy

Retry temporary failures (network errors, 5xx, 429 with backoff); never retry other 4xx; exponential backoff with jitter; idempotency keys where the API supports them; repeated failures recorded as `integration.<vendor>.<op>.failed`.

## 12.3 n8n Workflows

When n8n is used (§2.2.2): separate staging and production workflows; secrets in n8n credentials, never in nodes; every webhook in both directions HMAC-signed; the workflow's JSON export is kept in `documentation/n8n/` in the project repository so that it is versioned.

---

# 13. Data and Privacy Standards

## 13.1 Data Minimization

Collect and store only what the product needs. Before storing data ask: do we need it, for how long, who can access it, can it be deleted, is it sensitive?

## 13.2 Data Classification

| Level | Examples |
|---|---|
| Public | Marketing content |
| Internal | Project notes, non-sensitive configuration |
| Confidential | Client data, business records |
| Sensitive | Personal data, financial data |
| Highly sensitive | Secrets, tokens, authentication data |

## 13.3 Personal Data

Store only necessary fields; limit access by role; never log personal data (§9.10); define retention periods; support deletion where required (audit log exception in §9.8); use secure exports.

## 13.4 Data Export

Only authorized roles export; every export emits `export.requested` / `.completed`; large exports run as background jobs (Function or n8n workflow); export files expire; sensitive exports require extra confirmation.

## 13.5 DSAR and Erasure

See §9.8. The DSAR export is provided through logs-console for audit data and through an admin endpoint in the application for product data.

---

# 14. Release Management

## 14.1 Release Types

Patch (`Z`): bug fix or small improvement. Minor (`Y`): feature without breaking change. Major (`X`): breaking or contractual change. Hotfix: urgent production fix from `hotfix/*`.

## 14.2 Release Checklist

- [ ] All planned tasks done · QA completed on staging · security checklist where relevant
- [ ] Migrations and rules applied to production (§3.5)
- [ ] `CHANGELOG.md` moved from Unreleased to `X.Y.Z`; `package.json` version bumped; release commit and tag
- [ ] Backup status checked · rollback plan defined (previous Worker version)
- [ ] Client notified where needed · logs-console checked after release

## 14.3 Release Notes

Release notes for the client are generated from the `CHANGELOG.md` section (Summary, New features, Improvements, Bug fixes, Known issues, Notes for client) and posted in ClickUp.

---

# 15. Incident Management

## 15.1 Definition and Severity

An incident is any issue that impacts user access, data integrity, security, core workflows, integrations, AI cost or availability, or production availability.

| Severity | Description | Example |
|---|---|---|
| P1 | Critical outage or data / security risk | App down, data leak |
| P2 | Major functionality broken | Users cannot import records |
| P3 | Minor functionality broken | Non-critical feature failing |
| P4 | Low impact | Visual bug |

## 15.2 Response Steps

Identify → assign owner → assess severity → communicate internally → stabilize (`wrangler rollback` is the first option) → fix or roll back → verify → communicate outcome → postmortem for P1 / P2.

## 15.3 Postmortem Template

Summary · Timeline (started, detected, resolved) · Impact · Root cause · Resolution · What went well · What did not · Action items (owner, due date). Stored in `documentation/incidents/<YYYY-MM-DD>_<slug>.md`.

## 15.4 Forensics in logs-console

During a P1 / P2, logs-console is the first stop: last actor on the affected resource, action sequence by `request_id`, `.denied` attempts suggesting probing, automated processes at the relevant time (`audit.pruned`, integration syncs), and `error_events` grouped by route.

---

# 16. Client Handover

## 16.1 Handover Requirements (ClickUp or client-approved format)

Product overview · user guide · admin guide · login and access instructions · known limitations · support process · maintenance plan · backup and recovery summary · external integration overview · release notes · privacy notice including the audit-log retention position (§9.8) · DNS records the client owns (CNAME for the SaaS hostname, SPF/DKIM for email).

## 16.2 Technical Handover (repository)

`steering/` and `storage/` (architecture, requirements, design, traceability) · `documentation/` (`SECURITY.md`, `AUDIT_LOGGING.md`, `DATABASE.md`, `OPERATIONS.md` with environments, deploy and restore runbooks, `INTEGRATIONS.md`, `RELEASE_PROCESS.md`, `hardening/`, `incidents/`) · `database/schema.sql` and migrations if used · `CHANGELOG.md`.

---

# 17. Project Closeout

- [ ] All agreed scope delivered · production release completed · client approval received
- [ ] Documentation complete (repository + ClickUp) · handover completed
- [ ] Events visible in logs-console · backups active · restore test passed
- [ ] Open issues documented · maintenance plan agreed · final review done in the last Sprint Planning

---

# 18. Minimum Standard for Every Production Project

- [ ] GitHub repository with `master` / `staging`, PR template, README, CHANGELOG
- [ ] MUSUBI initialized from the ITG fork; steering files current; `musubi validate` in CI
- [ ] ClickUp project with architecture index linking to the repository
- [ ] Two Firebase projects (`-staging`, `-production`) and two Workers, both deployed from Sprint 0
- [ ] GitHub Environments `staging` and `production` as the only configuration source
- [ ] CI gates: typecheck, lint, lint:security, format, unit tests, build, audit, route guards, route logging, knip, constitution, changelog
- [ ] Deploy workflow per §8.2.1 with production guard
- [ ] Authentication with admin MFA, Turnstile, App Check
- [ ] Roles in custom claims only (no role field in any database)
- [ ] Every API route through `withApiRoute`, guarded, validated, logged
- [ ] Events flowing to log-ingest; visible in logs-console; redactor active; no names or emails
- [ ] Transactional email through ACS
- [ ] Customer domain via Cloudflare for SaaS
- [ ] Backup Function on both projects; restore test scheduled
- [ ] `documentation/` with SECURITY, AUDIT_LOGGING, OPERATIONS, INTEGRATIONS, RELEASE_PROCESS
- [ ] Security checklist (§11.14), QA checklist (§7.5), smoke test (§8.4), handover (§16)

If a project does not meet this minimum standard, it is not production-ready.

---

# 19. Appendix A: Standard Checklists

## 19.1 New Project Checklist

- [ ] Discovery completed → `steering/product.md`
- [ ] Scope defined; first EARS requirements written
- [ ] Architecture drafted in `steering/tech.md` and `storage/design/`
- [ ] Integrations identified; ClickUp registry started
- [ ] ClickUp project and GitHub repository created
- [ ] Sprint 0 planned

## 19.2 Sprint 0 Checklist

See §3.4.

## 19.3 Production Readiness Checklist

- [ ] CI green on `master` · QA completed on staging · security checklist (§11.14) completed
- [ ] Backups enabled and restore test passed
- [ ] Events verified in logs-console on staging with production-shaped data; redactor verified
- [ ] Custom hostname active; email sender domain verified
- [ ] Smoke test completed · rollback plan ready · client notified where needed

## 19.4 Maintenance Checklist (monthly)

- [ ] Dependencies reviewed; security updates applied; weekly audit report reviewed
- [ ] Restore test (critical projects)
- [ ] Cloudflare observability and `error_events` reviewed
- [ ] Audit log queried for anomalies; `audit.pruned` present
- [ ] External API and AI usage and cost reviewed
- [ ] Access permissions and claims reviewed; stale accounts disabled
- [ ] MUSUBI fork version checked; `musubi upgrade` applied if the playbook changed

---

# Appendix B: Logging Platform Reference

This appendix describes the platform side of §9 for reference. It is operated by ITG through the log-ingest service; application teams do not implement it.

- **Store.** One PostgreSQL logs database (`db_itg_logs`) on the ITG VPS with tables `audit_log`, `app_events`, `integration_events`, `ai_usage_events`, `error_events`, each stamped with `app_id` and `environment`.
- **Ingest.** The log-ingest service verifies the per-app HMAC signature (`x-log-signature: v1,sha256=…` over `<timestamp>.<body>`), rejects stale timestamps, stamps `app_id` / `environment` from the credential, validates action names against `^[a-z0-9]+(\.[a-z0-9_]+)+$`, and inserts with an INSERT-only database role. Apps never receive database credentials.
- **Constraints.** The action-name format is also a `CHECK` constraint on the tables, so a malformed name is rejected at two layers.
- **Retention.** A SQL pruning function deletes per bucket in bounded batches (≈10k rows per pass), scheduled nightly by `pg_cron`, and inserts `audit.pruned` with per-bucket counts. Buckets and windows are edited in logs-console and stored in a `retention_policy` table.
- **Scale.** Tables are partitioned monthly by `occurred_at` once volume justifies it (>1M rows/month); old partitions are dropped rather than deleted row by row. Connection pooling (PgBouncer) sits between the ingest service and PostgreSQL. Read access is limited to the logs-console role.
- **Upsert detection (PostgreSQL projects).** For `INSERT … ON CONFLICT DO UPDATE`, `RETURNING (xmax = 0) AS was_inserted` tells the caller whether to emit `<resource>.created` or `<resource>.updated` without a pre-read.
- **DSAR.** logs-console exports all rows where a subject id appears as actor or resource, sorted by `occurred_at` descending, capped with a `truncated` flag, and records `admin.dsar.export`.

---

# Appendix C: File Skeletons

## C.1 `.env.example`

```bash
# ---- App ----
APP_ENV=local                        # local | staging | production (set by wrangler in deployed envs)
NEXT_PUBLIC_APP_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=debug
NEXT_PUBLIC_DISABLED_FEATURES=

# ---- Firebase (client) ----  Variables
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY=
# ---- Firebase (server, REST) ----  Secrets
FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT=            # JSON, used by the REST client to mint tokens
FORCE_ADMIN_MFA=true

# ---- Turnstile ----
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_EXPECTED_HOSTNAMES=

# ---- Session ----
SESSION_COOKIE_NAME=__session
SESSION_IDLE_MINUTES=30
SESSION_ABSOLUTE_HOURS=12

# ---- Email (Azure Communication Services) ----
AZURE_COMMUNICATION_ENDPOINT=
AZURE_COMMUNICATION_ACCESS_KEY=      # or AZURE_TENANT_ID / AZURE_CLIENT_ID / AZURE_CLIENT_SECRET
EMAIL_SENDER_ADDRESS=
EMAIL_SENDER_NAME=
EMAIL_REPLY_TO=

# ---- Logs (ITG log-ingest) ----
LOG_INGEST_URL=
LOG_INGEST_SECRET=

# ---- Storage (R2) ----
CLOUDFLARE_R2_BUCKET=                # binding name MEDIA in wrangler.jsonc

# ---- AI (Vertex AI only) ----
VERTEX_AI_PROJECT_ID=
VERTEX_AI_LOCATION=europe-west4
VERTEX_AI_MODEL=gemini-2.5-flash
VERTEX_AI_SERVICE_ACCOUNT=         # JSON; never a Gemini API key

# ---- Backups (functions/) ----
BACKUP_BUCKET=
BACKUP_RETENTION_DAYS=30
```

## C.2 `.github/workflows/deploy.yml` (outline)

```yaml
name: deploy
on:
  push: { branches: [staging, master] }
  workflow_dispatch:
    inputs:
      environment: { type: choice, options: [staging, production] }
      confirm:     { type: string, description: "type deploy-production for production" }
concurrency: deploy-${{ github.ref_name }}
jobs:
  resolve:        # branch → environment; production actor allow-list; manual confirm
  verify:         # the §8.1 checks
  deploy:
    needs: [resolve, verify]
    environment: ${{ needs.resolve.outputs.environment }}
    steps:
      - npm ci
      - materialize NEXT_PUBLIC_* → .env.production ; secrets → .secrets.json
      - npx opennextjs-cloudflare build
      - npx wrangler secret bulk .secrets.json --env ${{ env.ENVIRONMENT }}
      - uses: cloudflare/wrangler-action  (deploy --env …)
      - rm .secrets.json .env.production
  functions:      # firebase deploy --only functions,firestore:rules,firestore:indexes --project <app>-<env>  (on change)
```

## C.3 CI check scripts

`scripts/checks/check-route-guards.mjs` — walks `src/app/api/**/route.ts`, fails if a file exports a handler that is not wrapped in `withApiRoute(...)` with `withAuth` / `withRole` / `withTenant` or `public: true`.

`scripts/checks/check-route-logging.mjs` — for every route, requires either the wrapper's automatic event (route id registered in the event catalogue) or an explicit `recordAuditEvent` / `recordAppEvent` call; new routes without one fail with the file path.

`scripts/checks/check-changelog.mjs` — fails a PR that changes `src/**` without changing `CHANGELOG.md`.

---

## Final Note

This playbook is not meant to slow delivery down. It is meant to prevent avoidable chaos, repeated mistakes, risky deployments, unclear ownership and fragile systems.

The goal is not bureaucracy. The goal is reliable delivery.

ITG should be able to say with confidence: *every platform we build follows a clear, secure, testable, auditable, recoverable and scalable delivery process.*
