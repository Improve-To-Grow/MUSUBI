/**
 * MUSUBI Issue Resolver
 *
 * Analyzes GitHub issues and automatically proposes and implements solutions
 *
 * @module src/resolvers/issue-resolver
 * @see REQ-P0-B006
 * @inspired-by OpenHands openhands/resolver/
 */

const fs = require('fs');
const path = require('path');

// GitHub client (optional dependency)
let GitHubClient;
try {
  GitHubClient = require('../integrations/github-client').GitHubClient;
} catch (e) {
  GitHubClient = null;
}

/**
 * Issue types
 */
const IssueType = {
  BUG: 'bug',
  FEATURE: 'feature',
  DOCUMENTATION: 'documentation',
  REFACTOR: 'refactor',
  TEST: 'test',
  UNKNOWN: 'unknown',
};

/**
 * Resolution status
 */
const ResolverStatus = {
  PENDING: 'pending',
  ANALYZING: 'analyzing',
  IMPLEMENTING: 'implementing',
  TESTING: 'testing',
  COMPLETE: 'complete',
  FAILED: 'failed',
};

/**
 * Issue information
 */
class IssueInfo {
  constructor(options = {}) {
    this.number = options.number;
    this.title = options.title || '';
    this.body = options.body || '';
    this.labels = options.labels || [];
    this.author = options.author || '';
    this.url = options.url || '';
    this.createdAt = options.createdAt || new Date();
    this.comments = options.comments || [];
  }

  /**
   * Infer the issue type
   * @returns {string}
   */
  get type() {
    const labelNames = this.labels.map(l =>
      typeof l === 'string' ? l.toLowerCase() : (l.name || '').toLowerCase()
    );

    if (labelNames.some(l => l.includes('bug') || l.includes('fix'))) {
      return IssueType.BUG;
    }
    if (labelNames.some(l => l.includes('feature') || l.includes('enhancement'))) {
      return IssueType.FEATURE;
    }
    if (labelNames.some(l => l.includes('doc'))) {
      return IssueType.DOCUMENTATION;
    }
    if (labelNames.some(l => l.includes('refactor'))) {
      return IssueType.REFACTOR;
    }
    if (labelNames.some(l => l.includes('test'))) {
      return IssueType.TEST;
    }

    // Also infer from the title and body
    const content = `${this.title} ${this.body}`.toLowerCase();
    if (content.includes('bug') || content.includes('error') || content.includes('fix')) {
      return IssueType.BUG;
    }
    if (content.includes('add') || content.includes('implement') || content.includes('feature')) {
      return IssueType.FEATURE;
    }

    return IssueType.UNKNOWN;
  }

  /**
   * Get the full content
   * @returns {string}
   */
  get fullContent() {
    let content = `# ${this.title}\n\n${this.body}`;
    if (this.comments.length > 0) {
      content += '\n\n## Comments\n\n';
      content += this.comments.map(c => `**${c.author}**: ${c.body}`).join('\n\n');
    }
    return content;
  }
}

/**
 * Resolution result
 */
