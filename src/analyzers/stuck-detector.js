/**
 * MUSUBI Stuck Detector
 *
 * AIエージェントのスタック状態（無限ループ、繰り返しエラー）を検出 / Detects stuck states of AI agents (infinite loops, repeated errors)
 *
 * @module src/analyzers/stuck-detector
 * @see REQ-P0-B001
 * @inspired-by OpenHands openhands/controller/stuck.py
 */

const crypto = require('crypto');

/**
 * スタックイベントの種類 / Stuck event types
 */
const EventType = {
  ACTION: 'action',
  OBSERVATION: 'observation',
  ERROR: 'error',
  MESSAGE: 'message',
};

/**
 * SDDステージ / SDD stages
 */
const Stage = {
  REQUIREMENTS: 'requirements',
  DESIGN: 'design',
  IMPLEMENT: 'implement',
  TEST: 'test',
  VALIDATE: 'validate',
};

/**
 * スタックの種類 / Stuck (loop) types
 */
const LoopType = {
  REPEATING_ACTION: 'repeating_action',
  ERROR_LOOP: 'error_loop',
  MONOLOGUE: 'monologue',
  CONTEXT_OVERFLOW: 'context_overflow',
  STAGE_OSCILLATION: 'stage_oscillation',
};

/**
 * 深刻度 / Severity
 */
const Severity = {
  WARNING: 'warning',
  CRITICAL: 'critical',
};

/**
 * イベントのハッシュを生成 / Generate a hash of an event
 * @param {Object} event
 * @returns {string}
 */
