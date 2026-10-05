---
layout: home

hero:
  name: MUSUBI
  text: Ultimate Specification Driven Development
  tagline: 7 AI Agents × 25 Skills × Constitutional Governance
  image:
    src: /logo.svg
    alt: MUSUBI
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/nahisaho/MUSUBI

features:
  - icon: 🤖
    title: 7 AI Coding Agents
    details: Claude Code, GitHub Copilot, Cursor, Gemini CLI, Codex CLI, Qwen Code, Windsurf - one unified workflow
  - icon: 📋
    title: 25 Specialized Skills
    details: From requirements to deployment - orchestrator, architect, developer, tester, security auditor, and more
  - icon: ⚖️
    title: Constitutional Governance
    details: 9 immutable articles ensure quality, consistency, and traceability across all projects
  - icon: 📝
    title: EARS Requirements
    details: Unambiguous requirements with 5 patterns - Event-driven, State-driven, Unwanted, Optional, Ubiquitous
  - icon: 🔍
    title: 100% Traceability
    details: Complete mapping from Requirements → Design → Code → Tests with gap detection
  - icon: 🔄
    title: Brownfield Ready
    details: Delta specifications and change management for existing codebases
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>

## Quick Start

```bash
# Install and initialize
musubi-sdd init

# Use SDD commands with your AI agent
# Claude Code:     /sdd-requirements, /sdd-design, /sdd-implement
# GitHub Copilot:  #sdd-requirements, #sdd-design, #sdd-implement
```

## SDD Workflow

```
Requirements → Design → Tasks → Implement → Test → Review → Deploy
     ↓           ↓        ↓         ↓          ↓       ↓
   EARS       C4+ADR   Breakdown  Test-First  Verify  Release
```

## Why MUSUBI?

| Challenge | MUSUBI Solution |
|-----------|-----------------|
| Fragmented AI tools | 7 agents, 1 unified workflow |
| Ambiguous requirements | EARS format with 5 patterns |
| Lost traceability | 100% Req→Design→Code→Test mapping |
| Quality inconsistency | 9 Constitutional Articles |
| Brownfield challenges | Delta specs + Change management |
