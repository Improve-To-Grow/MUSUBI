# ADR-P0-B001: Adoption of OpenHands-Derived Features

| Item | Content |
|------|------|
| **ADR ID** | ADR-P0-B001 |
| **Status** | Approved |
| **Decision Date** | 2025-12-07 |
| **Decision Makers** | MUSUBI Team |
| **Target Requirements** | REQ-P0-B001 ~ REQ-P0-B008 |

---

## 1. Context

MUSUBI has matured as a Specification Driven Development (SDD) framework, but it lacked features to improve the execution quality of AI agents. Competitive analysis showed that adopting the following features from OpenHands (which achieved 72.8% on SWE-Bench) would significantly improve MUSUBI's competitiveness.

### Features to Adopt

1. **Stuck Detection System** - Detect infinite loops in agents
2. **Keyword-Triggered Skills** - Conversation-based skill activation
3. **Repository-Specific Skills** - Project-specific knowledge management
4. **Memory Condenser** - Context compression
5. **Critic (Evaluation) System** - Scoring of output quality
6. **Automatic GitHub Issue Resolution** - Automatic PR generation
7. **Security Risk Analyzer** - Security evaluation
8. **Agent Memory** - Persistence of session learnings

---

## 2. Decision

Adopt the eight OpenHands features in MUSUBI v2.2.0.

### 2.1 Architecture Decisions

| Item | Decision | Reason |
|------|------|------|
| **Language** | JavaScript (Node.js) | Consistency with the existing codebase |
| **Module structure** | No new directories | Add to existing `src/analyzers/`, `src/managers/`, `src/validators/` |
| **Configuration format** | YAML (`project.yml`) | Extend the existing configuration system |
| **Skill format** | Markdown + YAML frontmatter | Same format as OpenHands to ensure compatibility |

### 2.2 Naming Conventions

| OpenHands | MUSUBI |
|-----------|--------|
| Microagent | Skill |
| stuck.py | stuck-detector.js |
| condenser.py | memory-condenser.js |
| critic/ | critic-system.js |
| resolver/ | issue-resolver.js |
| security/ | security-analyzer.js |

### 2.3 Directory Structure

```
.musubi/           # Repository-specific configuration and skills
  └── skills/
      └── repo.md

steering/          # Project memory (existing)
  └── memories/
      ├── quality_report.md   # Critic output
      └── session_learnings.md # AgentMemory output
```

---

## 3. Options Considered

### Option A: Add OpenHands as-is as a dependency

**Benefits:**
- Minimal implementation cost
- Automatic updates

**Disadvantages:**
- Python dependency (MUSUBI uses Node.js)
- Includes all OpenHands features (excessive)
- Complicates licensing

**Verdict:** Rejected

### Option B: Reimplement OpenHands features in JavaScript

**Benefits:**
- Integration with the Node.js ecosystem
- Optimized for MUSUBI's architecture
- Adopt only the necessary features

**Disadvantages:**
- Implementation cost
- Maintenance burden

**Verdict:** Adopted

### Option C: Integrate via MCP (Model Context Protocol)

**Benefits:**
- Loose coupling
- Language independent

**Disadvantages:**
- Additional complexity
- Network dependency

**Verdict:** Consider in the future

---

## 4. Consequences

### 4.1 Positive Consequences

- Improved agent quality (stuck detection, critic)
- Improved developer experience (keyword triggers, agent memory)
- Improved security (security analyzer)
- Improved automation (issue resolution)

### 4.2 Risks and Mitigations

| Risk | Impact | Mitigation |
|--------|-------|--------|
| Implementation delays | Medium | Phase splitting, MVP first |
| Performance degradation | Low | Lazy evaluation, caching |
| User confusion | Low | Incremental rollout, documentation |

### 4.3 Impact on Dependencies

- No new dependencies in `package.json` (standard library only)
- No impact on existing CLI commands
- New CLI commands: `musubi-resolve`, `musubi-remember`

---

## 5. Implementation Plan

### Phase 1 (Week 1-2): Core Features

- [ ] REQ-P0-B001: Stuck Detection System
- [ ] REQ-P0-B002: Keyword-Triggered Skills
- [ ] REQ-P0-B003: Repository-Specific Skills

### Phase 2 (Week 3-4): Quality Features

- [ ] REQ-P0-B004: Memory Condenser
- [ ] REQ-P0-B005: Critic (Evaluation) System
- [ ] REQ-P0-B008: Agent Memory

### Phase 3 (Week 5-6): Automation Features

- [ ] REQ-P0-B006: Automatic GitHub Issue Resolution
- [ ] REQ-P0-B007: Security Risk Analyzer

---

## 6. Success Metrics

| Metric | Target | Measurement Method |
|------|--------|----------|
| Stuck detection accuracy | 95%+ | Test cases |
| Skill activation accuracy | 90%+ | User feedback |
| Critic score correlation | 0.8+ | Comparison with manual evaluation |
| Issue resolution success rate | 60%+ | Automatic PR approval rate |

---

## 7. References

- [OpenHands GitHub](https://github.com/OpenHands/OpenHands)
- [OpenHands Skills README](https://github.com/OpenHands/OpenHands/blob/main/skills/README.md)
- [OpenHands Stuck Detector](https://github.com/OpenHands/OpenHands/blob/main/openhands/controller/stuck.py)
- [OpenHands Resolver](https://github.com/OpenHands/OpenHands/blob/main/openhands/resolver/README.md)

---

## 8. Document History

| Version | Date | Author | Changes |
|-----------|------|--------|----------|
| 1.0 | 2025-12-07 | MUSUBI Team | Initial version |

---

*- End of ADR -*
