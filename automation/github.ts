import { Buffer } from 'node:buffer';
import { emptyState, validateState, type State } from './budget.ts';
export const repo =
  process.env.GITHUB_REPOSITORY || 'swapupg/swapupg.github.io';
export async function github(
  path: string,
  method = 'GET',
  body?: unknown,
  token = process.env.GH_TOKEN,
) {
  if (!token) throw new Error('Missing GitHub credential');
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok)
    throw new Error(`GitHub ${method} ${path}: ${response.status}`);
  return response.status === 204 ? undefined : response.json();
}
export class StateStore {
  state: State = emptyState();
  sha?: string;
  async open() {
    let branch;
    try {
      branch = await github(`/repos/${repo}/git/ref/heads/automation-state`);
    } catch (e) {
      if (!(e instanceof Error && e.message.endsWith(': 404'))) throw e;
    }
    if (!branch) {
      const main = await github(`/repos/${repo}/git/ref/heads/main`);
      await github(`/repos/${repo}/git/refs`, 'POST', {
        ref: 'refs/heads/automation-state',
        sha: main.object.sha,
      });
    }
    try {
      const file = await github(
        `/repos/${repo}/contents/.automation/state.json?ref=automation-state`,
      );
      this.sha = file.sha;
      this.state = JSON.parse(Buffer.from(file.content, 'base64').toString());
      validateState(this.state);
    } catch (e) {
      if (!(e instanceof Error && e.message.endsWith(': 404'))) throw e;
    }
    return this;
  }
  async save() {
    const result = await github(
      `/repos/${repo}/contents/.automation/state.json`,
      'PUT',
      {
        message: 'Record automation checkpoint',
        branch: 'automation-state',
        ...(this.sha ? { sha: this.sha } : {}),
        content: Buffer.from(
          JSON.stringify(this.state, null, 2) + '\n',
        ).toString('base64'),
      },
    );
    this.sha = result.content.sha;
  }
}
export async function report(title: string, body: string) {
  const issues = await github(`/repos/${repo}/issues?state=open&per_page=100`);
  const previous = issues.find(
    (issue: { title: string; pull_request?: unknown }) =>
      issue.title === title && !issue.pull_request,
  );
  if (previous)
    return github(`/repos/${repo}/issues/${previous.number}`, 'PATCH', {
      body,
    });
  return github(`/repos/${repo}/issues`, 'POST', { title, body });
}
