# Swarm Enhancement Roadmap

**Created**: 2025-12-09
**Based on**: SDD/Swarm Coding Research Analysis
**Goal**: Multi-agent orchestration capabilities on par with OpenAI Agents SDK and AutoGen

---

## Phase 1: Handoff & Triage Patterns (v3.8.0)

### Sprint 1.1: Handoff Pattern Foundation

| Task ID | Task | Estimate | Depends On |
|---------|--------|--------|------|
| H-001 | `HandoffPattern` base class design | 2h | - |
| H-002 | `handoff()` function implementation (agent delegation) | 3h | H-001 |
| H-003 | Handoff input (EscalationData) implementation | 2h | H-002 |
| H-004 | Input Filters (history filtering) implementation | 2h | H-003 |
| H-005 | `on_handoff` callback mechanism | 2h | H-002 |
| H-006 | Handoff event emission | 1h | H-005 |
| H-007 | Unit tests (handoff.test.js) | 3h | H-001 to H-006 |

**Deliverables**:
```
src/orchestration/patterns/handoff.js
src/orchestration/handoff/
├── handoff-filters.js
├── escalation-data.js
└── index.js
tests/orchestration/patterns/handoff.test.js
```

### Sprint 1.2: Triage Pattern

| Task ID | Task | Estimate | Depends On |
|---------|--------|--------|------|
| T-001 | `TriagePattern` class design | 2h | H-007 |
| T-002 | Request classification logic implementation | 3h | T-001 |
| T-003 | Specialist agent routing | 2h | T-002 |
| T-004 | Fallback agent configuration | 1h | T-003 |
| T-005 | Triage→Handoff integration | 2h | T-003, H-002 |
| T-006 | Unit tests (triage.test.js) | 2h | T-001 to T-005 |
| T-007 | E2E tests (triage-handoff-e2e.test.js) | 3h | T-006, H-007 |

**Deliverables**:
```
src/orchestration/patterns/triage.js
tests/orchestration/patterns/triage.test.js
tests/e2e/triage-handoff-e2e.test.js
```

### Sprint 1.3: CLI & Documentation

| Task ID | Task | Estimate | Depends On |
|---------|--------|--------|------|
| D-001 | `musubi-orchestrate handoff` subcommand | 2h | H-007 |
| D-002 | `musubi-orchestrate triage` subcommand | 2h | T-006 |
| D-003 | Register in Pattern Registry | 1h | T-006 |
| D-004 | Write documentation (handoff-guide.md) | 2h | D-001 |
| D-005 | Update CHANGELOG | 0.5h | D-004 |
| D-006 | Version update → v3.8.0 | 0.5h | D-005 |

---

## Phase 2: Guardrails System (v3.9.0)

### Sprint 2.1: Input Guardrails

| Task ID | Task | Estimate | Depends On |
|---------|--------|--------|------|
| G-001 | `Guardrail` base class design | 2h | - |
| G-002 | `InputGuardrail` implementation | 3h | G-001 |
| G-003 | Input validation rule DSL | 2h | G-002 |
| G-004 | Early termination in parallel execution | 2h | G-003 |
| G-005 | Unit tests (input-guardrail.test.js) | 2h | G-002 to G-004 |

**Deliverables**:
```
src/orchestration/guardrails/
├── base-guardrail.js
├── input-guardrail.js
├── guardrail-rules.js
└── index.js
tests/orchestration/guardrails/input-guardrail.test.js
```

### Sprint 2.2: Output Guardrails

| Task ID | Task | Estimate | Depends On |
|---------|--------|--------|------|
| G-006 | `OutputGuardrail` implementation | 3h | G-001 |
| G-007 | Output validation (safety checks) | 3h | G-006 |
| G-008 | Integration with Constitutional Articles | 2h | G-007 |
| G-009 | Unit tests (output-guardrail.test.js) | 2h | G-006 to G-008 |

**Deliverables**:
```
src/orchestration/guardrails/output-guardrail.js
src/orchestration/guardrails/safety-check.js
tests/orchestration/guardrails/output-guardrail.test.js
```

### Sprint 2.3: Guardrails Integration

| Task ID | Task | Estimate | Depends On |
|---------|--------|--------|------|
| G-010 | Integration into OrchestrationEngine | 3h | G-005, G-009 |
| G-011 | Integration into SwarmPattern | 2h | G-010 |
| G-012 | Integration into HandoffPattern | 2h | G-010 |
| G-013 | `musubi-validate guardrails` command | 2h | G-010 |
| G-014 | E2E tests | 3h | G-010 to G-013 |
| G-015 | Documentation and CHANGELOG | 2h | G-014 |