function hashEvent(event) {
  const content = JSON.stringify({
    type: event.type,
    stage: event.stage,
    content: event.content,
  });
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

/**
 * スタック分析結果 / Stuck analysis result
 */
class StuckAnalysis {
  /**
   * @param {Object} options
   * @param {string} options.loopType - スタックの種類 / Type of stuck state
   * @param {number} options.loopRepeatTimes - 繰り返し回数 / Number of repetitions
   * @param {number} options.loopStartIndex - ループ開始インデックス / Loop start index
   * @param {string[]} options.suggestedActions - 推奨アクション / Suggested actions
   * @param {string} options.severity - 深刻度 / Severity
   */
  constructor(options = {}) {
    this.loopType = options.loopType;
    this.loopRepeatTimes = options.loopRepeatTimes || 0;
    this.loopStartIndex = options.loopStartIndex || 0;
    this.suggestedActions = options.suggestedActions || [];
    this.severity = options.severity || Severity.WARNING;
    this.timestamp = new Date();
  }

  /**
   * 人間が読める形式のメッセージを生成 / Generate a human-readable message
   * @returns {string}
   */
  getMessage() {
    const typeMessages = {
      [LoopType.REPEATING_ACTION]: `同じアクションが${this.loopRepeatTimes}回繰り返されています`, // EN: `The same action has been repeated ${n} times`
      [LoopType.ERROR_LOOP]: `同じエラーが${this.loopRepeatTimes}回繰り返されています`, // EN: `The same error has been repeated ${n} times`
      [LoopType.MONOLOGUE]: `出力なしの思考が${this.loopRepeatTimes}ステップ続いています`, // EN: `Thinking without output has continued for ${n} steps`
      [LoopType.CONTEXT_OVERFLOW]: `コンテキスト超過エラーが${this.loopRepeatTimes}回発生しています`, // EN: `Context overflow errors have occurred ${n} times`
      [LoopType.STAGE_OSCILLATION]: `同一ステージ間を${this.loopRepeatTimes}回往復しています`, // EN: `Oscillated between the same stages ${n} times`
    };
    return typeMessages[this.loopType] || 'スタック状態が検出されました'; // EN: 'A stuck state was detected'
  }

  toJSON() {
    return {
      loopType: this.loopType,
      loopRepeatTimes: this.loopRepeatTimes,
      loopStartIndex: this.loopStartIndex,
      suggestedActions: this.suggestedActions,
      severity: this.severity,
      message: this.getMessage(),
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * スタック検出システム / Stuck detection system
 */
class StuckDetector {
  /**
   * @param {Object} options
   * @param {number} options.maxRepeatActions - アクション繰り返し検出閾値（デフォルト: 4） / Action-repeat detection threshold (default: 4)
   * @param {number} options.maxRepeatErrors - エラー繰り返し検出閾値（デフォルト: 3） / Error-repeat detection threshold (default: 3)
   * @param {number} options.maxMonologueSteps - モノローグ検出閾値（デフォルト: 10） / Monologue detection threshold (default: 10)
   * @param {number} options.maxContextErrors - コンテキスト超過検出閾値（デフォルト: 3） / Context-overflow detection threshold (default: 3)
   * @param {number} options.maxStageOscillations - ステージ往復検出閾値（デフォルト: 3） / Stage-oscillation detection threshold (default: 3)
   */
  constructor(options = {}) {
    this.maxRepeatActions = options.maxRepeatActions || 4;
    this.maxRepeatErrors = options.maxRepeatErrors || 3;
    this.maxMonologueSteps = options.maxMonologueSteps || 10;
    this.maxContextErrors = options.maxContextErrors || 3;
    this.maxStageOscillations = options.maxStageOscillations || 3;

    this.history = [];
    this.stuckAnalysis = null;
  }

  /**
   * イベントを履歴に追加 / Add an event to the history
   * @param {Object} event
   * @param {string} event.type - イベント種類 / Event type
   * @param {string} event.stage - SDDステージ / SDD stage
   * @param {string} event.content - 内容 / Content
   */
  addEvent(event) {
    const eventWithMeta = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: event.type || EventType.ACTION,
      stage: event.stage || Stage.IMPLEMENT,
      content: event.content || '',
      hash: hashEvent(event),
    };
    this.history.push(eventWithMeta);
    return eventWithMeta;
  }

  /**
   * 履歴をクリア / Clear the history
   */
  clearHistory() {
    this.history = [];
    this.stuckAnalysis = null;
  }

  /**
   * スタック状態を検出 / Detect a stuck state
   * @returns {StuckAnalysis|null}
   */
  detect() {
    // 最低3イベント必要 / At least 3 events required
    if (this.history.length < 3) {
      return null;
    }

    // シナリオ1: 同じアクション・同じ結果の繰り返し / Scenario 1: repeated identical action with identical result
    const repeatingAction = this._detectRepeatingAction();
    if (repeatingAction) {
      this.stuckAnalysis = repeatingAction;
      return repeatingAction;
    }

    // シナリオ2: エラーループ / Scenario 2: error loop
    const errorLoop = this._detectErrorLoop();
    if (errorLoop) {
      this.stuckAnalysis = errorLoop;
      return errorLoop;
    }

    // シナリオ3: モノローグ / Scenario 3: monologue
    const monologue = this._detectMonologue();
    if (monologue) {
      this.stuckAnalysis = monologue;
      return monologue;
    }

    // シナリオ4: コンテキスト超過ループ / Scenario 4: context overflow loop
    const contextOverflow = this._detectContextOverflow();
    if (contextOverflow) {
      this.stuckAnalysis = contextOverflow;
      return contextOverflow;
    }

    // シナリオ5: ステージ往復 / Scenario 5: stage oscillation
    const stageOscillation = this._detectStageOscillation();
    if (stageOscillation) {
      this.stuckAnalysis = stageOscillation;
      return stageOscillation;
    }

    this.stuckAnalysis = null;
    return null;
  }

  /**
   * シナリオ1: 同じアクション・同じ結果の繰り返しを検出 / Scenario 1: detect repeated identical action with identical result
   * @private
   * @returns {StuckAnalysis|null}
   */
  _detectRepeatingAction() {
    if (this.history.length < this.maxRepeatActions) {
      return null;
    }

    const lastN = this.history.slice(-this.maxRepeatActions);
    const firstHash = lastN[0].hash;
    const allSame = lastN.every(e => e.hash === firstHash);

    if (allSame) {
      return new StuckAnalysis({
        loopType: LoopType.REPEATING_ACTION,
        loopRepeatTimes: this.maxRepeatActions,
        loopStartIndex: this.history.length - this.maxRepeatActions,
        suggestedActions: this._suggestAlternatives(LoopType.REPEATING_ACTION),
        severity: Severity.WARNING,
      });
    }

    return null;
  }

  /**
   * シナリオ2: エラーループを検出 / Scenario 2: detect an error loop
   * @private
   * @returns {StuckAnalysis|null}
   */
  _detectErrorLoop() {
    if (this.history.length < this.maxRepeatErrors) {
      return null;
    }

    const lastN = this.history.slice(-this.maxRepeatErrors);
    const allErrors = lastN.every(e => e.type === EventType.ERROR);

    if (allErrors) {
      const firstHash = lastN[0].hash;
      const sameError = lastN.every(e => e.hash === firstHash);

      if (sameError) {
        return new StuckAnalysis({
          loopType: LoopType.ERROR_LOOP,
          loopRepeatTimes: this.maxRepeatErrors,
          loopStartIndex: this.history.length - this.maxRepeatErrors,
          suggestedActions: this._suggestAlternatives(LoopType.ERROR_LOOP),
          severity: Severity.CRITICAL,
        });
      }
    }

    return null;
  }

  /**
   * シナリオ3: モノローグ（出力なしの思考継続）を検出 / Scenario 3: detect a monologue (continued thinking without output)
   * @private
   * @returns {StuckAnalysis|null}
   */
  _detectMonologue() {
    if (this.history.length < this.maxMonologueSteps) {
      return null;
    }

    const lastN = this.history.slice(-this.maxMonologueSteps);
    const allMessages = lastN.every(
      e =>
        e.type === EventType.MESSAGE &&
        !e.content.includes('```') && // コードブロックなし / no code block
        e.content.length < 500 // 短いメッセージ / short message
    );

    if (allMessages) {
      return new StuckAnalysis({
        loopType: LoopType.MONOLOGUE,
        loopRepeatTimes: this.maxMonologueSteps,
        loopStartIndex: this.history.length - this.maxMonologueSteps,
        suggestedActions: this._suggestAlternatives(LoopType.MONOLOGUE),
        severity: Severity.WARNING,
      });
    }

    return null;
  }

  /**
   * シナリオ4: コンテキスト超過ループを検出 / Scenario 4: detect a context overflow loop
   * @private
   * @returns {StuckAnalysis|null}
   */
  _detectContextOverflow() {
    if (this.history.length < this.maxContextErrors) {
      return null;
    }

    const contextErrorPatterns = [
      'context_length_exceeded',
      'maximum context length',
      'token limit',
      'context window',
      'too many tokens',
    ];

    const lastN = this.history.slice(-this.maxContextErrors);
    const allContextErrors = lastN.every(
      e =>
        e.type === EventType.ERROR &&
        contextErrorPatterns.some(pattern =>
          e.content.toLowerCase().includes(pattern.toLowerCase())
        )
    );

    if (allContextErrors) {
      return new StuckAnalysis({
        loopType: LoopType.CONTEXT_OVERFLOW,
        loopRepeatTimes: this.maxContextErrors,
        loopStartIndex: this.history.length - this.maxContextErrors,
        suggestedActions: this._suggestAlternatives(LoopType.CONTEXT_OVERFLOW),
        severity: Severity.CRITICAL,
      });
    }

    return null;
  }

  /**
   * シナリオ5: ステージ往復を検出 / Scenario 5: detect stage oscillation
   * @private
   * @returns {StuckAnalysis|null}
   */
  _detectStageOscillation() {
    const minEvents = this.maxStageOscillations * 2;
    if (this.history.length < minEvents) {
      return null;
    }

    const lastN = this.history.slice(-minEvents);
    const stages = lastN.map(e => e.stage);

    // 2つのステージ間を往復しているかチェック / Check whether oscillating between two stages
    const uniqueStages = [...new Set(stages)];
    if (uniqueStages.length !== 2) {
      return null;
    }

    // 交互パターンのチェック / Check for an alternating pattern
    let oscillations = 0;
    for (let i = 1; i < stages.length; i++) {
      if (stages[i] !== stages[i - 1]) {
        oscillations++;
      }
    }

    if (oscillations >= this.maxStageOscillations) {
      return new StuckAnalysis({
        loopType: LoopType.STAGE_OSCILLATION,
        loopRepeatTimes: oscillations,
        loopStartIndex: this.history.length - minEvents,
        suggestedActions: this._suggestAlternatives(LoopType.STAGE_OSCILLATION),
        severity: Severity.WARNING,
      });
    }

    return null;
  }

  /**
   * 代替アプローチを提案 / Suggest alternative approaches
   * @param {string} loopType
   * @returns {string[]}
   */
  _suggestAlternatives(loopType) {
    const suggestions = {
      [LoopType.REPEATING_ACTION]: [
        '別のアプローチを試してください', // EN: 'Please try a different approach'
        '要件を再確認してください', // EN: 'Please re-check the requirements'
        '問題を小さなステップに分解してください', // EN: 'Please break the problem into smaller steps'
        '一時的に別のタスクに取り組んでください', // EN: 'Please temporarily work on a different task'
      ],
      [LoopType.ERROR_LOOP]: [
        'エラーメッセージを詳しく確認してください', // EN: 'Please examine the error message in detail'
        '依存関係を確認してください', // EN: 'Please check the dependencies'
        '環境設定を見直してください', // EN: 'Please review the environment configuration'
        'デバッグ情報を追加してください', // EN: 'Please add debug information'
      ],
      [LoopType.MONOLOGUE]: [
        '具体的なアクションを実行してください', // EN: 'Please perform a concrete action'
        'コードを書いてください', // EN: 'Please write code'
        'テストを実行してください', // EN: 'Please run the tests'
        'ユーザーに質問してください', // EN: 'Please ask the user a question'
      ],
      [LoopType.CONTEXT_OVERFLOW]: [
        'メモリコンデンサーを有効にしてください', // EN: 'Please enable the memory condenser'
        '不要なコンテキストを削除してください', // EN: 'Please remove unnecessary context'
        'セッションを分割してください', // EN: 'Please split the session'
        '要約を生成してください', // EN: 'Please generate a summary'
      ],
      [LoopType.STAGE_OSCILLATION]: [
        '現在のステージを完了させてください', // EN: 'Please complete the current stage'
        '受入基準を明確にしてください', // EN: 'Please clarify the acceptance criteria'
        'ステージの完了条件を確認してください', // EN: 'Please check the stage completion conditions'
        'ブロッカーを特定してください', // EN: 'Please identify blockers'
      ],
    };

    return suggestions[loopType] || ['状態を確認してください']; // EN: ['Please check the state']
  }

  /**
   * 現在の分析結果を取得 / Get the current analysis result
   * @returns {StuckAnalysis|null}
   */
  getAnalysis() {
    return this.stuckAnalysis;
  }

  /**
   * 履歴を取得 / Get the history
   * @returns {Object[]}
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * 履歴をMarkdown形式でエクスポート / Export the history in Markdown format
   * @returns {string}
   */
  exportHistory() {
    if (this.history.length === 0) {
      return '# Stuck Detector History\n\nNo events recorded.';
    }

    let md = '# Stuck Detector History\n\n';
    md += `Generated: ${new Date().toISOString()}\n\n`;
    md += '## Events\n\n';
    md += '| # | Timestamp | Type | Stage | Hash |\n';
    md += '|---|-----------|------|-------|------|\n';

    this.history.forEach((event, index) => {
      md += `| ${index + 1} | ${event.timestamp.toISOString()} | ${event.type} | ${event.stage} | ${event.hash} |\n`;
    });

    if (this.stuckAnalysis) {
      md += '\n## Analysis\n\n';
      md += `- **Type**: ${this.stuckAnalysis.loopType}\n`;
      md += `- **Message**: ${this.stuckAnalysis.getMessage()}\n`;
      md += `- **Severity**: ${this.stuckAnalysis.severity}\n`;
      md += `- **Suggestions**:\n`;
      this.stuckAnalysis.suggestedActions.forEach(s => {
        md += `  - ${s}\n`;
      });
    }

    return md;
  }
}

module.exports = {
  StuckDetector,
  StuckAnalysis,
  EventType,
  Stage,
  LoopType,
  Severity,
  hashEvent,
};
