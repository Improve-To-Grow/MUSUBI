/**
 * SprintReporter Implementation
 *
 * Generates sprint completion reports.
 *
 * Requirement: IMP-6.2-003-04
 * Design: Section 4.4
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  storageDir: 'storage/reports',
};

/**
 * SprintReporter
 *
 * Generates and manages sprint reports.
 */
class SprintReporter {
  /**
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate sprint completion report
   * @param {Object} sprint - Sprint data
   * @returns {Promise<Object>} Generated report
   */
  async generateReport(sprint) {
    const report = {
      id: `RPT-${sprint.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sprintId: sprint.id,
      sprintName: sprint.name,
      featureId: sprint.featureId,
      generatedAt: new Date().toISOString(),
      period: {
        start: sprint.startDate,
        end: sprint.endDate,
        startedAt: sprint.startedAt,
        completedAt: sprint.completedAt,
      },
      metrics: this.calculateMetrics(sprint),
      taskSummary: this.summarizeTasks(sprint),
      velocityAnalysis: this.analyzeVelocity(sprint),
      recommendations: this.generateRecommendations(sprint),
    };

    await this.saveReport(report);

    return report;
  }

  /**
   * Calculate sprint metrics
   * @param {Object} sprint - Sprint data
   * @returns {Object} Metrics
   */
  calculateMetrics(sprint) {
    const tasks = sprint.tasks || [];
    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedTasks = tasks.filter(t => t.status === 'done');
    const completedPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const plannedVelocity = sprint.velocity || 0;
    const actualVelocity = completedPoints;
    const velocityDiff = actualVelocity - plannedVelocity;

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      incompleteTasks: tasks.length - completedTasks.length,
      totalPoints,
      completedPoints,
      remainingPoints: totalPoints - completedPoints,
      completionRate:
        tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
      pointsCompletionRate: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
      plannedVelocity,
      actualVelocity,
      velocityDiff,
      velocityAccuracy:
        plannedVelocity > 0 ? Math.round((actualVelocity / plannedVelocity) * 100) : 0,
    };
  }

  /**
   * Summarize tasks by status and priority
   * @param {Object} sprint - Sprint data
   * @returns {Object} Task summary
   */
  summarizeTasks(sprint) {
    const tasks = sprint.tasks || [];

    const byStatus = {
      todo: tasks.filter(t => t.status === 'todo'),
      inProgress: tasks.filter(t => t.status === 'in-progress'),
      done: tasks.filter(t => t.status === 'done'),
    };

    const byPriority = {
      critical: tasks.filter(t => t.priority === 'critical'),
      high: tasks.filter(t => t.priority === 'high'),
      medium: tasks.filter(t => t.priority === 'medium'),
      low: tasks.filter(t => t.priority === 'low'),
    };

    const completedByPriority = {
      critical: byPriority.critical.filter(t => t.status === 'done').length,
      high: byPriority.high.filter(t => t.status === 'done').length,
      medium: byPriority.medium.filter(t => t.status === 'done').length,
      low: byPriority.low.filter(t => t.status === 'done').length,
    };

    return {
      byStatus: {
        todo: byStatus.todo.length,
        inProgress: byStatus.inProgress.length,
        done: byStatus.done.length,
      },
      byPriority: {
        critical: byPriority.critical.length,
        high: byPriority.high.length,
        medium: byPriority.medium.length,
        low: byPriority.low.length,
      },
      completedByPriority,
      incompleteTasks: [...byStatus.todo, ...byStatus.inProgress].map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        storyPoints: t.storyPoints,
        status: t.status,
      })),
    };
  }

  /**
   * Analyze velocity trends
   * @param {Object} sprint - Sprint data
   * @returns {Object} Velocity analysis
   */
  analyzeVelocity(sprint) {
    const metrics = this.calculateMetrics(sprint);

    let status;
    if (metrics.velocityAccuracy >= 90 && metrics.velocityAccuracy <= 110) {
      status = 'on-target';
    } else if (metrics.velocityAccuracy > 110) {
      status = 'over-performing';
    } else if (metrics.velocityAccuracy >= 70) {
      status = 'slightly-under';
    } else {
      status = 'under-performing';
    }

    return {
      planned: metrics.plannedVelocity,
      actual: metrics.actualVelocity,
      difference: metrics.velocityDiff,
      accuracy: metrics.velocityAccuracy,
      status,
    };
  }

  /**
   * Generate recommendations based on sprint results
   * @param {Object} sprint - Sprint data
   * @returns {Array} Recommendations
   */
  generateRecommendations(sprint) {
    const recommendations = [];
    const metrics = this.calculateMetrics(sprint);
    const taskSummary = this.summarizeTasks(sprint);

    // Velocity recommendations
    if (metrics.velocityAccuracy < 70) {
      recommendations.push({
        type: 'velocity',
        severity: 'high',
        message:
          'スプリントの実績ベロシティが計画の70%未満でした。次のスプリントでは計画ベロシティを下げることを検討してください。', // EN: Actual sprint velocity was below 70% of plan. Consider lowering planned velocity for the next sprint.
      });
    } else if (metrics.velocityAccuracy > 130) {
      recommendations.push({
        type: 'velocity',
        severity: 'medium',
        message:
          '計画以上のベロシティを達成しました。次のスプリントでは計画ベロシティを上げることを検討してください。', // EN: Velocity exceeded the plan. Consider raising planned velocity for the next sprint.
      });
    }

    // Incomplete critical tasks
    const incompleteCritical =
      taskSummary.byPriority.critical - taskSummary.completedByPriority.critical;
    if (incompleteCritical > 0) {
      recommendations.push({
        type: 'priority',
        severity: 'critical',
        message: `${incompleteCritical}件のクリティカルタスクが未完了です。次のスプリントで優先的に対応してください。`, // EN: ${incompleteCritical} critical task(s) remain incomplete. Prioritize them in the next sprint.
      });
    }

    // High number of incomplete tasks
    if (metrics.completionRate < 50) {
      recommendations.push({
        type: 'planning',
        severity: 'high',
        message:
          'タスク完了率が50%未満です。タスクの見積もりや優先順位付けの改善を検討してください。', // EN: Task completion rate is below 50%. Consider improving task estimation and prioritization.
      });
    }

    // Many in-progress tasks
    if (taskSummary.byStatus.inProgress > 3) {
      recommendations.push({
        type: 'wip',
        severity: 'medium',
        message:
          '進行中のタスクが多すぎます。WIP制限を設けてフォーカスを高めることを検討してください。', // EN: Too many tasks in progress. Consider setting WIP limits to improve focus.
      });
    }

    return recommendations;
  }

  /**
   * Generate markdown report
   * @param {Object} sprint - Sprint data
   * @returns {Promise<string>} Markdown report
   */
  async generateMarkdownReport(sprint) {
    const report = await this.generateReport(sprint);
    const lines = [];

    lines.push(`# Sprint Report: ${report.sprintName}`);
    lines.push('');
    lines.push(`**Generated:** ${report.generatedAt}`);
    lines.push(`**Feature:** ${report.featureId || 'N/A'}`);
    lines.push(`**Period:** ${report.period.start} - ${report.period.end}`);
    lines.push('');

    // Metrics
    lines.push('## Metrics');
    lines.push('');
    lines.push('| Metric | Value |');
    lines.push('|--------|-------|');
    lines.push(`| Total Tasks | ${report.metrics.totalTasks} |`);
    lines.push(`| Completed Tasks | ${report.metrics.completedTasks} |`);
    lines.push(`| Completion Rate | ${report.metrics.completionRate}% |`);
    lines.push(`| Total Points | ${report.metrics.totalPoints} |`);
    lines.push(`| Completed Points | ${report.metrics.completedPoints} |`);
    lines.push(`| Points Completion | ${report.metrics.pointsCompletionRate}% |`);
    lines.push(`| Planned Velocity | ${report.metrics.plannedVelocity} |`);
    lines.push(`| Actual Velocity | ${report.metrics.actualVelocity} |`);
    lines.push(`| Velocity Accuracy | ${report.metrics.velocityAccuracy}% |`);
    lines.push('');

    // Velocity Analysis
    lines.push('## Velocity Analysis');
    lines.push('');
    const va = report.velocityAnalysis;
    const statusEmoji = {
      'on-target': '✅',
      'over-performing': '🚀',
      'slightly-under': '⚠️',
      'under-performing': '❌',
    };
    lines.push(`Status: ${statusEmoji[va.status] || '❓'} **${va.status}**`);
    lines.push('');

    // Task Summary
    lines.push('## Task Summary');
    lines.push('');
    lines.push('### By Status');
    lines.push(`- ⬜ Todo: ${report.taskSummary.byStatus.todo}`);
    lines.push(`- 🔄 In Progress: ${report.taskSummary.byStatus.inProgress}`);
    lines.push(`- ✅ Done: ${report.taskSummary.byStatus.done}`);
    lines.push('');

    lines.push('### By Priority');
    lines.push(
      `- 🔴 Critical: ${report.taskSummary.completedByPriority.critical}/${report.taskSummary.byPriority.critical}`
    );
    lines.push(
      `- 🟠 High: ${report.taskSummary.completedByPriority.high}/${report.taskSummary.byPriority.high}`
    );
    lines.push(
      `- 🟡 Medium: ${report.taskSummary.completedByPriority.medium}/${report.taskSummary.byPriority.medium}`
    );
    lines.push(
      `- 🟢 Low: ${report.taskSummary.completedByPriority.low}/${report.taskSummary.byPriority.low}`
    );
    lines.push('');

    // Incomplete Tasks
    if (report.taskSummary.incompleteTasks.length > 0) {
      lines.push('### Incomplete Tasks');
      lines.push('');
      for (const task of report.taskSummary.incompleteTasks) {
        lines.push(`- **${task.id}**: ${task.title} (${task.priority}, ${task.storyPoints}pt)`);
      }
      lines.push('');
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      lines.push('## Recommendations');
      lines.push('');
      const severityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
      };
      for (const rec of report.recommendations) {
        lines.push(`${severityEmoji[rec.severity] || '❓'} **${rec.type}**: ${rec.message}`);
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Save report to storage
   * @param {Object} report - Report to save
   */
  async saveReport(report) {
    await this.ensureStorageDir();

    const filePath = path.join(this.config.storageDir, `${report.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');
  }

  /**
   * Load report from storage
   * @param {string} reportId - Report ID
   * @returns {Promise<Object|null>} Report
   */
  async loadReport(reportId) {
    try {
      const filePath = path.join(this.config.storageDir, `${reportId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * List reports for sprint
   * @param {string} sprintId - Sprint ID
   * @returns {Promise<Array>} Report list
   */
  async listReports(sprintId) {
    try {
      const files = await fs.readdir(this.config.storageDir);
      return files
        .filter(f => f.includes(sprintId) && f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch {
      return [];
    }
  }

  /**
   * Ensure storage directory exists
   */
  async ensureStorageDir() {
    try {
      await fs.access(this.config.storageDir);
    } catch {
      await fs.mkdir(this.config.storageDir, { recursive: true });
    }
  }
}

module.exports = { SprintReporter };
