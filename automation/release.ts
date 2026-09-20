import { Buffer } from 'node:buffer';
import { stringify } from 'yaml';
import { verifyCandidate } from './candidate.ts';
import { github, repo } from './github.ts';
import { md } from './render.ts';
const { manifest, project } = await verifyCandidate();
const token = process.env.PROJECT_PUBLISH_TOKEN;
if (
  !token ||
  !process.env.APPROVED_DIGEST ||
  manifest.digest !== process.env.APPROVED_DIGEST ||
  manifest.dry ||
  process.env.SOURCE_RUN !== manifest.run
)
  throw new Error('Missing credential, approval, or exact candidate identity');
const owner = 'swapupg',
  target = `${owner}/${project.name}`;
const call = (path: string, method = 'GET', body?: unknown) =>
  github(path, method, body, token);
const marker = `Model Fieldnotes candidate ${manifest.digest}`;
let repository;
try {
  repository = await call(`/repos/${target}`);
} catch (e) {
  if (!(e instanceof Error && e.message.endsWith(': 404'))) throw e;
}
if (repository) {
  if (
    repository.description !== marker ||
    repository.private ||
    repository.owner.login !== owner
  )
    throw new Error(
      'Repository collision; existing project will not be overwritten',
    );
} else {
  const user = await call('/user');
  if (user.login !== owner) throw new Error('Wrong publishing account');
  repository = await call('/user/repos', 'POST', {
    name: project.name,
    description: marker,
    private: false,
    auto_init: true,
    has_issues: true,
  });
}
const base = await call(
  `/repos/${target}/git/ref/heads/${repository.default_branch}`,
);
const commit = await call(`/repos/${target}/git/commits/${base.object.sha}`);
let sha = base.object.sha;
if (commit.message !== marker) {
  // A partially created repo is resumable only while it has its initial commit.
  const history = await call(`/repos/${target}/commits?per_page=2`);
  if (history.length !== 1 || commit.message !== 'Initial commit')
    throw new Error('Repository changed since candidate creation');
  const tree = [];
  for (const file of project.files) {
    const blob = await call(`/repos/${target}/git/blobs`, 'POST', {
      content: file.content,
      encoding: 'utf-8',
    });
    tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const created = await call(`/repos/${target}/git/trees`, 'POST', { tree });
  const added = await call(`/repos/${target}/git/commits`, 'POST', {
    message: marker,
    tree: created.sha,
    parents: [base.object.sha],
  });
  await call(
    `/repos/${target}/git/refs/heads/${repository.default_branch}`,
    'PATCH',
    { sha: added.sha, force: false },
  );
  sha = added.sha;
}
let release;
try {
  release = await call(`/repos/${target}/releases/tags/v0.1.0`);
} catch (e) {
  if (!(e instanceof Error && e.message.endsWith(': 404'))) throw e;
}
if (!release)
  await call(`/repos/${target}/releases`, 'POST', {
    tag_name: 'v0.1.0',
    target_commitish: sha,
    name: 'v0.1.0 · public beta',
    body: `Approved candidate: ${manifest.digest}\n\n${project.description}\n\nLimitations: ${project.limitations}\n\nAI-assisted prototype; isolated tests passed. Review before relying on it.`,
  });
const url = `https://github.com/${target}`;
const meta = {
  title: project.title,
  description: project.description,
  published: manifest.date,
  status: 'published',
  author: 'Swapnil',
  topics: ['Agents'],
  sources: [{ title: 'Source and documentation', url }],
  stage: 'Public beta',
  format: project.format,
  demo: url,
  repository: url,
};
const content = `---\n${stringify(meta, { defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' })}---\n\n## The problem\n\n${md(project.problem)}\n\n## Use the tool\n\nFollow the [README](${url}#readme) for installation, examples, and tests. This is an AI-assisted prototype released after review.\n\n## Compared with existing projects\n\n${project.alternatives.map((a) => `- [${md(a.name)}](${a.url}): ${md(a.difference)}`).join('\n')}\n\n## Limitations\n\n${md(project.limitations)}\n`;
const branch = `automation/project-${project.name}`,
  main = await github(`/repos/${repo}/git/ref/heads/main`);
try {
  await github(`/repos/${repo}/git/ref/heads/${branch}`);
} catch (e) {
  if (!(e instanceof Error && e.message.endsWith(': 404'))) throw e;
  await github(`/repos/${repo}/git/refs`, 'POST', {
    ref: `refs/heads/${branch}`,
    sha: main.object.sha,
  });
}
let existing;
try {
  existing = await github(
    `/repos/${repo}/contents/src/content/projects/${project.name}.md?ref=${branch}`,
  );
} catch (e) {
  if (!(e instanceof Error && e.message.endsWith(': 404'))) throw e;
}
if (existing && Buffer.from(existing.content, 'base64').toString() !== content)
  throw new Error('Project page changed; review manually');
if (!existing)
  await github(
    `/repos/${repo}/contents/src/content/projects/${project.name}.md`,
    'PUT',
    {
      message: `Add ${project.name} project`,
      branch,
      content: Buffer.from(content).toString('base64'),
    },
  );
const prs = await github(
  `/repos/${repo}/pulls?state=all&head=swapupg:${branch}`,
);
if (!prs.length)
  await github(`/repos/${repo}/pulls`, 'POST', {
    title: `Add released project: ${project.title}`,
    head: branch,
    base: 'main',
    body: `Released source: ${url}\n\nApproved candidate: ${manifest.digest}\n\nReview and merge this project page after confirming the README and release.`,
  });
const head = await github(`/repos/${repo}/git/ref/heads/${branch}`);
await github(`/repos/${repo}/actions/workflows/pages.yml/dispatches`, 'POST', {
  ref: 'main',
  inputs: { deploy_ref: head.object.sha, verify_only: 'true' },
});
console.log(`Released ${url}; project listing is ready for review.`);
