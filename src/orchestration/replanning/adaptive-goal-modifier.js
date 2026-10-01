/**
 * AdaptiveGoalModifier - Dynamic, context-aware goal adjustment
 *
 * Full implementation of Goal-Driven Replanning (Phase 2/3)
 * Dynamically adjusts goal priority, scope, timeline and success criteria
 *
 * @module orchestration/replanning/adaptive-goal-modifier
 */

'use strict';

/**
 * Categories of goal modification reasons
 */
const ModificationReason = {
  RESOURCE_CONSTRAINT: 'resource_constraint', // Resource constraint
  TIME_CONSTRAINT: 'time_constraint', // Time constraint
  DEPENDENCY_FAILURE: 'dependency_failure', // Dependency failure
  PRIORITY_SHIFT: 'priority_shift', // Priority change
  SCOPE_CREEP: 'scope_creep', // Scope expansion
  EXTERNAL_CHANGE: 'external_change', // External change
  PERFORMANCE_ISSUE: 'performance_issue', // Performance issue
  USER_REQUEST: 'user_request', // User request
  STRATEGIC_PIVOT: 'strategic_pivot', // Strategic pivot
};

/**
 * Modification types
 */
const ModificationType = {
  PRIORITY_ADJUSTMENT: 'priority_adjustment', // Priority adjustment
  SCOPE_REDUCTION: 'scope_reduction', // Scope reduction
  SCOPE_EXPANSION: 'scope_expansion', // Scope expansion
  TIMELINE_EXTENSION: 'timeline_extension', // Timeline extension
  TIMELINE_COMPRESSION: 'timeline_compression', // Timeline compression
  SUCCESS_CRITERIA_RELAXATION: 'criteria_relaxation', // Relax success criteria
  SUCCESS_CRITERIA_TIGHTENING: 'criteria_tightening', // Tighten success criteria
  GOAL_DECOMPOSITION: 'goal_decomposition', // Goal decomposition
  GOAL_MERGE: 'goal_merge', // Goal merge
  GOAL_DEFERRAL: 'goal_deferral', // Goal deferral
  GOAL_CANCELLATION: 'goal_cancellation', // Goal cancellation
};

/**
 * Impact analysis engine
 * Analyzes the impact of goal changes
 */
