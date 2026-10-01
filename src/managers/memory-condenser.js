/**
 * MUSUBI Memory Condenser
 *
 * Compresses long session histories so they fit within the context window
 *
 * @module src/managers/memory-condenser
 * @see REQ-P0-B004
 * @inspired-by OpenHands openhands/memory/condenser/condenser.py
 */

/**
 * Condenser types
 */
const CondenserType = {
  LLM: 'llm', // Summarize with an LLM
  RECENT: 'recent', // Keep the most recent N events
  AMORTIZED: 'amortized', // Divide-and-conquer approach
  NOOP: 'noop', // No compression
};

/**
 * Event types
 */
const MemoryEventType = {
  USER_MESSAGE: 'user_message',
  ASSISTANT_MESSAGE: 'assistant_message',
  ACTION: 'action',
  OBSERVATION: 'observation',
  SUMMARY: 'summary',
  SYSTEM: 'system',
};

/**
 * Memory event
 */
class MemoryEvent {
  /**
   * @param {Object} options
   * @param {string} options.type - Event type
   * @param {string} options.content - Content
   * @param {Object} options.metadata - Metadata
   */
  constructor(options = {}) {
    this.id = options.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = options.type || MemoryEventType.ACTION;
    this.content = options.content || '';
    this.metadata = options.metadata || {};
    this.timestamp = options.timestamp || new Date();
    this.tokens = options.tokens || this._estimateTokens();
  }

  /**
   * Estimate the token count (simplified)
   * @returns {number}
   */
  _estimateTokens() {
    // Rough estimate: 4 characters ≈ 1 token
    return Math.ceil(this.content.length / 4);
  }

  /**
   * Create a summary event
   * @param {string} summary
   * @param {MemoryEvent[]} originalEvents
   * @returns {MemoryEvent}
   */
  static createSummary(summary, originalEvents) {
    return new MemoryEvent({
      type: MemoryEventType.SUMMARY,
      content: summary,
      metadata: {
        summarizedCount: originalEvents.length,
        originalIds: originalEvents.map(e => e.id),
        summarizedAt: new Date(),
      },
    });
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      content: this.content,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
      tokens: this.tokens,
    };
  }
}

/**
 * Condensation result
 */
class CondensedView {
  /**
   * @param {MemoryEvent[]} events - Events after condensation
   * @param {Object} stats - Statistics
   */
  constructor(events, stats = {}) {
    this.events = events;
    this.stats = {
      originalCount: stats.originalCount || 0,
      condensedCount: events.length,
      summaryCount: events.filter(e => e.type === MemoryEventType.SUMMARY).length,
      compressionRatio: stats.originalCount ? 1 - events.length / stats.originalCount : 0,
      totalTokens: events.reduce((sum, e) => sum + e.tokens, 0),
    };
  }

  /**
   * Format for use in a prompt
   * @returns {string}
   */
  toPrompt() {
    return this.events
      .map(e => {
        if (e.type === MemoryEventType.SUMMARY) {
          return `[Previous conversation summary]\n${e.content}`;
        }
        return e.content;
      })
      .join('\n\n');
  }
}

/**
 * Base condenser
 */
class BaseCondenser {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this.preservePatterns = options.preservePatterns || [
      'DECISION:',
      'ARCHITECTURE:',
      'REQ-',
      '## Important',
      'BREAKING CHANGE',
    ];
  }

  /**
   * Condense events
   * @param {MemoryEvent[]} events
   * @returns {Promise<CondensedView>}
   */
  async condense(_events) {
    throw new Error('Must implement condense()');
  }

  /**
   * Check whether an event should be kept
   * @param {MemoryEvent} event
   * @returns {boolean}
   */
  shouldPreserve(event) {
    // Always keep summary events
    if (event.type === MemoryEventType.SUMMARY) {
      return true;
    }

    // Pattern matching
    return this.preservePatterns.some(pattern => event.content.includes(pattern));
  }
}

/**
 * Noop condenser (no compression)
 */
class NoopCondenser extends BaseCondenser {
  async condense(events) {
    return new CondensedView(events, {
      originalCount: events.length,
    });
  }
}

/**
 * Recent-N condenser
 */
class RecentEventsCondenser extends BaseCondenser {
  /**
   * @param {Object} options
   * @param {number} options.keepFirst - Keep the first N events
   * @param {number} options.keepRecent - Keep the most recent N events
   */
  constructor(options = {}) {
    super(options);
    this.keepFirst = options.keepFirst || 2;
    this.keepRecent = options.keepRecent || 10;
  }

  async condense(events) {
    if (events.length <= this.keepFirst + this.keepRecent) {
      return new CondensedView(events, {
        originalCount: events.length,
      });
    }

    const firstEvents = events.slice(0, this.keepFirst);
    const recentEvents = events.slice(-this.keepRecent);

    // Extract the middle events that must be kept
    const middleEvents = events.slice(this.keepFirst, -this.keepRecent);
    const preservedMiddle = middleEvents.filter(e => this.shouldPreserve(e));

    // Summary indicating how many events were omitted
    const omittedCount = middleEvents.length - preservedMiddle.length;
    const summaryEvent = MemoryEvent.createSummary(
      `[${omittedCount} messages omitted for brevity]`,
      middleEvents.filter(e => !this.shouldPreserve(e))
    );

    const condensedEvents = [...firstEvents, summaryEvent, ...preservedMiddle, ...recentEvents];

    return new CondensedView(condensedEvents, {
      originalCount: events.length,
    });
  }
}

/**
 * LLM condenser
 */
