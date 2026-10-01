# MUSUBI P1 Roadmap - Feature Differentiation Phase

## Overview

This document defines the implementation roadmap for the P1 (High Priority) requirements of MUSUBI v2.5.0 – v3.0.0.

### P1 Requirements List

| ID | Requirement | Effort | Dependencies | Target | Status |
|----|--------|------|----------|-----------|------|
| REQ-P1-001 | Browser Automation Agent | 4 weeks | None | v3.0.0 | ✅ Done |
| REQ-P1-002 | Web GUI Dashboard | 4 weeks | None | v3.0.0 | ✅ Done |
| REQ-P1-003 | VS Code Extension | 3 weeks | None | v2.2.0 | ✅ Done |
| REQ-P1-004 | Spec Kit Compatibility | 3 weeks | None | v2.2.0 | ✅ Done |

**All P1 requirements completed** 🎉

## Completion Summary

### REQ-P1-001 Browser Automation Agent ✅
- **Commit**: af4c26c
- **Deliverables**:
  - `src/agents/browser-agent.js` - Playwright integration
  - `src/templates/skills/browser-agent.md` - Claude Code skill
  - E2E test generation, screenshot comparison

### REQ-P1-002 Web GUI Dashboard ✅
- **Commit**: 9204e3f
- **Deliverables**:
  - `bin/musubi-gui.js` - CLI (start, dev, status, matrix)
  - `src/gui/server.js` - Express + WebSocket server
  - `src/gui/services/` - ProjectScanner, FileWatcher, WorkflowService, TraceabilityService
  - REST API: /api/project, /api/specs, /api/traceability, /api/workflow, /api/steering

### REQ-P1-003 VS Code Extension ✅
- **Published**: VS Code Marketplace
- **Deliverables**:
  - Sidebar, status bar, and command palette integration
  - SDD workflow commands

### REQ-P1-004 Spec Kit Compatibility ✅
- **Commit**: 86b3721
- **Deliverables**:
  - `src/managers/speckit-manager.js` - Conversion manager
  - `musubi-convert` command
  - Bidirectional MUSUBI ↔ Spec Kit conversion

---

## Timeline (Actual)

```
2025 Q1
├── January: REQ-P1-003 VS Code Extension (3 weeks)
│   ├── Week 1-2: Foundation + sidebar
│   └── Week 3: Status bar + publishing
│
├── February: REQ-P1-004 Spec Kit Compatibility (3 weeks)
│   ├── Week 1: IR schema + parser
│   ├── Week 2: Writer + mapper
│   └── Week 3: Validation + round-trip
│
└── March: REQ-P1-001 Browser Automation (4 weeks)
    ├── Week 1-2: Playwright integration
    └── Week 3-4: Screenshot comparison + AI

2025 Q2
├── April: REQ-P1-002 Web GUI Dashboard (4 weeks)
│   ├── Week 1-2: Server + basic UI
│   └── Week 3-4: Visualization
│
└── May: v3.0.0 release preparation
    ├── Integration testing
    ├── Documentation
    └── Release
```

## Rationale for Implementation Order

### 1. REQ-P1-003 VS Code Extension (Top Priority)

**Reasons**:
- ✅ High impact: Integrates directly into developers' daily workflow
- ✅ Medium complexity: Can be implemented as a wrapper around the existing CLI
- ✅ Marketing effect: Publishing on the Marketplace expands reach
- ✅ No dependencies: Can be developed independently

**Deliverables**:
- Published on VS Code Marketplace
- Sidebar, status bar, command palette

### 2. REQ-P1-004 Spec Kit Compatibility (Second)

**Reasons**:
- ✅ Ecosystem integration: Compatibility with GitHub's official tool
- ✅ Migration path: Attracts Spec Kit users
- ✅ Technical learning: Knowledge from the conversion system can be applied to other formats
- ✅ Medium effort: Can be completed in 3 weeks

**Deliverables**:
- `musubi-convert` command
- Bidirectional MUSUBI ↔ Spec Kit conversion

### 3. REQ-P1-001 Browser Automation (Third)

**Reasons**:
- ✅ Differentiating feature: Unique capability not found in competing tools
- ⚠️ High complexity: Playwright integration, AI screenshot comparison
- ⚠️ Requires 4 weeks of effort
- ✅ High demand for E2E test automation

**Deliverables**:
- `browser-agent` Claude Code skill
- Playwright test code generation
- Screenshot comparison (95%+ accuracy)

### 4. REQ-P1-002 Web GUI Dashboard (Last)

