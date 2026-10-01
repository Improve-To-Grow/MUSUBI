# ADR-6.2-001: Review Gate Architecture

**ADR ID**: ADR-6.2-001
**Status**: Proposed
**Created**: 2025-12-31
**Author**: MUSUBI Team
**Requirements**: IMP-6.2-001-01, IMP-6.2-001-02, IMP-6.2-001-03, IMP-6.2-001-04

---

## Context

MUSUBI SDDワークフローには現在、明示的なレビューゲートが存在しません。YAGOKOROプロジェクト（v1.0.0〜v5.0.0）の開発経験から、以下の問題が特定されました：

The MUSUBI SDD workflow currently has no explicit review gates. Development experience on the YAGOKORO project (v1.0.0–v5.0.0) identified the following problems:

1. 要件の曖昧さが設計段階で発覚する / Requirement ambiguities are discovered only at the design stage
2. 設計変更が実装後に必要になる / Design changes become necessary after implementation
3. テストカバレッジの事後確認のみ / Test coverage is only checked after the fact
4. Constitutional Articles遵守の手動確認 / Compliance with Constitutional Articles is checked manually

レビューゲートを追加することで、各フェーズ間での品質チェックを自動化し、問題の早期発見を可能にする必要があります。

By adding review gates, we need to automate quality checks between phases and enable early detection of problems.

---

## Decision

### Architecture Pattern: Gate-Based Workflow

各ワークフローフェーズ（Requirements → Design → Tasks → Implement → Validate）の間に独立したReviewGateクラスを配置します。

An independent ReviewGate class is placed between each workflow phase (Requirements → Design → Tasks → Implement → Validate).

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Requirements├────►│ Requirements├────►│   Design    │
│   Phase     │     │ ReviewGate  │     │   Phase     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐             │
                    │   Design    │◄────────────┘
                    │ ReviewGate  │
                    └──────┬──────┘
                           │
┌─────────────┐            │      ┌─────────────┐
│    Tasks    │◄───────────┘      │Implementation│
│   Phase     │──────────────────►│ ReviewGate   │
└─────────────┘                   └──────┬───────┘
                                         │
                    ┌─────────────┐       │
                    │  Validate   │◄──────┘
                    │   Phase     │
                    └─────────────┘
```

### Component Design

#### 1. Base ReviewGate Interface

```typescript
interface ReviewGate {
  id: string;
  name: string;
  validate(context: ReviewContext): Promise<ReviewResult>;
  generateReport(result: ReviewResult): Promise<string>;
  persistResult(result: ReviewResult): Promise<void>;
}
```

#### 2. Gate Implementations

| Gate | Trigger | Checks | Blockers |
|------|---------|--------|----------|
| RequirementsReviewGate | Requirements doc created | EARS compliance, Stakeholders, AC | Missing EARS, No AC |
| DesignReviewGate | Design doc created | C4 model, ADR, Constitution | Missing C4, Article violation |
| ImplementationReviewGate | Sprint completed | Coverage, Lint, Traceability | Coverage < 80%, Lint errors |

#### 3. ReviewPromptRegistry

統一的なプロンプト管理を提供：
(Provides unified prompt management:)

```typescript
const REVIEW_PROMPTS = [
  { pattern: '#sdd-review-requirements', gate: RequirementsReviewGate },
  { pattern: '#sdd-review-design', gate: DesignReviewGate },
  { pattern: '#sdd-review-implementation', gate: ImplementationReviewGate },
  { pattern: '#sdd-review-all', gate: FullReviewGate },
];
```

---

## Alternatives Considered

### Alternative 1: Monolithic ReviewEngine

単一のReviewEngineクラスで全てのレビューを処理する。
(Handle all reviews in a single ReviewEngine class.)

**Pros**:
- シンプルな実装 / Simple implementation
- 共通ロジックの重複を避けられる / Avoids duplication of common logic

**Cons**:
- 単一責任原則違反 / Violates the Single Responsibility Principle
- テストが困難 / Difficult to test
- 新しいゲートタイプの追加が困難 / Difficult to add new gate types

**Rejected**: 拡張性と保守性を優先 / Extensibility and maintainability take priority

### Alternative 2: Plugin-Based Architecture

各ゲートをプラグインとして動的にロードする。
(Load each gate dynamically as a plugin.)

**Pros**:
- 高い拡張性 / High extensibility
- サードパーティゲートのサポート / Support for third-party gates

**Cons**:
- 過度に複雑 / Overly complex
- Phase -1 Gate（Anti-Abstraction）違反の可能性 / Possible violation of the Phase -1 Gate (Anti-Abstraction)

**Rejected**: Constitutional Article VIII違反 / Violates Constitutional Article VIII

---

## Consequences

### Positive

1. **独立したテスト (Independent testing)**: 各ゲートは独立してユニットテスト可能 / Each gate can be unit-tested independently
2. **拡張性 (Extensibility)**: 新しいゲートタイプの追加が容易 / Easy to add new gate types
3. **明確な責任分離 (Clear separation of responsibilities)**: 各ゲートは特定のフェーズのみを担当 / Each gate is responsible for one specific phase only
4. **AGENTS.md統合 (AGENTS.md integration)**: プロンプト追加で機能拡張可能 / Functionality can be extended by adding prompts

### Negative

1. **コード重複の可能性 (Possible code duplication)**: 共通チェックロジックが重複する可能性 / Common check logic may be duplicated
2. **学習コスト (Learning cost)**: 開発者は複数のゲートクラスを理解する必要 / Developers need to understand multiple gate classes
3. **設定の複雑さ (Configuration complexity)**: 各ゲートに個別の設定が必要 / Each gate requires its own configuration

### Mitigations

- 共通ロジックは`ReviewGateBase`クラスに抽出 / Extract common logic into a `ReviewGateBase` class
- ドキュメントとサンプルを充実 / Provide thorough documentation and samples
- デフォルト設定を提供し、カスタマイズはオプショナルに / Provide default settings and make customization optional

---

## Implementation Notes

### File Structure

```
src/review/
├── gates/
│   ├── base-review-gate.ts          # 共通基底クラス / Common base class
│   ├── requirements-review-gate.ts
│   ├── design-review-gate.ts
│   └── implementation-review-gate.ts
├── checkers/
│   ├── ears-checker.ts
│   ├── c4-checker.ts
│   └── coverage-checker.ts
├── prompts/
│   └── review-prompt-registry.ts
└── index.ts
```

### Storage Structure

```
storage/reviews/
├── requirements/
│   └── {feature-id}-{timestamp}.yml
├── design/
│   └── {feature-id}-{timestamp}.yml
└── implementation/
    └── {feature-id}-{timestamp}.yml
```

---

## Related Decisions

- ADR-001: Constitutional Governance (existing)
- ADR-002: Skill-Based Architecture (existing)
- ADR-6.2-002: Traceability Storage Format (proposed)
- ADR-6.2-003: Phase -1 Gate Notification (proposed)

---

## References

- [IMP-6.2-001 Requirements](../../requirements/req_v6.2.md#imp-62-001-レビューステージのワークフロー統合)
- [Constitutional Article VII](../../../steering/rules/constitution.md#article-vii-simplicity-gate-phase--1-gate)
- [Constitutional Article VIII](../../../steering/rules/constitution.md#article-viii-anti-abstraction-gate-phase--1-gate)

---

**Status**: Proposed
**Decision Date**: TBD
**Reviewers**: MUSUBI Core Team
