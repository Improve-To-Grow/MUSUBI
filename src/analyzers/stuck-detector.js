/**
 * MUSUBI Stuck Detector
 *
 * Detects stuck states of AI agents (infinite loops, repeated errors)
 *
 * @module src/analyzers/stuck-detector
 * @see REQ-P0-B001
 * @inspired-by OpenHands openhands/controller/stuck.py
 */

const crypto = require('crypto');

/**
 * Stuck event types
 */
const EventType = {
  ACTION: 'action',
  OBSERVATION: 'observation',
  ERROR: 'error',
  MESSAGE: 'message',
};

/**
 * SDD stages
 */
const Stage = {
  REQUIREMENTS: 'requirements',
  DESIGN: 'design',
  IMPLEMENT: 'implement',
  TEST: 'test',
  VALIDATE: 'validate',
};

/**
 * Stuck (loop) types
 */
const LoopType = {
  REPEATING_ACTION: 'repeating_action',
  ERROR_LOOP: 'error_loop',
  MONOLOGUE: 'monologue',
  CONTEXT_OVERFLOW: 'context_overflow',
  STAGE_OSCILLATION: 'stage_oscillation',
};

/**
 * Severity levels
 */
const Severity = {
  WARNING: 'warning',
  CRITICAL: 'critical',
};

/**
 * Generate a hash for an event
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
 * Stuck analysis result
 */
class StuckAnalysis {
  /**
   * @param {Object} options
   * @param {string} options.loopType - Stuck (loop) type
   * @param {number} options.loopRepeatTimes - Number of repetitions
   * @param {number} options.loopStartIndex - Index where the loop starts
   * @param {string[]} options.suggestedActions - Suggested actions
   * @param {string} options.severity - Severity
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
   * Generate a human-readable message
   * @returns {string}
   */
  getMessage() {
    const typeMessages = {
      [LoopType.REPEATING_ACTION]: `The same action has been repeated ${this.loopRepeatTimes} times`,
      [LoopType.ERROR_LOOP]: `The same error has been repeated ${this.loopRepeatTimes} times`,
      [LoopType.MONOLOGUE]: `Reasoning without output has continued for ${this.loopRepeatTimes} steps`,
      [LoopType.CONTEXT_OVERFLOW]: `Context overflow errors have occurred ${this.loopRepeatTimes} times`,
      [LoopType.STAGE_OSCILLATION]: `Oscillated between the same stages ${this.loopRepeatTimes} times`,
    };
    return typeMessages[this.loopType] || 'A stuck state was detected';
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
 * Stuck detection system
 */
class StuckDetector {
  /**
   * @param {Object} options
   * @param {number} options.maxRepeatActions - Threshold for repeated actions (default: 4)
   * @param {number} options.maxRepeatErrors - Threshold for repeated errors (default: 3)
   * @param {number} options.maxMonologueSteps - Threshold for monologue detection (default: 10)
   * @param {number} options.maxContextErrors - Threshold for context overflow errors (default: 3)
   * @param {number} options.maxStageOscillations - Threshold for stage oscillations (default: 3)
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
   * Add an event to the history
   * @param {Object} event
   * @param {string} event.type - Event type
   * @param {string} event.stage - SDD stage
   * @param {string} event.content - Content
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
   * Clear the history
   */
  clearHistory() {
    this.history = [];
    this.stuckAnalysis = null;
  }

  /**
   * Detect a stuck state
   * @returns {StuckAnalysis|null}
   */
  detect() {
    // At least 3 events are required
    if (this.history.length < 3) {
      return null;
    }

    // Scenario 1: same action with the same result, repeated
    const repeatingAction = this._detectRepeatingAction();
    if (repeatingAction) {
      this.stuckAnalysis = repeatingAction;
      return repeatingAction;
    }

    // Scenario 2: error loop
    const errorLoop = this._detectErrorLoop();
    if (errorLoop) {
      this.stuckAnalysis = errorLoop;
      return errorLoop;
    }

    // Scenario 3: monologue
    const monologue = this._detectMonologue();
    if (monologue) {
      this.stuckAnalysis = monologue;
      return monologue;
    }

    // Scenario 4: context overflow loop
    const contextOverflow = this._detectContextOverflow();
    if (contextOverflow) {
      this.stuckAnalysis = contextOverflow;
      return contextOverflow;
    }

    // Scenario 5: stage oscillation
    const stageOscillation = this._detectStageOscillation();
    if (stageOscillation) {
      this.stuckAnalysis = stageOscillation;
      return stageOscillation;
    }

    this.stuckAnalysis = null;
    return null;
  }

  /**
   * Scenario 1: detect the same action with the same result, repeated
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
   * Scenario 2: detect an error loop
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
   * Scenario 3: detect a monologue (continued reasoning without output)
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
        !e.content.includes('```') && // no code block
        e.content.length < 500 // short message
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
   * Scenario 4: detect a context overflow loop
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
   * Scenario 5: detect stage oscillation
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

    // Check whether it oscillates between two stages
    const uniqueStages = [...new Set(stages)];
    if (uniqueStages.length !== 2) {
      return null;
    }

    // Check for an alternating pattern
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
   * Suggest alternative approaches
   * @param {string} loopType
   * @returns {string[]}
   */
  _suggestAlternatives(loopType) {
    const suggestions = {
      [LoopType.REPEATING_ACTION]: [
        'Try a different approach',
        'Re-check the requirements',
        'Break the problem down into smaller steps',
        'Temporarily work on a different task',
      ],
      [LoopType.ERROR_LOOP]: [
        'Examine the error message in detail',
        'Check the dependencies',
        'Review the environment configuration',
        'Add debugging information',
      ],
      [LoopType.MONOLOGUE]: [
        'Take a concrete action',
        'Write code',
        'Run the tests',
        'Ask the user a question',
      ],
      [LoopType.CONTEXT_OVERFLOW]: [
        'Enable the memory condenser',
        'Remove unnecessary context',
        'Split the session',
        'Generate a summary',
      ],
      [LoopType.STAGE_OSCILLATION]: [
        'Complete the current stage',
        'Clarify the acceptance criteria',
        'Check the stage completion criteria',
        'Identify the blockers',
      ],
    };

    return suggestions[loopType] || ['Check the current state'];
  }

  /**
   * Get the current analysis result
   * @returns {StuckAnalysis|null}
   */
  getAnalysis() {
    return this.stuckAnalysis;
  }

  /**
   * Get the history
   * @returns {Object[]}
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Export the history as Markdown
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
