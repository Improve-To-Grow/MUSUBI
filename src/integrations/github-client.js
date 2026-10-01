/**
 * MUSUBI GitHub Client
 *
 * GitHub API 統合クライアント / GitHub API integration client
 *
 * @module src/integrations/github-client
 * @see REQ-P0-B006
 */

const { Octokit } = require('@octokit/rest');

/**
 * GitHub API クライアント / GitHub API client
 */
class GitHubClient {
  /**
   * @param {Object} options
   * @param {string} options.token - GitHub Personal Access Token
   * @param {string} options.owner - リポジトリオーナー / Repository owner
   * @param {string} options.repo - リポジトリ名 / Repository name
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
   * Issue を取得 / Get an issue
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
   * Issue のコメントを取得 / Get issue comments
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
   * Issue にコメントを追加 / Add a comment to an issue
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
   * Issue にラベルを追加 / Add labels to an issue
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
   * ブランチを作成 / Create a branch
   * @param {string} branchName
   * @param {string} baseBranch - ベースブランチ / Base branch (default: 'main')
   * @returns {Promise<Object>}
   */
  async createBranch(branchName, baseBranch = 'main') {
    // ベースブランチの最新コミットを取得 / Get the latest commit of the base branch
    const { data: baseRef } = await this.octokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${baseBranch}`,
    });

    // 新しいブランチを作成 / Create the new branch
    const { data } = await this.octokit.git.createRef({
      owner: this.owner,
      repo: this.repo,
      ref: `refs/heads/${branchName}`,
      sha: baseRef.object.sha,
    });

    return data;
  }

  /**
   * ファイルを作成/更新 / Create/update a file
   * @param {string} path - ファイルパス / File path
   * @param {string} content - ファイル内容 / File content
   * @param {string} message - コミットメッセージ / Commit message
   * @param {string} branch - ブランチ名 / Branch name
   * @returns {Promise<Object>}
   */
  async createOrUpdateFile(path, content, message, branch) {
    let sha;

    // 既存ファイルの SHA を取得（更新の場合に必要） / Get the SHA of the existing file (required for updates)
    try {
      const { data: existingFile } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: branch,
      });
      sha = existingFile.sha;
    } catch (e) {
      // ファイルが存在しない場合は無視 / Ignore if the file does not exist
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
   * Pull Request を作成 / Create a pull request
   * @param {Object} options
   * @param {string} options.title - PR タイトル / PR title
   * @param {string} options.body - PR 説明 / PR description
   * @param {string} options.head - ソースブランチ / Source branch
   * @param {string} options.base - ターゲットブランチ / Target branch
   * @param {boolean} options.draft - Draft PR フラグ / Draft PR flag
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
   * PR にレビュアーを追加 / Add reviewers to a PR
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
   * Issue を Close / Close an issue
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
   * Issue 一覧を取得 / List issues
   * @param {Object} options
   * @param {string} options.state - 状態 / State ('open', 'closed', 'all')
   * @param {string[]} options.labels - フィルタするラベル / Labels to filter by
   * @param {number} options.perPage - 1ページあたりの件数 / Number of items per page
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
   * リポジトリ情報を取得 / Get repository information
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
   * GitHub Actions ワークフローを手動実行 / Manually trigger a GitHub Actions workflow
   * @param {string} workflowId - ワークフロー ID またはファイル名 / Workflow ID or file name
   * @param {string} ref - ブランチ名 / Branch name
   * @param {Object} inputs - ワークフロー入力 / Workflow inputs
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
 * URL からリポジトリ情報を抽出 / Extract repository info from a URL
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
 * Issue URL から番号を抽出 / Extract the number from an issue URL
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
