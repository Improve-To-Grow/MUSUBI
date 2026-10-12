---
policy: ITG-GIT
title: Repository, branches, commits, pull requests and code quality
playbook: ITG Software Delivery Playbook v2.1
sections: ["§4.1", "§4.2", "§4.3", "§4.4", "§4.5", "§4.6"]
roles: [software-developer, code-reviewer, constitution-enforcer, traceability-auditor, devops-engineer]
---

# Git and Code Quality (ITG-GIT)

## When this applies

Creating files and folders, branching, committing, opening or reviewing a pull request.

## Decision diagrams

Branching (§4.2). `master` is production and `staging` is staging; every merge deploys.

```mermaid
%%{init: {'gitGraph': {'mainBranchName': 'master'}}}%%
gitGraph
    commit id: "v1.2.0"
    branch staging
    checkout staging
    commit id: "sync"
    branch feature/meeting-rsvp-869et4322
    checkout feature/meeting-rsvp-869et4322
    commit id: "feat(rsvp): ..."
    checkout staging
    merge feature/meeting-rsvp-869et4322 id: "PR + CI + review"
    checkout master
    merge staging id: "release: 1.3.0" tag: "v1.3.0"
    branch hotfix/login-loop-869et5000
    checkout hotfix/login-loop-869et5000
    commit id: "fix(auth): ..."
    checkout master
    merge hotfix/login-loop-869et5000 tag: "v1.3.1"
    checkout staging
    merge master id: "hotfix back to staging"
```

Where does this code go (§4.1)?

```mermaid
flowchart TD
    C([New code]) --> R{API route handler?}
    R -- yes --> API[src/app/api/.../route.ts<br/>through withApiRoute]
    R -- no --> PG{Page or layout?}
    PG -- yes --> APP[src/app/...]
    PG -- no --> UI{shadcn/ui primitive?}
    UI -- yes --> CUI[src/components/ui/]
    UI -- no --> TY{Type of a domain entity?}
    TY -- yes --> TYP[src/types/domain/entity.ts]
    TY -- no --> SH{Used by a second feature?}
    SH -- yes --> LIB[Promote to src/lib/ or<br/>src/components/ui/]
    SH -- no --> FEAT[src/features/domain/<br/>components, hooks, api, types.ts]
```

## Rules

### Repository structure (§4.1)

- **ITG-GIT-01** A repository SHALL hold one Next.js application organized by feature, with the layout in `steering/structure.md`. A monorepo (`apps/`, `packages/`) SHALL be used only when several deployable applications share packages (§4.1).
- **ITG-GIT-02** A feature folder `src/features/<domain>/` SHALL be self-contained, so that removing the feature removes one folder. Shared code SHALL be promoted to `src/lib` or `src/components/ui` only when a second feature needs it (§4.1).
- **ITG-GIT-03** Types SHALL be split by domain and entity in `src/types/<domain>/<entity>.ts`, re-exported by a small `src/types/<domain>/index.ts`; there SHALL be no single index file that holds every type (§4.1).
- **ITG-GIT-04** The project SHALL use the path alias `@/*` → `src/*` and TypeScript `strict: true` (§4.1).

### Branches, commits and versions (§4.2, §4.3)

- **ITG-GIT-05** Branches SHALL be `master` (production), `staging` (staging), short-lived `feature/<slug>-<clickup-id>` from `staging`, and `hotfix/<slug>-<clickup-id>` from `master`, merged back into `staging` (§4.2).
- **ITG-GIT-06** The flow SHALL be: feature branch → PR into `staging` → CI and review → merge (staging deploy) → QA on staging → PR `staging` into `master` → merge (production deploy) → smoke test (§4.2).
- **ITG-GIT-07** Commits SHALL follow Conventional Commits `type(scope): summary` with `feat`, `fix`, `refactor`, `chore`, `docs`, `ci`, `test` or `security`, and SHALL carry the ClickUp id in the scope or body (§4.3).
- **ITG-GIT-08** `CHANGELOG.md` SHALL follow Keep a Changelog; every PR SHALL add an entry under `Unreleased`, and CI SHALL fail a PR that changes `src/` without changing the changelog (§4.3).
- **ITG-GIT-09** The version in `package.json` SHALL be `X.Y.Z` (X breaking or contractual, Y feature, Z fix). The release commit SHALL be `release: X.Y.Z — <summary>`, move `Unreleased` under the version heading, and be tagged `vX.Y.Z` on `master` (§4.3).

### Pull requests and review (§4.4, §4.5)

- **ITG-GIT-10** Every code change SHALL go through a pull request with a clear title, the linked ClickUp task, a description, screenshots for UI changes, at least one reviewer and all required CI checks green. Direct pushes to `staging` and `master` SHALL be blocked by branch protection, or by the deploy workflow when the GitHub plan has none (ITG-CI-05) (§4.4).
- **ITG-GIT-11** The PR description SHALL use the template below (§4.4).
- **ITG-GIT-12** Reviewers SHALL check that the code solves the `REQ-*` it is traced to; is as simple as it can be and duplicates nothing in `src/lib` or `src/components/ui`; reads permissions from claims and checks them in the route wrapper; handles errors with typed `ApiRouteError`s and logs them; includes tests that came first; keeps sensitive data out of logs; leaves no dead code, unused exports, stale flags or old migrations; and has a clear user experience with every string in `src/locales/` in a multilingual product (§4.5).

### Code quality (§4.6)

- **ITG-GIT-13** A source file SHALL contain at most 500 lines of code (non-blank, non-comment), a function at most 50 lines, and a non-index file at most 10 distinct imported modules (§4.6; constitution VII-4 to VII-6).
- **ITG-GIT-14** A second copy of the same logic SHALL be a review blocker; extract it to `src/lib` or the feature folder (§4.6).
- **ITG-GIT-15** WHEN a behavior changes, the old code path, flag, migration helper, message key and test SHALL be removed in the same PR. A compatibility shim SHALL carry an expiry date in a code comment and a ClickUp task (§4.6).
- **ITG-GIT-16** `knip` SHALL run in CI and fail on unused files, exports and dependencies; Prettier `format:check` SHALL run in CI (§4.6).
- **ITG-GIT-17** `musubi validate` and `musubi gaps` SHALL run in CI, and requirements without tests or code without a requirement SHALL be reported on the PR (§4.6).

## Checklist

Pull request template (§4.4):

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

## Deviation

Record deviations as described in [README.md](README.md#deviations).
