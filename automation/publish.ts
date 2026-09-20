import { readFile, copyFile, appendFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { parse } from 'yaml';
import { github, StateStore, report, repo } from './github.ts';
import { editionId, localDate } from './policy.ts';
const manifest = JSON.parse(
  await readFile('.automation-output/manifest.json', 'utf8'),
);
const { id, kind, date, path, disposition, dry } = manifest;
if (
  !['daily', 'research'].includes(kind) ||
  id !== editionId(kind, date) ||
  date !== localDate() ||
  path !== `src/content/${kind === 'daily' ? 'notes' : 'research'}/${id}.md` ||
  !['publish', 'review'].includes(disposition)
)
  throw new Error('Invalid publication manifest');
const content = await readFile('.automation-output/article.md', 'utf8');
const frontmatter = parse(content.split('---')[1]);
if (
  content.includes('<') ||
  /^(?:import|export)\s/m.test(content) ||
  frontmatter.authorship !== 'automated' ||
  frontmatter.author !== 'Model Fieldnotes' ||
  frontmatter.published !== date ||
  frontmatter.status !== 'published'
)
  throw new Error('Invalid generated content');
if (process.argv.includes('--stage')) {
  await copyFile('.automation-output/article.md', path);
} else {
  if (dry || process.env.AUTOMATION_ENABLED !== 'true')
    throw new Error('Publication is disabled');
  const store = await new StateStore().open();
  const branch =
    disposition === 'publish' && kind === 'daily' ? 'main' : `automation/${id}`;
  if (branch !== 'main') {
    try {
      await github(`/repos/${repo}/git/ref/heads/${branch}`);
    } catch (e) {
      if (!(e instanceof Error && e.message.endsWith(': 404'))) throw e;
      const main = await github(`/repos/${repo}/git/ref/heads/main`);
      await github(`/repos/${repo}/git/refs`, 'POST', {
        ref: `refs/heads/${branch}`,
        sha: main.object.sha,
      });
    }
  }
  let file;
  try {
    file = await github(`/repos/${repo}/contents/${path}?ref=${branch}`);
  } catch (e) {
    if (!(e instanceof Error && e.message.endsWith(': 404'))) throw e;
  }
  let sha;
  if (file) {
    if (Buffer.from(file.content, 'base64').toString() !== content)
      throw new Error('Edition exists with different content; review manually');
    sha = (await github(`/repos/${repo}/git/ref/heads/${branch}`)).object.sha;
  } else {
    const result = await github(`/repos/${repo}/contents/${path}`, 'PUT', {
      message: `Add ${id}`,
      branch,
      content: Buffer.from(content).toString('base64'),
    });
    sha = result.commit.sha;
  }
  let url = `https://modelfieldnotes.com/${kind === 'daily' ? 'notes' : 'research'}/${id}/`;
  if (branch !== 'main') {
    const prs = await github(
      `/repos/${repo}/pulls?state=all&head=swapupg:${branch}`,
    );
    const evidence = JSON.parse(
      await readFile('.automation-output/evidence.json', 'utf8'),
    );
    const body = `Review-first automated draft. Merge only after checking each source and claim; automated verification is not human review.\n\nReason: ${manifest.reason}\n\nSources:\n${evidence.sources.map((s: { title: string; url: string }) => `- [${s.title}](${s.url})`).join('\n')}\n\nEvidence excerpts, verification results, and a built HTML preview are in the 30-day artifacts of [the run](https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}).\n\nCandidate commit: ${sha}`;
    const pr =
      prs[0] ||
      (await github(`/repos/${repo}/pulls`, 'POST', {
        title: `Review ${id}`,
        head: branch,
        base: 'main',
        body,
      }));
    url = pr.html_url;
  }
  store.state.editions[id] = {
    status: 'candidate',
    at: new Date().toISOString(),
    sourceIds: manifest.sourceIds,
    url,
    commit: sha,
    reason: 'Content committed; awaiting validation dispatch',
  };
  await store.save();
  // Explicit dispatch: a GITHUB_TOKEN push does not trigger push workflows.
  await github(
    `/repos/${repo}/actions/workflows/pages.yml/dispatches`,
    'POST',
    {
      ref: 'main',
      inputs: {
        deploy_ref: sha,
        verify_only: branch === 'main' ? 'false' : 'true',
      },
    },
  );
  store.state.editions[id] = {
    status: branch === 'main' ? 'candidate' : 'review',
    at: new Date().toISOString(),
    sourceIds: manifest.sourceIds,
    url,
    commit: sha,
    reason:
      branch === 'main'
        ? 'Awaiting exact-commit deployment and live smoke test'
        : 'Human review required',
  };
  await store.save();
  if (branch !== 'main')
    await report(`Review ready: ${id}`, `Draft and source evidence: ${url}`);
  if (process.env.GITHUB_OUTPUT)
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `commit=${sha}\nurl=${url}\nid=${id}\nauto=${branch === 'main'}\n`,
    );
  console.log(`${id}: ${url}`);
}