class ResolverResult {
  constructor(options = {}) {
    this.status = options.status || ResolverStatus.PENDING;
    this.issue = options.issue;
    this.requirements = options.requirements || [];
    this.impactAnalysis = options.impactAnalysis || null;
    this.changes = options.changes || [];
    this.tests = options.tests || [];
    this.prUrl = options.prUrl || null;
    this.branchName = options.branchName || null;
    this.error = options.error || null;
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      status: this.status,
      issueNumber: this.issue?.number,
      issueType: this.issue?.type,
      requirements: this.requirements,
      changesCount: this.changes.length,
      testsCount: this.tests.length,
      prUrl: this.prUrl,
      branchName: this.branchName,
      error: this.error,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Render the report as Markdown
   * @returns {string}
   */
  toMarkdown() {
    let md = `# Issue Resolution Report\n\n`;
    md += `- **Status**: ${this.status}\n`;
    md += `- **Issue**: #${this.issue?.number} - ${this.issue?.title}\n`;
    md += `- **Type**: ${this.issue?.type}\n\n`;

    if (this.requirements.length > 0) {
      md += `## Extracted Requirements\n\n`;
      this.requirements.forEach((req, i) => {
        md += `${i + 1}. ${req}\n`;
      });
      md += '\n';
    }

    if (this.impactAnalysis) {
      md += `## Impact Analysis\n\n`;
      md += `${this.impactAnalysis}\n\n`;
    }

    if (this.changes.length > 0) {
      md += `## Changes\n\n`;
      this.changes.forEach(change => {
        md += `- \`${change.file}\`: ${change.description}\n`;
      });
      md += '\n';
    }

    if (this.tests.length > 0) {
      md += `## Tests Added\n\n`;
      this.tests.forEach(test => {
        md += `- \`${test.file}\`: ${test.description}\n`;
      });
      md += '\n';
    }

    if (this.prUrl) {
      md += `## Pull Request\n\n`;
      md += `[View PR](${this.prUrl})\n\n`;
    }

    if (this.error) {
      md += `## Error\n\n`;
      md += `\`\`\`\n${this.error}\n\`\`\`\n`;
    }

    return md;
  }
}

/**
 * Impact analysis result
 */
class ImpactAnalysis {
  constructor(options = {}) {
    this.affectedFiles = options.affectedFiles || [];
    this.affectedComponents = options.affectedComponents || [];
    this.relatedRequirements = options.relatedRequirements || [];
    this.riskLevel = options.riskLevel || 'low';
    this.estimatedEffort = options.estimatedEffort || 'unknown';
  }

  toMarkdown() {
    let md = `### Affected Files\n\n`;
    md += this.affectedFiles.map(f => `- \`${f}\``).join('\n') || '- None identified\n';
    md += `\n\n### Components\n\n`;
    md += this.affectedComponents.map(c => `- ${c}`).join('\n') || '- None identified\n';
    md += `\n\n### Risk Level: ${this.riskLevel}\n`;
    md += `### Estimated Effort: ${this.estimatedEffort}\n`;
    return md;
  }
}

/**
 * Issue resolver
 */
class IssueResolver {
  /**
   * @param {Object} options
   * @param {string} options.projectRoot - Project root
   * @param {string} options.githubToken - GitHub token
   * @param {boolean} options.draftPR - Whether to create a draft PR
   * @param {boolean} options.dryRun - Do not make any actual changes
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.githubToken = options.githubToken || process.env.GITHUB_TOKEN;
    this.draftPR = options.draftPR !== false;
    this.dryRun = options.dryRun || false;
    this.repo = options.repo || this._detectRepo();

    // Initialize the GitHub client
    this.github = null;
    if (GitHubClient && this.githubToken && this.repo) {
      this.github = new GitHubClient({
        token: this.githubToken,
        owner: this.repo.owner,
        repo: this.repo.repo,
      });
    }
  }

  /**
   * Detect repository information
   * @returns {Object|null}
   */
  _detectRepo() {
    try {
      const gitConfigPath = path.join(this.projectRoot, '.git/config');
      if (!fs.existsSync(gitConfigPath)) return null;

      const config = fs.readFileSync(gitConfigPath, 'utf-8');
      const match = config.match(/url\s*=\s*.*github\.com[:/]([^/]+)\/([^/\s.]+)/);
      if (match) {
        return { owner: match[1], repo: match[2].replace('.git', '') };
      }
    } catch (e) {
      // Ignore
    }
    return null;
  }

