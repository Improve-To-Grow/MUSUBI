# ITG Software Delivery Playbook

Delivery standard for AI-focused platforms built on Next.js, Firebase, Cloudflare Workers, Azure Communication Services, Gemini / Vertex AI and n8n.

**Version 2.2 (October 2026) — draft.** Revision of v2.1 after a section-by-section review of the code-related chapters against ITG's running projects. The stack table has two classes, Required and Recommended; authentication uses Identity Platform, with App Check and reCAPTCHA Enterprise as the bot protection (Turnstile is removed); PostgreSQL runs on Neon through Hyperdrive with row-level security; deployed configuration lives in GitHub Environments and the deploy workflow can also be run manually; Firebase Functions are for Firebase triggers and scheduled work, with no HTTP Functions; Storage reads go through the API with signed URLs; the CSP is nonce-based; log retention is set per table; restore tests run in the shared `itg-restore` project; every Google service runs in `europe-west4`; Node 22 is the minimum. See `Changelog.md` for the v2.1 → v2.2 entry.

## Versions

| Version | Date | Status | Page |
| ---| ---| ---| --- |
| 2.2 | 2026-10-19 | Draft | this document |
| 2.1 | 2026-10-13 | Draft, superseded by 2.2 | `ITG Software Delivery Playbook v2.1 - 2026-10-13 - draft.md` |
| 2.0 | 2026-10-08 | Current until 2.2 is approved | [v2.0 — October 2026](https://app.clickup.com/9012642779/v/dc/8ck40yv-8512/8ck40yv-6232) |
| 1.0 | 2026-05-18 | Archived | [v1.0 — May 2026](https://app.clickup.com/9012642779/v/dc/8ck40yv-8512/8ck40yv-6872) |

Changes between versions: `Changelog.md` in this folder (all entries, newest first), mirrored on the ClickUp [Changelog](https://app.clickup.com/9012642779/v/dc/8ck40yv-8512/8ck40yv-6212) page.

## How this document is maintained

*   The playbook has a version (`X.Y`) and a changelog. Every decision change bumps the version and adds a changelog entry.
*   The canonical Markdown source lives in the `Improve-To-Grow/ITG-Software-Delivery-Playbook` repository (branch `main`): the `- active` file at the repository root is the current version, superseded versions are under `Archive/`. This ClickUp page mirrors it; the two must stay identical.
*   New ITG projects are set up with MUSUBI and the ITG profile ([§3.3](#33-architecture-via-musubi)).

# v2.2 — October 2026

Delivery standard for AI-focused platforms built on Next.js, Firebase, Cloudflare Workers, Azure Communication Services, Gemini / Vertex AI and n8n.

## Purpose

This playbook defines how Improve to Grow (ITG) plans, builds, tests, deploys, monitors, secures and maintains software products for clients.

**Scope.** This playbook applies to every project started from this version onward. It describes the target state for a new project, not the history of older ones.

**Deviation.** The Required rows of the stack table ([§2.1](#21-default-stack)) are the same in every project and change through a playbook change. A project team may deviate from a Recommended row or a default rule when the project's domain justifies it. The deviation must be documented in the project's `documentation/` folder (see [§1.2](#12-where-documentation-lives)) and, when it affects architecture or stack, in the MUSUBI steering files (see [§3.3](#33-architecture-via-musubi)). Silent deviation is not allowed.

**Source of truth and versioning.** The Markdown source of this playbook in the `Improve-To-Grow/ITG-Software-Delivery-Playbook` repository (branch `main`) is canonical; the ClickUp page mirrors it and the PDF is generated from it. This playbook has a version (`X.Y`, header of this document) and a changelog (`Changelog.md`, beside this document in the repository). A playbook change bumps the version and adds a changelog entry.

* * *

## Contents

*   [1. Delivery Framework and Documentation](#1-delivery-framework-and-documentation)
    *   [1.1 Delivery Framework](#11-delivery-framework)
    *   [1.2 Where Documentation Lives](#12-where-documentation-lives)
    *   [1.3 Dated Hardening Documents](#13-dated-hardening-documents)
*   [2. Standard Technology Stack and Platform](#2-standard-technology-stack-and-platform)
    *   [2.1 Default Stack](#21-default-stack)
        *   [2.1.1 PostgreSQL](#211-postgresql)
        *   [2.1.2 Design](#212-design)
        *   [2.1.3 Secrets and Configuration](#213-secrets-and-configuration)
        *   [2.1.4 UI and Library Standard](#214-ui-and-library-standard)
    *   [2.2 Hosting: Cloudflare Workers](#22-hosting-cloudflare-workers)
        *   [2.2.1 Workers Runtime Constraints and Firebase Access](#221-workers-runtime-constraints-and-firebase-access)
        *   [2.2.2 Background Jobs and n8n](#222-background-jobs-and-n8n)
        *   [2.2.3 Customer Domains via Cloudflare for SaaS](#223-customer-domains-via-cloudflare-for-saas)
        *   [2.2.4 Environments and Naming](#224-environments-and-naming)
    *   [2.3 Database Decision Matrix](#23-database-decision-matrix)
    *   [2.4 Third-Party Integrations](#24-third-party-integrations)
        *   [2.4.1 Transactional Email: Azure Communication Services](#241-transactional-email-azure-communication-services)
    *   [2.5 External Integration Data Shape](#25-external-integration-data-shape)
*   [3. Project Lifecycle](#3-project-lifecycle)
    *   [3.1 Discovery](#31-discovery)
    *   [3.2 Scope Definition](#32-scope-definition)
    *   [3.3 Architecture via MUSUBI](#33-architecture-via-musubi)
    *   [3.4 Sprint 0](#34-sprint-0)
    *   [3.5 Migration Discipline](#35-migration-discipline)
*   [4. Git and Repository Standards](#4-git-and-repository-standards)
    *   [4.1 Repository Structure](#41-repository-structure)
    *   [4.2 Branching Strategy](#42-branching-strategy)
    *   [4.3 Commits and Versioning](#43-commits-and-versioning)
    *   [4.4 Pull Request Rules](#44-pull-request-rules)
        *   [Pull Request Template](#pull-request-template)
    *   [4.5 Code Review Standards](#45-code-review-standards)
    *   [4.6 Code Quality Rules](#46-code-quality-rules)
*   [5. ClickUp Delivery Structure](#5-clickup-delivery-structure)
    *   [5.1 Workspace Structure](#51-workspace-structure)
    *   [5.2 Task Statuses](#52-task-statuses)
    *   [5.3 Task Types](#53-task-types)
    *   [5.4 Standard Task Template](#54-standard-task-template)
    *   [5.5 Definition of Ready](#55-definition-of-ready)
    *   [5.6 Definition of Done](#56-definition-of-done)
*   [6. Sprint and Meeting Rhythm](#6-sprint-and-meeting-rhythm)
    *   [6.1 Sprint Length](#61-sprint-length)
    *   [6.2 Standard Meetings](#62-standard-meetings)
    *   [6.3 Sprint Planning Output](#63-sprint-planning-output)
*   [7. Testing Standards](#7-testing-standards)
    *   [7.1 Test-First](#71-test-first)
    *   [7.2 Test Levels](#72-test-levels)
    *   [7.3 Real Services, No Emulator](#73-real-services-no-emulator)
    *   [7.4 Required Coverage of Flows](#74-required-coverage-of-flows)
    *   [7.5 Manual QA Checklist (staging)](#75-manual-qa-checklist-staging)
*   [8. GitHub and CI/CD Standards](#8-github-and-cicd-standards)
    *   [8.1 Required CI Checks](#81-required-ci-checks)
    *   [8.2 Deployment Flow](#82-deployment-flow)
        *   [8.2.1 Deploy Pipeline Contract](#821-deploy-pipeline-contract)
    *   [8.3 Production Deployment Rules](#83-production-deployment-rules)
    *   [8.4 Smoke Test After Deploy](#84-smoke-test-after-deploy)
*   [9. Logging and Observability](#9-logging-and-observability)
    *   [9.1 Principles](#91-principles)
    *   [9.2 Log Categories](#92-log-categories)
    *   [9.3 The Central Log Store: log-ingest and logs-console](#93-the-central-log-store-log-ingest-and-logs-console)
    *   [9.4 Action Names](#94-action-names)
    *   [9.5 Required Fields](#95-required-fields)
    *   [9.6 Metadata: Allowlist, Redactor, Fingerprints](#96-metadata-allowlist-redactor-fingerprints)
    *   [9.7 Retention](#97-retention)
    *   [9.8 GDPR and Audit Logs](#98-gdpr-and-audit-logs)
    *   [9.9 Logger and Environment Access](#99-logger-and-environment-access)
    *   [9.10 Client-attested Events](#910-client-attested-events)
*   [10. Backup and Recovery Standards](#10-backup-and-recovery-standards)
    *   [10.1 Principles](#101-principles)
    *   [10.2 Backup Policy](#102-backup-policy)
    *   [10.3 Recovery Objectives](#103-recovery-objectives)
    *   [10.4 Restore Testing](#104-restore-testing)
    *   [10.5 Backup Checklist](#105-backup-checklist)
*   [11. Security Standards](#11-security-standards)
    *   [11.1 Authentication](#111-authentication)
    *   [11.2 Authorization: Roles in Custom Claims](#112-authorization-roles-in-custom-claims)
    *   [11.3 Tenant Isolation](#113-tenant-isolation)
    *   [11.4 Sessions](#114-sessions)
    *   [11.5 API Route Contract](#115-api-route-contract)
    *   [11.6 Firebase Security Rules](#116-firebase-security-rules)
    *   [11.7 Webhooks](#117-webhooks)
    *   [11.8 AI Security](#118-ai-security)
    *   [11.9 Security Lint and Code Rules](#119-security-lint-and-code-rules)
    *   [11.10 CSP and Headers](#1110-csp-and-headers)
    *   [11.11 Diagnostic Endpoints and Feature Kill Switches](#1111-diagnostic-endpoints-and-feature-kill-switches)
    *   [11.12 Security Release Checklist](#1112-security-release-checklist)
*   [12. External Integration Standards](#12-external-integration-standards)
    *   [12.1 Integration Documentation Template](#121-integration-documentation-template)
    *   [12.2 Retry Policy](#122-retry-policy)
    *   [12.3 n8n Workflows](#123-n8n-workflows)
*   [13. Data and Privacy Standards](#13-data-and-privacy-standards)
    *   [13.1 Personal Data](#131-personal-data)
    *   [13.2 Data Export](#132-data-export)
    *   [13.3 DSAR and Erasure](#133-dsar-and-erasure)
*   [14. Release Management](#14-release-management)
    *   [14.1 Release Types](#141-release-types)
    *   [14.2 Release Checklist](#142-release-checklist)
    *   [14.3 Release Notes](#143-release-notes)
*   [15. Incident Management](#15-incident-management)
    *   [15.1 Definition and Severity](#151-definition-and-severity)
    *   [15.2 Response Steps](#152-response-steps)
    *   [15.3 Postmortem](#153-postmortem)
    *   [15.4 Forensics in logs-console](#154-forensics-in-logs-console)
*   [16. Client Handover](#16-client-handover)
    *   [16.1 Handover Requirements (ClickUp or client-approved format)](#161-handover-requirements-clickup-or-client-approved-format)
    *   [16.2 Technical Handover (repository)](#162-technical-handover-repository)
*   [17. Project Closeout](#17-project-closeout)
*   [18. Minimum Standard for Every Production Project](#18-minimum-standard-for-every-production-project)
*   [19. Appendix A: Standard Checklists](#19-appendix-a-standard-checklists)
    *   [19.1 New Project Checklist](#191-new-project-checklist)
    *   [19.2 Sprint 0 Checklist](#192-sprint-0-checklist)
    *   [19.3 Production Readiness Checklist](#193-production-readiness-checklist)
    *   [19.4 Maintenance Checklist (monthly)](#194-maintenance-checklist-monthly)
*   [Appendix B: Logging Platform Reference](#appendix-b-logging-platform-reference)
*   [Appendix C: File Skeletons](#appendix-c-file-skeletons)
    *   [C.1 `.env.example`](#c1-envexample)
    *   [C.2 `.github/workflows/deploy.yml` (outline)](#c2-githubworkflowsdeployyml-outline)
    *   [C.3 CI check scripts](#c3-ci-check-scripts)

# 1. Delivery Framework and Documentation

## 1.1 Delivery Framework

Every project follows the same sequence:

1. Discovery ([§3.1](#31-discovery))
2. Scope definition ([§3.2](#32-scope-definition))
3. Technical architecture via MUSUBI steering ([§3.3](#33-architecture-via-musubi))
4. Sprint 0 setup ([§3.4](#34-sprint-0))
5. Development
6. QA and security review
7. Deployment
8. Monitoring
9. Maintenance
10. Handover ([§16](#16-client-handover))

## 1.2 Where Documentation Lives

| Home | Content |
| ---| --- |
| Repository — `steering/` and `storage/` (MUSUBI) | Architecture patterns, technology stack, product context, EARS requirements, C4 design and ADRs, task breakdowns, traceability matrix; validated by `musubi validate` |
| Repository — `documentation/` | `SECURITY.md`, `AUDIT_LOGGING.md`, `DATABASE.md`, `OPERATIONS.md`, `INTEGRATIONS.md`, `RELEASE_PROCESS.md`, `hardening/` ([§1.3](#13-dated-hardening-documents)), migration READMEs, query runbooks |
| ClickUp | Project brief, scope, sprint planning, sign-off checklists (security review, deployment, QA), client handover packet, backup / restore status |
| Microsoft OneDrive | Client-provided assets and large binary files |

Default ITG rule: _engineering docs in the repository, delivery docs in ClickUp._ A project may override when a client contractually requires all artifacts in a single location.

## 1.3 Dated Hardening Documents

Significant security or architecture decisions get a dated write-up in `documentation/hardening/`:

```
documentation/hardening/<TOPIC>_HARDENING_<YYYY-MM-DD>.md
documentation/hardening/README.md        # index: one line per doc + runbook links
```

Each document captures: what changed; why (rationale, threat model, trade-offs); validation commands run after the change; residual risk; follow-ups. The index README is the entry point for new developers.

# 2. Standard Technology Stack and Platform

## 2.1 Default Stack

The stack has two classes. **Required** rows are the same in every project and change through a playbook change. **Recommended** rows are the default; a project that uses another tool records a deviation ([Purpose](#purpose)), and the other tool meets the same properties.

**(new)** marks a tool or service that no ITG production project has used yet. The playbook describes it as intended; the first project that sets it up expects to find problems there first, and records what it learns in `documentation/hardening/` ([§1.3](#13-dated-hardening-documents)) and in a playbook change.

**Required**

| Layer | Technology |
| ---| --- |
| Frontend | Next.js (App Router), React, TypeScript |
| Server-side application logic | Next.js Route Handlers (`src/app/api/**/route.ts`) behind the route wrapper ([§11.5](#115-api-route-contract)); every server mutation is a Route Handler |
| Hosting / runtime | Cloudflare Workers via OpenNext ([§2.2](#22-hosting-cloudflare-workers)) |
| Authentication | Firebase Authentication with Identity Platform, roles in custom claims ([§11.1](#111-authentication), [§11.2](#112-authorization-roles-in-custom-claims)) |
| Bot protection | Firebase App Check with reCAPTCHA Enterprise on every API call and on Storage; Identity Platform's reCAPTCHA enforcement on email / password sign-in ([§11.1](#111-authentication)) |
| Rate limiting | Per route in the route wrapper through the Cloudflare Rate Limiting binding (new); a Cloudflare WAF rule on `/api/*` as the second gate (new) ([§11.5](#115-api-route-contract)) |
| Primary database | Firestore ([§2.3](#23-database-decision-matrix)) |
| File storage | Firebase Storage ([§11.6](#116-firebase-security-rules)); static assets through Workers Static Assets ([§2.2.1](#221-workers-runtime-constraints-and-firebase-access)) |
| Region | `europe-west4` for every Google service: Firestore, Storage, Functions, Vertex AI ([§2.2.4](#224-environments-and-naming)) |
| Node-side and scheduled work | Firebase Functions in `functions/`, for Firebase triggers and scheduled work ([§2.2.2](#222-background-jobs-and-n8n)) |
| Structured and audit logs | ITG log-ingest service + logs-console; the Worker reaches it through a Cloudflare Queue and the project's log-relay Worker (new) ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console)) |
| Error tracking | Cloudflare observability + `error_events` in the central log store ([§9.2](#92-log-categories)) |
| Secrets and configuration | GitHub Environments: Variables for public values and server configuration, Secrets for credentials ([§2.1.3](#213-secrets-and-configuration)) |
| CI/CD | GitHub Actions + Wrangler + Firebase CLI ([§8](#8-github-and-cicd-standards)) |
| Testing | Vitest + Playwright ([§7](#7-testing-standards)) |
| Validation | zod ([§2.1.4](#214-ui-and-library-standard)) |
| Source control | GitHub, organization `Improve-To-Grow` on GitHub Team, with rulesets on `master` and `staging` (new) and Dependabot (new) ([§8](#8-github-and-cicd-standards)) |
| Project management | ClickUp |
| Specification | MUSUBI (Specification Driven Development, [§3.3](#33-architecture-via-musubi)) |

**Recommended**

| Layer | Technology |
| ---| --- |
| Large relational data | PostgreSQL on Neon through Hyperdrive (new), when the decision matrix ([§2.3](#23-database-decision-matrix)) requires it ([§2.1.1](#211-postgresql)) |
| Workflow automation | n8n, for large or frequently changing workflows ([§2.2.2](#222-background-jobs-and-n8n)) |
| AI services | Gemini models through Vertex AI in `europe-west4`, called through REST from the Worker and from Functions ([§11.8](#118-ai-security)) |
| Transactional email | Azure Communication Services (ACS) Email, called from application code ([§2.4.1](#241-transactional-email-azure-communication-services)) |
| Design | Claude Design ([§2.1.2](#212-design)) |
| UI libraries | shadcn/ui, Tailwind CSS, lucide-react / sonner, react-hook-form, TanStack Query (new), React Context, next-intl (multilingual products), TanStack Table (new) / Recharts ([§2.1.4](#214-ui-and-library-standard)) |

### 2.1.1 PostgreSQL

Firestore is the primary database ([§2.3](#23-database-decision-matrix)). A project that works on a large dataset, such as leads, keeps that dataset in PostgreSQL:

*   **Neon (new).** One Neon project per client project, in an EU region. The Worker connects through a Cloudflare Hyperdrive binding (new) ([§2.2.1](#221-workers-runtime-constraints-and-firebase-access)).
*   **One database per environment:** `<app>` for production and `<app>-test` for staging and CI. `<app>-test` is its own Neon branch with fictitious data, not a copy of production.
*   **Tenant isolation:** every tenant table has a `tenant_id` column and row-level security ([§11.3](#113-tenant-isolation)).
*   **Two database users:** an owner / migration user for DDL, used by CI to apply migrations ([§3.5](#35-migration-discipline)), and a runtime user with DML only, used by the Worker through Hyperdrive.

The ITG VPS in Germany holds the central log store `db_itg_logs`, operated by ITG as a platform service; applications reach it through log-ingest ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console)).

### 2.1.2 Design

Designs are produced with Claude Design and handed over as component-level specifications. Implementation uses the shadcn/ui + Tailwind component language ([§2.1.4](#214-ui-and-library-standard)), so that a design maps one-to-one onto existing primitives. Design files, exported assets and client-provided brand material live in Microsoft OneDrive.

### 2.1.3 Secrets and Configuration

Deployed configuration has three classes. The class decides how a value reaches the deployables; the GitHub Environment is the source of all three.

| Class | What | Examples | Lives in | Reaches the deployables |
| ---| ---| ---| ---| --- |
| Public | values the browser needs | `NEXT_PUBLIC_*`: app URL, Firebase web config, reCAPTCHA Enterprise site key for App Check | GitHub Environment **Variables** | inlined into the client bundle at build time |
| Server configuration | values the server reads that do not grant access | `APP_ENV`, `ALLOWED_ORIGINS`, `LOG_LEVEL`, `FORCE_ADMIN_MFA`, `SESSION_ABSOLUTE_HOURS`, `EMAIL_SENDER_*`, `LOG_INGEST_URL`, `VERTEX_AI_LOCATION`, `VERTEX_AI_MODEL`, `DISABLED_FEATURES`, project ids, bucket names, endpoints | GitHub Environment **Variables** | `wrangler deploy --var` for the Workers; `functions/.env.<project-id>`, written by the deploy workflow, for Functions |
| Credentials | values that grant access: keys, tokens, passwords, signing secrets, service-account JSON | `FIREBASE_SERVICE_ACCOUNT`, `AZURE_COMMUNICATION_ACCESS_KEY`, `LOG_INGEST_SECRET`, `VERTEX_AI_SERVICE_ACCOUNT` | GitHub Environment **Secrets** | `wrangler secret bulk` for the Workers; Firebase Functions secrets (Google Secret Manager) for Functions |

Rules:

*   Two GitHub Environments per repository, `staging` and `production`, each with its own Secrets and Variables (a private repository needs GitHub Team or higher for them, [§8](#8-github-and-cicd-standards)), and a matching `env` block for each in `wrangler.jsonc` for bindings and routes ([§2.2.1](#221-workers-runtime-constraints-and-firebase-access)). Appendix [C.1](#c1-envexample) marks the class of every key.
*   When in doubt, a value is a credential.
*   A key belongs to exactly one class. `wrangler.jsonc` holds bindings, routes and names; configuration values come from the GitHub Environment. `.env.example` is committed with key names, the class per block and defaults only.
*   The deploy workflow writes the configuration: it reads the GitHub Environment, passes the public Variables to the build and the server configuration to `wrangler deploy --var`, pushes the Secrets with `wrangler secret bulk`, and writes `functions/.env.<project-id>` and the Functions secrets ([§8.2.1](#821-deploy-pipeline-contract)).
*   Three deployables read these classes: the application Worker, the log-relay Worker (`workers/log-relay/wrangler.jsonc` for its bindings, its own `--var` and its own secrets file, [§9.3](#93-the-central-log-store-log-ingest-and-logs-console)) and `functions/` (server configuration in `functions/.env.<project-id>`, credentials as Firebase Functions secrets). A block in Appendix [C.1](#c1-envexample) names its reader when it is not the application Worker. The application Worker holds no `LOG_INGEST_*` value: it enqueues, the relay signs.
*   A few credentials are read by CI only and reach no deployable: the passwords of the fixed test users and the App Check debug token on staging ([§7.3](#73-real-services-no-emulator)), and `MIGRATION_DATABASE_URL`, the migration user's connection string, in both environments when the project uses PostgreSQL ([§3.5](#35-migration-discipline)). They are marked _CI only_ in Appendix [C.1](#c1-envexample), and the materialize step of the deploy workflow writes them to no secrets file.
*   Locally all three classes come from the `.env.*` files ([§2.2.4](#224-environments-and-naming)); `src/lib/runtime-config.ts` ([§9.9](#99-logger-and-environment-access)) reads the server configuration and validates it with zod at startup in every environment.
*   A value that is changed during an incident, without a deploy, is operational state, not configuration. It lives in Firestore and is changed through an audited admin endpoint. The feature kill switch ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)) is the one such value the playbook defines.
*   Rotate credentials when team members leave or vendors change. Separate database and log-ingest credentials per project. A rotation is a change of the Secret in the GitHub Environment followed by a manual run of the deploy workflow for that environment ([§8.2.1](#821-deploy-pipeline-contract)); the manual run deploys the head of the environment's branch and the Functions with it, and the smoke test ([§8.4](#84-smoke-test-after-deploy)) verifies it. The rotation is recorded in `CHANGELOG.md` under _Security_ with the next PR (which key, which environment, why; never the value).

Functions credentials are stored as Firebase Functions secrets, which live in Google Secret Manager of the Firebase project; the GitHub Environment stays their source. Another secret manager is used when credentials must be shared with systems outside GitHub Actions, Cloudflare and Firebase, or when compliance requires automated rotation.

### 2.1.4 UI and Library Standard

The rows below are Recommended ([§2.1](#21-default-stack)); validation with zod is Required.

| Concern | Standard |
| ---| --- |
| Component library | shadcn/ui, generated into `src/components/ui` |
| Styling | Tailwind CSS, theming through CSS variables in `globals.css` |
| Icons / toasts | lucide-react / sonner |
| Forms | react-hook-form |
| Server state | TanStack Query (new) |
| Client state | React Context for auth and app-wide state; no Redux |
| Internationalization | Only when the product is multilingual: next-intl with a `[locale]` segment and messages under `src/locales/<locale>/<page>.json` (one file per page). Single-language products have no `[locale]` segment and no message files; copy lives in the components. |
| Validation | zod schemas for every route input and every form |
| Data tables / charts | TanStack Table (new) / Recharts |

## 2.2 Hosting: Cloudflare Workers

Every Next.js application is deployed to Cloudflare Workers through OpenNext (`@opennextjs/cloudflare`). There is no VPS, Vercel, Netlify or Firebase Hosting deployment for application code. ITG's Cloudflare account is on the Workers Paid plan and every project runs in it ([§2.2.3](#223-customer-domains-via-cloudflare-for-saas)), so KV, Durable Objects, Queues and the Rate Limiting binding are available to every project.

| Use case | Platform |
| ---| --- |
| Next.js application (pages + API) | Cloudflare Workers via OpenNext |
| Firebase triggers and scheduled work: Firestore / Auth / Storage event triggers, scheduled jobs such as backups and exports ([§2.2.2](#222-background-jobs-and-n8n)) | Firebase Functions (Node 22 or later) in `functions/`, region `europe-west4` |
| Log delivery from the Worker | Cloudflare Queue `<app>-logs-<environment>`, consumed by the project's `workers/log-relay/` Worker (new) ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console)) |
| Large or frequently changing workflows | n8n ([§2.2.2](#222-background-jobs-and-n8n)) |
| Uploads and user files | Firebase Storage, under the rules of [§11.6](#116-firebase-security-rules) |
| Static assets | Workers Static Assets (`ASSETS` binding, [§2.2.1](#221-workers-runtime-constraints-and-firebase-access)) |
| Large relational data, when used | Neon PostgreSQL through a Hyperdrive binding (new) ([§2.1.1](#211-postgresql)) |
| Rate-limit ceiling for `/api/*` | Cloudflare WAF rate limiting rule on the `improvetogrow.com` zone, set once for all projects (new) ([§11.5](#115-api-route-contract)) |
| Customer domains | Cloudflare for SaaS ([§2.2.3](#223-customer-domains-via-cloudflare-for-saas)) |

### 2.2.1 Workers Runtime Constraints and Firebase Access

Cloudflare Workers run V8 isolates, not Node.js.

**Firebase on Workers.** The `firebase-admin` server SDK does not run on Workers (it depends on gRPC and Node-only modules). The Firebase _client_ SDK runs normally in the browser. Therefore:

*   Application server code (route handlers, middleware, server components) talks to Firebase through its REST APIs via a project-owned client in `src/lib/firebase-rest/`:
    *   `verify-id-token.ts` — ID token verification against Google's public keys (JOSE / WebCrypto)
    *   `auth-admin.ts` — custom claims, user lookup, user creation and deletion, the account-state check and refresh-token revocation ([§11.4](#114-sessions)) via the Identity Toolkit API; the integration tests of [§7.3](#73-real-services-no-emulator) create and delete their per-run users through this module
    *   `firestore.ts` — Firestore REST CRUD and structured queries
    *   `storage.ts` — signed URLs and object operations
    *   `service-account.ts` — access tokens for the service account (OAuth 2.0 JWT grant signed with WebCrypto), cached per isolate and scope set; the Vertex AI client of [§11.8](#118-ai-security) uses the same helper
*   `firebase-admin` runs in Node: in `functions/`, and in the operator scripts under `scripts/` (seed, backfill, restore), where it is a devDependency of the root `package.json`. An ESLint `no-restricted-imports` rule keeps it out of `src/` and `workers/`, so it cannot reach a Worker bundle.
*   This project-owned client is an accepted abstraction under MUSUBI constitution article VIII-4 (vendor SDK cannot run on the target runtime). The constraint is recorded in `storage/design/*.md` as required by VIII-5.

**Other constraints:**

*   `postinstall` runs the jose patch script required by the Cloudflare build.
*   Use `unpdf` for PDF parsing, not `pdf-parse`. Avoid libraries that need `fs`, `net` or `child_process`.
*   In-memory state (caches) is per isolate and not shared. Rate limits are counted by the Cloudflare Rate Limiting binding ([§11.5](#115-api-route-contract)); anything else that must be consistent goes through Firestore or a Cloudflare binding (KV, Durable Objects).
*   Bundle size limits apply. The limit for ITG projects is 10 MiB. Keep heavy SDKs out of the Worker.
*   Vertex AI is called through REST with the token helper above ([§11.8](#118-ai-security)); no Google AI SDK is installed. `@google/genai` authenticates to Vertex AI through `google-auth-library`, which depends on Node-only modules and does not run on Workers.

**`wrangler.jsonc`** **contract:**

```plain
{
  "name": "<app>",
  "main": ".open-next/worker.js",
  "compatibility_date": "<date>",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
  "observability": { "enabled": true },
  "env": {
    "staging": {
      "name": "<app>-staging",
      "workers_dev": false,
      "routes": [{ "pattern": "<app>-staging.improvetogrow.com", "custom_domain": true }],
      "queues": { "producers": [{ "binding": "LOG_QUEUE", "queue": "<app>-logs-staging" }] },
      "ratelimits": [ "…" ]
    },
    "production": {
      "name": "<app>-production",
      "workers_dev": false,
      "routes": [{ "pattern": "<subdomain>.<client-domain>/*", "zone_name": "improvetogrow.com" }],
      "queues": { "producers": [{ "binding": "LOG_QUEUE", "queue": "<app>-logs-production" }] },
      "ratelimits": [ "…" ]
    }
  }
  // Bindings, routes and names only. Server configuration is passed by the deploy workflow with
  // `wrangler deploy --var`, credentials with `wrangler secret bulk` (§2.1.3). Bindings are not
  // inherited: each environment block lists its own (queue producer, rate limits, Hyperdrive when the
  // project uses PostgreSQL). LOG_QUEUE is the recorder's transport (§9.3); its consumer is
  // workers/log-relay/ with its own wrangler.jsonc.
}
```

### 2.2.2 Background Jobs and n8n

Default order of preference:

1. **Application code.** Sending an email, calling a webhook, calling one third-party API, enriching one record: these live in the application (route handler). They are versioned, tested and logged like any other code.
2. **Firebase Functions** for work that Firebase triggers or that runs on a schedule: scheduled jobs on Cloud Scheduler (backups, exports), Firestore / Auth / Storage event triggers. All scheduled work runs here, so that server-side jobs have one platform; a project without server-side jobs has no `functions/`. Functions export Firebase triggers and schedules; application endpoints live in the Worker under the route contract ([§11.5](#115-api-route-contract)), and `check-function-triggers.mjs` fails on an `onRequest` or `onCall` export ([§8.1](#81-required-ci-checks)). A synchronous need for Node is a deviation ([Purpose](#purpose)).
3. **n8n** for workflows that are large (many steps, many systems) or that change often and benefit from a visual editor: multi-step lead enrichment, CRM synchronization chains, campaign orchestration.

n8n workflows are still subject to the integration rules: calls from the application to n8n are HMAC-signed ([§11.7](#117-webhooks)), n8n writes to the project's database under the rules of [§12.3](#123-n8n-workflows), and every workflow has a `documentation/INTEGRATIONS.md` section. Production workflows are separate copies from staging workflows.

### 2.2.3 Customer Domains via Cloudflare for SaaS

Clients keep their DNS provider. ITG does not take over NS records.

*   Staging is served on `<app>-staging.improvetogrow.com`, a Workers custom domain in the staging block of `wrangler.jsonc` ([§2.2.1](#221-workers-runtime-constraints-and-firebase-access)).
*   Production is served on a subdomain of the client's domain (for example `app.<client-domain>`) as a **Cloudflare for SaaS custom hostname** in the `improvetogrow.com` zone, with its route in the production block of `wrangler.jsonc`. The client adds one CNAME (and the ownership-verification TXT record) at their provider.
*   Certificates are issued and renewed by Cloudflare. No manual certificate handling.
*   The `improvetogrow.com` zone has one fallback origin for all projects; each project adds its own route. The custom hostname is recorded in `documentation/OPERATIONS.md`.

### 2.2.4 Environments and Naming

There are exactly three environments. There is no shared "development" environment: development happens on the developer's machine.

|  | local | staging | production |
| ---| ---| ---| --- |
| Where | developer machine, `next dev` | Cloudflare Worker | Cloudflare Worker |
| Git branch | `feature/*`, `hotfix/*` | `staging` | `master` |
| GitHub Environment | — | `staging` | `production` |
| Firebase project | uses the staging project | `<app>-staging` | `<app>-production` |
| Worker name | — | `<app>-staging`; relay `<app>-log-relay-staging` | `<app>-production`; relay `<app>-log-relay-production` |
| `APP_ENV` | `local` | `staging` | `production` |
| Hostname | `localhost:3000` | `<app>-staging.improvetogrow.com` | subdomain of the client's domain (SaaS) |
| Local env file | `.env.local` | `.env.development.local` (holds the staging values) | `.env.production.local` (holds the production values) |

Rules:

*   Both deployed environments are created in Sprint 0, not later.
*   Production stays clean: no test users, no sample data, no developer accounts beyond the admin seat the client approves. That seat is part of the agreement with the client, not a convenience: one `owner`-role account for the ITG operator named in `OPERATIONS.md`, with MFA, used for incident operations only: switching a feature off or on through the kill switch ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)) and the in-app checks an incident investigation needs ([§15.4](#154-forensics-in-logs-console)). Every use of the seat is in the audit log; it is never used for day-to-day work, and it is listed in the handover ([§16.1](#161-handover-requirements-clickup-or-client-approved-format)).
*   Firestore rules, indexes, Storage rules and migrations are always deployed to both environments in the same change.
*   Local development connects to the staging Firebase project. Developers never hold production credentials locally unless they are running a documented production operation.
*   Staging is also the test sandbox: CI's integration and rules tests run against it under a per-run prefix ([§7.3](#73-real-services-no-emulator)). There is no separate test project and no emulator.
*   Staging holds fictitious test data. Restore tests of production backups run in the shared ITG recovery project `itg-restore` ([§10.4](#104-restore-testing)).
*   Every Google service of both Firebase projects runs in `europe-west4`: Firestore, Storage, Functions and Vertex AI.

## 2.3 Database Decision Matrix

| Requirement | Firestore | PostgreSQL |
| ---| ---| --- |
| Company data, users, app state (live updates poll an API route, [§11.6](#116-firebase-security-rules)) | Yes | Only for the large dataset the app works on (e.g. leads) |
| Simple dashboards | Yes | Over the large dataset |
| Hundreds of thousands of records, large imports | No | Yes |
| Complex filtering and relational reporting | Limited | Yes |
| Transactions across many records, heavy concurrent updates | Limited | Yes |
| Full-text search | No | Yes |
| Vector / semantic search | Limited | Yes (`pgvector`) |
| AI enrichment pipelines over large datasets | Sometimes | Yes |
| Structured, audit and AI-usage logs | No | Central log store ([§9](#9-logging-and-observability)), not a project database |

Firestore is the primary database in every project: company data, users and app state live there. PostgreSQL holds a large dataset the app works on ([§2.1.1](#211-postgresql)).

The decision is recorded in `steering/tech.md`.

## 2.4 Third-Party Integrations

Examples: Azure Communication Services, Vertex AI, Google Search API, CRM APIs, payment APIs, Apollo, Skylead.

Rules:

*   All third-party calls go through server-side code.
*   Call the vendor SDK or REST API directly from a service module under `src/features/<domain>/api/` or `src/lib/<vendor>/`. Do **not** build a generic wrapper layer over the SDK (MUSUBI article VIII). A project-owned client is justified only when the SDK cannot run on Workers (VIII-4), and then it is documented in the design (the Firebase and Vertex AI REST clients, [§2.2.1](#221-workers-runtime-constraints-and-firebase-access) and [§11.8](#118-ai-security)).
*   Every integration has a section in `documentation/INTEGRATIONS.md` ([§12.1](#121-integration-documentation-template)).
*   Every failed call is recorded as an `integration.*.failed` event ([§9](#9-logging-and-observability)).

### 2.4.1 Transactional Email: Azure Communication Services

All transactional email — authentication emails (verification, password reset, invitations), notifications, reports — is sent through Azure Communication Services Email from application code; ACS is the default email provider ([§2.1](#21-default-stack)).

*   Clients do not move their DNS or NS records and ITG does not take SMTP credentials from client mail servers. The sending domain is verified in ITG's ACS resource; the client adds at their provider the ownership TXT record, the two DKIM CNAME records, the ACS `include` in their existing SPF record, and a DMARC record if required.
*   The email module lives in `src/lib/email/`: an ACS REST client with WebCrypto HMAC request signing with the access key, typed templates under `src/lib/email/templates/`, and a `sendEmail()` entry point.
*   When `APP_ENV` is `local` and the ACS values are not set, sending is skipped and logged as `integration.email.skipped`. On staging and production a missing ACS value fails the runtime-config check at startup ([§9.9](#99-logger-and-environment-access)).
*   Every send is recorded as `integration.email.sent` / `.failed` with the message id and template name, never the body or the recipient address ([§9.6](#96-metadata-allowlist-redactor-fingerprints)).
*   Auth emails go through the application's own route, because Firebase's built-in templates cannot be edited in the console: the route generates the action link through the Identity Toolkit REST API and sends it through ACS, so that branding and logging are consistent. The route that sends password-reset and verification links is protected by App Check, the `auth` rate limit and a per-address limit, and answers the same whether or not the address exists ([§11.5](#115-api-route-contract)).

## 2.5 External Integration Data Shape

Applies when data from an external API is stored. Only the fields the product needs are stored ([§13.1](#131-personal-data)), not the raw payload as a whole.

*   **Firestore:** the mapped fields on the document; fields whose shape varies between records go into one nested map.
*   **PostgreSQL:** typed columns for what is queried; a JSONB column for the variable part.

One mapping / upsert helper per integration keeps the field mapping in one place. The choice is recorded in `storage/design/`.

# 3. Project Lifecycle

## 3.1 Discovery

Required outputs: client business goal, target users, main workflows, key pain points, success metrics, technical constraints, data sensitivity level, integration requirements, and an AI-readiness assessment when relevant. These feed `steering/product.md`.

## 3.2 Scope Definition

Before development starts, define MVP scope, out-of-scope items, key screens, core data objects, external integrations, risks and assumptions, and delivery milestones.

User stories are written as **EARS requirements** (MUSUBI article IV) with `REQ-<AREA>-<NNN>` identifiers, generated with `/sdd-requirements <feature>`. Each requirement has acceptance criteria and is traceable to design, code and tests (article V).

## 3.3 Architecture via MUSUBI

ITG uses MUSUBI (Specification Driven Development):

```
npm install -g github:Improve-To-Grow/MUSUBI#<tag>   # the latest -itg release tag of the ITG fork, e.g. v6.3.1-itg.2
musubi init                                          # in the new repository, Claude Code platform
```

A new project is initialized with the ITG profile: `constitution.profile: application`, the ITG default stack in the steering templates, and the CI check scripts from this playbook.

MUSUBI artifacts replace the former standalone architecture document:

| Artifact | Content |
| ---| --- |
| `steering/product.md` | Business context, users, goals (from Discovery) |
| `steering/tech.md` | Stack, runtime constraints, database decision, integrations, environments |
| `steering/structure.md` | Repository layout, module boundaries, naming |
| `steering/rules/constitution.md` | The nine constitutional articles with the ITG profile |
| `storage/specs/<feature>-requirements.md` | EARS requirements |
| `storage/design/<feature>-design.md` | C4 context / container / component views, ADRs, requirements coverage matrix, runtime-constraint clients (VIII-5) |
| `storage/tasks/<feature>-tasks.md` | Task breakdown mapped to requirements |
| `storage/traceability/matrix.md` | Generated by `musubi trace matrix --format markdown --output storage/traceability/matrix.md` |

The architecture index in ClickUp links to these files. The following topics must be covered across `steering/tech.md` and the design documents before Sprint 0 closes: system overview, authentication and authorization, data model, external integrations, AI services, file storage, logging, backup and recovery, security considerations, deployment flow, open risks.

## 3.4 Sprint 0

Sprint 0 is the technical foundation sprint. No feature development starts before it is complete.

- [ ] GitHub repository created in `Improve-To-Grow` (private, GitHub Team or higher, [§8](#8-github-and-cicd-standards)), `master` and `staging` branches under branch protection, README; Dependabot alerts and security updates on
- [ ] MUSUBI installed from the ITG fork at its latest `-itg` tag and `musubi init` run ([§3.3](#33-architecture-via-musubi)); `steering/*.md` filled; constitution profile `application`
- [ ] PR template, CODEOWNERS, `.nvmrc` (Node 22 or later), Prettier, ESLint with eslint-plugin-security ([§11.9](#119-security-lint-and-code-rules)), knip
- [ ] CI pipeline with the required checks ([§8.1](#81-required-ci-checks)) gating merges
- [ ] GitHub Environments `staging` and `production` with Secrets (credentials) and Variables (public values and server configuration) ([§2.1.3](#213-secrets-and-configuration)); the `production` environment limited to `master` ([§8](#8-github-and-cicd-standards))
- [ ] Firebase projects `<app>-staging` and `<app>-production` with Identity Platform (TOTP MFA; reCAPTCHA enforcement `AUDIT` on staging and `ENFORCE` on production; client-side sign-up disabled), Firestore and Storage in `europe-west4`, App Check with a reCAPTCHA Enterprise key and enforcement on Storage ([§11.1](#111-authentication)); Firestore point-in-time recovery on in production ([§10.2](#102-backup-policy))
- [ ] Firestore rules, indexes and Storage rules deployed to both projects
- [ ] `wrangler.jsonc` with `staging` and `production` environments (assets, routes, `workers_dev: false`, bindings, [§2.2.1](#221-workers-runtime-constraints-and-firebase-access)); first deploy of both Workers
- [ ] Staging custom domain `<app>-staging.improvetogrow.com`; production custom hostname on the client's subdomain via Cloudflare for SaaS when the client domain is known ([§2.2.3](#223-customer-domains-via-cloudflare-for-saas))
- [ ] Storage bucket per Firebase project with the rules of [§11.6](#116-firebase-security-rules)
- [ ] When the product uses AI: Vertex AI API enabled in both Google Cloud projects, used in `europe-west4`; the Vertex AI User role granted to the Worker's service account and, when a Function calls a model, to the Functions runtime service account ([§11.8](#118-ai-security))
- [ ] ACS email sender configured for staging; production sender domain verification requested from the client
- [ ] Log-ingest credentials per environment; Cloudflare Queue `<app>-logs-<environment>` created and `workers/log-relay/` deployed for both environments ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console)); logger, recorders, allowlist and redactor wired; first `app.started` event visible in logs-console, which proves the queue path; the project's retention policies entered in logs-console ([§9.7](#97-retention))
- [ ] `withApiRoute` wrapper, auth guards, account-state check, rate limiting through the Rate Limiting binding with a wrapper default, `ApiRouteError` in place with one example route
- [ ] Feature registry and kill switch ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)): `DISABLED_FEATURES` as a GitHub Variable in both environments, `ops/kill-switch` document in both Firebase projects, owner-only endpoint; the ITG admin seat in production approved by the client ([§2.2.4](#224-environments-and-naming))
- [ ] Vitest + Playwright configured; one unit test and one E2E smoke test passing in CI
- [ ] Fixed test users seeded on staging with `scripts/ops/seed-test-users`, their passwords and the App Check debug token as CI-only Secrets; the rules test of [§11.6](#116-firebase-security-rules) green; the scheduled `ci-*` cleanup workflow in place ([§7.3](#73-real-services-no-emulator))
- [ ] Backup Function scheduled for both Firebase projects; production password hash parameters stored next to the exports ([§10.2](#102-backup-policy)); restore test in `itg-restore` scheduled ([§10.4](#104-restore-testing))
- [ ] `documentation/` skeleton created; ClickUp project structure created
- [ ] When [§2.3](#23-database-decision-matrix) requires PostgreSQL: Neon project with the `<app>` and `<app>-test` databases, the migration and runtime users, a Hyperdrive configuration per environment, and `MIGRATION_DATABASE_URL` as a CI-only Secret in both environments ([§2.1.1](#211-postgresql))
- [ ] When n8n is used: its own credentials per project and environment ([§12.3](#123-n8n-workflows))

## 3.5 Migration Discipline

Every project changes Firestore through rules, indexes and data backfills (operator scripts under `scripts/ops/`) that are versioned and deployed to both environments in the same change ([§2.2.4](#224-environments-and-naming)). A project that also uses PostgreSQL adds the SQL rules below.

*   Numbered files: `database/migrations/0001_<name>.sql`, `0002_<name>.sql`, … The numbered migrations are the only source of the schema; a fresh database is built by applying them in order. They are append-only forward steps.
*   Each `CREATE` uses `IF NOT EXISTS`.
*   CI applies migrations. The deploy workflow runs `scripts/ci/migrate.mjs` with the migration user (`MIGRATION_DATABASE_URL`) before `wrangler deploy`, on staging and on production ([§8.2.1](#821-deploy-pipeline-contract)). The script records applied files in a `schema_migrations` table in the same database and applies only the new ones, each file and its record in one transaction.
    _Known gap:_ the integration tests of a PR run against `<app>-test`, which the staging deploy migrates, so a PR that adds a migration is tested against the previous schema until it is merged into `staging`.
*   A deploy with a migration can make the app unavailable for a few minutes. It runs outside working hours where possible, and the client is told in advance.

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
src/lib/vertex-ai/                 Vertex AI REST client (§11.8)
src/lib/features/                  feature registry and kill switch (§11.11)
src/lib/runtime-config.ts          server configuration, validated with zod at startup (§9.9)
src/lib/utils/
src/lib/api/                       route wrappers: withApiRoute, withAuth, withRole, api-errors (§11.5)
src/middleware.ts                  Next.js middleware: security headers and CSP nonce (§11.10), page kill switch (§11.11)
src/types/<domain>/<entity>.ts     one file per entity, grouped by domain; no single index.ts that holds everything
src/locales/<locale>/<page>.json   next-intl messages, one file per page (multilingual products only)
functions/                         Firebase Functions: Firebase triggers and scheduled work (§2.2.2)
workers/log-relay/                 queue consumer that forwards events to log-ingest; own wrangler.jsonc (§9.3)
scripts/ci/                        CI helpers (env materialization, migrate.mjs, deploy helpers)
scripts/checks/                    CI gate scripts (route guards, route logging, function triggers, audit catalogue, rules)
scripts/ops/                       operator scripts run against a Firebase project (seed-test-users, backfill, restore); firebase-admin is a root devDependency (§2.2.1)
database/migrations/               numbered SQL migrations (if PostgreSQL, §3.5)
steering/  storage/                MUSUBI
documentation/                     engineering docs (§1.2), hardening/ (§1.3)
tests/e2e/                         Playwright specs
```

Rules: path alias `@/*` → `src/*`; `strict: true`; types are split by domain and entity (`src/types/<domain>/<entity>.ts`, re-exported by a small `src/types/<domain>/index.ts`) so that a type change is reviewable in one small file; a feature folder is self-contained so that removing the feature removes one folder; shared code is promoted to `src/lib` or `src/components/ui` only when a second feature needs it.

A monorepo (`apps/`, `packages/`) is used only when several deployable applications share packages. It is not the default.

## 4.2 Branching Strategy

```
master       production — every merge deploys to production
staging      staging    — every merge deploys to staging
feature/*    short-lived feature branches, from staging
release/*    the release commit (§4.3), from staging, merged into staging
hotfix/*     urgent production fixes, from master, merged into master
```

Flow: `feature/<slug>-<clickup-id>` → PR into `staging` → CI + review → merge (staging deploy) → QA on staging → `release/X.Y.Z` from `staging` with the release commit → PR into `staging` → PR `staging` into `master` → merge (production deploy) → smoke test.

Hotfix: `hotfix/<slug>-<clickup-id>` from `master` → PR into `master` with the checks of [§8.1](#81-required-ci-checks) green (E2E is skipped on `hotfix/*`) and `Z` bumped in the same PR ([§4.3](#43-commits-and-versioning)) → merge (production deploy) → smoke test ([§8.4](#84-smoke-test-after-deploy)), which replaces QA on staging; when it fails, `wrangler rollback` ([§8.3](#83-production-deployment-rules)). A back-merge PR `master` → `staging` is opened the same day; conflicts in `CHANGELOG.md` and `package.json` are resolved there.

```
hotfix/* ──PR──▶ master ──auto deploy──▶ <app>-production ──▶ smoke test (fails → wrangler rollback)
                   └──back-merge PR, same day──▶ staging
```

Feature branch names carry the ClickUp task id: `feature/meeting-rsvp-869et4322`. Hotfixes: `hotfix/<slug>-<clickup-id>`.

## 4.3 Commits and Versioning

*   Commits follow Conventional Commits: `type(scope): summary` with `feat`, `fix`, `refactor`, `chore`, `docs`, `ci`, `test`, `security`. The ClickUp id goes in the body or the scope.
*   `CHANGELOG.md` follows Keep a Changelog. Every PR adds an entry under _Unreleased_; CI fails a PR that changes `src/` without touching the changelog.
*   Version is `X.Y.Z` in `package.json`: X for breaking or contractual changes, Y for features, Z for fixes. The release commit is `release: X.Y.Z — <summary>`; it moves _Unreleased_ under the version heading and bumps `package.json`. It is made on a `release/X.Y.Z` branch and merged into `staging` by PR; `staging` then goes into `master` ([§4.2](#42-branching-strategy)). A hotfix bumps `Z` in its own PR. After a merge into `master` the deploy workflow creates the tag `vX.Y.Z`, and skips it when the tag exists ([§8.2.1](#821-deploy-pipeline-contract)).

## 4.4 Pull Request Rules

Every code change goes through a pull request with a linked ClickUp task, screenshots for UI changes and all required CI checks green ([§8.1](#81-required-ci-checks)). A review is requested from a second developer when the project has one. In a project with two or more developers a merge into `master` requires one approval, and the ruleset names one bypass person; in a single-developer project approval is optional. Direct pushes to `staging` and `master` are blocked by branch protection ([§8](#8-github-and-cicd-standards)).

### Pull Request Template

```markdown
## Summary
What changed and why. ClickUp: <link>

## Target
- [ ] staging
- [ ] master (production) — requires QA sign-off on staging (a hotfix: the smoke test, §4.2)

## Checklist
- [ ] CI green (typecheck, lint, tests, build, route checks, knip)
- [ ] Configuration keys added or changed (if any) are in the right class (§2.1.3): Variables or Secrets added to both GitHub Environments, `.env.example` updated
- [ ] No secrets committed
- [ ] CHANGELOG.md updated
- [ ] New or changed routes emit audit / app events
- [ ] Old code path removed (no dead code left behind)
- [ ] Firestore rules / migrations updated for both environments (if any)
```

## 4.5 Code Review Standards

Reviewers check:

*   Does the code solve the requirement it is traced to (`REQ-*` id in the PR)?
*   Is anything duplicated that already exists in `src/lib` or `src/components/ui`?
*   Are permissions read from claims and checked in the route wrapper?
*   Are errors handled with typed `ApiRouteError`s and logged?
*   Were the tests written first?
*   Is sensitive data kept out of logs?
*   Did the change leave dead code, unused exports, stale flags or old migrations behind?
*   In a multilingual product, is every user-facing string in `src/locales/`?

## 4.6 Code Quality Rules

These rules are enforced by MUSUBI (constitution article VII) and by CI; they are not stylistic preferences.

| Rule | Limit / check |
| ---| --- |
| File length | ≤ 500 lines of code (non-blank, non-comment) |
| Function length | ≤ 50 lines |
| Imports per file | ≤ 10 distinct modules (index files exempt) |
| Reuse | Small, composable units. A second copy of the same logic is a review blocker; extract to `src/lib` or the feature folder. |
| No legacy left behind | When a behavior changes, the old code path, flag, migration helper, message key and test are removed in the same PR. Compatibility shims need an expiry date in a code comment and a ClickUp task. |
| Dead code | `knip` (new) runs in CI; unused files, exports and dependencies fail the build. |
| Traceability | `musubi validate` and `musubi gaps` run in CI; requirements without tests, or code without a requirement, are reported on the PR. |
| Formatting | Prettier, `format:check` in CI. |

The size limits exist because AI-assisted development produces code faster than it can be reviewed; they keep every unit reviewable.

# 5. ClickUp Delivery Structure

## 5.1 Workspace Structure

```yaml
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

A task is done only when: the requirement is traced to code and tests, tests were written first and pass, CI is green ([§8.1](#81-required-ci-checks)), code is reviewed, logs and audit events are emitted, old code is removed, documentation and CHANGELOG are updated, the feature is verified on staging, and manual QA is completed where needed.

# 6. Sprint and Meeting Rhythm

## 6.1 Sprint Length

Default sprint length: one week.

## 6.2 Standard Meetings

Two meetings only.

| Meeting | Frequency | Duration | Agenda |
| ---| ---| ---| --- |
| Sprint Planning | Weekly | 45–60 min | 1\. Review last sprint: what shipped, what slipped, one improvement action. 2. Select the sprint goal. 3. Plan and assign the week's tasks (refinement happens here). 4. Note risks, dependencies and the release target. |
| Daily Standup | Daily (or 3×/week for small teams) | 10–15 min | What blocks the sprint goal? What moves a task closer to staging today? Who needs help? |

Technical design discussions happen asynchronously in the PR or in `storage/design/`, or as an ad-hoc call when a decision is blocked. Client demos are scheduled per milestone, not weekly.

## 6.3 Sprint Planning Output

Every sprint defines a sprint goal, committed tasks, stretch tasks, risks, dependencies and a release target. The improvement action from the review is tracked as a task.

# 7. Testing Standards

## 7.1 Test-First

ITG follows MUSUBI constitution article III: write a failing test for the behavior (**Red**), write the minimal code that makes it pass (**Green**), refactor with all tests passing (**Blue**).

Every EARS requirement maps to at least one test that references its `REQ-*` id. Coverage thresholds come from `steering/rules/constitution-levels.yml` for the `application` profile and are enforced by `musubi validate` in CI.

## 7.2 Test Levels

| Level | Tool | Purpose |
| ---| ---| --- |
| Static checks | TypeScript, ESLint (+ eslint-plugin-security), Prettier, knip | Code quality, security lint, dead code |
| Unit tests | Vitest | Functions, services, route handlers, feature logic |
| Component tests | Vitest + React Testing Library (optional) | Complex reusable components |
| Integration tests | Vitest against the real staging Firebase project | Auth, Firestore rules, REST client, email, log-ingest |
| E2E tests | Playwright | Critical user journeys in the browser against a local or staging build |
| Security tests | `npm audit`, Dependabot alerts + security checklist ([§11.12](#1112-security-release-checklist)) | Security risks |
| Manual QA | ClickUp checklist on staging | Final human verification |

Playwright is the priority for business-critical flows. React Testing Library is optional.

## 7.3 Real Services, No Emulator

Integration tests run against real services (MUSUBI article IX): the staging Firebase project, the Neon test database `<app>-test` when the project uses PostgreSQL, the staging log-ingest endpoint and vendor sandboxes. The Firebase Emulator is not used. Mocks are allowed only for LLM providers, paid external APIs and services without a test environment, and each mock is justified in the test file. In Vitest the recorder has no queue binding and uses the direct, awaited transport against the staging log-ingest endpoint ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console)); the queue path is exercised by the `app.started` event of every staging deploy.

**Staging is the sandbox.** Every integration test, every rules test and every E2E run against a deployed build happens in the staging project, against the rules, indexes and Functions deployed from the `staging` branch. There is no third Firebase project for tests and no emulator in any project; ITG used the emulator before and found its setup and upkeep not worth it. CI uses the `staging` GitHub Environment for integration and E2E runs.

Rules:

*   **Fixed test users.** The idempotent operator script `scripts/ops/seed-test-users` ([§4.1](#41-repository-structure)) creates one staging user per role, plus one user in a second tenant when the application is multi-tenant, and sets their custom claims. Their passwords are CI-only Secrets of the `staging` Environment ([§2.1.3](#213-secrets-and-configuration)). Tests use real users with real claims; no claim is simulated.
*   **Sign in once per run.** A run signs each fixed user in once and reuses the ID tokens, renewed with the refresh token when older than 50 minutes; repeated sign-ins hit Firebase's throttling.
*   **App Check and reCAPTCHA in CI.** CI requests on staging pass App Check with a debug token, a CI-only Secret of the `staging` Environment, and Identity Platform's reCAPTCHA enforcement runs in `AUDIT` mode on staging, so CI and E2E sign-ins are not blocked ([§11.1](#111-authentication)).
*   **Per-run data prefix.** Everything a run writes lives under `ci-<run-id>` (a tenant, a collection prefix or a field, per project; Storage paths and, in the Neon test database, the run's tenant carry the same prefix) and is deleted at the end of the run. A scheduled GitHub Actions workflow with the `staging` secrets ([C.2](#c2-githubworkflowsdeployyml-outline)) deletes `ci-*` data older than 24 hours left by crashed runs. Tests never read or change data outside their prefix, so QA, client testing and parallel runs do not interfere.
*   **Per-run users for destructive auth tests.** A test that disables a user, revokes refresh tokens or changes a role ([§7.4](#74-required-coverage-of-flows)) creates its own user through the REST client ([§2.2.1](#221-workers-runtime-constraints-and-firebase-access)) and deletes it at the end; revocation applies to every session of a user and would break parallel runs on a shared user.
*   **Rules test.** The fixed users exercise the deployed rules on staging with the Firebase client SDK: the cases of [§11.6](#116-firebase-security-rules): Firestore denied for an authenticated client; Storage uploads allowed in the user's own tenant and denied for another tenant, for a content type outside the allowlist and for an upload over the size limit; Storage client reads denied. The test uploads real objects under the run's prefix; no rules library and no emulator is involved.
*   **Rules changed in a PR.** Tests against staging see the rules deployed there, not the ones in the PR. For a PR that changes `firestore.rules` or `storage.rules`, `scripts/checks/check-rules.mjs` ([§8.1](#81-required-ci-checks), [C.3](#c3-ci-check-scripts)) evaluates the rules files of the branch with the Firebase Security Rules API test method, which runs the same cases with a mocked `request.auth` against the staging project without deploying and without an emulator, and covers claim combinations no fixed user has. After the merge the rules test above checks the deployed rules.

## 7.4 Required Coverage of Flows

Every production project tests: login and logout, role-based access and permission-denied states, tenant isolation where multi-tenant (every collection read and written by a user of a second tenant, [§11.3](#113-tenant-isolation)), main CRUD flows, file upload and download (signed URLs) including the rules cases of [§11.6](#116-firebase-security-rules), external API integrations, AI calls, payment flow if applicable, error and empty states, and the email sending path.

Required E2E journeys: user signs in; user creates / updates / imports records; AI feature produces a result; admin changes a user's role; unauthorized user is blocked; a disabled user and a revoked session are rejected on the next request; after logout the old ID token is rejected on the next request ([§11.4](#114-sessions)). The kill switch is covered by a unit test of the wrapper with a mocked loader: a route of a switched-off feature answers 404 ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)).

## 7.5 Manual QA Checklist (staging)

- [ ] Main user flows · auth · permissions
- [ ] Responsive layout · empty / error states · form validation
- [ ] External integrations and email delivery
- [ ] AI outputs checked where relevant
- [ ] No visible console errors
- [ ] Expected events visible in logs-console

# 8. GitHub and CI/CD Standards

**GitHub plan requirement.** Every project repository is private in the `Improve-To-Grow` organization, and the organization is on GitHub Team or higher. The pipeline depends on features that GitHub does not offer to private repositories on the Free plan: the GitHub Environments `staging` and `production` with their Secrets and Variables ([§2.1.3](#213-secrets-and-configuration)) and their deployment branch policies, which the deploy workflow reads ([§8.2.1](#821-deploy-pipeline-contract)), and branch protection on `master` and `staging` ([§4.4](#44-pull-request-rules)).

*   **Branch protection (new).** Branch protection, or a ruleset, on both branches requires a pull request with the checks of [§8.1](#81-required-ci-checks) green and the branch up to date before merging, and blocks direct and force pushes. On `master`, a project with two or more developers requires one approval, with a named bypass person in the ruleset; a single-developer project keeps approval optional ([§4.4](#44-pull-request-rules)).
*   **Environments.** The `production` environment has a deployment branch policy limited to `master`, so a run from another branch cannot read the production secrets or deploy production. The `staging` environment is open to all branches, because PR CI reads its secrets.

That is the production guard: production is deployed from `master`, by a merge through a pull request with green checks or by a manual run of the deploy workflow on `master`, which deploys the merged head ([§8.2.1](#821-deploy-pipeline-contract)). The workflow has no guard of its own, because a check inside it runs from the pushed commit's own copy of the file and could be edited away in the same push. No environment reviewer is used: required reviewers on a private repository need GitHub Enterprise. Without the plan the design does not run; there is no fallback.

## 8.1 Required CI Checks

Every pull request into `staging` or `master` runs the following, and the merge is gated on all of them:

| Check | Command | Notes |
| ---| ---| --- |
| Install | `npm ci` | Node 22 or later; the exact version is pinned in `.nvmrc` |
| Typecheck | `tsc --noEmit` |  |
| Lint | `eslint .` | Includes eslint-plugin-security (new) over `src/`, `functions/` and `workers/` (`detect-object-injection` off, the other rules as errors, [§11.9](#119-security-lint-and-code-rules)); `no-console` is an error under `src/app/api` and `src/lib` |
| Format | `prettier --check .` | Prettier (new) |
| Unit + integration tests | `vitest run` | Required, not optional |
| Build | `opennextjs-cloudflare build` | Catches Workers-incompatible imports early |
| Dependency audit | `npm audit --omit=dev --audit-level=high` | Production dependencies; `functions/` audited separately |
| Route guards | `scripts/checks/check-route-guards.mjs` | Every `route.ts` uses `withApiRoute` with an auth guard or an explicit `public` marker |
| Route logging | `scripts/checks/check-route-logging.mjs` | Every `route.ts` emits at least one audit or app event; new ones without one fail |
| Function triggers | `scripts/checks/check-function-triggers.mjs` | Any `onRequest` or `onCall` export under `functions/src/` fails; Functions export Firebase triggers and schedules ([§2.2.2](#222-background-jobs-and-n8n)) |
| Audit catalogue | `scripts/checks/check-audit-catalogue.mjs` | The action table in `documentation/AUDIT_LOGGING.md` matches `src/lib/logs/allowlist.ts`; a stale table fails ([§9.6](#96-metadata-allowlist-redactor-fingerprints)) |
| Dead code | `knip` | knip (new): unused files, exports, dependencies |
| Constitution | `musubi validate` | Article VII limits, traceability gaps |
| Changelog | `scripts/checks/check-changelog.mjs` | `CHANGELOG.md` changed when `src/` changed |
| Feature registry | `scripts/checks/check-feature-registry.mjs` | Every folder under `src/features/` is declared in the registry, so every feature can be switched off ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)) |
| AI provider | `scripts/checks/check-ai-provider.mjs` | The AI properties of [§11.8](#118-ai-security): model calls from server-side code, an EU regional endpoint (no `global` location), no public Gemini API endpoint or key, no Gemini client package anywhere (Vertex AI through REST) |
| Rules | `scripts/checks/check-rules.mjs` | Runs when `firestore.rules` or `storage.rules` changed: evaluates the branch's rules with the Firebase Security Rules API test method against the cases of [§11.6](#116-firebase-security-rules), mocked `request.auth`, no deploy, no emulator ([§7.3](#73-real-services-no-emulator)) |

Playwright E2E is a required check on PRs into `master` and is skipped on `hotfix/*` branches ([§4.2](#42-branching-strategy)); on PRs into `staging` it is recommended, not gating. Lighthouse budget: recommended.

## 8.2 Deployment Flow

```
feature/* ──PR──▶ staging ──auto deploy──▶ <app>-staging ──QA──▶ release/X.Y.Z ──PR──▶ staging ──PR──▶ master ──auto deploy──▶ <app>-production ──▶ smoke test ──▶ monitoring
hotfix/*  ──PR──▶ master ──auto deploy──▶ <app>-production ──▶ smoke test (fails → wrangler rollback) ──▶ back-merge PR master → staging
```

### 8.2.1 Deploy Pipeline Contract

One workflow, `.github/workflows/deploy.yml`:

*   **Triggers:** push to `staging` deploys staging; push to `master` deploys production; a manual run (`workflow_dispatch`) deploys the head of the branch it is run on, `staging` or `master`, which is merged code. The manual run lets a changed Variable or Secret go live without a merge ([§2.1.3](#213-secrets-and-configuration)). A re-run of an old workflow run deploys that run's commit and is not used for this.
*   **Resolve job:** maps branch → GitHub Environment (`staging` → staging, `master` → production). `concurrency: deploy-${{ github.ref_name }}` serializes deploys per branch, and so per environment.
*   **No checks of its own:** the required checks and "branch up to date before merging" ([§8](#8-github-and-cicd-standards)) guarantee that the merged commit was tested, so the deploy workflow does not run them again.
*   **Steps:**
    1. `npm ci`
    2. Materialize configuration from the GitHub Environment: the public Variables (`NEXT_PUBLIC_*`) are written to `.env.production` for the build; the server configuration becomes the `--var` arguments of each Worker's deploy; the Secrets (credentials) are written to a temporary JSON file per Worker, one for the application and one for the relay (Appendix [C.1](#c1-envexample) names the reader of every block)
    3. `opennextjs-cloudflare build`
    4. When the project uses PostgreSQL: `scripts/ci/migrate.mjs` with `MIGRATION_DATABASE_URL` ([§3.5](#35-migration-discipline))
    5. `wrangler secret bulk <file> --env <environment>` for the application Worker; its file holds every credential except `LOG_INGEST_SECRET`, which the application Worker does not receive ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console))
    6. `cloudflare/wrangler-action` deploy `--env <environment>` with the server configuration as `--var KEY:VALUE`
    7. The same two commands for the relay, with `--config workers/log-relay/wrangler.jsonc`: its secrets file (`LOG_INGEST_SECRET`), then its deploy with its own `--var` (`LOG_INGEST_URL`), which ships its queue consumer
    8. On `master`: create the tag `vX.Y.Z` from `package.json`, skipped when the tag exists ([§4.3](#43-commits-and-versioning)); the workflow has the `contents: write` permission for it
    9. Delete temporary files; write the deployed version and URL to the job summary
*   **Fixed names:** secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`; variable `DEPLOY_URL`.
*   **Firebase Functions, Firestore rules and indexes, and Storage rules** are deployed by a separate job in the same workflow, with the same GitHub Environment as the deploy job, to the matching Firebase project: `firebase deploy --only functions,firestore:rules,firestore:indexes,storage --project <app>-<environment>`. Before the deploy, the job writes `functions/.env.<project-id>` from the Variables and sets the Functions secrets from the GitHub Environment with `firebase functions:secrets:set`, which stores them in Google Secret Manager; today that is `LOG_INGEST_SECRET`, which the Functions recorder signs with ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console)). On a push the job runs when `functions/**`, `firestore.rules`, `firestore.indexes.json`, `storage.rules` or `firebase.json` changed, so a rules change reaches both environments in the same change ([§2.2.4](#224-environments-and-naming)); a manual run always runs it, so a changed Variable or Secret reaches the Functions. A project without Firebase Storage leaves `storage` out of the list and `storage.rules` out of the path filter: `firebase deploy --only storage` fails without a Storage configuration in `firebase.json`.

Who can deploy production is who can merge into `master` or run the workflow on `master`; the ruleset and the `production` environment's branch policy decide that ([§8](#8-github-and-cicd-standards)), and the workflow adds no check of its own.

## 8.3 Production Deployment Rules

A merge into `master` requires: green CI, a pull request (approval per [§4.4](#44-pull-request-rules)), QA sign-off on staging (a hotfix goes without it and is verified by the smoke test after the deploy, [§4.2](#42-branching-strategy)), the security checklist completed when the change touches auth, data access or integrations, a rollback plan for risky changes, and release notes for client-facing changes. A deploy with a migration runs in the deploy window of [§3.5](#35-migration-discipline).

**Rollback.** The previous Worker version is kept, and `wrangler rollback` is the default rollback. After a deploy that changed the PostgreSQL schema it is safe only when the migration was additive; otherwise the fix goes forward. Firestore rules, indexes and Functions changes are rolled back with a revert PR.

## 8.4 Smoke Test After Deploy

- [ ] App loads · login works · main dashboard loads
- [ ] Main workflow works · external APIs respond · an email is delivered
- [ ] `app.deployed` event and the first user events visible in logs-console
- [ ] No errors in Cloudflare observability for the first 15 minutes

# 9. Logging and Observability

## 9.1 Principles

*   **Every API route logs.** Each `route.ts` emits at least one event through the route wrapper: an audit event for privileged or data-changing actions, an app event otherwise, and `.denied` / `.failed` variants on failure. CI enforces this ([§8.1](#81-required-ci-checks)).
*   **Beyond routes.** Background jobs, imports and exports, payments, deployments and AI calls (counts and cost) also emit events, even when no API route is involved.
*   **Identifiers, not identities.** Log rows carry user ids, tenant ids and resource ids. They never carry names, email addresses, phone numbers, free-text personal data, client documents, raw prompts or model outputs, or message bodies (log counts and resource ids only). The address and user agent are stamped by the route wrapper and reduced unless the event is a security event ([§9.5](#95-required-fields)). The redactor ([§9.6](#96-metadata-allowlist-redactor-fingerprints)) is the last line of defense, not the first: a redaction means the calling code is wrong; it is logged as an error, and it fails the test in Vitest ([§9.6](#96-metadata-allowlist-redactor-fingerprints)).
*   **Append-only.** Application code never updates or deletes log rows. Retention pruning is a platform job ([§9.7](#97-retention)).
*   **A log write never fails the caller.** In the Worker, a request's events are handed to the log queue in one `sendBatch` inside `ctx.waitUntil`, so the response never waits for them. In Firebase Functions and operator scripts, where nothing runs after the handler returns, the recorder's flush is awaited before the function returns, so the write completes and the job's result never depends on it. In both runtimes a failed delivery is retried once, then written to the runtime log and swallowed; it never becomes an `error_events` row, which would travel the path that just failed ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console)).

## 9.2 Log Categories

| Category | Where | Purpose |
| ---| ---| --- |
| Runtime logs | Cloudflare observability, Firebase / Functions logs | Technical debugging, request traces, log-delivery failures ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console)) |
| Audit events (`audit_log`) | Central log store | Who did what, when, to which resource |
| App events (`app_events`) | Central log store | Important product and business events |
| Integration events (`integration_events`) | Central log store | Third-party and n8n calls, n8n writes, email sends, failures |
| AI usage events (`ai_usage_events`) | Central log store | Model, tokens, cost estimate, result status — never prompts or outputs |
| Error events (`error_events`) | Central log store | Caught 5xx errors, uncaught exceptions and redactions ([§9.6](#96-metadata-allowlist-redactor-fingerprints)) |

## 9.3 The Central Log Store: log-ingest and logs-console

ITG operates one central PostgreSQL log store as a platform service. Applications never hold a database connection to it. Events reach it on two paths, one per runtime:

```
Application Worker
  └─ recorder (src/lib/logs, src/lib/audit)
       └─ one sendBatch per request, inside ctx.waitUntil
            └─ Cloudflare Queue <app>-logs-<environment>
                 └─ workers/log-relay (queue consumer, batches across requests)
                      └─ HTTPS POST, HMAC-signed ──▶ ITG log-ingest service

Firebase Function / operator script
  └─ recorder
       └─ HTTPS POST, HMAC-signed, awaited, one retry ──▶ ITG log-ingest service

ITG log-ingest service ──INSERT-only, idempotent on id──▶ db_itg_logs
                                                            └─ logs-console (admin UI)
```

*   Each project gets a `LOG_INGEST_URL` and a per-environment `LOG_INGEST_SECRET`. The ingest service stamps `app_id` and `environment` from the credential, not from the payload. The relay Worker and `functions/` hold the two values; the application Worker does not, and can only enqueue ([§2.1.3](#213-secrets-and-configuration), Appendix [C.1](#c1-envexample)).
*   **Worker path: the queue (new).** Each environment has one Cloudflare Queue, `<app>-logs-<environment>`, created in Sprint 0, bound to the application Worker as the producer `LOG_QUEUE` and consumed by `workers/log-relay/`, a small Worker in the same repository with its own `wrangler.jsonc`, named `<app>-log-relay-<environment>` ([§2.2.4](#224-environments-and-naming)) and deployed by the same workflow ([§8.2.1](#821-deploy-pipeline-contract)). The recorder collects the events of a request and sends them in one `sendBatch` inside `ctx.waitUntil`, one event per message (a message holds at most 128 KB); a failed send is retried once, then reported to the runtime log with the action names, the count and the request id, and the events are dropped. The relay receives a batch of up to 50 messages, collected across requests for up to five seconds, signs it, POSTs it to log-ingest within the ingest cap and acknowledges it on `2xx`. On any other outcome it retries the whole batch with a delay that doubles from one minute to one hour, up to the Queues maximum of 100 attempts, and Queues keeps an unacknowledged message for its retention period of four days: an unreachable log-ingest delays events and loses none, and an outage longer than that is an incident ([§15](#15-incident-management)). Queues delivers at least once; log-ingest inserts idempotently on the event `id`, so a redelivered batch creates no duplicate rows ([Appendix B](#appendix-b-logging-platform-reference)). The consumer is a separate Worker so that the ingest credential never sits on the Worker that serves user requests.
*   **Functions and scripts: direct.** `functions/` and the operator scripts under `scripts/` ([§2.2.1](#221-workers-runtime-constraints-and-firebase-access)) have no queue binding, and nothing runs after their handler returns, so the recorder POSTs to log-ingest directly, HMAC-signed, awaited before the handler returns, with one retry; a final failure goes to the Functions runtime log and is swallowed. The handler's result never depends on it.
*   **Transport selection.** The recorder chooses by what is bound. A `LOG_QUEUE` binding means the queue. Otherwise `LOG_INGEST_URL` and `LOG_INGEST_SECRET` mean the direct transport (Functions, scripts, and Vitest integration runs in CI against the staging endpoint, [§7.3](#73-real-services-no-emulator)). Otherwise the recorder prints the event to the console and delivers nothing (`next dev`, whose `.env.local` carries no `LOG_INGEST_*` value, and unit tests).
*   **Delivery failures are runtime errors only.** A failed send from the recorder or a failed POST from the relay is reported through the runtime logger to Cloudflare observability or Cloud Logging, never to `error_events`: that row would travel the path that just failed ([§9.9](#99-logger-and-environment-access)). The queue's backlog and the relay's retries are visible in the Queues metrics of the Cloudflare dashboard.
*   Batches to log-ingest are capped at 50 rows / 256 KB; the relay's consumer batch size matches the row cap.
*   **logs-console** is the admin UI for all projects: search by app, environment, action prefix, actor id, resource id and request id; incident queries ([§15.4](#154-forensics-in-logs-console)); retention settings per app and table ([§9.7](#97-retention)).
*   Database-side concerns (schema, CHECK constraints, partitioning, pooling, roles, pruning jobs) belong to the platform and are documented in the log-ingest repository, not in application repositories. [Appendix B](#appendix-b-logging-platform-reference) summarizes them for reference.

## 9.4 Action Names

Lowercase dotted names, `<domain>.<resource>.<verb>`, validated by the recorder (`^[a-z0-9]+(\.[a-z0-9_]+)+$`) and by the store.

Every privileged action emits matching lifecycle variants:

```
admin.claim.set            # success
admin.claim.set.denied     # caller lacked permission
admin.claim.set.failed     # exception during execution
```

One prefix query (`action LIKE 'admin.claim.set%'`) returns the whole attempt history. Each project keeps its action catalogue in `documentation/AUDIT_LOGGING.md`; its action table lists the metadata keys each action may carry and is generated from the allowlist registration ([§9.6](#96-metadata-allowlist-redactor-fingerprints)).

Standard prefixes: `auth.*`, `admin.*`, `org.*`, `integration.<vendor>.*`, `integration.email.*`, `integration.n8n.*`, `ai.*`, `export.*`, `app.*` (lifecycle: `app.started`, `app.deployed`), plus domain prefixes per project.

## 9.5 Required Fields

Every event carries:

```
id · occurred_at · app_id · environment · action
actor_user_id (nullable for system events) · actor_tenant_id (nullable)
resource_type · resource_id (nullable)
ip_address · user_agent · request_id
metadata (JSON, allowlisted + redacted)
```

There is no `actor_email`, `actor_name` or similar column. Identity is resolved in logs-console by id when an operator needs it. The recorder sets `id` (a UUID) and `occurred_at` when the event is emitted, before any transport, so a redelivered message carries the same values and log-ingest can recognise it ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console)).

**Network metadata.** `ip_address` and `user_agent` are personal data. The route wrapper stamps them and the recorder reduces them before the event leaves the application, decided by the event's action prefix. Security events, whose action starts with one of the security prefixes fixed by this playbook (`auth.*`, `admin.*`, `org.*`, `integration.credential.*`, `export.*`, `bulk.*`), carry the full address and the raw `User-Agent` string: an account-takeover investigation runs on them, because the attacker's events carry the same actor id as the user's own. Every other event carries the address truncated to a `/24` prefix for IPv4 and a `/48` prefix for IPv6, and the user agent in parsed form, browser family, major version and operating system (`Chrome/130 Windows`), which is what reproducing a browser-specific bug needs. There is no platform job that truncates later, so the store never holds a full address or a raw user agent outside the security events.

## 9.6 Metadata: Allowlist, Redactor, Fingerprints

The recorder runs metadata through one pass that combines the allowlist and the redactor. The allowlist declares which keys an action may carry; the redactor removes what is not declared and scrubs values that look like credentials or personal data. It is one pass, not two, so that the redactor knows which keys were declared and can tell a declared field from a leak.

*   **Allowlist.** Registered in code in `src/lib/logs/allowlist.ts`, per action name or action prefix: `registerMetadataAllowlist('integration.email.sent', ['messageId', 'templateName', 'provider'])`. A nested key is registered as a dotted path (`'customer.id'`). Resolution: exact action first, then the longest matching prefix (`auth.*`). `auth.*`, `admin.*` and `integration.credential.*` are registered before their first event ships; other namespaces are registered incrementally. The standard events of [§9.2](#92-log-categories) (`app.*`, `ai.*`, `integration.email.*`) are registered with the fields [§2.4.1](#241-transactional-email-azure-communication-services) and [§9.2](#92-log-categories) require. An action with no registration is not pruned (passive mode); a project may switch the recorder to strict mode, where every action must be registered, once coverage is complete, and records the switch in `steering/tech.md`.
*   **Redactor.** Runs on every event with the registration for the event's action in hand, and applies four rules in order. (1) *Unregistered key*: the action is registered and the key is not in its list → dropped. (2) *Key list*: the key contains password, passcode, pin, secret, token, apikey, api\_key, privatekey, authorization, cookie, credential, mfasecret, totpsecret, refreshtoken, accesstoken, idtoken, sessiontoken, bearer, emailbody, messagebody, htmlbody, rawbody, phonenumber, mobilephone, ssn, tax\_id, **email, name, displayname, firstname, lastname, fullname**, and the key is not registered for this action → dropped. Registration exempts a key from this rule and from no other: `templateName` survives on `integration.email.sent` and is still dropped on an action that did not register it. (3) *Value patterns*: the value is shaped like a vendor token (Stripe, GitHub, Slack, AWS, Google API, Twilio), a JWT, a long opaque base64 / hex string (40 characters or more), a phone number or an email address → scrubbed, registered or not. The value patterns are the actual protection, so a registered `templateName` whose value is an email address is scrubbed like any other. One exemption: a key named `sha256` whose value is exactly 64 hexadecimal characters is not a long opaque string; the fingerprint helper is the only code that writes one. (4) *Limits*: string length 1024, depth 6, 32 keys per object → truncated. The redactor never throws outside tests.
*   **Redaction is an error.** The redactor never fails the caller, but it is not silent. Every value it drops, scrubs or truncates under any of the four rules is reported through the runtime logger at level `error` ([§9.9](#99-logger-and-environment-access)), which forwards to `error_events`. The error carries the action name, the path of the offending key (for example `metadata.customer.email`), the rule that matched (unregistered key, key list, value pattern or limit) and the request id; it never carries the value. The original event is still written, redacted. A redaction means code put something into metadata that [§9.1](#91-principles) forbids. The fix is in the calling code: stop sending the value, or, when the field is legitimate (an identifier, a template name, a token count), register it for that action and have the registration reviewed in the PR. The redactor's key list and value patterns are not edited per project. Redactions are caught by the tests (below) and by the release check: before a release, `error_events` on staging holds no redaction errors ([§11.12](#1112-security-release-checklist), [§19.3](#193-production-readiness-checklist)).
*   **Redaction in tests.** When `NODE_ENV` is `test` (set by Vitest), the redactor throws instead of logging, so an event with an unregistered or forbidden field fails the test that emits it. Redactions in code paths that tests cover are caught in the PR, before staging or production; the release check of `error_events` on staging covers the rest.
*   **Catalogue.** `documentation/AUDIT_LOGGING.md` ([§9.4](#94-action-names)) is the human-readable list of every action with the metadata keys it may carry. Its action table is generated from `src/lib/logs/allowlist.ts` by `npm run audit:catalogue` between fixed markers; the prose around the table is written by hand. CI fails when the committed table differs from the generated one (`check:audit-catalogue`, [§8.1](#81-required-ci-checks)), so the catalogue and the code cannot drift apart.
*   **Fingerprints.** Prompts, generated AI content, message bodies and any multi-KB text are not stored in log events. Store `{ length, sha256 }`, written by the shared fingerprint helper. There is no preview: the first characters of a prompt or message can hold a person's name, which the redactor does not recognise. A project that keeps a preview limits it to content types that cannot contain personal data and records the decision in `steering/tech.md`.
*   **Diffs.** For update events, record before/after for changed typed fields only; for large JSON blobs record only the list of changed key names, capped at 30 with a `truncated` flag.

## 9.7 Retention

Retention is set per app and per table in logs-console. Defaults for a new project, entered in logs-console in Sprint 0 ([§3.4](#34-sprint-0)), because a table without a policy is kept indefinitely ([Appendix B](#appendix-b-logging-platform-reference)):

| Table | Window | Rationale |
| ---| ---| --- |
| `audit_log` | 24 months | Forensics, privilege-change history, exports and bulk operations (what a takeover investigation and a breach notification run on) |
| `ai_usage_events` | 12 months | AI provenance and cost |
| `app_events`, `integration_events`, `error_events` | 6 months | Operational |

Pruning is run by the platform nightly in bounded batches and records an `audit.pruned` event with per-table counts, so "did the prune run?" is itself answerable from the log.

## 9.8 GDPR and Audit Logs

Audit records are not deleted on erasure requests. Article 17 GDPR carves out "compliance with a legal obligation" as grounds for retention. The data subject is entitled to a copy of their audit footprint (Article 15): an ITG operator answers an audit-data DSAR with the query documented in the log-ingest repository (rows where the subject was the actor or the affected resource). Rows hold ids and network metadata. Outside the security events the address is truncated and the user agent parsed at write time ([§9.5](#95-required-fields)), so erasure of the user profile leaves no personal data in those rows. Security events keep the full address and the raw user agent for the window of their table ([§9.7](#97-retention)), because an account-takeover investigation and a breach notification run on them; after erasure of the profile they are the only personal data left in the log store. This position, including the window for the address and user agent on security events, is stated in every project's privacy notice.

## 9.9 Logger and Environment Access

*   Every module uses `createLogger('<module-id>')` from `src/lib/logger.ts` for runtime logs. `console.*` is a lint error under `src/app/api` and `src/lib`. Module ids are kebab-case: `api-<path>` for routes, `<name>-service` for services.
*   Caught errors that return a 5xx call `logger.error`, which forwards to `error_events`. The redactor reports every redaction the same way, except in tests, where it throws ([§9.6](#96-metadata-allowlist-redactor-fingerprints)). A failed log delivery is the one `logger.error` that stays in the runtime log and is not forwarded ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console)). Uncaught errors are captured in `instrumentation.ts` (`onRequestError`).
*   Server configuration is read in `src/lib/runtime-config.ts` and validated with zod at startup; a missing or malformed value fails the start. `NEXT_PUBLIC_*` values are read the standard Next.js way.
*   Log levels: `debug` (local only), `info`, `warn`, `error`, `critical`.

## 9.10 Client-attested Events

Some events exist only in the browser SDK (MFA enrollment, certain auth failures). Expose one endpoint for them with a small enum of allowed event types. Events are sent with `fetch({ keepalive: true })`, with the App Check token and, after login, the ID token in `Authorization: Bearer` ([§11.4](#114-sessions)). The server stamps actor id, IP and user agent (reduced as in [§9.5](#95-required-fields)); reason codes are validated against a strict character class; rate-limited per IP.

# 10. Backup and Recovery Standards

## 10.1 Principles

Every production project defines what is backed up, frequency, retention, storage location, recovery process, responsible owner and restore-test frequency in `documentation/OPERATIONS.md`.

## 10.2 Backup Policy

| Resource | Strategy |
| ---| --- |
| Firestore | Point-in-time recovery on in production: recovery to the minute over the last 7 days. Nightly managed export by a scheduled Firebase Function in `functions/` to a GCS bucket in the same project, for restore tests in `itg-restore` ([§10.4](#104-restore-testing)) and as a copy outside the database; `BACKUP_RETENTION_DAYS` applied by the same Function; both Firebase projects covered |
| Firebase Auth users | Exported nightly by the same Function (hashed credentials included) so that accounts can be restored with the data. The production project's password hash parameters (signer key, salt separator, rounds, memory cost), read once from the Firebase console, are kept next to the exports in the production backup bucket under the same access; an Auth import needs them, or restored users cannot sign in |
| PostgreSQL (if used) | Neon point-in-time restore of the production database, within the history window of the Neon plan |
| Storage | Object versioning or lifecycle rules where the data is not reproducible |
| Configuration | `wrangler.jsonc` of the application and of `workers/log-relay/` (bindings and routes), rules, indexes, `.env.example` in git; public values, server configuration and credentials in GitHub Environments |
| Source | Git history on GitHub |

## 10.3 Recovery Objectives

Each project defines RPO (maximum acceptable data loss) and RTO (maximum acceptable recovery time). Default: RPO 24 hours (Firestore in production: minutes, through point-in-time recovery, [§10.2](#102-backup-policy)), RTO 4 hours.

## 10.4 Restore Testing

At least once per month for critical projects, quarterly otherwise: restore the latest production export (Firestore and Auth users, the users imported with the production hash parameters of [§10.2](#102-backup-policy)) into the shared ITG recovery project `itg-restore`, verify that the restored collections and users match the export, record the result in ClickUp, and empty `itg-restore` the same day.

*   `itg-restore` serves every ITG project, one project at a time: a restore starts only in an empty `itg-restore`.
*   Access to `itg-restore` and to the production backup bucket is held by the ITG restore operators named in `OPERATIONS.md`.
*   The project's privacy notice states that backups are tested in an isolated ITG recovery project and deleted the same day. A client whose agreement keeps data inside its own project records a deviation ([Purpose](#purpose)).

## 10.5 Backup Checklist

- [ ] Firestore point-in-time recovery on in production · backup Function deployed to both Firebase projects · retention set · bucket lifecycle set
- [ ] Auth export included · production password hash parameters stored next to the exports · Neon point-in-time restore window known (if PostgreSQL) · Storage versioning considered
- [ ] Restore process documented in `OPERATIONS.md` · restore test in `itg-restore` scheduled · owner assigned
- [ ] Privacy notice states that backups are tested in an isolated ITG recovery project · ITG restore operators named in `OPERATIONS.md`

# 11. Security Standards

## 11.1 Authentication

Default: Firebase Authentication with Identity Platform. Users sign in in the browser with the Firebase client SDK; the server uses the REST client of [§2.2.1](#221-workers-runtime-constraints-and-firebase-access) for admin operations (claims, user creation, the account-state check), because the admin SDK does not run on Workers.

Required:

*   Firebase App Check with reCAPTCHA Enterprise in staging and production: verified server-side in the route wrapper ([§11.5](#115-api-route-contract)) on every API call, and enforced on Firebase Storage, which the browser reaches directly ([§11.6](#116-firebase-security-rules)).
*   Identity Platform's reCAPTCHA enforcement on email / password sign-in, the one auth call the browser makes to Firebase directly: the client loads it with `initializeRecaptchaConfig` before sign-in; the mode is `AUDIT` on staging, so CI and E2E sign-ins are not blocked ([§7.3](#73-real-services-no-emulator)), and `ENFORCE` on production. Sign-up and password reset go through the application's routes ([§2.4.1](#241-transactional-email-azure-communication-services)), which App Check, the `auth` rate limit and the per-address limit protect.
*   **TOTP MFA is mandatory for admin roles**, enforced server-side (`FORCE_ADMIN_MFA`), not just offered.
*   Client-side sign-up is disabled in the Firebase project. Accounts are created by the server: an admin adds or invites users, and self-registration goes through the project's sign-up route.
*   Email verification where accounts are self-registered.
*   Password policy (length, character classes) set in the Firebase project and enforced by Firebase Authentication. There is no password history: a password change goes from the client to Firebase directly, so no API route sees a password.
*   Auth emails (verification, password reset, invitation) are sent through ACS, the default email provider, by the route of [§2.4.1](#241-transactional-email-azure-communication-services).
*   Disabled / deleted user handling: a disabled or deleted user is rejected on the next request, not at token expiry. Mechanism: the account-state check in [§11.4](#114-sessions).

## 11.2 Authorization: Roles in Custom Claims

If the application has more than one kind of user, it defines roles. A typical set is `owner`, `admin`, `manager`, `member`, `viewer`; projects pick the roles their domain needs. A single-user-type application has no role system and must not invent one.

Roles and the tenant are stored as **Firebase custom claims** on the user, and every authorization decision reads them from the **verified ID token**. Claims hold the role and the tenant (`tenantId`, [§11.3](#113-tenant-isolation)); resource-level membership and ownership (projects, teams) live in the database, and the service reads the resource's tenant and membership from the database and checks them against the tenant in the claim.

*   Firestore may keep a copy of the role on the user document for admin lists and search. The claim-setting endpoint is the one writer of the copy, and authorization decisions read the claim, not the copy. Claims are not rebuilt from the document at sign-in.
*   Request bodies, query strings and headers are never a source of identity or role.
*   Role changes go through one admin endpoint that sets the claim and the copy, emits `admin.claim.set`, revokes the user's refresh tokens ([§11.4](#114-sessions)). The old token is rejected on the next request, the user signs in again and the new claim is in the new token.

Why: claims are signed by the auth provider and verified on every request; a database copy can lag.

Every protected action checks: is the user authenticated; does the user have the required role; (multi-tenant only) is the resource in the user's tenant and, where the resource has members, is the user one of them.

## 11.3 Tenant Isolation

For multi-tenant systems, every record carries its tenant: `tenantId` in Firestore and in the custom claim, `tenant_id` in PostgreSQL; "organization" is a domain term only. The tenant scope comes from the claim and is enforced server-side in every store: in Firestore through one tenant-scoped helper that every tenant query goes through; in Storage through the rules, which scope client uploads to the tenant's paths, while reads go through an API route ([§11.6](#116-firebase-security-rules)); in PostgreSQL through row-level security on every tenant table ([§2.1.1](#211-postgresql)). Firestore rules allow no client access ([§11.6](#116-firebase-security-rules)). The tenant isolation test ([§7.4](#74-required-coverage-of-flows)) covers every collection with a user of a second tenant.

## 11.4 Sessions

*   The session is the Firebase ID token. Every API request carries it in `Authorization: Bearer`; the route wrapper ([§11.5](#115-api-route-contract)) verifies it per request, and it is the only credential the server accepts. There is **no session cookie**. Protected pages are client-rendered shells that hold no data until an API call returns; the Firebase client SDK holds the sign-in state and the shell redirects to the login route when there is no signed-in user. Server components and the middleware never identify the user; the middleware sets the security headers and the CSP nonce ([§11.10](#1110-csp-and-headers)) and applies the feature kill switch ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)), nothing else.
*   A protected resource reached without a header (a plain link, an image, a new tab, a link that leaves the app: exports, shared files) is served through a short-lived signed URL issued by an API route ([§11.6](#116-firebase-security-rules)) or fetched by the client with the token. In-app file views use the same signed URLs; `getDownloadURL` links, whose token does not expire, are not used. No route is gated by a cookie, and a cookie that merely contains JSON is not a session.
*   **Absolute lifetime**, set per project (defaults: 12 hours for admin apps, 14 days for consumer apps), enforced statelessly in the wrapper: an ID token whose `auth_time` is older than the limit is rejected with `401` and `auth.session.rejected` reason `expired`. `auth_time` survives token refreshes, so the user signs in again, with MFA for admin roles.
*   **Idle timeout** is a client control, not a server guarantee (defaults: 30 minutes for admin apps, none for consumer apps): the client signs out of the Firebase SDK after the idle period without user input and returns to the login route. It protects an unattended browser; a stolen credential is bounded by the absolute lifetime and the account-state check below.
*   **Logout** calls the logout endpoint with the ID token, which emits `auth.logout` for the actor and revokes the user's refresh tokens, then signs out of the Firebase SDK; the client signs out even when the endpoint fails. The revocation ends the user's other sessions on their next request.

Why no session cookie: a cookie is a second credential with its own lifetime, so lifetime, revocation, account state and logout would each exist twice, in the wrapper and in the middleware. Firebase cannot extend a session cookie without a fresh ID token from the client, so an idle timeout on it is either a client-driven sliding window, which leaves the API path uncovered, or per-request session state in KV, which adds a store and a write on every request for a control that only an unattended browser needs. An unsigned, self-issued JSON cookie avoids both and is forgeable. The uncached per-request lookup is the choice because it is the simplest and the strictest option. The alternatives are recorded in the changelog.

**Account-state check.** Verifying the signature of an ID token is stateless: it cannot see that the user was disabled or deleted, or that the refresh tokens were revoked ([§11.2](#112-authorization-roles-in-custom-claims)). Therefore the route wrapper checks the account state after signature verification, on every authenticated request:

*   The state comes from Identity Toolkit `accounts:lookup` (`disabled`, `validSince`) through the REST client of [§2.2.1](#221-workers-runtime-constraints-and-firebase-access). The request is rejected with `401` when the account is disabled or missing, or when the token's `auth_time` is earlier than `validSince`; the rejection emits `auth.session.rejected` with the reason (`disabled`, `deleted`, `revoked`).
*   There is no cache. The check is one Identity Toolkit round trip per request, on the critical path before the handler; it needs no Cloudflare binding, and the lookups are not billed by Firebase. A disabled account or a revoked session is therefore rejected on the next request, for every role.
*   A failed lookup rejects the request with a retryable `503` and an `error_events` row; it never falls through to an unchecked token. An Identity Toolkit outage is then an incident ([§15](#15-incident-management)), not a bypass.
*   The check is not cached or tuned per project. A project that cannot carry the lookup latency records the deviation ([Purpose](#purpose)).

## 11.5 API Route Contract

Every `src/app/api/**/route.ts` is implemented through one wrapper. Nothing else in the Worker exports a handler; Firebase Functions export triggers and schedules only ([§2.2.2](#222-background-jobs-and-n8n)).

```ts
export const POST = withApiRoute('api-admin-users-create', withRole('admin', handler), {
  rateLimit: 'write',
  schema: createUserSchema,       // zod, body + query
  feature: 'users',               // registry name; omitted for routes that belong to no feature
});
```

The wrapper provides, in order:

1. Request id (`x-request-id`, generated or propagated) and the request logger
2. Feature kill switch: a route whose `feature` is switched off answers `404` here, before anything else runs ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)); routes without a `feature` skip this step
3. App Check verification
4. Authentication (ID token in `Authorization: Bearer`, then the account-state check of [§11.4](#114-sessions)) and the auth guard (`withAuth`, `withRole('<role>')`, `withTenant`, or an explicit `public: true`)
5. Rate limiting (new: the Rate Limiting binding): every route declares its limit in the wrapper options, by profile (`auth`, `read`, `write`, `admin`, `ai`), with a wrapper default when it declares none, counted through the Cloudflare Rate Limiting binding; the route that sends password-reset and verification links adds a per-address limit ([§2.4.1](#241-transactional-email-azure-communication-services))
6. Body-size limit and zod validation of body and query
7. The handler
8. Typed errors: `ApiRouteError` helpers `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `tooManyRequests`; anything else becomes a generic 500 and an `error_events` row. Status codes are never derived from message text.
9. Response envelope: `{ success: true, data }` or `{ success: false, error: { code, message } }`
10. Automatic event: the route's audit or app event, with `.denied` on guard failure and `.failed` on exception; the request's events leave in one batch inside `ctx.waitUntil` after the response ([§9.1](#91-principles))

Route ids follow `api-<path>-<verb>`. The CI checks in [§8.1](#81-required-ci-checks) verify that every route uses the wrapper, a guard, and emits an event.

**WAF ceiling (new).** A Cloudflare WAF rate limiting rule on the `improvetogrow.com` zone is the second gate, per IP and well above the code limits. It is set once on the zone for all projects: expression `starts_with(http.request.uri.path, "/api/")`, 100 requests per 10 seconds per IP (about 600 per minute), action Block for 10 seconds. The zone is on the Cloudflare Free plan, which allows one rule with a 10-second window.

## 11.6 Firebase Security Rules

**Firestore rules deny all client reads and writes.** Every read and write of application data goes through an API route, so every request passes the account-state check of [§11.4](#114-sessions); rules evaluate the ID token without a lookup and would let a disabled or revoked user keep reading until the token expires. The `ops` collection ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)) is no exception: the Worker reads and writes it with the service account. Real-time listeners (`onSnapshot`) are therefore not available by default; live updates poll an API route. A project that needs client reads, for example for real-time listeners, records a deviation ([Purpose](#purpose)) that names the readable collections and accepts that a disabled or revoked user can read them until the ID token expires, up to one hour; those collections carry the tenant scope from the claim ([§11.3](#113-tenant-isolation)) in the rules.

**Storage rules allow client uploads, scoped and limited; reads go through the API.** Storage is the one place where the browser talks to Firebase directly, under App Check enforcement ([§11.1](#111-authentication)): a client may upload to the paths of its own tenant, taken from the claim (`request.auth.token.tenantId`, or the user's `uid` in a single-tenant application), with a content-type allowlist and a size limit per path. Storage rules deny client reads and every other path. Every read goes through an API route that checks tenant, membership and account state ([§11.4](#114-sessions)) and returns a short-lived signed URL: 10–15 minutes, issued per view, one URL per item when a list is returned. A disabled or revoked user can upload under the rules until the ID token expires, up to one hour; accepted, because every read of the object passes the account-state check.

**Testing.** Rules are tested in CI against the staging project, with fixed test users and real objects, never in an emulator ([§7.3](#73-real-services-no-emulator)). The cases are fixed:

| Rules | Case | Expected |
| ---| ---| --- |
| Firestore | An authenticated client reads a document of its own tenant | denied |
| Firestore | An authenticated client writes a document of its own tenant | denied |
| Storage | An upload into the user's own tenant path with an allowed content type and size | allowed |
| Storage | An upload into another tenant's path | denied |
| Storage | An upload with a content type outside the allowlist | denied |
| Storage | An upload one byte over the size limit of the path | denied |
| Storage | A client read of any object, own tenant included | denied |

A project with a client-read deviation adds one allowed and one denied case per readable collection, per role and per tenant. Rules are deployed to both projects in the same change ([§2.2.4](#224-environments-and-naming)); a PR that changes a rules file is additionally checked by the Security Rules API before the merge ([§7.3](#73-real-services-no-emulator), [§8.1](#81-required-ci-checks)).

## 11.7 Webhooks

Outbound: every webhook carries `X-<App>-Webhook-Signature: v1,sha256=<hex>` computed as HMAC-SHA256 over `<timestamp>.<rawBody>` and `X-<App>-Webhook-Timestamp`; per-route secrets; receivers reject timestamps older than ≈5 minutes.

## 11.8 AI Security

Gemini models are called through Vertex AI, at the regional endpoint of `europe-west4` (`VERTEX_AI_LOCATION`), with a project service account in the client's or ITG's Google Cloud project, so that prompts and outputs are processed in the EU. A model that is not available in the EU region is not used until it is; the `global` endpoint is not used. The public Gemini API (API-key based, `generativelanguage.googleapis.com`) and Vertex AI express mode (`vertexai: true` with an API key instead of a project) are not used either: neither pins processing to an EU region.

Gemini through Vertex AI is the Recommended AI service ([§2.1](#21-default-stack)). A project that uses another provider records a deviation and keeps the same properties: calls from server-side code, processing in the EU region, and `check-ai-provider` green.

**One REST client.** Vertex AI is called through REST in every runtime, so there is one way to call a model and no SDK whose constructor option decides between the Gemini API and Vertex AI:

*   The Worker calls Vertex AI from `src/lib/vertex-ai/`: `generateContent` on `https://<location>-aiplatform.googleapis.com/v1/projects/<project>/locations/<location>/publishers/google/models/<model>`, with a bearer token for the `cloud-platform` scope that the token helper of the Firebase REST client ([§2.2.1](#221-workers-runtime-constraints-and-firebase-access)) mints from `VERTEX_AI_SERVICE_ACCOUNT`. Like that client it is an accepted abstraction under constitution article VIII-4, recorded in `storage/design/*.md`.
*   A Function that calls a model makes the same REST call. Its token comes from the metadata server for the Function's runtime service account, which holds the Vertex AI User role ([§3.4](#34-sprint-0)), so `functions/` has no AI credential; `VERTEX_AI_PROJECT_ID`, `VERTEX_AI_LOCATION` and `VERTEX_AI_MODEL` come from `functions/.env.<project-id>` ([§2.1.3](#213-secrets-and-configuration)).
*   No Gemini client package is a dependency of any `package.json`: not `@google/genai`, not the legacy `@google/generative-ai`, not `@ai-sdk/google`.

**CI.** `scripts/checks/check-ai-provider.mjs` ([§8.1](#81-required-ci-checks), [C.3](#c3-ci-check-scripts)) fails the pull request on: the string `generativelanguage.googleapis.com` under `src/`, `functions/` or `workers/`; the package `@google/genai`, `@google/generative-ai` or `@ai-sdk/google` in any `package.json` or in an import under `src/`, `functions/` or `workers/`; a `VERTEX_AI_LOCATION` or Vertex AI endpoint with the location `global`; and a variable named `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_GENAI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY` in source, `wrangler.jsonc`, the committed `.env*` files or the workflows.

Prompt-injection review for every feature that feeds user content to a model; personal-data minimization at the prompt boundary; output validation where the output drives a privileged action; per-tenant cost and usage limits; abuse detection. Prompts and outputs are not stored in logs: log events carry their length and hash ([§9.6](#96-metadata-allowlist-redactor-fingerprints)). Content the user has the AI produce is stored as product data.

## 11.9 Security Lint and Code Rules

eslint-plugin-security (new) is part of the normal ESLint config and runs with `eslint` ([§8.1](#81-required-ci-checks)) over `src/`, `functions/` and `workers/`: `detect-object-injection` is off and the other rules are errors. The `eval` / `new Function` / `javascript:` family is banned globally. `npm audit` runs on every PR ([§8.1](#81-required-ci-checks)); Dependabot (new) alerts and security updates are on in every repository.

## 11.10 CSP and Headers

**Nonce-based CSP (new).** The middleware creates a nonce per request and sets the CSP with `script-src 'nonce-<nonce>' 'strict-dynamic'`, without `'unsafe-inline'`; pages therefore render per request. Adding a script, font or connect target is a change to the middleware and goes through PR review. `img-src` and `media-src` include the Firebase Storage host for the signed URLs of [§11.6](#116-firebase-security-rules); the reCAPTCHA Enterprise hosts are allowed for App Check and Identity Platform ([§11.1](#111-authentication)). All security headers are set in middleware: CSP, HSTS, `X-Frame-Options: DENY`, nosniff, COOP, CORP and a restrictive Permissions-Policy. API responses use `default-src 'none'`. CORS uses an explicit `ALLOWED_ORIGINS` list, a GitHub Variable per environment ([§2.1.3](#213-secrets-and-configuration)).

## 11.11 Diagnostic Endpoints and Feature Kill Switches

Diagnostic routes are disabled by default and return 404 (not 401/403) when disabled; owner-only and rate-limited when enabled; audited through the wrapper.

A feature is a folder under `src/features/` ([§4.1](#41-repository-structure)). Every feature is declared once in the registry `src/lib/features/registry.ts` with its name, which is the folder name, and the page paths it owns; a route names its feature in the wrapper options ([§11.5](#115-api-route-contract)). A feature that is switched off is invisible to the user and closed on the server: its navigation items are hidden, its pages and its routes answer `404`, never `401` or `403`. Routes and pages that belong to no feature cannot be switched off.

Two lists decide, and the effective set is their union:

*   **The per-environment list.** `DISABLED_FEATURES`, a GitHub Variable per environment ([§2.1.3](#213-secrets-and-configuration)): the features a given environment does not offer. Changed in the GitHub Environment and live with the next deploy or a manual run of the deploy workflow ([§8.2.1](#821-deploy-pipeline-contract)).
*   **The kill switch.** The Firestore document `ops/kill-switch` (`disabled: string[]`, `updatedAt`, `updatedBy`, `reason`): the features stopped during an incident. Changed without a deploy, through one owner-only admin endpoint under the route contract (`admin` rate-limit profile, zod body `{ feature, disabled, reason }`, feature validated against the registry). Every change emits `admin.feature.disabled` or `admin.feature.enabled` with `feature` and `reason` as metadata, registered in the allowlist ([§9.6](#96-metadata-allowlist-redactor-fingerprints)); as `admin.*` events they are security events, kept in `audit_log` with the full address and user agent for 24 months ([§9.5](#95-required-fields)), so logs-console shows who stopped what, when and why. The endpoint is called from the owner's admin page, with the ITG admin seat the client approved for exactly this ([§2.2.4](#224-environments-and-naming)). A direct edit in the Firebase console is break-glass: it works, it leaves no `admin.feature.*` event, and it is recorded in the incident record instead.

**Where it is enforced.** One loader, `src/lib/features/kill-switch.ts`, serves three callers: the route wrapper (step 2 of [§11.5](#115-api-route-contract)) answers `404` for a route whose feature is off; the middleware answers `404` for a request to a page path the registry assigns to a feature that is off; the root layout hands the effective set to the navigation shell, which hides the items. Hiding is cosmetic; the two `404`s are the control. Diagnostic routes (above) are an ordinary feature in the registry, listed in `DISABLED_FEATURES` of both environments, so they are off by default and switched on per environment by changing the Variable.

**The read.** The loader reads the per-environment list from `runtime-config.ts` ([§9.9](#99-logger-and-environment-access)) and the document with one `documents.get` through `firestore.ts` of [§2.2.1](#221-workers-runtime-constraints-and-firebase-access), the same call every service uses, with the service-account token that client already caches per isolate. The wrapper has no other Firestore read per request ([§11.4](#114-sessions) reads the Auth record through Identity Toolkit, and authorization reads the claims, not the user document, [§11.2](#112-authorization-roles-in-custom-claims)), so this is the only one, and it does not run per request: the loader keeps the document in memory per isolate for `KILL_SWITCH_TTL_SECONDS` (default 30), callers that arrive during a refresh share the one in-flight read, and the Firestore cost is one read per isolate per TTL. A failed refresh keeps the last value and writes an `error_events` row; a cold isolate whose first read fails rejects the request with a retryable `503`, as the account-state check does, never with an unchecked request. Time to effect is therefore the TTL, and the switch survives deploys and `wrangler rollback`, which a Variable would not.

**Verification.** The Vitest suite of the loader covers the TTL, the shared in-flight read, the stale value on a failed refresh and the cold-start `503`; a unit test of the wrapper with a mocked loader checks that a route of a switched-off feature answers `404` ([§7.4](#74-required-coverage-of-flows)); `check-feature-registry.mjs` ([§8.1](#81-required-ci-checks)) fails when a folder under `src/features/` is missing from the registry; the security checklist ([§11.12](#1112-security-release-checklist)) verifies the switch before every release.

## 11.12 Security Release Checklist

- [ ] Auth, authorization and (if multi-tenant) tenant isolation checked
- [ ] Authorization from claims; the role copy on the user document written by the claim endpoint and used for listing ([§11.2](#112-authorization-roles-in-custom-claims))
- [ ] Admin MFA enforced · App Check verified in the wrapper and enforced on Storage · reCAPTCHA enforcement `ENFORCE` on production · client-side sign-up disabled ([§11.1](#111-authentication))
- [ ] Account-state check active: disabled user and revoked session rejected on the next request (verified on staging)
- [ ] Sessions bearer-only: no session cookie, protected pages are client shells, absolute lifetime enforced in the wrapper, client idle sign-out in place, logout endpoint revokes refresh tokens
- [ ] Firestore rules deny all client access; Storage rules scope uploads to the tenant with content-type and size limits and deny client reads; file reads through signed URLs from the API; the rules test of [§11.6](#116-firebase-security-rules) green on staging; deployed to both projects
- [ ] Every route through `withApiRoute` with a guard, a rate limit and a zod schema (CI green)
- [ ] Functions export Firebase triggers and schedules (`check-function-triggers` green, [§2.2.2](#222-background-jobs-and-n8n))
- [ ] Credentials in GitHub Environment Secrets, configuration in Variables, no values in `wrangler.jsonc`; `.env.example` current with the class of every block
- [ ] Outbound webhooks signed
- [ ] Kill switch verified on staging: a feature switched off answers 404 on its page and its API within the TTL, is switched back on, and both `admin.feature.*` events are visible in logs-console ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches))
- [ ] CSP with a per-request nonce and `'strict-dynamic'`, no `'unsafe-inline'`; all security headers set in middleware ([§11.10](#1110-csp-and-headers))
- [ ] ESLint (with eslint-plugin-security) and `npm audit` green; Dependabot alerts reviewed
- [ ] Redactor active; no names or emails in events; full address and raw user agent only on security events ([§9.5](#95-required-fields)); no redaction errors in `error_events` (checked in logs-console on staging)
- [ ] AI calls server-side, in the EU region, through REST ([§11.8](#118-ai-security)); no Gemini API key or client package anywhere (`check-ai-provider` green)
- [ ] Privacy notice states the audit-log retention position and the restore test in an isolated ITG recovery project ([§10.4](#104-restore-testing))

# 12. External Integration Standards

Every integration has a section in `documentation/INTEGRATIONS.md`.

## 12.1 Integration Documentation Template

```markdown
## Integration: <Service>
Purpose · Owner · Authentication method · Endpoints used
Data sent / received / stored · Rate limits · Error handling · Retry policy (§12.2)
Webhooks (outbound signing, §11.7) · Cost risks · Security notes
Events emitted (integration.<vendor>.*) · Environment variables (names only)
```

## 12.2 Retry Policy

Retry temporary failures (network errors, 5xx, 429); never retry other 4xx; exponential backoff with jitter, and on 429 the `Retry-After` header is respected; idempotency keys where the API supports them; repeated failures recorded as `integration.<vendor>.<op>.failed`.

*   A call that is not safe to repeat and has no idempotency key (email, payment, record creation) is not retried: the failure is logged and reported to the user.
*   Inside a request: at most 2 attempts within a total budget of a few seconds. Longer retrying goes to a background job (Functions or n8n).

## 12.3 n8n Workflows

When n8n is used ([§2.2.2](#222-background-jobs-and-n8n)): separate staging and production workflows; secrets in n8n credentials, never in nodes; calls from the application to n8n HMAC-signed ([§11.7](#117-webhooks)); the workflow's JSON export is kept in `documentation/n8n/` in the project repository so that it is versioned.

n8n writes directly to the project's database:

*   with its own credential per project: a PostgreSQL user limited to the tables it writes, under row-level security, and a Firestore service account separate from the application's;
*   with the `tenantId` the application sent in the outbound call;
*   and every write emits an `integration.n8n.*` event to log-ingest, HMAC-signed ([§9.3](#93-the-central-log-store-log-ingest-and-logs-console)).

# 13. Data and Privacy Standards

## 13.1 Personal Data

Store only the fields the product needs; limit access by role; never log personal data ([§9.1](#91-principles); the identifiers and the reduced network metadata of [§9.5](#95-required-fields) are the only exception); keep product data until the client contract ends, as the privacy notice states; support deletion ([§13.3](#133-dsar-and-erasure), audit-log exception in [§9.8](#98-gdpr-and-audit-logs)); export only through [§13.2](#132-data-export).

## 13.2 Data Export

Only authorized roles export; every export emits `export.requested` / `.completed`, kept 24 months in `audit_log` ([§9.7](#97-retention)); large exports run as background jobs (Function or n8n workflow); export files expire; sensitive exports require extra confirmation.

## 13.3 DSAR and Erasure

An audit-data DSAR is answered by an ITG operator query ([§9.8](#98-gdpr-and-audit-logs)); a product-data DSAR through an admin endpoint in the application.

An erasure request is carried out through an admin endpoint across Firebase Auth, Firestore (including the role copy of [§11.2](#112-authorization-roles-in-custom-claims)), Storage, PostgreSQL and the data n8n wrote ([§12.3](#123-n8n-workflows)). Copies in backups (nightly export, point-in-time recovery) are deleted when their retention runs out, as the privacy notice states. Audit logs are not deleted ([§9.8](#98-gdpr-and-audit-logs)).

# 14. Release Management

## 14.1 Release Types

Patch (`Z`): bug fix or small improvement. Minor (`Y`): feature without breaking change. Major (`X`): breaking or contractual change. Hotfix: urgent production fix from `hotfix/*` ([§4.2](#42-branching-strategy)).

## 14.2 Release Checklist

- [ ] All planned tasks done · QA completed on staging (a hotfix: the smoke test, [§4.2](#42-branching-strategy)) · security checklist where relevant
- [ ] Migrations applied by the deploy ([§3.5](#35-migration-discipline)); a deploy with a migration runs in the deploy window and the client is told in advance
- [ ] Release commit on `release/X.Y.Z` merged into `staging` ([§4.3](#43-commits-and-versioning)); tag `vX.Y.Z` created by the deploy workflow
- [ ] Backup status checked · rollback plan defined (`wrangler rollback` for the Worker; after a non-additive migration the fix goes forward, [§8.3](#83-production-deployment-rules))
- [ ] Client notified where needed · logs-console checked after release

## 14.3 Release Notes

Release notes for the client are generated from the `CHANGELOG.md` section (Summary, New features, Improvements, Bug fixes, Known issues, Notes for client) and posted in ClickUp.

# 15. Incident Management

## 15.1 Definition and Severity

An incident is any issue that impacts user access, data integrity, security, core workflows, integrations, AI cost or availability, or production availability.

| Severity | Description | Example |
| ---| ---| --- |
| P1 | Critical outage or data / security risk | App down, data leak |
| P2 | Major functionality broken | Users cannot import records |
| P3 | Minor functionality broken | Non-critical feature failing |
| P4 | Low impact | Visual bug |

## 15.2 Response Steps

Identify → assign owner → assess severity ([§15.1](#151-definition-and-severity)) → communicate internally → stabilize (`wrangler rollback` to the previous Worker version is the first option, within the limits of [§8.3](#83-production-deployment-rules); when the cause is older than the previous version, cannot be rolled back, or sits in one feature or one vendor, switch that feature off with the kill switch, [§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)) → fix or roll back → verify (smoke test, [§8.4](#84-smoke-test-after-deploy); forensics in logs-console, [§15.4](#154-forensics-in-logs-console)) → communicate outcome → postmortem for P1 / P2 ([§15.3](#153-postmortem)).

## 15.3 Postmortem

Summary · Timeline (started, detected, resolved) · Impact · Root cause · Resolution · What went well · What did not · Action items (owner, due date). Stored in `documentation/incidents/<YYYY-MM-DD>_<slug>.md`.

## 15.4 Forensics in logs-console

During a P1 / P2, logs-console is the first stop: last actor on the affected resource, action sequence by `request_id`, `.denied` attempts suggesting probing, the full address and user agent on security events to tell the account holder from an attacker ([§9.5](#95-required-fields)), automated processes at the relevant time (`audit.pruned`, integration syncs), `admin.feature.*` for who switched a feature off or on and why ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)), and `error_events` grouped by route.

# 16. Client Handover

## 16.1 Handover Requirements (ClickUp or client-approved format)

Product overview · user guide · admin guide · login and access instructions · the ITG admin seat in production, who holds it and what it is used for ([§2.2.4](#224-environments-and-naming)) · known limitations · support process · maintenance plan · backup and recovery summary · external integration overview · release notes · privacy notice including the audit-log retention position ([§9.8](#98-gdpr-and-audit-logs)), the restore test in an isolated ITG recovery project ([§10.4](#104-restore-testing)), product data kept until the contract ends and backup copies deleted when their retention runs out ([§13.1](#131-personal-data), [§13.3](#133-dsar-and-erasure)) · DNS records the client owns (CNAME for the SaaS hostname, the ACS records of [§2.4.1](#241-transactional-email-azure-communication-services)).

## 16.2 Technical Handover (repository)

`steering/` and `storage/` (architecture, requirements, design, traceability) · `documentation/` (`SECURITY.md`, `AUDIT_LOGGING.md`, `DATABASE.md`, `OPERATIONS.md` with environments, deploy and restore runbooks, `INTEGRATIONS.md`, `RELEASE_PROCESS.md`, `hardening/`, `incidents/`) · `database/migrations/` if used · `CHANGELOG.md`.

# 17. Project Closeout

- [ ] All agreed scope delivered · production release completed · client approval received
- [ ] Documentation complete (repository + ClickUp) · handover completed
- [ ] Events visible in logs-console · backups active · restore test passed
- [ ] Open issues documented · maintenance plan agreed · final review done in the last Sprint Planning

# 18. Minimum Standard for Every Production Project

- [ ] GitHub repository (private, GitHub Team or higher) with `master` / `staging` under branch protection, PR template, README, CHANGELOG; Dependabot on
- [ ] MUSUBI initialized with the ITG profile; steering files current; `musubi validate` in CI
- [ ] ClickUp project with architecture index linking to the repository
- [ ] Two Firebase projects (`-staging`, `-production`) in `europe-west4` and two Workers, both deployed from Sprint 0
- [ ] Configuration in GitHub Environments ([§2.1.3](#213-secrets-and-configuration)): Variables for public values and server configuration, Secrets for credentials; the deploy workflow writes them to Cloudflare and Firebase; the `production` environment limited to `master`
- [ ] CI gates: typecheck, lint (with the security rules), format, unit tests, build, audit, route guards, route logging, function triggers, audit catalogue, knip, constitution, changelog, feature registry, AI provider, rules; E2E on PRs into `master`
- [ ] Deploy workflow per [§8.2.1](#821-deploy-pipeline-contract), triggered by merges into `staging` and `master` and by manual runs on those branches
- [ ] Firebase Authentication with Identity Platform: admin MFA, reCAPTCHA enforcement, App Check (wrapper and Storage), client-side sign-up disabled, account-state check
- [ ] Firestore rules deny all client access; Storage rules scope uploads to the tenant with content-type and size limits and deny client reads; reads through signed URLs; rules tested in CI against staging, no emulator ([§11.6](#116-firebase-security-rules), [§7.3](#73-real-services-no-emulator))
- [ ] Authorization from custom claims (role and tenant)
- [ ] Every API route through `withApiRoute`, guarded, rate-limited, validated, logged; Functions for Firebase triggers and schedules ([§2.2.2](#222-background-jobs-and-n8n))
- [ ] Feature registry and kill switch ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)): `DISABLED_FEATURES` per environment, `ops/kill-switch` in both Firebase projects, owner-only endpoint, 404 on page and API
- [ ] Events flowing to log-ingest, from the Worker through the queue and `workers/log-relay/`, from Functions directly; visible in logs-console; retention policies entered; redactor active; no names or emails; address and user agent reduced outside the security events; no redaction errors
- [ ] Transactional email through ACS
- [ ] Customer domain on a subdomain of the client's domain via Cloudflare for SaaS
- [ ] Firestore point-in-time recovery in production; backup Function on both projects; restore test in `itg-restore` scheduled
- [ ] `documentation/` with SECURITY, AUDIT\_LOGGING, OPERATIONS, INTEGRATIONS, RELEASE\_PROCESS
- [ ] Security checklist ([§11.12](#1112-security-release-checklist)), QA checklist ([§7.5](#75-manual-qa-checklist-staging)), smoke test ([§8.4](#84-smoke-test-after-deploy)), handover ([§16](#16-client-handover))

# 19. Appendix A: Standard Checklists

## 19.1 New Project Checklist

- [ ] Discovery completed → `steering/product.md`
- [ ] Scope defined; first EARS requirements written
- [ ] Architecture drafted in `steering/tech.md` and `storage/design/`
- [ ] Integrations identified; `documentation/INTEGRATIONS.md` started
- [ ] ClickUp project and GitHub repository created
- [ ] Sprint 0 planned

## 19.2 Sprint 0 Checklist

See [§3.4](#34-sprint-0).

## 19.3 Production Readiness Checklist

- [ ] CI green on `master` · QA completed on staging · security checklist ([§11.12](#1112-security-release-checklist)) completed
- [ ] Backups enabled and restore test passed
- [ ] Events verified in logs-console on staging with production-shaped data; redactor verified; no redaction errors in `error_events`
- [ ] Custom hostname active; email sender domain verified
- [ ] Smoke test completed · rollback plan ready · client notified where needed

## 19.4 Maintenance Checklist (monthly)

- [ ] Dependencies reviewed; security updates applied; Dependabot alerts reviewed
- [ ] Restore test (critical projects)
- [ ] Cloudflare observability, the log queue's backlog and the relay's errors, and `error_events` reviewed
- [ ] Audit log queried for anomalies; `audit.pruned` present
- [ ] External API and AI usage and cost reviewed
- [ ] Access permissions and claims reviewed; stale accounts disabled
- [ ] MUSUBI on the latest `-itg` tag of the ITG fork; steering files checked against the current playbook version

# Appendix B: Logging Platform Reference

This appendix describes the platform side of [§9](#9-logging-and-observability) for reference. It is operated by ITG through the log-ingest service; application teams do not implement it.

*   **Store.** One PostgreSQL logs database (`db_itg_logs`) on the ITG VPS in Germany with tables `audit_log`, `app_events`, `integration_events`, `ai_usage_events`, `error_events`, each stamped with `app_id` and `environment`.
*   **Ingest.** The log-ingest service verifies the per-app HMAC signature (`x-log-signature: v1,sha256=…` over `<timestamp>.<body>`), rejects stale timestamps, stamps `app_id` / `environment` from the credential, validates action names against `^[a-z0-9]+(\.[a-z0-9_]+)+$`, and inserts with an INSERT-only database role, idempotently on the event `id` (`ON CONFLICT (id) DO NOTHING`; `ON CONFLICT (id, occurred_at) DO NOTHING` once the tables are partitioned by `occurred_at`), because the queue path of [§9.3](#93-the-central-log-store-log-ingest-and-logs-console) delivers at least once. Apps never receive database credentials.
*   **Constraints.** The action-name format is also a `CHECK` constraint on the tables, so a malformed name is rejected at two layers.
*   **Network metadata.** The store receives `ip_address` and `user_agent` as the recorder reduced them ([§9.5](#95-required-fields)). It does not truncate or parse them itself, and there is no truncation job: a full address or raw user agent outside the security events is an application bug, not a platform task.
*   **Retention.** The nightly prune job of the log-ingest service deletes per app and table in bounded batches (≈10k rows per pass) and inserts `audit.pruned` with per-table counts. Policies are edited in logs-console and stored in the `log_retention_policies` table; a table without a policy is kept indefinitely, so the project's policies are entered in Sprint 0 ([§9.7](#97-retention)).
*   **Scale.** Tables are partitioned monthly by `occurred_at` once volume justifies it (>1M rows/month); old partitions are dropped rather than deleted row by row. Connection pooling (PgBouncer) sits between the ingest service and PostgreSQL. Read access is limited to the logs-console role.
*   **DSAR.** An audit-data DSAR is answered by an ITG operator query documented in the log-ingest repository: all rows where a subject id appears as actor or resource, sorted by `occurred_at` descending ([§9.8](#98-gdpr-and-audit-logs)).

# Appendix C: File Skeletons

## C.1 `.env.example`

```bash
# Class per block (§2.1.3). Public and server configuration → GitHub Variables; credentials → GitHub Secrets.
# The deploy workflow inlines public values at build, passes server configuration with `wrangler deploy --var`
# and writes functions/.env.<project-id>, and pushes credentials with `wrangler secret bulk` and as Functions secrets.
# Locally all three come from .env.* files.
# A block is read by the application Worker unless its header names another reader.

# ---- App ----  Public
NEXT_PUBLIC_APP_URL=http://localhost:3000
# ---- App ----  Server configuration
APP_ENV=local                        # local | staging | production (a GitHub Variable in deployed envs)
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=debug
DISABLED_FEATURES=                   # §11.11, comma-separated registry names; the incident list is ops/kill-switch in Firestore
KILL_SWITCH_TTL_SECONDS=30           # §11.11

# ---- Firebase (client) ----  Public
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY=   # reCAPTCHA Enterprise site key (§11.1)
# ---- Firebase (server, REST) ----  Server configuration
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=             # signed URLs (§11.6) through storage.ts
FORCE_ADMIN_MFA=true
# ---- Firebase (server, REST) ----  Credentials
FIREBASE_SERVICE_ACCOUNT=            # JSON, used by the REST client to mint access tokens (§2.2.1)

# ---- Session (§11.4) ----  Public
NEXT_PUBLIC_SESSION_IDLE_MINUTES=30  # client-side idle sign-out
# ---- Session (§11.4) ----  Server configuration
SESSION_ABSOLUTE_HOURS=12            # enforced in the route wrapper

# ---- Email (Azure Communication Services) ----  Server configuration
AZURE_COMMUNICATION_ENDPOINT=
EMAIL_SENDER_ADDRESS=
EMAIL_SENDER_NAME=
EMAIL_REPLY_TO=
# ---- Email (Azure Communication Services) ----  Credentials
AZURE_COMMUNICATION_ACCESS_KEY=      # HMAC request signing (§2.4.1)

# ---- Logs (ITG log-ingest, §9.3) ----  Server configuration, read by workers/log-relay (its own --var) and functions/ (functions/.env.<project-id>); the application Worker has the LOG_QUEUE binding instead
LOG_INGEST_URL=
# ---- Logs (ITG log-ingest, §9.3) ----  Credentials, read by workers/log-relay (its own secrets file) and functions/ (Firebase Functions secret); never pushed to the application Worker
LOG_INGEST_SECRET=

# ---- AI (Vertex AI only, §11.8) ----  Server configuration, read by the application Worker and, when a Function calls a model, from functions/.env.<project-id>
VERTEX_AI_PROJECT_ID=
VERTEX_AI_LOCATION=europe-west4      # the EU region; the regional endpoint follows from it
VERTEX_AI_MODEL=gemini-2.5-flash
# ---- AI (Vertex AI only, §11.8) ----  Credentials, read by the Worker's REST client; functions/ authenticates with its runtime service account
VERTEX_AI_SERVICE_ACCOUNT=           # JSON; never a Gemini API key

# ---- Backups (functions/) ----  Server configuration, read from functions/.env.<project-id>
BACKUP_BUCKET=
BACKUP_RETENTION_DAYS=30

# ---- PostgreSQL (if used, §2.1.1) ----  Credentials, CI only: the migration user, read by scripts/ci/migrate.mjs in the deploy workflow (§3.5); the Worker connects through its HYPERDRIVE binding
MIGRATION_DATABASE_URL=

# ---- Test users (§7.3) ----  Credentials, CI only: read by Vitest and Playwright from the staging Environment, never pushed to a Worker or a Function
TEST_USER_PASSWORD_ADMIN=            # one key per fixed user seeded by scripts/ops/seed-test-users; the script fixes the email per role and tenant
TEST_USER_PASSWORD_MEMBER=
TEST_USER_PASSWORD_MEMBER_TENANT2=   # multi-tenant applications only
APPCHECK_DEBUG_TOKEN_CI=             # App Check debug token for CI requests on staging
```

## C.2 `.github/workflows/deploy.yml` (outline)

```yaml
name: deploy
on:
  push: { branches: [staging, master] }
  workflow_dispatch: {}                        # deploys the head of the branch it is run on (§8.2.1)
concurrency: deploy-${{ github.ref_name }}     # one deploy per branch, and so per environment
permissions: { contents: write }               # the release tag on master (§4.3)
jobs:
  resolve:        # branch → environment; the production environment accepts master only (§8)
  deploy:
    needs: [resolve]
    environment: ${{ needs.resolve.outputs.environment }}
    steps:
      - npm ci
      - materialize Variables: NEXT_PUBLIC_* → .env.production ; server configuration → --var arguments ; Secrets → .secrets.json and .relay-secrets.json   # C.1 names the reader per block
      - npx opennextjs-cloudflare build
      - node scripts/ci/migrate.mjs                # PostgreSQL projects; MIGRATION_DATABASE_URL (§3.5)
      - npx wrangler secret bulk .secrets.json --env ${{ env.ENVIRONMENT }}
      - uses: cloudflare/wrangler-action  (deploy --env … --var KEY:VALUE …)
      - npx wrangler secret bulk .relay-secrets.json --env … --config workers/log-relay/wrangler.jsonc   # LOG_INGEST_SECRET only
      - uses: cloudflare/wrangler-action  (deploy --env … --config workers/log-relay/wrangler.jsonc --var LOG_INGEST_URL:… ; the queue consumer, §9.3)
      - on master: tag vX.Y.Z from package.json, skipped when the tag exists (§4.3)
      - rm .secrets.json .relay-secrets.json .env.production
  functions:
    needs: [resolve]
    environment: ${{ needs.resolve.outputs.environment }}   # same environment as deploy
                  # write functions/.env.<project-id> from the Variables; firebase functions:secrets:set LOG_INGEST_SECRET; then
                  # firebase deploy --only functions,firestore:rules,firestore:indexes,storage --project <app>-<env>
                  # on push: when functions/**, firestore.rules, firestore.indexes.json, storage.rules or firebase.json changed
                  # on workflow_dispatch: always, so a changed Variable or Secret reaches the Functions
                  # storage only when the project uses Firebase Storage (§8.2.1)
```

The `ci-*` cleanup of [§7.3](#73-real-services-no-emulator) is a second workflow, `.github/workflows/ci-cleanup.yml`:

```yaml
name: ci-cleanup
on:
  schedule: [{ cron: '0 3 * * *' }]            # nightly
jobs:
  cleanup:
    environment: staging
    # deletes ci-* data older than 24 hours in the staging Firebase project (Firestore, Storage, Auth users)
    # and, when the project uses PostgreSQL, in the Neon test database
```

## C.3 CI check scripts

`scripts/checks/check-route-guards.mjs` — walks `src/app/api/**/route.ts`, fails if a file exports a handler that is not wrapped in `withApiRoute(...)` with `withAuth` / `withRole` / `withTenant` or `public: true`.

`scripts/checks/check-route-logging.mjs` — for every route, requires either the wrapper's automatic event (route id registered in the event catalogue) or an explicit `recordAuditEvent` / `recordAppEvent` call; new routes without one fail with the file path.

`scripts/checks/check-function-triggers.mjs` — walks `functions/src/**` and fails on any export of `onRequest` or `onCall` from `firebase-functions`; Functions export Firebase triggers and schedules ([§2.2.2](#222-background-jobs-and-n8n)).

`scripts/checks/check-changelog.mjs` — fails a PR that changes `src/**` without changing `CHANGELOG.md`.

`scripts/checks/check-audit-catalogue.mjs` — regenerates the action table of `documentation/AUDIT_LOGGING.md` from `src/lib/logs/allowlist.ts` and fails when the committed table differs; `npm run audit:catalogue` writes the table ([§9.6](#96-metadata-allowlist-redactor-fingerprints)).

`scripts/checks/check-feature-registry.mjs` — lists the folders under `src/features/` and fails when one is missing from `src/lib/features/registry.ts` or when the registry names a folder that does not exist ([§11.11](#1111-diagnostic-endpoints-and-feature-kill-switches)).

`scripts/checks/check-rules.mjs` — runs when `firestore.rules` or `storage.rules` changed in the PR: sends the rules files of the branch and the fixed cases of [§11.6](#116-firebase-security-rules) to the Firebase Security Rules API test method (`projects.test`) of the staging project, with the `request.auth`, path, method and resource of each case mocked, and fails when a case does not produce the expected outcome. Nothing is deployed and no emulator runs; the script authenticates with the staging `FIREBASE_SERVICE_ACCOUNT` ([§7.3](#73-real-services-no-emulator)).

`scripts/checks/check-ai-provider.mjs` — checks the AI properties of [§11.8](#118-ai-security): fails on `generativelanguage.googleapis.com` under `src/`, `functions/` or `workers/`; on `@google/genai`, `@google/generative-ai` or `@ai-sdk/google` in any `package.json` or in an import under `src/`, `functions/` or `workers/`; on a Vertex AI location `global`; and on a variable named `GEMINI_API_KEY`, `GOOGLE_API_KEY`, `GOOGLE_GENAI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY` in source, `wrangler.jsonc`, the committed `.env*` files or the workflows ([§11.8](#118-ai-security)).
