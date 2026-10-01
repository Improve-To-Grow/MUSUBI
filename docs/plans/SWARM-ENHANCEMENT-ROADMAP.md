# Swarm Enhancement Roadmap

**Created**: 2025-12-09
**Based on**: SDD/Swarm Coding Research Analysis
**Goal**: OpenAI Agents SDK・AutoGen同等のマルチエージェントオーケストレーション能力 / Multi-agent orchestration capabilities on par with the OpenAI Agents SDK and AutoGen

---

## Phase 1: Handoff & Triage Patterns (v3.8.0)

### Sprint 1.1: Handoff Pattern Foundation

| Task ID | タスク / Task | 見積り / Estimate | 依存 / Depends on |
|---------|--------|--------|------|
| H-001 | `HandoffPattern` 基本クラス設計 / base class design | 2h | - |
| H-002 | `handoff()` 関数実装（エージェント委譲） / function implementation (agent delegation) | 3h | H-001 |
| H-003 | Handoff入力（EscalationData）実装 / Implement handoff input (EscalationData) | 2h | H-002 |
| H-004 | Input Filters（履歴フィルタリング）実装 / Implement Input Filters (history filtering) | 2h | H-003 |
| H-005 | `on_handoff` コールバック機構 / callback mechanism | 2h | H-002 |
| H-006 | Handoff イベント発行 / Emit handoff events | 1h | H-005 |
| H-007 | 単体テスト / Unit tests (handoff.test.js) | 3h | H-001〜H-006 |

**成果物 / Deliverables**:
```
src/orchestration/patterns/handoff.js
src/orchestration/handoff/
├── handoff-filters.js
├── escalation-data.js
└── index.js
tests/orchestration/patterns/handoff.test.js
```

### Sprint 1.2: Triage Pattern

| Task ID | タスク / Task | 見積り / Estimate | 依存 / Depends on |
|---------|--------|--------|------|
| T-001 | `TriagePattern` クラス設計 / class design | 2h | H-007 |
| T-002 | リクエスト分類ロジック実装 / Implement request classification logic | 3h | T-001 |
| T-003 | 専門エージェントルーティング / Specialist agent routing | 2h | T-002 |
| T-004 | フォールバックエージェント設定 / Fallback agent configuration | 1h | T-003 |
| T-005 | Triage→Handoff連携 / Triage→Handoff integration | 2h | T-003, H-002 |
| T-006 | 単体テスト / Unit tests (triage.test.js) | 2h | T-001〜T-005 |
| T-007 | E2Eテスト / E2E tests (triage-handoff-e2e.test.js) | 3h | T-006, H-007 |

**成果物 / Deliverables**:
```
src/orchestration/patterns/triage.js
tests/orchestration/patterns/triage.test.js
tests/e2e/triage-handoff-e2e.test.js
```

### Sprint 1.3: CLI & Documentation

| Task ID | タスク / Task | 見積り / Estimate | 依存 / Depends on |
|---------|--------|--------|------|
| D-001 | `musubi-orchestrate handoff` サブコマンド / subcommand | 2h | H-007 |
| D-002 | `musubi-orchestrate triage` サブコマンド / subcommand | 2h | T-006 |
| D-003 | Pattern Registry に登録 / Register in the Pattern Registry | 1h | T-006 |
| D-004 | ドキュメント作成 / Write documentation (handoff-guide.md) | 2h | D-001 |
| D-005 | CHANGELOG 更新 / Update CHANGELOG | 0.5h | D-004 |
| D-006 | バージョン更新 / Version bump → v3.8.0 | 0.5h | D-005 |

---

## Phase 2: Guardrails System (v3.9.0)

### Sprint 2.1: Input Guardrails

| Task ID | タスク / Task | 見積り / Estimate | 依存 / Depends on |
|---------|--------|--------|------|
| G-001 | `Guardrail` 基底クラス設計 / base class design | 2h | - |
| G-002 | `InputGuardrail` 実装 / implementation | 3h | G-001 |
| G-003 | 入力検証ルール DSL / Input validation rule DSL | 2h | G-002 |
| G-004 | 並列実行での早期終了 / Early termination during parallel execution | 2h | G-003 |
| G-005 | 単体テスト / Unit tests (input-guardrail.test.js) | 2h | G-002〜G-004 |

