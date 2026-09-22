import { execFileSync } from 'node:child_process';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { load } from 'cheerio';
import { socialCardPath } from '../src/lib/identity.ts';
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
  const essayId = await fixture('notes', 'automated-essay', {
    ...common,
    topics: ['Leadership'],
    kind: 'Essay',
    number: 9004,
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
  if (home('#signed-notes').text().includes('Fixture briefing'))
    throw new Error('Automated essay displaced signed writing');
  const signedFeed = await readFile('dist/writing/rss.xml', 'utf8');
  const perspectives = load(await readFile('dist/notes/index.html', 'utf8'));
  const developments = load(
    await readFile('dist/developments/index.html', 'utf8'),
  );
  const developmentsFeed = await readFile('dist/developments/rss.xml', 'utf8');
  for (const excluded of [id, essayId]) {
    if (perspectives('[data-note]').toString().includes(excluded))
      throw new Error('Automated writing leaked into Perspectives');
    if (
      !developments('[data-note]').toString().includes(excluded) ||
      !developmentsFeed.includes(excluded)
    )
      throw new Error('Automated writing missing from Developments');
  }
  if (developmentsFeed.includes('/notes/cost-of-a-completed-task/'))
    throw new Error('Perspective leaked into Developments feed');

  const leadership = await readFile('dist/leadership/index.html', 'utf8');
  if (
    leadership.includes(essayId) ||
    home('.leadership-feature').text().includes('Fixture briefing')
  )
    throw new Error('Automated essay leaked into leadership analysis');
  for (const excluded of [id, essayId, `${prefix}-weekly`])
    if (signedFeed.includes(excluded))
      throw new Error('Automated entry leaked into signed feed');
  for (const included of [
    'fieldbook/duplicate-action/',
    'notes/cost-of-a-completed-task/',
    'research/five-foundations-for-ai-agents/',
  ])
    if (!signedFeed.includes(included))
      throw new Error(`Signed content missing: ${included}`);
  for (const [collection, slug] of [
    ['notes', id],
    ['notes', essayId],
    ['research', `${prefix}-weekly`],
  ]) {
    const svg = await readFile(
      `dist${socialCardPath(collection, slug).replace(/\.png$/, '.svg')}`,
      'utf8',
    );
    if (
      !svg.includes('Model Fieldnotes · Automated briefing') ||
      svg.includes('By Swapnil')
    )
      throw new Error('Automated social card has personal attribution');
    if (!(await readFile('dist/rss.xml', 'utf8')).includes(slug))
      throw new Error('Automated content missing from combined feed');
  }
  const guide = load(
    await readFile('dist/fieldbook/duplicate-action/index.html', 'utf8'),
  );
  if (!guide('.article-byline').text().includes('By Swapnil Upganlawar'))
    throw new Error('Full signed author missing');
  const guideCard = await readFile(
    `dist${socialCardPath('fieldbook', 'duplicate-action').replace(/\.png$/, '.svg')}`,
    'utf8',
  );
  if (
    !guideCard.includes('By Swapnil Upganlawar') ||
    !guideCard.includes('SIMULATION-BASED GUIDE')
  )
    throw new Error('Fieldbook social attribution or evidence label missing');
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