  /**
   * Resolve an issue
   * @param {string|number|IssueInfo} issue - Issue URL, number, or IssueInfo
   * @returns {Promise<ResolverResult>}
   */
  async resolve(issue) {
    const result = new ResolverResult({ status: ResolverStatus.ANALYZING });

    try {
      // 1. Fetch/normalize issue information
      const issueInfo = issue instanceof IssueInfo ? issue : await this.fetchIssue(issue);
      result.issue = issueInfo;

      // 2. Extract requirements
      result.requirements = this.extractRequirements(issueInfo);

      // 3. Analyze impact
      result.status = ResolverStatus.ANALYZING;
      result.impactAnalysis = await this.analyzeImpact(result.requirements, issueInfo);

      // 4. Generate the change plan
      result.status = ResolverStatus.IMPLEMENTING;
      result.changes = await this.planChanges(
        issueInfo,
        result.requirements,
        result.impactAnalysis
      );

      // 5. Generate the test plan
      result.status = ResolverStatus.TESTING;
      result.tests = await this.planTests(issueInfo, result.changes);

      // 6. Determine the branch name
      result.branchName = this.generateBranchName(issueInfo);

      // 7. Create a PR unless this is a dry run
      if (!this.dryRun && this.github) {
        try {
          // Create branch
          await this.github.createBranch(result.branchName);

          // Post the analysis as an issue comment
          const analysisComment = this._formatAnalysisComment(result);
          await this.github.addIssueComment(issueInfo.number, analysisComment);

          // Add labels
          await this.github.addLabels(issueInfo.number, ['musubi-analyzed']);

          // Create PR (draft)
          const prBody = this._formatPRBody(issueInfo, result);
          const pr = await this.github.createPullRequest({
            title: `${issueInfo.type === IssueType.BUG ? 'fix' : 'feat'}: ${issueInfo.title} (Closes #${issueInfo.number})`,
            body: prBody,
            head: result.branchName,
            base: 'main',
            draft: this.draftPR,
          });

          result.prUrl = pr.html_url;
        } catch (apiError) {
          console.warn(`GitHub API error: ${apiError.message}`);
          // Still return the analysis result on API errors
        }
      }

      result.status = ResolverStatus.COMPLETE;
    } catch (error) {
      result.status = ResolverStatus.FAILED;
      result.error = error.message;
    }

    return result;
  }

  /**
   * Format the analysis comment
   * @param {ResolverResult} result
   * @returns {string}
   */
  _formatAnalysisComment(result) {
    let comment = `## 🤖 MUSUBI Issue Analysis\n\n`;
    comment += `**Type**: ${result.issue?.type}\n`;
    comment += `**Branch**: \`${result.branchName}\`\n\n`;

    if (result.requirements.length > 0) {
      comment += `### Extracted Requirements\n\n`;
      result.requirements.forEach((req, i) => {
        comment += `${i + 1}. ${req}\n`;
      });
      comment += '\n';
    }

    if (result.impactAnalysis) {
      comment += `### Impact Analysis\n\n`;
      comment += `- **Risk Level**: ${result.impactAnalysis.riskLevel}\n`;
      comment += `- **Estimated Effort**: ${result.impactAnalysis.estimatedEffort}\n`;
      if (result.impactAnalysis.affectedFiles.length > 0) {
        comment += `- **Affected Files**: ${result.impactAnalysis.affectedFiles
          .slice(0, 5)
          .map(f => `\`${f}\``)
          .join(', ')}\n`;
      }
    }

    comment += `\n---\n_Analyzed by MUSUBI Issue Resolver_`;
    return comment;
  }

  /**
   * Format the PR body
   * @param {IssueInfo} issue
   * @param {ResolverResult} result
   * @returns {string}
   */
  _formatPRBody(issue, result) {
    let body = `## Summary\n\n`;
    body += `Resolves #${issue.number}\n\n`;

    body += `## Requirements Addressed\n\n`;
    result.requirements.forEach((req, _i) => {
      body += `- [ ] ${req}\n`;
    });

    if (result.changes.length > 0) {
      body += `\n## Planned Changes\n\n`;
      result.changes.forEach(change => {
        body += `- \`${change.file}\`: ${change.description}\n`;
      });
    }

    if (result.tests.length > 0) {
      body += `\n## Tests\n\n`;
      result.tests.forEach(test => {
        body += `- \`${test.file}\`: ${test.description}\n`;
      });
    }

    body += `\n---\n_This PR was created by MUSUBI Issue Resolver_`;
    return body;
  }