**成果物 / Deliverables**:
```
src/orchestration/guardrails/
├── base-guardrail.js
├── input-guardrail.js
├── guardrail-rules.js
└── index.js
tests/orchestration/guardrails/input-guardrail.test.js
```

### Sprint 2.2: Output Guardrails

| Task ID | タスク / Task | 見積り / Estimate | 依存 / Depends on |
|---------|--------|--------|------|
| G-006 | `OutputGuardrail` 実装 / implementation | 3h | G-001 |
| G-007 | 出力検証（安全チェック） / Output validation (safety checks) | 3h | G-006 |
| G-008 | Constitutional Articles との連携 / Integration with the Constitutional Articles | 2h | G-007 |
| G-009 | 単体テスト / Unit tests (output-guardrail.test.js) | 2h | G-006〜G-008 |

**成果物 / Deliverables**:
```
src/orchestration/guardrails/output-guardrail.js
src/orchestration/guardrails/safety-check.js
tests/orchestration/guardrails/output-guardrail.test.js
```

### Sprint 2.3: Guardrails Integration

| Task ID | タスク / Task | 見積り / Estimate | 依存 / Depends on |
|---------|--------|--------|------|
| G-010 | OrchestrationEngine への統合 / Integration into OrchestrationEngine | 3h | G-005, G-009 |
| G-011 | SwarmPattern への統合 / Integration into SwarmPattern | 2h | G-010 |
| G-012 | HandoffPattern への統合 / Integration into HandoffPattern | 2h | G-010 |
| G-013 | `musubi-validate guardrails` コマンド / command | 2h | G-010 |
| G-014 | E2Eテスト / E2E tests | 3h | G-010〜G-013 |
| G-015 | ドキュメント・CHANGELOG / Documentation & CHANGELOG | 2h | G-014 |

---

## Phase 3: Agent Loop (v4.0.0)

### Sprint 3.1: Agent Loop Core

| Task ID | タスク / Task | 見積り / Estimate | 依存 / Depends on |
|---------|--------|--------|------|
| A-001 | `AgentLoop` クラス設計 / class design | 3h | - |
| A-002 | ツール呼び出し→結果→LLM送信ループ / Tool call → result → send-to-LLM loop | 4h | A-001 |
| A-003 | 完了判定ロジック / Completion detection logic | 2h | A-002 |
| A-004 | 最大イテレーション制限 / Maximum iteration limit | 1h | A-002 |
| A-005 | タイムアウト処理 / Timeout handling | 1h | A-002 |
| A-006 | 単体テスト / Unit tests (agent-loop.test.js) | 3h | A-001〜A-005 |

**成果物 / Deliverables**:
```
src/agents/agent-loop.js
tests/agents/agent-loop.test.js
```

### Sprint 3.2: Function Tools Auto-Registration

| Task ID | タスク / Task | 見積り / Estimate | 依存 / Depends on |
|---------|--------|--------|------|
| F-001 | `@functionTool` デコレータ設計 / decorator design | 2h | - |
| F-002 | JSDoc→パラメータスキーマ変換 / JSDoc → parameter schema conversion | 3h | F-001 |
| F-003 | 型ヒント推論 / Type hint inference | 2h | F-002 |
| F-004 | ツール自動登録機構 / Automatic tool registration mechanism | 2h | F-003 |
| F-005 | 単体テスト / Unit tests | 2h | F-001〜F-004 |

**成果物 / Deliverables**:
```
src/agents/function-tool.js
src/agents/schema-generator.js
tests/agents/function-tool.test.js
```

### Sprint 3.3: Agent Loop Integration