---

## Phase 3: Agent Loop (v4.0.0)

### Sprint 3.1: Agent Loop Core

| Task ID | Task | Estimate | Depends On |
|---------|--------|--------|------|
| A-001 | `AgentLoop` class design | 3h | - |
| A-002 | Loop: tool call → result → send to LLM | 4h | A-001 |
| A-003 | Completion determination logic | 2h | A-002 |
| A-004 | Maximum iteration limit | 1h | A-002 |
| A-005 | Timeout handling | 1h | A-002 |
| A-006 | Unit tests (agent-loop.test.js) | 3h | A-001 to A-005 |

**Deliverables**:
```
src/agents/agent-loop.js
tests/agents/agent-loop.test.js
```

### Sprint 3.2: Function Tools Auto-Registration

| Task ID | Task | Estimate | Depends On |
|---------|--------|--------|------|
| F-001 | `@functionTool` decorator design | 2h | - |
| F-002 | JSDoc → parameter schema conversion | 3h | F-001 |
| F-003 | Type hint inference | 2h | F-002 |
| F-004 | Automatic tool registration mechanism | 2h | F-003 |
| F-005 | Unit tests | 2h | F-001 to F-004 |

**Deliverables**:
```
src/agents/function-tool.js
src/agents/schema-generator.js
tests/agents/function-tool.test.js
```

### Sprint 3.3: Agent Loop Integration

| Task ID | Task | Estimate | Depends On |
|---------|--------|--------|------|
| A-007 | Integration with LLM Providers | 3h | A-006, F-005 |
| A-008 | Integration with Guardrails | 2h | A-006, G-010 |
| A-009 | Integration with Handoff | 2h | A-006, H-007 |
| A-010 | `musubi-agent run` command | 2h | A-007 |
| A-011 | E2E tests | 4h | A-007 to A-010 |
| A-012 | Documentation and CHANGELOG | 2h | A-011 |

---

## Phase 4: Advanced Integrations (v4.1.0)

### Sprint 4.1: MCP Integration Enhancement

| Task ID | Task | Estimate | Depends On |
|---------|--------|--------|------|
| M-001 | MCP Server Discovery | 3h | - |
| M-002 | MCP Tool Auto-Registration | 3h | M-001 |
| M-003 | MCP Context Provider | 2h | M-002 |
| M-004 | Existing MCP server compatibility tests | 3h | M-003 |
| M-005 | Documentation | 2h | M-004 |

**Deliverables**:
```
src/integrations/mcp/
├── mcp-discovery.js
├── mcp-tool-registry.js
├── mcp-context-provider.js
└── index.js
```

### Sprint 4.2: Codebase Intelligence

| Task ID | Task | Estimate | Depends On |
|---------|--------|--------|------|
| C-001 | Repository Map Generator | 4h | - |
| C-002 | Code structure extraction via AST analysis | 4h | C-001 |
| C-003 | Codebase Embedding (optional) | 6h | C-002 |
| C-004 | Context window optimization | 3h | C-001 |
| C-005 | Unit tests | 3h | C-001 to C-004 |
| C-006 | E2E tests and documentation | 3h | C-005 |

**Deliverables**:
```
src/analyzers/repository-map.js
src/analyzers/ast-extractor.js
src/analyzers/codebase-embedding.js (optional)
```

---

## Total Estimate

| Phase | Version | Features | Estimated Time |
|-------|-----------|------|-----------|
| Phase 1 | v3.8.0 | Handoff + Triage | ~35h |
| Phase 2 | v3.9.0 | Guardrails | ~34h |
| Phase 3 | v4.0.0 | Agent Loop + Function Tools | ~40h |
| Phase 4 | v4.1.0 | MCP enhancement + Codebase Intel | ~36h |
| **Total** | | | **~145h** |

---

## Prioritized Task List (to Start Phase 1)

### 🔴 Must Have (P0)

1. **H-001**: HandoffPattern base class design
2. **H-002**: handoff() function implementation
3. **T-001**: TriagePattern class design
4. **T-002**: Request classification logic

### 🟠 Should Have (P1)

5. **H-003**: Handoff input implementation
6. **H-004**: Input Filters
7. **T-003**: Specialist agent routing
8. **T-005**: Triage→Handoff integration

### 🟡 Nice to Have (P2)

9. **H-005**: on_handoff callback
10. **T-004**: Fallback agent
11. **D-004**: Documentation

---

## Next Actions

1. [ ] Start Phase 1 Sprint 1.1
2. [ ] H-001: Begin with HandoffPattern base class design
3. [ ] Create branch: `feature/handoff-triage-patterns`
