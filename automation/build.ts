import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { StateStore, report, repo, github } from './github.ts';
import { generate } from './provider.ts';
import {
  projectSchema,
  validateProject,
  editionId,
  localDate,
} from './policy.ts';
import { candidateDigest } from './candidate.ts';
import { Buffer } from 'node:buffer';
const date = localDate(),
  id = editionId('build', date),
  store = await new StateStore().open();
if (process.env.AUTOMATION_ENABLED !== 'true' && process.env.DRY_RUN !== 'true')
  throw new Error('Automation paused');
const stateId = process.env.DRY_RUN !== 'false' ? `dry-${id}` : id;
if (store.state.editions[stateId]?.status === 'candidate')
  throw new Error(
    'Candidate already exists for this date; review its artifact before retrying',
  );
await mkdir('.automation-output/project', { recursive: true });
try {
  // Search is GitHub's public repository API, not a paid or unbounded model tool.
  const own = await github('/users/swapupg/repos?per_page=100');
  const alternatives = await github(
    '/search/repositories?q=agent+evaluation+tool&sort=stars&per_page=8',
  );
  const comparisons = [];
  for (const alternative of alternatives.items.slice(0, 4)) {
    try {
      const readme = await github(`/repos/${alternative.full_name}/readme`);
      const text = Buffer.from(readme.content, 'base64').toString();
      if (text.length <= 16000)
        comparisons.push({
          name: alternative.name,
          url: alternative.html_url,
          readme: text,
        });
    } catch {
      /* An inaccessible comparison is omitted, not guessed. */
    }
  }
  if (comparisons.length < 2)
    throw new Error('Fewer than two readable existing projects for comparison');
  const project = await generate(
    store,
    'build',
    date,
    projectSchema,
    'Propose and implement one small, useful, original local-first AI developer tool. Compare at least two of the supplied existing projects honestly. If an existing project already solves it, narrow the problem; do not clone for novelty. Pick browser app, CLI or library based on usefulness. Use dependency-free Node 24 JavaScript with package.json script test exactly "node --test", meaningful node:test tests under test/, README with install/use examples and honest limitations, complete MIT LICENSE and THIRD_PARTY_NOTICES.md. Place files only at the repository root or directly under src/, test/, public/, or bin/. No network, model API, telemetry, credentials, package lifecycle scripts, shell scripts or workflows. No made-up test results. Output only the source candidate; it will run in an isolated container. Avoid names already owned by Swapnil.',
    {
      own: own.map((r: { name: string; description: string }) => ({
        name: r.name,
        description: r.description,
      })),
      alternatives: comparisons,
    },
    12000,
  );
  // Preserve incomplete source as inert JSON even when a contract check rejects it.
  await writeFile(
    '.automation-output/project.json',
    JSON.stringify(project, null, 2),
  );
  validateProject(project);
  // Reference only alternatives actually discovered; invented comparisons require another run/review.
  const known = new Set(comparisons.map((r) => r.url));
  if (project.alternatives.some((a) => !known.has(a.url)))
    throw new Error('Unknown alternative reference');
  if (own.some((r: { name: string }) => r.name === project.name))
    throw new Error('Repository name collision; use an improvement PR instead');
  for (const file of project.files) {
    const path = `.automation-output/project/${file.path}`;
    await mkdir(path.slice(0, path.lastIndexOf('/')), { recursive: true });
    await writeFile(path, file.content);
  }
  await writeFile(
    '.automation-output/project.json',
    JSON.stringify(project, null, 2),
  );
  const digest = candidateDigest(project);
  await writeFile(
    '.automation-output/release.json',
    JSON.stringify(
      {
        version: 1,
        id,
        date,
        name: project.name,
        digest,
        run: process.env.GITHUB_RUN_ID,
        dry: process.env.DRY_RUN !== 'false',
        title: project.title,
        description: project.description,
        format: project.format,
        limitations: project.limitations,
      },
      null,
      2,
    ),
  );
  store.state.editions[stateId] = {
    status: 'candidate',
    at: new Date().toISOString(),
    reason: `Awaiting isolated tests and explicit release approval: ${digest}`,
  };
  await store.save();
  if (process.env.GITHUB_OUTPUT)
    await appendFile(process.env.GITHUB_OUTPUT, 'candidate=true\n');
  console.log(`Candidate ${project.name}: ${digest}`);
} catch (e) {
  const reason = e instanceof Error ? e.message : 'Build failed';
  store.state.editions[stateId] = {
    status: 'failed',
    at: new Date().toISOString(),
    reason,
  };
  await store.save();
  await report(
    `Automation needs attention: ${id}`,
    `${reason}\n\n[Run](https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}). Nothing was released.`,
  );
  throw e;
}