**Reasons**:
- ✅ A complementary feature once the CLI/Extension is complete
- ⚠️ Largest effort: Requires frontend development
- ✅ Visualization conveys MUSUBI's value intuitively
- ✅ UI integration is easier once the other features are complete

**Deliverables**:
- `musubi-gui` command
- Dashboard (localhost:3000)
- Traceability matrix visualization

---

## REQ-P1-003: VS Code Extension Detailed Plan

### Design Documents

- [ADR-P1-003: VS Code Extension](./adr/ADR-P1-003-vscode-extension.md)
- [REQ-P1-003 Design Document](./REQ-P1-003-vscode-extension-design.md)

### Milestones

| Week | Deliverable | Acceptance Criteria |
|------|--------|----------|
| 1 | Project foundation | TypeScript build succeeds |
| 1 | Sidebar TreeView | steering/ displayed |
| 2 | Status bar | Constitution compliance rate displayed |
| 2 | Command palette | /sdd-* commands work |
| 3 | Packaging | .vsix generated |
| 3 | Marketplace publishing | "MUSUBI SDD" published |

### Tech Stack

- **Language**: TypeScript 5.x
- **Framework**: VS Code Extension API
- **Webview**: React 18
- **Build**: esbuild
- **Testing**: @vscode/test-electron

### Risks

| Risk | Probability | Impact | Mitigation |
|--------|------|------|------|
| Marketplace review delay | Medium | Low | Schedule with buffer |
| API compatibility issues | Low | Medium | Target the latest stable VS Code |

---

## REQ-P1-004: Spec Kit Compatibility Detailed Plan

### Design Documents

- [ADR-P1-004: Spec Kit Compatibility](./adr/ADR-P1-004-speckit-compatibility.md)
- [REQ-P1-004 Design Document](./REQ-P1-004-speckit-compatibility-design.md)

### Milestones

| Week | Deliverable | Acceptance Criteria |
|------|--------|----------|
| 1 | IR schema | TypeScript type definitions complete |
| 1 | Spec Kit parser | constitution.md parsed successfully |
| 2 | MUSUBI writer | steering/ generated |
| 2 | Constitution mapper | 9-article mapping |
| 2 | Requirements mapper | EARS ↔ User Stories |
| 3 | CLI implementation | musubi-convert works |
| 3 | Round-trip tests | 95%+ similarity |

### Tech Stack

- **Language**: JavaScript (ES Modules)
- **CLI**: Commander.js
- **Parser**: marked (Markdown)
- **Testing**: Jest

### Risks

| Risk | Probability | Impact | Mitigation |
|--------|------|------|------|
| Spec Kit specification changes | Medium | Medium | Version pinning, abstraction layer |
| Information loss | Low | High | Thorough round-trip testing |

---

## REQ-P1-001: Browser Automation Agent Detailed Plan

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                   Browser Agent Skill                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ NL Command  │  │ Playwright  │  │  Screenshot     │ │
│  │ Interpreter │──│   Driver    │──│  Comparator     │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│         │                │                   │          │
│  ┌──────┴──────┐  ┌─────┴─────┐     ┌──────┴──────┐   │
│  │ LLM Action  │  │ Browser   │     │ AI Vision   │   │
│  │ Parser      │  │ Context   │     │ (GPT-4V)    │   │
│  └─────────────┘  └───────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Milestones

| Week | Deliverable | Acceptance Criteria |
|------|--------|----------|
| 1 | Playwright integration foundation | Browser launches successfully |
| 1 | NL command parser | Basic operations parsed |
| 2 | Browser operation implementation | click/type/navigate work |
| 2 | Context management | Multiple tabs/pages supported |
| 3 | Screenshot capture | Automatic capture |
| 3 | AI comparison engine | GPT-4V integration |
| 4 | E2E code generation | Playwright test output |
| 4 | Claude Code skill registration | browser-agent works |

### Tech Stack

- **Browser automation**: Playwright
- **AI vision**: GPT-4V / Claude 3 Vision
- **Test generation**: Playwright Test format
- **Skill integration**: Claude Code Skills API

### Risks

| Risk | Probability | Impact | Mitigation |
|--------|------|------|------|
| Insufficient AI comparison accuracy | Medium | High | Combine multiple models, tune thresholds |
| Playwright version compatibility | Low | Medium | Version pinning |
| Cost (Vision API) | Medium | Medium | Caching, batch processing |

---