class LLMCondenser extends BaseCondenser {
  /**
   * @param {Object} options
   * @param {number} options.maxTokens - Maximum number of tokens
   * @param {number} options.keepFirst - Keep the first N events
   * @param {Function} options.summarizer - Summarizer function (events) => Promise<string>
   */
  constructor(options = {}) {
    super(options);
    this.maxTokens = options.maxTokens || 4000;
    this.keepFirst = options.keepFirst || 2;
    this.chunkSize = options.chunkSize || 10;
    this.summarizer = options.summarizer || this._defaultSummarizer.bind(this);
  }

  async condense(events) {
    const totalTokens = events.reduce((sum, e) => sum + e.tokens, 0);

    if (totalTokens <= this.maxTokens) {
      return new CondensedView(events, {
        originalCount: events.length,
      });
    }

    // Keep the first events
    const preserved = events.slice(0, this.keepFirst);
    let remaining = events.slice(this.keepFirst);

    // Extract important events
    const importantEvents = remaining.filter(e => this.shouldPreserve(e));
    const regularEvents = remaining.filter(e => !this.shouldPreserve(e));

    // Chunk and summarize regular events
    const chunks = this._chunkEvents(regularEvents);
    const summaries = [];

    for (const chunk of chunks) {
      if (chunk.length === 0) continue;

      const summaryText = await this.summarizer(chunk);
      summaries.push(MemoryEvent.createSummary(summaryText, chunk));
    }

    const condensedEvents = [...preserved, ...summaries, ...importantEvents];

    return new CondensedView(condensedEvents, {
      originalCount: events.length,
    });
  }

  /**
   * Split events into chunks
   * @param {MemoryEvent[]} events
   * @returns {MemoryEvent[][]}
   */
  _chunkEvents(events) {
    const chunks = [];
    for (let i = 0; i < events.length; i += this.chunkSize) {
      chunks.push(events.slice(i, i + this.chunkSize));
    }
    return chunks;
  }

  /**
   * Default summarizer (simplified, no LLM)
   * @param {MemoryEvent[]} events
   * @returns {Promise<string>}
   */
  async _defaultSummarizer(events) {
    const types = {};
    events.forEach(e => {
      types[e.type] = (types[e.type] || 0) + 1;
    });

    const typesSummary = Object.entries(types)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');

    return `[Summary of ${events.length} events: ${typesSummary}]`;
  }
}

/**
 * Divide-and-conquer condenser (Amortized)
 */
class AmortizedCondenser extends BaseCondenser {
  /**
   * @param {Object} options
   * @param {number} options.maxSize - Maximum number of events
   * @param {number} options.targetSize - Target number of events
   * @param {Function} options.summarizer - Summarizer function
   */
  constructor(options = {}) {
    super(options);
    this.maxSize = options.maxSize || 100;
    this.targetSize = options.targetSize || 50;
    this.summarizer = options.summarizer || this._defaultSummarizer.bind(this);
  }

  async condense(events) {
    if (events.length <= this.maxSize) {
      return new CondensedView(events, {
        originalCount: events.length,
      });
    }

    // Locate user messages (used as boundaries)
    const userMessageIndices = events
      .map((e, i) => (e.type === MemoryEventType.USER_MESSAGE ? i : -1))
      .filter(i => i !== -1);

    // Keep the events around the first and the latest user messages
    const preserveStart = userMessageIndices[0] !== undefined ? userMessageIndices[0] : 0;
    const preserveEnd =
      userMessageIndices.length > 1
        ? userMessageIndices[userMessageIndices.length - 1]
        : events.length;

    // Determine which events to condense
    const toCondense = events.slice(preserveStart + 1, preserveEnd);
    const condensedCount = events.length - this.targetSize;

    if (condensedCount <= 0 || toCondense.length === 0) {
      return new CondensedView(events, {
        originalCount: events.length,
      });
    }

    // Create the summary
    const summaryText = await this.summarizer(toCondense.slice(0, condensedCount));
    const summaryEvent = MemoryEvent.createSummary(
      summaryText,
      toCondense.slice(0, condensedCount)
    );

    const condensedEvents = [
      ...events.slice(0, preserveStart + 1),
      summaryEvent,
      ...toCondense.slice(condensedCount),
      ...events.slice(preserveEnd),
    ];

    return new CondensedView(condensedEvents, {
      originalCount: events.length,
    });
  }

  async _defaultSummarizer(events) {
    return `[Condensed ${events.length} previous interactions]`;
  }
}

/**
 * Memory condenser factory
 */
class MemoryCondenser {
  /**
   * Create a condenser
   * @param {Object} options
   * @param {string} options.type - Condenser type
   * @returns {BaseCondenser}
   */
  static create(options = {}) {
    const type = options.type || CondenserType.RECENT;

    switch (type) {
      case CondenserType.NOOP:
        return new NoopCondenser(options);
      case CondenserType.RECENT:
        return new RecentEventsCondenser(options);
      case CondenserType.LLM:
        return new LLMCondenser(options);
      case CondenserType.AMORTIZED:
        return new AmortizedCondenser(options);
      default:
        throw new Error(`Unknown condenser type: ${type}`);
    }
  }

  /**
   * Create a condenser from a configuration file
   * @param {Object} config - The condenser section of project.yml
   * @returns {BaseCondenser}
   */
  static fromConfig(config = {}) {
    return this.create({
      type: config.type || CondenserType.RECENT,
      maxTokens: config.max_tokens,
      maxSize: config.max_size,
      keepFirst: config.keep_first,
      keepRecent: config.keep_recent,
      targetSize: config.target_size,
      preservePatterns: config.preserve_patterns,
    });
  }
}

module.exports = {
  MemoryCondenser,
  MemoryEvent,
  CondensedView,
  CondenserType,
  MemoryEventType,
  BaseCondenser,
  NoopCondenser,
  RecentEventsCondenser,
  LLMCondenser,
  AmortizedCondenser,
};