class ImpactAnalyzer {
  /**
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.config = {
      cascadeDepth: options.cascadeDepth || 3,
      impactThreshold: options.impactThreshold || 0.3,
      ...options,
    };
  }

  /**
   * Analyze the impact of a goal change
   * @param {Object} goal - Target goal
   * @param {Object} modification - Modification details
   * @param {Object} context - Context
   * @returns {Object} Impact analysis result
   */
  analyzeImpact(goal, modification, context) {
    const directImpact = this._analyzeDirectImpact(goal, modification);
    const cascadeImpact = this._analyzeCascadeImpact(goal, modification, context);
    const resourceImpact = this._analyzeResourceImpact(goal, modification, context);
    const timelineImpact = this._analyzeTimelineImpact(goal, modification, context);

    const totalScore = this._calculateTotalImpact(
      directImpact,
      cascadeImpact,
      resourceImpact,
      timelineImpact
    );

    return {
      goalId: goal.id,
      modificationType: modification.type,
      directImpact,
      cascadeImpact,
      resourceImpact,
      timelineImpact,
      totalScore,
      riskLevel: this._categorizeRisk(totalScore),
      recommendations: this._generateRecommendations(totalScore, modification),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Analyze direct impact
   * @private
   */
  _analyzeDirectImpact(goal, modification) {
    const impacts = {
      [ModificationType.PRIORITY_ADJUSTMENT]: 0.3,
      [ModificationType.SCOPE_REDUCTION]: 0.5,
      [ModificationType.SCOPE_EXPANSION]: 0.6,
      [ModificationType.TIMELINE_EXTENSION]: 0.4,
      [ModificationType.TIMELINE_COMPRESSION]: 0.7,
      [ModificationType.SUCCESS_CRITERIA_RELAXATION]: 0.3,
      [ModificationType.SUCCESS_CRITERIA_TIGHTENING]: 0.5,
      [ModificationType.GOAL_DECOMPOSITION]: 0.4,
      [ModificationType.GOAL_MERGE]: 0.5,
      [ModificationType.GOAL_DEFERRAL]: 0.6,
      [ModificationType.GOAL_CANCELLATION]: 1.0,
    };

    const baseImpact = impacts[modification.type] || 0.5;
    const priorityMultiplier =
      goal.priority === 'critical' ? 1.5 : goal.priority === 'high' ? 1.2 : 1.0;

    return {
      score: Math.min(1.0, baseImpact * priorityMultiplier),
      affectedAreas: this._identifyAffectedAreas(modification.type),
    };
  }

  /**
   * Analyze cascade impact
   * @private
   */
  _analyzeCascadeImpact(goal, modification, context) {
    const dependentGoals = context.goals?.filter(g => g.dependencies?.includes(goal.id)) || [];

    let totalCascade = 0;
    const affectedGoals = [];

    for (const depGoal of dependentGoals) {
      const impact = this._calculateDependencyImpact(depGoal, modification);
      totalCascade += impact;
      if (impact > this.config.impactThreshold) {
        affectedGoals.push({
          goalId: depGoal.id,
          impact,
          requires: this._determineCascadeAction(impact),
        });
      }
    }

    return {
      score: Math.min(1.0, totalCascade / Math.max(1, dependentGoals.length)),
      affectedGoals,
      depth: Math.min(affectedGoals.length, this.config.cascadeDepth),
    };
  }

  /**
   * Analyze resource impact
   * @private
   */
  _analyzeResourceImpact(goal, modification, context) {
    const resourceChanges = {
      freed: [],
      required: [],
      conflicting: [],
    };

    if (
      modification.type === ModificationType.SCOPE_REDUCTION ||
      modification.type === ModificationType.GOAL_CANCELLATION
    ) {
      resourceChanges.freed = goal.resources || [];
    } else if (
      modification.type === ModificationType.SCOPE_EXPANSION ||
      modification.type === ModificationType.TIMELINE_COMPRESSION
    ) {
      resourceChanges.required = this._estimateAdditionalResources(goal, modification);
    }

    // Check for resource conflicts
    if (context.resourcePool) {
      resourceChanges.conflicting = this._findConflicts(
        resourceChanges.required,
        context.resourcePool
      );
    }

    return {
      score: resourceChanges.conflicting.length > 0 ? 0.7 : 0.3,
      changes: resourceChanges,
      feasibility: resourceChanges.conflicting.length === 0,
    };
  }

  /**
   * Analyze timeline impact
   * @private
   */
  _analyzeTimelineImpact(goal, modification, context) {
    let shift = 0;
    let affectedMilestones = [];

    switch (modification.type) {
      case ModificationType.TIMELINE_EXTENSION:
        shift = modification.extensionDays || 7;
        break;
      case ModificationType.TIMELINE_COMPRESSION:
        shift = -(modification.compressionDays || 3);
        break;
      case ModificationType.SCOPE_EXPANSION:
        shift = modification.estimatedDays || 5;
        break;
      case ModificationType.SCOPE_REDUCTION:
        shift = -(modification.savedDays || 2);
        break;
    }

    if (context.milestones) {
      affectedMilestones = context.milestones.filter(
        m => new Date(m.dueDate) >= new Date(goal.targetDate)
      );
    }

    return {
      score: Math.min(1.0, Math.abs(shift) / 14), // Two weeks as the baseline
      shiftDays: shift,
      direction: shift > 0 ? 'delay' : 'accelerate',
      affectedMilestones: affectedMilestones.length,
    };
  }

  /**
   * Calculate the overall impact score
   * @private
   */
  _calculateTotalImpact(direct, cascade, resource, timeline) {
    return direct.score * 0.3 + cascade.score * 0.25 + resource.score * 0.25 + timeline.score * 0.2;
  }

  /**
   * Categorize the risk level
   * @private
   */
  _categorizeRisk(score) {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Identify affected areas
   * @private
   */
  _identifyAffectedAreas(modificationType) {
    const areaMap = {
      [ModificationType.PRIORITY_ADJUSTMENT]: ['scheduling', 'resources'],
      [ModificationType.SCOPE_REDUCTION]: ['deliverables', 'testing'],
      [ModificationType.SCOPE_EXPANSION]: ['deliverables', 'testing', 'resources'],
      [ModificationType.TIMELINE_EXTENSION]: ['milestones', 'dependencies'],
      [ModificationType.TIMELINE_COMPRESSION]: ['quality', 'resources', 'scope'],
      [ModificationType.SUCCESS_CRITERIA_RELAXATION]: ['quality', 'testing'],
      [ModificationType.SUCCESS_CRITERIA_TIGHTENING]: ['quality', 'testing', 'resources'],
      [ModificationType.GOAL_DECOMPOSITION]: ['tracking', 'dependencies'],
      [ModificationType.GOAL_MERGE]: ['tracking', 'dependencies', 'scope'],
      [ModificationType.GOAL_DEFERRAL]: ['milestones', 'dependencies'],
      [ModificationType.GOAL_CANCELLATION]: ['all'],
    };
    return areaMap[modificationType] || ['unknown'];
  }

  /**
   * Calculate dependency impact
   * @private
   */
  _calculateDependencyImpact(depGoal, modification) {
    const baseImpact = depGoal.dependencyStrength || 0.5;
    const typeMultiplier =
      modification.type === ModificationType.GOAL_CANCELLATION
        ? 1.0
        : modification.type === ModificationType.TIMELINE_EXTENSION
          ? 0.7
          : 0.4;
    return baseImpact * typeMultiplier;
  }

  /**
   * Determine the cascade action
   * @private
   */
  _determineCascadeAction(impact) {
    if (impact >= 0.8) return 'immediate_replanning';
    if (impact >= 0.5) return 'review_required';
    return 'monitor';
  }

  /**
   * Estimate additional resources
   * @private
   */
  _estimateAdditionalResources(goal, modification) {
    const currentResources = goal.resources || [];
    const expansionFactor = modification.expansionFactor || 1.5;
    return currentResources.map(r => ({
      ...r,
      amount: Math.ceil(r.amount * (expansionFactor - 1)),
    }));
  }

  /**
   * Detect resource conflicts
   * @private
   */
  _findConflicts(required, pool) {
    return required.filter(r => {
      const available = pool.find(p => p.type === r.type);
      return !available || available.available < r.amount;
    });
  }

  /**
   * Generate recommendations
   * @private
   */
  _generateRecommendations(totalScore, modification) {
    const recommendations = [];

    if (totalScore >= 0.7) {
      recommendations.push({
        priority: 'high',
        action: 'Conduct stakeholder review before proceeding',
        rationale: 'High impact modification requires approval',
      });
    }

    if (modification.type === ModificationType.SCOPE_EXPANSION) {
      recommendations.push({
        priority: 'medium',
        action: 'Review resource allocation',
        rationale: 'Scope expansion typically requires additional resources',
      });
    }

    if (modification.type === ModificationType.TIMELINE_COMPRESSION) {
      recommendations.push({
        priority: 'high',
        action: 'Assess quality risks',
        rationale: 'Compressed timelines may affect deliverable quality',
      });
    }

    return recommendations;
  }
}

/**
 * Goal modification strategy
 * Determines the adjustment strategy for the current situation
 */
class ModificationStrategy {
  /**
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.config = {
      conservativeMode: options.conservativeMode || false,
      autoApproveThreshold: options.autoApproveThreshold || 0.3,
      ...options,
    };
  }

  /**
   * Determine the best modification strategy
   * @param {Object} goal - Target goal
   * @param {Object} trigger - Trigger information
   * @param {Object} context - Context
   * @returns {Object} Modification strategy
   */
  determineStrategy(goal, trigger, context) {
    const strategies = this._generateCandidateStrategies(goal, trigger, context);
    const evaluated = strategies.map(s => ({
      ...s,
      score: this._evaluateStrategy(s, goal, context),
    }));

    evaluated.sort((a, b) => b.score - a.score);

    return {
      recommended: evaluated[0],
      alternatives: evaluated.slice(1, 3),
      confidence: evaluated[0]?.score || 0,
      autoApprovable: evaluated[0]?.score >= 1 - this.config.autoApproveThreshold,
    };
  }

  /**
   * Generate candidate strategies
   * @private
   */
  _generateCandidateStrategies(goal, trigger, _context) {
    const strategies = [];

    switch (trigger.reason) {
      case ModificationReason.TIME_CONSTRAINT:
        strategies.push(
          this._createScopeReductionStrategy(goal, trigger),
          this._createTimelineExtensionStrategy(goal, trigger),
          this._createCriteriaRelaxationStrategy(goal, trigger)
        );
        break;

      case ModificationReason.RESOURCE_CONSTRAINT:
        strategies.push(
          this._createScopeReductionStrategy(goal, trigger),
          this._createTimelineExtensionStrategy(goal, trigger),
          this._createGoalDeferralStrategy(goal, trigger)
        );
        break;

      case ModificationReason.DEPENDENCY_FAILURE:
        strategies.push(
          this._createGoalDecompositionStrategy(goal, trigger),
          this._createTimelineExtensionStrategy(goal, trigger),
          this._createGoalDeferralStrategy(goal, trigger)
        );
        break;

      case ModificationReason.PRIORITY_SHIFT:
        strategies.push(
          this._createPriorityAdjustmentStrategy(goal, trigger),
          this._createTimelineCompressionStrategy(goal, trigger),
          this._createScopeExpansionStrategy(goal, trigger)
        );
        break;

      case ModificationReason.SCOPE_CREEP:
        strategies.push(
          this._createScopeReductionStrategy(goal, trigger),
          this._createGoalDecompositionStrategy(goal, trigger),
          this._createTimelineExtensionStrategy(goal, trigger)
        );
        break;

      case ModificationReason.PERFORMANCE_ISSUE:
        strategies.push(
          this._createCriteriaRelaxationStrategy(goal, trigger),
          this._createTimelineExtensionStrategy(goal, trigger),
          this._createScopeReductionStrategy(goal, trigger)
        );
        break;

      default:
        strategies.push(
          this._createTimelineExtensionStrategy(goal, trigger),
          this._createScopeReductionStrategy(goal, trigger)
        );
    }

    return strategies.filter(s => s !== null);
  }

  /**
   * Evaluate a strategy
   * @private
   */
  _evaluateStrategy(strategy, goal, _context) {
    let score = 0.5; // Base score

    // Alignment with goal priority
    if (goal.priority === 'critical' && strategy.preservesCore) {
      score += 0.2;
    }

    // Resource efficiency
    if (strategy.resourceEfficiency === 'high') {
      score += 0.15;
    }

    // Risk level
    score -= strategy.riskLevel === 'high' ? 0.2 : strategy.riskLevel === 'medium' ? 0.1 : 0;

    // Conservative mode
    if (this.config.conservativeMode && strategy.conservative) {
      score += 0.1;
    }

    // Feasibility
    score += strategy.feasibility * 0.15;

    return Math.max(0, Math.min(1, score));
  }

  // Strategy factory methods
  _createScopeReductionStrategy(goal, _trigger) {
    return {
      type: ModificationType.SCOPE_REDUCTION,
      description: 'Reduce scope to meet constraints',
      reductionTargets: this._identifyReductionTargets(goal),
      preservesCore: true,
      resourceEfficiency: 'high',
      riskLevel: 'medium',
      conservative: true,
      feasibility: 0.8,
    };
  }

  _createTimelineExtensionStrategy(goal, trigger) {
    return {
      type: ModificationType.TIMELINE_EXTENSION,
      description: 'Extend timeline to accommodate current progress',
      extensionDays: Math.ceil((trigger.gap || 0.2) * 14),
      preservesCore: true,
      resourceEfficiency: 'medium',
      riskLevel: 'low',
      conservative: true,
      feasibility: 0.9,
    };
  }

  _createTimelineCompressionStrategy(goal, trigger) {
    return {
      type: ModificationType.TIMELINE_COMPRESSION,
      description: 'Compress timeline for higher priority',
      compressionDays: Math.ceil((trigger.urgency || 0.3) * 7),
      preservesCore: true,
      resourceEfficiency: 'low',
      riskLevel: 'high',
      conservative: false,
      feasibility: 0.6,
    };
  }

  _createCriteriaRelaxationStrategy(_goal, _trigger) {
    return {
      type: ModificationType.SUCCESS_CRITERIA_RELAXATION,
      description: 'Relax success criteria to achievable levels',
      relaxationTargets: ['performance', 'coverage'],
      preservesCore: false,
      resourceEfficiency: 'high',
      riskLevel: 'medium',
      conservative: false,
      feasibility: 0.7,
    };
  }

  _createGoalDecompositionStrategy(goal, _trigger) {
    return {
      type: ModificationType.GOAL_DECOMPOSITION,
      description: 'Decompose goal into smaller, manageable sub-goals',
      suggestedSubGoals: this._suggestSubGoals(goal),
      preservesCore: true,
      resourceEfficiency: 'medium',
      riskLevel: 'low',
      conservative: true,
      feasibility: 0.85,
    };
  }

  _createGoalDeferralStrategy(goal, trigger) {
    return {
      type: ModificationType.GOAL_DEFERRAL,
      description: 'Defer goal to next iteration',
      deferralReason: trigger.reason,
      preservesCore: true,
      resourceEfficiency: 'high',
      riskLevel: 'medium',
      conservative: true,
      feasibility: 0.9,
    };
  }

  _createPriorityAdjustmentStrategy(goal, trigger) {
    return {
      type: ModificationType.PRIORITY_ADJUSTMENT,
      description: 'Adjust goal priority based on new context',
      newPriority: trigger.suggestedPriority || 'high',
      preservesCore: true,
      resourceEfficiency: 'medium',
      riskLevel: 'low',
      conservative: true,
      feasibility: 0.95,
    };
  }

  _createScopeExpansionStrategy(goal, trigger) {
    return {
      type: ModificationType.SCOPE_EXPANSION,
      description: 'Expand scope to include additional requirements',
      expansionItems: trigger.additionalRequirements || [],
      preservesCore: true,
      resourceEfficiency: 'low',
      riskLevel: 'medium',
      conservative: false,
      feasibility: 0.7,
    };
  }

  /**
   * Identify reduction targets
   * @private
   */
  _identifyReductionTargets(goal) {
    const deliverables = goal.deliverables || [];
    return deliverables
      .filter(d => d.priority !== 'critical')
      .map(d => ({
        id: d.id,
        name: d.name,
        estimatedSavings: d.effort || 1,
      }));
  }

  /**
   * Suggest sub-goals
   * @private
   */
  _suggestSubGoals(goal) {
    const phases = ['core', 'enhancement', 'polish'];
    return phases.map((phase, index) => ({
      id: `${goal.id}-${phase}`,
      name: `${goal.name} - ${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase`,
      priority: index === 0 ? goal.priority : 'normal',
      estimatedEffort: Math.ceil((goal.estimatedEffort || 10) / 3),
    }));
  }
}

/**
 * Modification history manager
 * Tracks and analyzes goal modification history
 */
class ModificationHistoryManager {
  /**
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.history = new Map();
    this.config = {
      maxHistoryPerGoal: options.maxHistoryPerGoal || 50,
      ...options,
    };
  }

  /**
   * Record a modification
   * @param {string} goalId - Goal ID
   * @param {Object} modification - Modification details
   * @param {Object} impact - Impact analysis result
   */
  recordModification(goalId, modification, impact) {
    if (!this.history.has(goalId)) {
      this.history.set(goalId, []);
    }

    const history = this.history.get(goalId);
    history.push({
      id: `mod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      modification,
      impact,
      timestamp: new Date().toISOString(),
      status: 'applied',
    });

    // Enforce history size limit
    if (history.length > this.config.maxHistoryPerGoal) {
      history.shift();
    }
  }

  /**
   * Get the modification history of a goal
   * @param {string} goalId - Goal ID
   * @returns {Array} Modification history
   */
  getHistory(goalId) {
    return this.history.get(goalId) || [];
  }

  /**
   * Analyze modification patterns
   * @param {string} goalId - Goal ID
   * @returns {Object} Pattern analysis result
   */
  analyzePatterns(goalId) {
    const history = this.getHistory(goalId);
    if (history.length === 0) {
      return { patterns: [], insights: [] };
    }

    const typeCounts = {};
    const reasonCounts = {};
    let totalImpact = 0;

    for (const entry of history) {
      const type = entry.modification.type;
      const reason = entry.modification.reason;

      typeCounts[type] = (typeCounts[type] || 0) + 1;
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      totalImpact += entry.impact?.totalScore || 0;
    }

    const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
    const dominantReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];

    const insights = [];

    if (history.length > 5) {
      insights.push({
        type: 'volatility',
        message: 'Goal has been modified frequently - consider stabilization',
        severity: 'warning',
      });
    }

    if (dominantType && dominantType[1] > history.length * 0.5) {
      insights.push({
        type: 'pattern',
        message: `Recurring ${dominantType[0]} modifications detected`,
        suggestion: `Address root cause of ${dominantReason?.[0] || 'unknown'}`,
      });
    }

    return {
      totalModifications: history.length,
      averageImpact: totalImpact / history.length,
      typeDistribution: typeCounts,
      reasonDistribution: reasonCounts,
      dominantType: dominantType?.[0],
      dominantReason: dominantReason?.[0],
      insights,
    };
  }

  /**
   * Roll back a modification
   * @param {string} goalId - Goal ID
   * @param {string} modificationId - Modification ID
   * @returns {Object|null} The rolled-back modification
   */
  rollback(goalId, modificationId) {
    const history = this.history.get(goalId);
    if (!history) return null;

    const index = history.findIndex(h => h.id === modificationId);
    if (index === -1) return null;

    const entry = history[index];
    entry.status = 'rolled_back';
    entry.rolledBackAt = new Date().toISOString();

    return entry;
  }
}

/**
 * AdaptiveGoalModifier
 * Main class for dynamic, context-aware goal adjustment
 */
class AdaptiveGoalModifier {
  /**
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.impactAnalyzer = new ImpactAnalyzer(options.impact);
    this.strategy = new ModificationStrategy(options.strategy);
    this.historyManager = new ModificationHistoryManager(options.history);

    this.config = {
      requireApproval: options.requireApproval ?? true,
      autoModifyThreshold: options.autoModifyThreshold || 0.3,
      notifyOnModification: options.notifyOnModification ?? true,
      ...options,
    };

    this.goals = new Map();
    this.pendingModifications = new Map();
    this.eventHandlers = new Map();
  }

  /**
   * Register a goal
   * @param {Object} goal - Goal definition
   * @returns {Object} The registered goal
   */
  registerGoal(goal) {
    const normalizedGoal = {
      id: goal.id || `goal-${Date.now()}`,
      name: goal.name,
      description: goal.description,
      priority: goal.priority || 'normal',
      targetDate: goal.targetDate,
      successCriteria: goal.successCriteria || [],
      deliverables: goal.deliverables || [],
      dependencies: goal.dependencies || [],
      resources: goal.resources || [],
      estimatedEffort: goal.estimatedEffort,
      status: 'active',
      createdAt: new Date().toISOString(),
      modificationCount: 0,
    };

    this.goals.set(normalizedGoal.id, normalizedGoal);
    return normalizedGoal;
  }

  /**
   * Trigger a goal modification
   * @param {string} goalId - Goal ID
   * @param {Object} trigger - Trigger information
   * @returns {Promise<Object>} Modification result
   */
  async triggerModification(goalId, trigger) {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    // Build context
    const context = this._buildContext(goalId);

    // Determine strategy
    const strategyResult = this.strategy.determineStrategy(goal, trigger, context);

    // Analyze impact
    const impact = this.impactAnalyzer.analyzeImpact(
      goal,
      { type: strategyResult.recommended.type, ...strategyResult.recommended },
      context
    );

    const modification = {
      id: `mod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      goalId,
      trigger,
      strategy: strategyResult.recommended,
      alternatives: strategyResult.alternatives,
      impact,
      confidence: strategyResult.confidence,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Auto-approval check
    if (
      !this.config.requireApproval ||
      (strategyResult.autoApprovable && impact.totalScore < this.config.autoModifyThreshold)
    ) {
      return this._applyModification(modification);
    }

    // Awaiting approval
    this.pendingModifications.set(modification.id, modification);
    this._emit('modification_pending', modification);

    return {
      status: 'pending_approval',
      modification,
      message: 'Modification requires approval before application',
    };
  }

  /**
   * Approve a modification
   * @param {string} modificationId - Modification ID
   * @returns {Object} Application result
   */
  approveModification(modificationId) {
    const modification = this.pendingModifications.get(modificationId);
    if (!modification) {
      throw new Error(`Modification not found: ${modificationId}`);
    }

    this.pendingModifications.delete(modificationId);
    return this._applyModification(modification);
  }

  /**
   * Reject a modification
   * @param {string} modificationId - Modification ID
   * @param {string} reason - Rejection reason
   * @returns {Object} Rejection result
   */
  rejectModification(modificationId, reason) {
    const modification = this.pendingModifications.get(modificationId);
    if (!modification) {
      throw new Error(`Modification not found: ${modificationId}`);
    }

    modification.status = 'rejected';
    modification.rejectedAt = new Date().toISOString();
    modification.rejectionReason = reason;

    this.pendingModifications.delete(modificationId);
    this._emit('modification_rejected', modification);

    return {
      status: 'rejected',
      modification,
      message: `Modification rejected: ${reason}`,
    };
  }

  /**
   * Apply a modification
   * @private
   */
  _applyModification(modification) {
    const goal = this.goals.get(modification.goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${modification.goalId}`);
    }

    const strategy = modification.strategy;
    const previousState = { ...goal };

    // Apply the modification according to its type
    switch (strategy.type) {
      case ModificationType.PRIORITY_ADJUSTMENT:
        goal.priority = strategy.newPriority;
        break;

      case ModificationType.SCOPE_REDUCTION:
        goal.deliverables = goal.deliverables.filter(
          d => !strategy.reductionTargets?.some(t => t.id === d.id)
        );
        break;

      case ModificationType.SCOPE_EXPANSION:
        goal.deliverables = [...goal.deliverables, ...(strategy.expansionItems || [])];
        break;

      case ModificationType.TIMELINE_EXTENSION:
        if (goal.targetDate) {
          const date = new Date(goal.targetDate);
          date.setDate(date.getDate() + (strategy.extensionDays || 7));
          goal.targetDate = date.toISOString();
        }
        break;

      case ModificationType.TIMELINE_COMPRESSION:
        if (goal.targetDate) {
          const date = new Date(goal.targetDate);
          date.setDate(date.getDate() - (strategy.compressionDays || 3));
          goal.targetDate = date.toISOString();
        }
        break;

      case ModificationType.SUCCESS_CRITERIA_RELAXATION:
        goal.successCriteria = goal.successCriteria.map(c => ({
          ...c,
          threshold: c.threshold ? c.threshold * 0.8 : c.threshold,
        }));
        break;

      case ModificationType.SUCCESS_CRITERIA_TIGHTENING:
        goal.successCriteria = goal.successCriteria.map(c => ({
          ...c,
          threshold: c.threshold ? c.threshold * 1.2 : c.threshold,
        }));
        break;

      case ModificationType.GOAL_DECOMPOSITION:
        // Create sub-goals
        for (const subGoal of strategy.suggestedSubGoals || []) {
          this.registerGoal({
            ...subGoal,
            parentGoalId: goal.id,
          });
        }
        goal.status = 'decomposed';
        break;

      case ModificationType.GOAL_DEFERRAL:
        goal.status = 'deferred';
        goal.deferredAt = new Date().toISOString();
        goal.deferralReason = strategy.deferralReason;
        break;

      case ModificationType.GOAL_CANCELLATION:
        goal.status = 'cancelled';
        goal.cancelledAt = new Date().toISOString();
        break;
    }

    // Update metadata
    goal.modificationCount++;
    goal.lastModifiedAt = new Date().toISOString();

    // Record history
    this.historyManager.recordModification(
      modification.goalId,
      { ...modification, previousState },
      modification.impact
    );

    modification.status = 'applied';
    modification.appliedAt = new Date().toISOString();

    this._emit('modification_applied', {
      modification,
      goal,
      previousState,
    });

    return {
      status: 'applied',
      modification,
      goal,
      previousState,
      message: `Successfully applied ${strategy.type} to goal ${goal.id}`,
    };
  }

  /**
   * Build context
   * @private
   */
  _buildContext(goalId) {
    return {
      goals: Array.from(this.goals.values()),
      currentGoal: this.goals.get(goalId),
      history: this.historyManager.getHistory(goalId),
      patterns: this.historyManager.analyzePatterns(goalId),
    };
  }

  /**
   * Get a goal
   * @param {string} goalId - Goal ID
   * @returns {Object|undefined} The goal
   */
  getGoal(goalId) {
    return this.goals.get(goalId);
  }

  /**
   * Get all goals
   * @returns {Array} List of all goals
   */
  getAllGoals() {
    return Array.from(this.goals.values());
  }

  /**
   * Get the modification history of a goal
   * @param {string} goalId - Goal ID
   * @returns {Object} History and analysis
   */
  getGoalHistory(goalId) {
    return {
      history: this.historyManager.getHistory(goalId),
      patterns: this.historyManager.analyzePatterns(goalId),
    };
  }

  /**
   * Get pending modifications
   * @returns {Array} List of pending modifications
   */
  getPendingModifications() {
    return Array.from(this.pendingModifications.values());
  }

  /**
   * Register an event handler
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Emit an event
   * @private
   */
  _emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    }
  }

  /**
   * Generate modification suggestions
   * @param {string} goalId - Goal ID
   * @param {Object} currentState - Current state
   * @returns {Object} Modification suggestions
   */
  generateSuggestions(goalId, currentState) {
    const goal = this.goals.get(goalId);
    if (!goal) {
      return { suggestions: [] };
    }

    const suggestions = [];
    const patterns = this.historyManager.analyzePatterns(goalId);

    // Progress-based suggestions
    if (currentState.progress < 0.3 && currentState.timeElapsed > 0.5) {
      suggestions.push({
        trigger: { reason: ModificationReason.TIME_CONSTRAINT, gap: 0.2 },
        urgency: 'high',
        description: 'Progress behind schedule - consider scope reduction or timeline extension',
      });
    }

    // Resource-based suggestions
    if (currentState.resourceUtilization > 0.9) {
      suggestions.push({
        trigger: { reason: ModificationReason.RESOURCE_CONSTRAINT },
        urgency: 'medium',
        description: 'High resource utilization - consider prioritization',
      });
    }

    // Pattern-based suggestions
    if (patterns.insights?.some(i => i.type === 'volatility')) {
      suggestions.push({
        trigger: { reason: ModificationReason.SCOPE_CREEP },
        urgency: 'medium',
        description: 'Goal volatility detected - consider stabilization or decomposition',
      });
    }

    return {
      goalId,
      suggestions,
      patterns,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = {
  AdaptiveGoalModifier,
  ImpactAnalyzer,
  ModificationStrategy,
  ModificationHistoryManager,
  ModificationReason,
  ModificationType,
};