## REQ-P1-002: Web GUI Dashboard Detailed Plan

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                     musubi-gui                           │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │                  Frontend (React)                │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │   │
│  │  │Dashboard│  │Workflow │  │  Traceability   │  │   │
│  │  │  Panel  │  │ Editor  │  │     Matrix      │  │   │
│  │  └─────────┘  └─────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │                 Backend (Express)                │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │   │
│  │  │  REST   │  │WebSocket│  │  File Watcher   │  │   │
│  │  │   API   │  │  (Live) │  │   (steering/)   │  │   │
│  │  └─────────┘  └─────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Milestones

| Week | Deliverable | Acceptance Criteria |
|------|--------|----------|
| 1 | Express server | Starts on localhost:3000 |
| 1 | REST API foundation | /api/steering GET |
| 2 | React frontend | Dashboard displayed |
| 2 | File watcher | Changes reflected in real time |
| 3 | Workflow editor | Drag & drop |
| 3 | WebSocket integration | Live updates |
| 4 | Traceability visualization | D3.js graph |
| 4 | Integration tests | E2E tests pass |

### Tech Stack

- **Backend**: Express.js, WebSocket
- **Frontend**: React 18, Tailwind CSS
- **Visualization**: D3.js, React Flow
- **Build**: Vite
- **Testing**: Playwright (E2E)

### Risks

| Risk | Probability | Impact | Mitigation |
|--------|------|------|------|
| Frontend effort overrun | Medium | Medium | MVP first, staged releases |
| Browser compatibility | Low | Low | Support major browsers only |

---

## Milestones & Release Plan

### v2.5.0 (End of January 2025)

**Key feature**: VS Code Extension
- ✅ Published on VS Code Marketplace
- ✅ Sidebar TreeView
- ✅ Status bar
- ✅ Command palette integration

### v2.6.0 (Mid-February 2025)

**Key feature**: Spec Kit Compatibility
- ✅ musubi-convert CLI
- ✅ MUSUBI → Spec Kit export
- ✅ Spec Kit → MUSUBI import
- ✅ Round-trip validation

### v2.7.0 (End of March 2025)

**Key feature**: Browser Automation Agent
- ✅ browser-agent skill
- ✅ Playwright integration
- ✅ Screenshot comparison
- ✅ E2E test code generation

### v2.8.0 (End of April 2025)

**Key feature**: Web GUI Dashboard
- ✅ musubi-gui command
- ✅ Dashboard
- ✅ Workflow editor
- ✅ Traceability visualization

### v3.0.0 (May 2025)

**Major release**: Integration of all P1 features
- Integration testing of all P1 features
- Documentation
- Performance optimization
- General availability release

---

## Resource Plan

### Development Resources

| Role | Effort | Phases |
|------|------|-------------|
| Core development | 100% | All phases |
| Frontend | 40% | P1-002, P1-003 |
| Testing/QA | 20% | All phases |

### External Resources

| Resource | Purpose | Cost |
|----------|------|--------|
| VS Code Marketplace | Extension publishing | Free |
| GitHub Actions | CI/CD | Free (OSS) |
| OpenAI API | Vision comparison | Pay-as-you-go |

---

## Success Metrics (KPI)

### P1 Completion Criteria

| Metric | Target | Measurement Method |
|------|-----------|----------|
| VS Code installs | 1,000+ | Marketplace statistics |
| Spec Kit conversion success rate | 95%+ | Round-trip tests |
| Browser Agent accuracy | 95%+ | Screenshot comparison tests |
| GUI user satisfaction | 4.0+/5.0 | Feedback survey |

### v3.0.0 Release Criteria

| Criterion | Status |
|------|------|
| Acceptance criteria met for all P1 requirements | ☐ |
| All unit tests pass | ☐ |
| All integration tests pass | ☐ |
| Documentation complete | ☐ |
| Security review complete | ☐ |

---

## Next Actions

1. **Immediately**: Start implementing REQ-P1-003 VS Code Extension
2. **Week 1**: Create project structure, TypeScript configuration
3. **Week 2**: Implement sidebar TreeView
4. **Week 3**: Prepare for Marketplace publishing

---

## Related Documents

- [SRS v3.0.0](../requirements/srs/srs-musubi-v3.0.0.md)
- [Project Plan v3.0.0](../plans/project-plan-v3.0.0.md)
- [ADR-P1-003: VS Code Extension](./adr/ADR-P1-003-vscode-extension.md)
- [ADR-P1-004: Spec Kit Compatibility](./adr/ADR-P1-004-speckit-compatibility.md)