  /**
   * Fetch an issue
   * @param {string|number} issueRef - Issue URL or number
   * @returns {Promise<IssueInfo>}
   */
  async fetchIssue(issueRef) {
    // Parse from URL
    let issueNumber;
    if (typeof issueRef === 'string' && issueRef.includes('github.com')) {
      const match = issueRef.match(/\/issues\/(\d+)/);
      if (match) {
        issueNumber = parseInt(match[1]);
      }
    } else {
      issueNumber = typeof issueRef === 'number' ? issueRef : parseInt(issueRef);
    }

    // Fetch via the GitHub API
    if (this.github && issueNumber) {
      try {
        const issueData = await this.github.getIssue(issueNumber);
        const comments = await this.github.getIssueComments(issueNumber);

        return new IssueInfo({
          number: issueData.number,
          title: issueData.title,
          body: issueData.body || '',
          labels: issueData.labels.map(l => l.name || l),
          author: issueData.user?.login || '',
          url: issueData.html_url,
          createdAt: new Date(issueData.created_at),
          comments: comments.map(c => ({
            author: c.user?.login || '',
            body: c.body || '',
          })),
        });
      } catch (error) {
        console.warn(`Failed to fetch issue #${issueNumber} from GitHub: ${error.message}`);
        // Fall back
      }
    }

    // Fallback: local mock
    return new IssueInfo({
      number: issueNumber,
      title: `Issue #${issueNumber}`,
      body: '',
      url: typeof issueRef === 'string' ? issueRef : '',
    });
  }

  /**
   * Extract requirements from an issue
   * @param {IssueInfo} issue
   * @returns {string[]}
   */
  extractRequirements(issue) {
    const requirements = [];
    const content = issue.fullContent;

    // Extract task list items (checkboxes)
    const taskPattern = /- \[[ x]\] (.+)/g;
    let match;
    while ((match = taskPattern.exec(content)) !== null) {
      requirements.push(match[1].trim());
    }

    // Extract "should" / "must" / "need to" patterns
    const requirementPatterns = [
      /(?:should|must|need to|needs to)\s+(.+?)(?:\.|$)/gi,
      /(?:expected|expect|want)\s+(?:to\s+)?(.+?)(?:\.|$)/gi,
    ];

    for (const pattern of requirementPatterns) {
      while ((match = pattern.exec(content)) !== null) {
        const req = match[1].trim();
        if (req.length > 10 && req.length < 200 && !requirements.includes(req)) {
          requirements.push(req);
        }
      }
    }

    // Default requirements based on issue type
    if (requirements.length === 0) {
      switch (issue.type) {
        case IssueType.BUG:
          requirements.push(`Fix the issue described: ${issue.title}`);
          break;
        case IssueType.FEATURE:
          requirements.push(`Implement the feature: ${issue.title}`);
          break;
        default:
          requirements.push(`Address: ${issue.title}`);
      }
    }

    return requirements;
  }

