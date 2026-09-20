import { execFileSync } from 'node:child_process';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { load } from 'cheerio';
import { stringify } from 'yaml';
const paths = [];
const prefix = 'automation-contract-fixture';
const common = {
  title: 'Fixture briefing',
  description: 'Temporary automated content used only by the test contract.',
  published: '2026-01-01',
  status: 'published',
  author: 'Model Fieldnotes',
  authorship: 'automated',
  topics: ['Models'],
  sources: [{ title: 'Official documentation', url: 'https://openai.com/' }],
};
async function fixture(collection, name, data) {
  const path = `src/content/${collection}/${prefix}-${name}.md`;
  await writeFile(
    path,
    `---\n${stringify(data, { defaultStringType: 'QUOTE_DOUBLE', defaultKeyType: 'PLAIN' })}---\n\n## Evidence\n\nA temporary test entry.\n`,
    { flag: 'wx' },
  );
  paths.push(path);
  return `${prefix}-${name}`;
}
try {
  const id = await fixture('notes', 'daily', {
    ...common,
    kind: 'Daily brief',
    number: 9001,
    reviewed: '2026-01-01',
  });
  for (let i = 0; i < 2; i++)
    await fixture('notes', `daily-${i}`, {
      ...common,
      kind: 'Daily brief',
      number: 9002 + i,
      reviewed: '2026-01-01',
    });
  await fixture('research', 'weekly', {
    ...common,
    issue: 999,
    collection: 'Weekly selection',
    papers: Array.from({ length: 5 }, (_, i) => ({
      title: `Paper ${i}`,
      url: 'https://arxiv.org/abs/2210.03629',
      published: '2022-10-06',
      finding: 'A fixture finding.',
    })),
  });
  await fixture('projects', 'cli', {
    ...common,
    author: 'Swapnil',
    authorship: 'human',
    stage: 'Public beta',
    format: 'CLI',
    demo: 'https://github.com/swapupg/agent-explainer',
    repository: 'https://github.com/swapupg/agent-explainer',
  });
  execFileSync('npm', ['run', 'build'], { stdio: 'pipe' });
  const article = load(await readFile(`dist/notes/${id}/index.html`, 'utf8'));
  if (!article('.article-byline').text().includes('Automated briefing'))
    throw new Error('Automated byline missing');
  const json = JSON.parse(article('script[type="application/ld+json"]').text());
  if (json.author['@type'] !== 'Organization')
    throw new Error('Incorrect automated author metadata');
  const home = load(await readFile('dist/index.html', 'utf8'));
  if (
    home('.latest-brief').length !== 1 ||
    home('.note-card[data-kind="Daily brief"]').length
  )
    throw new Error('Brief displaced original writing');
  if (!(await readFile('dist/rss.xml', 'utf8')).includes(id))
    throw new Error('Brief missing from writing feed');
  if ((await readFile('dist/research/rss.xml', 'utf8')).includes(id))
    throw new Error('Brief leaked into research feed');
  const weekly = await readFile(
    `dist/research/${prefix}-weekly/index.html`,
    'utf8',
  );
  if (
    weekly.includes(
      'A foundational collection, not a current model leaderboard',
    )
  )
    throw new Error('Weekly collection mislabeled');
  const cli = load(
    await readFile(`dist/projects/${prefix}-cli/index.html`, 'utf8'),
  );
  if (
    cli('.project-detail-image').length ||
    !cli('main').text().includes('Get Fixture briefing')
  )
    throw new Error('CLI template is browser-specific');
  if (process.argv.includes('--browser'))
    execFileSync('npm', ['run', 'test:e2e'], { stdio: 'inherit' });
  console.log(
    'Growing archive, homepage balance, automated byline, weekly labeling, CLI project, and feeds verified.',
  );
} finally {
  for (const path of paths) await unlink(path);
  execFileSync('npm', ['run', 'build'], { stdio: 'pipe' });
}
