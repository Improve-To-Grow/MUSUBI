# ITG Software Delivery Playbook — Changelog

## v2.1 (October 2026)

Implemented by the ITG MUSUBI fork release `6.3.1-itg.3` (CHANGE-006).

- §3.3, §5.4: MUSUBI artifact paths match what the fork generates: `storage/specs/<feature>-requirements.md`, `storage/design/<feature>-design.md`, `storage/tasks/<feature>-tasks.md`, `storage/traceability/matrix.md` (from `musubi trace matrix --format markdown`). v2.0 named paths MUSUBI does not write.
- §3.3: new artifact row `steering/rules/itg/*.md`: the playbook's policies as agent rules with `ITG-*` rule ids, installed by `musubi init`.
- §3.3: diagrams in steering and design files are Mermaid (C4 for architecture, `flowchart` for decision logic).

## v1.0 (May 2026) → v2.0 (October 2026)

Scope note: v2 is written for new projects only. It describes the target standard and does not reference existing projects.

### Platform and stack (§2)

| Topic | v1 | v2 |
|---|---|---|
| Hosting | VPS / Vercel / Netlify / Cloudflare Pages / Firebase Hosting | **Cloudflare Workers via OpenNext** for every app. Deploy with Wrangler from GitHub Actions (§2.2, §8.2.1). |
| Firebase on Workers | — | New §2.2.1: `firebase-admin` cannot run on Workers; server code uses a REST client (`src/lib/firebase-rest/`); `firebase-admin` only in `functions/`. `wrangler.jsonc` contract. |
| Customer domains | — | New §2.2.3: Cloudflare for SaaS custom hostnames; clients keep their DNS provider. |
| Environments | test / development / staging / production used inconsistently | New §2.2.4: exactly **local, staging, production**. Naming table for branch, GitHub Environment, Firebase project, Worker, hostname and env file. Both deployed environments created in Sprint 0. |
| Email | not covered (email APIs listed as examples) | New §2.4.1: **Azure Communication Services** from application code for all transactional and auth email; no NS moves, no client SMTP. |
| Design | Figma | **Claude Design**, implemented with shadcn/ui (§2.1.3). |
| UI libraries | — | New §2.1.5: shadcn/ui, Tailwind, react-hook-form + zod, TanStack Query, next-intl. |
| n8n | default for all background jobs | Code first; n8n only for large or frequently changing workflows (§2.2.2, §12.3). |
| PostgreSQL | part of the default stack, in Sprint 0 | Only when the decision matrix requires it (§2.1.1, §2.3). Central logs database is a platform service. |
| External data shape (§2.5) | mandatory rule (JSONB + typed columns, no normalization) | Guidance; decided per project. |
| Integration wrappers | "every integration must have a wrapper" | Call SDK/API directly; project-owned client only for runtime constraints (MUSUBI article VIII). |
| Secrets | GitHub Environments | Same, now the single source; CI pushes to Wrangler. No script-based sync from local files. |

### Specification and architecture (§3)

- New §3.3: **MUSUBI** from the ITG fork (`github:Improve-To-Grow/MUSUBI#ITG-adjustments`) replaces the standalone 14-section architecture document. Steering files, EARS requirements, C4 design, task breakdowns and traceability are the architecture artifacts.
- §3.2: user stories are EARS requirements with `REQ-*` ids.
- §3.4 Sprint 0 rewritten for Workers, two Firebase projects, ACS, log-ingest, route wrapper, Vitest + Playwright.

### Git and code (§4)

- §4.1 repository structure: monorepo removed; feature-based `src/` layout.
- §4.2 branching: `master` = production, `staging` = staging, `feature/*`, `hotfix/*`. `develop` option removed.
- §4.3 new: Conventional Commits, `CHANGELOG.md` gate, `X.Y.Z` versioning, tags.
- §4.4 PR template shortened; adds "old code removed" and "routes emit events".
- §4.6 new: code quality rules (file ≤ 500 lines, function ≤ 50, ≤ 10 imports, no legacy left behind, knip, Prettier).

### Meetings (§6)

- Six meetings reduced to two: weekly Sprint Planning (includes review, refinement and task assignment) and Daily Standup.

### Testing (§7)

- Test-first (Red-Green-Blue) per MUSUBI article III; coverage threshold from the constitution profile.
- Vitest + Playwright confirmed; integration tests against the real staging Firebase project; no emulator.

### CI/CD (§8)

- Required checks extended: `lint:security`, `format:check`, dependency audit (high, production deps), **`check:route-guards`**, **`check:route-logging`**, `knip`, `musubi validate`, changelog check.
- New §8.2.1 deploy pipeline contract (triggers, resolve job with production guard, materialize → build → `wrangler secret bulk` → deploy, Functions and rules deploy). GitHub Free plan note.

### Logging (§9) — restructured

- v1 had 25 subsections mixing application rules with database mechanics. v2 keeps the **application contract** in §9 (11 subsections) and moves platform mechanics (CHECK constraints, pruning function, partitioning, pooling, `xmax`) to **Appendix B**.
- New §9.3: **log-ingest service + logs-console**. Applications never connect to the logs database.
- **Every API route must log**; CI gate.
- **Identifiers only**: `actor_email` removed from required fields; `email`, `name`, `displayName`, `firstName`, `lastName` added to the redactor key list.
- Retention defaults kept; now configured in logs-console.
- GDPR position (v1 §9.16 and §13.5) merged into §9.8.

### Security (§11)

- §11.2: admin TOTP MFA **mandatory**; Turnstile on public auth forms; password policy and history.
- §11.3: roles only when more than one user type; **roles only in custom claims, never in a database** (v1 §11.3 and §11.13 merged).
- §11.5: session cookie must be server-signed.
- §11.6 new: **API route contract** (`withApiRoute`, guards, zod, `ApiRouteError`, response envelope, automatic events).
- §11.7: Firestore/Storage rules server-write-only.
- §11.13: kill-switch feature flags.
- Checklist updated.

### Corrections applied 2026-10-08 (same day, still v2.0)

- Client assets and large binaries live in **Microsoft OneDrive**, not Google Drive (§1.5, §2.1.3).
- Gemini models are used **only through Vertex AI**; the public Gemini API is banned so client data is never used for training (§2.1, §11.10, security checklist, Appendix C.1).
- Localization is not a rule: `[locale]` segment and next-intl only for multilingual products; messages under `src/locales/<locale>/<page>.json`, one file per page (§2.1.5, §4.1, §4.5).
- Types are split per domain and entity under `src/types/<domain>/<entity>.ts`; no single `index.ts` holding everything (§4.1).
- Playbook and MUSUBI fork stay in sync: same change set, identical copy in the fork, playbook version + changelog, fork `-itg.N` release names the playbook version (Purpose).

### Other

- §10.2 backups: Firebase Functions nightly export for Firestore and Auth users; R2 versioning.
- §15.4: forensics via logs-console.
- §16: handover includes client-owned DNS records (CNAME, SPF/DKIM).
- §18 minimum standard rewritten.
- Duplicated sections removed (documentation policy, secrets, GDPR, Definition of Done, release checklists).
- New Appendix C: `.env.example`, `deploy.yml` outline, CI check scripts.
