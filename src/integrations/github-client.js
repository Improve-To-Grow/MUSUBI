/**
 * MUSUBI GitHub Client
 *
 * GitHub API integration client
 *
 * @module src/integrations/github-client
 * @see REQ-P0-B006
 */

const { Octokit } = require('@octokit/rest');

/**
 * GitHub API client
 */
class GitHubClient {
  /**
   * @param {Object} options
   * @param {string} options.token - GitHub Personal Access Token
   * @param {string} options.owner - Repository owner
   * @param {string} options.repo - Repository name
   */
  constructor(options = {}) {
    this.token = options.token || process.env.GITHUB_TOKEN;
    this.owner = options.owner;
    this.repo = options.repo;

    if (!this.token) {
      console.warn('GitHubClient: No GITHUB_TOKEN provided. API calls may fail.');
    }

    this.octokit = new Octokit({
      auth: this.token,
    });
  }

  /**
   * Get an issue
   * @param {number} issueNumber
   * @returns {Promise<Object>}
   */
  async getIssue(issueNumber) {
    const { data } = await this.octokit.issues.get({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
    });
    return data;
  }

  /**
   * Get the comments of an issue
   * @param {number} issueNumber
   * @returns {Promise<Object[]>}
   */
  async getIssueComments(issueNumber) {
    const { data } = await this.octokit.issues.listComments({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
    });
    return data;
  }

  /**
   * Add a comment to an issue
   * @param {number} issueNumber
   * @param {string} body
   * @returns {Promise<Object>}
   */
  async addIssueComment(issueNumber, body) {
    const { data } = await this.octokit.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      body,
    });
    return data;
  }

  /**
   * Add labels to an issue
   * @param {number} issueNumber
   * @param {string[]} labels
   * @returns {Promise<Object>}
   */
  async addLabels(issueNumber, labels) {
    const { data } = await this.octokit.issues.addLabels({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      labels,
    });
    return data;
  }

  /**
   * Create a branch
   * @param {string} branchName
   * @param {string} baseBranch - Base branch (default: 'main')
   * @returns {Promise<Object>}
   */
  async createBranch(branchName, baseBranch = 'main') {
    // Get the latest commit of the base branch
    const { data: baseRef } = await this.octokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${baseBranch}`,
    });

    // Create the new branch
    const { data } = await this.octokit.git.createRef({
      owner: this.owner,
      repo: this.repo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });

    return data;
  }

  /**
   * Create or update a file
   * @param {string} path - File path
   * @param {string} content - File content
   * @param {string} message - Commit message
   * @param {string} branch - Branch name
   * @returns {Promise<Object>}
   */
  async createOrUpdateFile(path, content, message, branch) {
    let sha;

    // Get the SHA of the existing file (required for updates)
    try {
      const { data: existingFile } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: branch,
      });
      sha = existingFile.sha;
    } catch (e) {
      // Ignore if the file does not exist
    }

    const { data } = await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
      sha,
    });

    return data;
  }

  /**
   * Create a pull request
   * @param {Object} options
   * @param {string} options.title - PR title
   * @param {string} options.body - PR description
   * @param {string} options.head - Source branch
   * @param {string} options.base - Target branch
   * @param {boolean} options.draft - Draft PR flag
   * @returns {Promise<Object>}
   */
  async createPullRequest(options) {
    const { data } = await this.octokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title: options.title,
      body: options.body,
      head: options.head,
      base: options.base || 'main',
      draft: options.draft !== false,
    });

    return data;
  }

  /**
   * Add reviewers to a PR
   * @param {number} pullNumber
   * @param {string[]} reviewers
   * @returns {Promise<Object>}
   */
  async addReviewers(pullNumber, reviewers) {
    const { data } = await this.octokit.pulls.requestReviewers({
      owner: this.owner,
      repo: this.repo,
      pull_number: pullNumber,
      reviewers,
    });
    return data;
  }

  /**
   * Close an issue
   * @param {number} issueNumber
   * @returns {Promise<Object>}
   */
  async closeIssue(issueNumber) {
    const { data } = await this.octokit.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      state: 'closed',
    });
    return data;
  }

  /**
   * List issues
   * @param {Object} options
   * @param {string} options.state - State ('open', 'closed', 'all')
   * @param {string[]} options.labels - Labels to filter by
   * @param {number} options.perPage - Number of results per page
   * @returns {Promise<Object[]>}
   */
  async listIssues(options = {}) {
    const { data } = await this.octokit.issues.listForRepo({
      owner: this.owner,
      repo: this.repo,
      state: options.state || 'open',
      labels: options.labels?.join(','),
      per_page: options.perPage || 30,
    });
    return data;
  }

  /**
   * Get repository information
   * @returns {Promise<Object>}
   */
  async getRepository() {
    const { data } = await this.octokit.repos.get({
      owner: this.owner,
      repo: this.repo,
    });
    return data;
  }

  /**
   * Manually dispatch a GitHub Actions workflow
   * @param {string} workflowId - Workflow ID or file name
   * @param {string} ref - Branch name
   * @param {Object} inputs - Workflow inputs
   * @returns {Promise<void>}
   */
  async dispatchWorkflow(workflowId, ref, inputs = {}) {
    await this.octokit.actions.createWorkflowDispatch({
      owner: this.owner,
      repo: this.repo,
      workflow_id: workflowId,
      ref,
      inputs,
    });
  }
}

/**
 * Extract repository information from a URL
 * @param {string} url
 * @returns {Object|null}
 */
function parseGitHubUrl(url) {
  const match = url.match(/github\.com[:/]([^/]+)\/([^/\s.]+)/);
  if (match) {
    return {
      owner: match[1],
      repo: match[2].replace('.git', ''),
    };
  }
  return null;
}

/**
 * Extract the issue number from an issue URL
 * @param {string} url
 * @returns {number|null}
 */
function parseIssueNumber(url) {
  const match = url.match(/\/issues\/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

module.exports = {
  GitHubClient,
  parseGitHubUrl,
  parseIssueNumber,
};
