# Product Context

**Project**: MUSUBI (ITG fork)
**Last Updated**: 2026-10-08
**Version**: 1.1

---

## Product Vision

**Vision**: every Improve to Grow (ITG) client project starts from the same specification-driven delivery system, and AI agents apply the ITG Software Delivery Playbook without being asked.

**Mission**: ship a fork of MUSUBI (Specification Driven Development) whose `musubi init` installs the ITG standard: steering templates with the ITG default stack, the playbook's policies as agent rules (`steering/rules/itg/`), the constitution with the `application` profile, and Mermaid C4 design output.

---

## Product Overview

### What is this fork?

`Improve-To-Grow/MUSUBI`, branch `ITG-adjustments`, package `@improve-to-grow/musubi-sdd` (private, installed from GitHub, versioned `<upstream base>-itg.<N>`). It tracks upstream MUSUBI and adds ITG's delivery standard.

### Problem Statement

ITG builds AI-focused platforms on Next.js, Cloudflare Workers, Firebase, Azure Communication Services, Vertex AI and n8n. Without a shared standard, every project re-decides hosting, auth, logging, CI and documentation, and AI agents generate code for whatever stack their examples show (Prisma, JWT, Redis).

### Solution

The ITG Software Delivery Playbook (`docs/itg/ITG_Software_Delivery_Playbook.md`) is the source of truth. This fork turns it into:

- **Steering templates** (`src/templates/shared/steering/`): `tech.md`, `structure.md` and `product.md` start from the ITG defaults, with a Deviations table
- **Policy files** (`src/templates/shared/steering/rules/itg/`): one file per playbook area, with `ITG-*` rule ids, Mermaid decision diagrams and checklists
- **Agent instructions**: every skill, command and `AGENTS.md` points to the policies; design commands produce Mermaid C4
- **Scaffolding** (planned): CI check scripts, PR template, deploy workflow outline, `.env.example`

---

## Target Users

| User | Goal |
|---|---|
| ITG developers | Run `musubi init` in a new repository and get the ITG standard, then work with `/sdd-*` commands |
| AI coding agents (Claude Code first, then the other six platforms) | Read steering and the ITG policies before every task and apply them |
| ITG tech leads (playbook owners) | Change a policy once in the playbook and have every new project and agent follow it |

---

## Core Product Capabilities

- `musubi init` installs ITG steering, policies and constitution rules for all seven platforms
- `musubi-onboard` installs the policies into existing projects and opens a Deviations table
- `/sdd-requirements`, `/sdd-design`, `/sdd-tasks`, `/sdd-implement`, `/sdd-validate` follow the ITG policies and cite rule ids
- `musubi validate` enforces the constitution (Article VII code limits, traceability)

---

## Success Metrics

| Metric | Target |
|---|---|
| New ITG projects initialized from the fork | 100% |
| Playbook changes released in the fork in the same change set | 100% (`tests/itg/playbook-sync.test.js` guards the version) |
| Generated designs that use Mermaid C4 and cite ITG rule ids | Every design |

---

## Constraints

- The playbook copy in `docs/itg/` is identical to the canonical source; see `steering/rules/itg-fork.md`
- English only (`tests/language-policy.test.js`)
- Upstream MUSUBI behavior is kept where ITG has no rule, so upstream releases can still be merged

---

## Stakeholders

| Role | Responsibility |
|---|---|
| ITG playbook owners | Approve playbook changes and their version |
| Fork maintainers | Implement playbook changes in templates, release `-itg.N` |
| ITG project teams | Report gaps between the playbook and what agents generate |

---

## Release Notes

Release history is kept in [CHANGELOG.md](../CHANGELOG.md); playbook history in [docs/itg/PLAYBOOK_CHANGELOG.md](../docs/itg/PLAYBOOK_CHANGELOG.md).