  /**
   * Analyze impact
   * @param {string[]} requirements
   * @param {IssueInfo} issue
   * @returns {Promise<ImpactAnalysis>}
   */
  async analyzeImpact(requirements, issue) {
    const analysis = new ImpactAnalysis();
    const content = issue.fullContent.toLowerCase();

    // Detect file paths
    const filePattern = /(?:in|at|file)\s+[`"]?([a-zA-Z0-9_\-./]+\.[a-zA-Z]+)[`"]?/gi;
    let match;
    while ((match = filePattern.exec(content)) !== null) {
      const filePath = match[1];
      if (!analysis.affectedFiles.includes(filePath)) {
        analysis.affectedFiles.push(filePath);
      }
    }

    // Detect backtick-quoted paths
    const backtickPattern = /`([a-zA-Z0-9_\-./]+\.[a-zA-Z]+)`/g;
    while ((match = backtickPattern.exec(content)) !== null) {
      const filePath = match[1];
      if (!analysis.affectedFiles.includes(filePath)) {
        analysis.affectedFiles.push(filePath);
      }
    }

    // Detect components
    const componentPatterns = [
      /(?:component|module|class|function)\s+[`"]?(\w+)[`"]?/gi,
      /(\w+)(?:Component|Module|Service|Controller|Manager)/g,
    ];

    for (const pattern of componentPatterns) {
      while ((match = pattern.exec(issue.fullContent)) !== null) {
        const component = match[1];
        if (component.length > 2 && !analysis.affectedComponents.includes(component)) {
          analysis.affectedComponents.push(component);
        }
      }
    }

    // Detect requirement IDs
    const reqPattern = /REQ-[A-Z0-9]+-\d+/g;
    const reqMatches = issue.fullContent.match(reqPattern) || [];
    analysis.relatedRequirements = [...new Set(reqMatches)];

    // Estimate risk level
    analysis.riskLevel = this._estimateRiskLevel(issue, analysis);

    // Estimate effort
    analysis.estimatedEffort = this._estimateEffort(issue, requirements);

    return analysis;
  }

  /**
   * Estimate the risk level
   * @param {IssueInfo} issue
   * @param {ImpactAnalysis} analysis
   * @returns {string}
   */
  _estimateRiskLevel(issue, analysis) {
    const content = issue.fullContent.toLowerCase();

    // High-risk keywords
    const highRiskKeywords = [
      'security',
      'authentication',
      'authorization',
      'database',
      'migration',
      'production',
    ];
    if (highRiskKeywords.some(k => content.includes(k))) {
      return 'high';
    }

    // Medium risk
    if (analysis.affectedFiles.length > 5 || analysis.affectedComponents.length > 3) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Estimate effort
   * @param {IssueInfo} issue
   * @param {string[]} requirements
   * @returns {string}
   */
  _estimateEffort(issue, requirements) {
    if (requirements.length > 5) return 'large';
    if (requirements.length > 2) return 'medium';
    return 'small';
  }

  /**
   * Create the change plan
   * @param {IssueInfo} issue
   * @param {string[]} requirements
   * @param {ImpactAnalysis} impact
   * @returns {Promise<Object[]>}
   */
  async planChanges(issue, requirements, impact) {
    const changes = [];

    // Plan changes for affected files
    for (const file of impact.affectedFiles) {
      changes.push({
        file,
        type: 'modify',
        description: `Update based on requirements`,
      });
    }

    // Additional changes based on issue type
    if (issue.type === IssueType.BUG && changes.length === 0) {
      changes.push({
        file: 'src/fix.js', // Placeholder
        type: 'modify',
        description: `Fix: ${issue.title}`,
      });
    }

    if (issue.type === IssueType.FEATURE) {
      changes.push({
        file: 'src/new-feature.js', // Placeholder
        type: 'create',
        description: `Implement: ${issue.title}`,
      });
    }

    return changes;
  }

  /**
   * Create the test plan
   * @param {IssueInfo} issue
   * @param {Object[]} changes
   * @returns {Promise<Object[]>}
   */
  async planTests(issue, changes) {
    const tests = [];

    for (const change of changes) {
      if (change.file.endsWith('.js') && !change.file.includes('.test.')) {
        const testFile = change.file.replace(/\.js$/, '.test.js');
        tests.push({
          file: testFile,
          type: change.type === 'create' ? 'create' : 'update',
          description: `Add/update tests for ${change.file}`,
        });
      }
    }

    // Additional tests based on issue type
    if (issue.type === IssueType.BUG) {
      tests.push({
        file: 'tests/regression.test.js',
        type: 'update',
        description: `Add regression test for issue #${issue.number}`,
      });
    }

    return tests;
  }

  /**
   * Generate a branch name
   * @param {IssueInfo} issue
   * @returns {string}
   */
  generateBranchName(issue) {
    const prefix = issue.type === IssueType.BUG ? 'fix' : 'feat';
    const slug = issue.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 30)
      .replace(/-+$/, '');
    return `${prefix}/${issue.number}-${slug}`;
  }

  /**
   * Generate a preview (for dry runs)
   * @param {ResolverResult} result
   * @returns {string}
   */
  generatePreview(result) {
    let preview = `# Issue Resolution Preview\n\n`;
    preview += `This is a dry run. No changes will be made.\n\n`;
    preview += result.toMarkdown();
    return preview;
  }
}

module.exports = {
  IssueResolver,
  IssueInfo,
  IssueType,
  ResolverResult,
  ResolverStatus,
  ImpactAnalysis,
};