| Task ID | タスク / Task | 見積り / Estimate | 依存 / Depends on |
|---------|--------|--------|------|
| A-007 | LLM Providers との統合 / Integration with LLM Providers | 3h | A-006, F-005 |
| A-008 | Guardrails との統合 / Integration with Guardrails | 2h | A-006, G-010 |
| A-009 | Handoff との統合 / Integration with Handoff | 2h | A-006, H-007 |
| A-010 | `musubi-agent run` コマンド / command | 2h | A-007 |
| A-011 | E2Eテスト / E2E tests | 4h | A-007〜A-010 |
| A-012 | ドキュメント・CHANGELOG / Documentation & CHANGELOG | 2h | A-011 |

---

## Phase 4: Advanced Integrations (v4.1.0)

### Sprint 4.1: MCP統合強化 (Enhanced MCP Integration)

| Task ID | タスク / Task | 見積り / Estimate | 依存 / Depends on |
|---------|--------|--------|------|
| M-001 | MCP Server Discovery | 3h | - |
| M-002 | MCP Tool Auto-Registration | 3h | M-001 |
| M-003 | MCP Context Provider | 2h | M-002 |
| M-004 | 既存MCPサーバー互換性テスト / Compatibility tests with existing MCP servers | 3h | M-003 |
| M-005 | ドキュメント / Documentation | 2h | M-004 |

**成果物 / Deliverables**:
```
src/integrations/mcp/
├── mcp-discovery.js
├── mcp-tool-registry.js
├── mcp-context-provider.js
└── index.js
```

### Sprint 4.2: Codebase Intelligence

| Task ID | タスク / Task | 見積り / Estimate | 依存 / Depends on |
|---------|--------|--------|------|
| C-001 | Repository Map Generator | 4h | - |
| C-002 | AST解析によるコード構造抽出 / Code structure extraction via AST analysis | 4h | C-001 |
| C-003 | Codebase Embedding（オプション） / (optional) | 6h | C-002 |
| C-004 | コンテキストウィンドウ最適化 / Context window optimization | 3h | C-001 |
| C-005 | 単体テスト / Unit tests | 3h | C-001〜C-004 |
| C-006 | E2Eテスト・ドキュメント / E2E tests & documentation | 3h | C-005 |

**成果物 / Deliverables**:
```
src/analyzers/repository-map.js
src/analyzers/ast-extractor.js
src/analyzers/codebase-embedding.js (optional)
```

---

## 総見積り (Total Estimate)

| Phase | バージョン / Version | 機能 / Features | 見積り時間 / Estimated time |
|-------|-----------|------|-----------|
| Phase 1 | v3.8.0 | Handoff + Triage | ~35h |
| Phase 2 | v3.9.0 | Guardrails | ~34h |
| Phase 3 | v4.0.0 | Agent Loop + Function Tools | ~40h |
| Phase 4 | v4.1.0 | MCP強化 + Codebase Intel / MCP enhancements + Codebase Intel | ~36h |
| **合計 / Total** | | | **~145h** |

---

## 優先順位付きタスクリスト（Phase 1 開始用） (Prioritized Task List for Starting Phase 1)

### 🔴 Must Have (P0)

1. **H-001**: HandoffPattern 基本クラス設計 / base class design
2. **H-002**: handoff() 関数実装 / function implementation
3. **T-001**: TriagePattern クラス設計 / class design
4. **T-002**: リクエスト分類ロジック / Request classification logic

### 🟠 Should Have (P1)

5. **H-003**: Handoff入力実装 / Implement handoff input
6. **H-004**: Input Filters
7. **T-003**: 専門エージェントルーティング / Specialist agent routing
8. **T-005**: Triage→Handoff連携 / Triage→Handoff integration

### 🟡 Nice to Have (P2)

9. **H-005**: on_handoff コールバック / callback
10. **T-004**: フォールバックエージェント / Fallback agent
11. **D-004**: ドキュメント作成 / Write documentation

---

## 次のアクション (Next Actions)

1. [ ] Phase 1 Sprint 1.1 開始 / Start Phase 1 Sprint 1.1
2. [ ] H-001: HandoffPattern 基本クラス設計から着手 / Begin with H-001: HandoffPattern base class design
3. [ ] ブランチ作成 / Create branch: `feature/handoff-triage-patterns`
