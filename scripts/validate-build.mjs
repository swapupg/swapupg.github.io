import { execFileSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { load } from 'cheerio';
import { parse } from 'yaml';
import { simulationLink } from '../src/lib/fieldbook.ts';
const root = resolve('dist');
async function walk(dir) {
  const files = [];
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    if ((await stat(path)).isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}
const files = await walk(root);
const errors = [];
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const $ = load(await readFile(file, 'utf8'));
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical?.startsWith('https://modelfieldnotes.com/'))
    errors.push(`Invalid canonical: ${file}`);
  if ($('h1').length !== 1) errors.push(`Expected one h1: ${file}`);
  if (!$('meta[name="description"]').attr('content'))
    errors.push(`Missing description: ${file}`);
  const ids = new Set();
  $('[id]').each((_, el) => {
    const id = $(el).attr('id');
    if (ids.has(id)) errors.push(`Duplicate id ${id}: ${file}`);
    ids.add(id);
  });
  for (const el of $(
    'a[href],img[src],script[src],link[rel="stylesheet"],meta[property="og:image"]',
  ).toArray()) {
    let value =
      $(el).attr('href') || $(el).attr('src') || $(el).attr('content');
    if (value?.startsWith('https://modelfieldnotes.com/'))
      value = new URL(value).pathname;
    if (
      !value ||
      !value.startsWith('/') ||
      value.startsWith('//') ||
      value.startsWith('/agent-explainer/')
    )
      continue;
    const path = value.split(/[?#]/)[0];
    const target = join(root, path.endsWith('/') ? path + 'index.html' : path);
    try {
      await stat(target);
    } catch {
      errors.push(`Missing ${value} from ${file}`);
    }
  }
  // Validate both article navigation and links into sections on other pages.
  for (const el of $('a[href]').toArray()) {
    const url = new URL($(el).attr('href'), canonical);
    if (
      url.origin !== 'https://modelfieldnotes.com' ||
      !url.hash ||
      url.pathname.startsWith('/agent-explainer/')
    )
      continue;
    const path = url.pathname.endsWith('/')
      ? url.pathname + 'index.html'
      : url.pathname;
    try {
      const targetFile =
        url.pathname === new URL(canonical).pathname ? file : join(root, path);
      const target = load(await readFile(targetFile, 'utf8'));
      const fragment = decodeURIComponent(url.hash.slice(1));
      if (
        !target('[id]')
          .toArray()
          .some((node) => target(node).attr('id') === fragment)
      )
        errors.push(`Missing section ${url.pathname}${url.hash} from ${file}`);
    } catch {
      errors.push(
        `Unreadable section destination ${url.pathname}${url.hash} from ${file}`,
      );
    }
  }
  let js = 0;
  for (const el of $('script[src]').toArray()) {
    const src = $(el).attr('src');
    if (src.startsWith('/'))
      js += gzipSync(await readFile(join(root, src))).length;
  }
  $('script:not([src]):not([type="application/ld+json"])').each((_, el) => {
    js += gzipSync(Buffer.from($(el).html() || '')).length;
  });
  if (js > 100 * 1024) errors.push(`JavaScript over budget: ${file} (${js})`);
}
for (const path of [
  'rss.xml',
  'writing/rss.xml',
  'research/rss.xml',
  'developments/rss.xml',
  'sitemap-index.xml',
]) {
  const text = await readFile(join(root, path), 'utf8');
  if (!text.includes('https://modelfieldnotes.com'))
    errors.push(`Wrong domain in ${path}`);
}
// Enforce the published Fieldbook contract independently of page rendering.
const guideOrders = new Set();
const guideScenarios = new Set();
for (const name of await readdir('src/content/fieldbook')) {
  if (!/\.mdx?$/.test(name)) continue;
  const metadata = parse(
    (await readFile(join('src/content/fieldbook', name), 'utf8')).split(
      '---',
    )[1],
  );
  if (
    metadata.status !== 'published' ||
    new Date(metadata.published) > new Date()
  )
    continue;
  const key = `${metadata.scenario.id}/${metadata.scenario.revision}`;
  if (guideOrders.has(metadata.order) || guideScenarios.has(key))
    errors.push(`Duplicate Fieldbook order or scenario: ${name}`);
  guideOrders.add(metadata.order);
  guideScenarios.add(key);
  const slug = name.replace(/\.mdx?$/, '');
  const $ = load(
    await readFile(join(root, 'fieldbook', slug, 'index.html'), 'utf8'),
  );
  for (const variant of ['baseline', 'repaired']) {
    if (
      !$(
        `.guide-actions a[href="${simulationLink(metadata.scenario, variant)}"]`,
      ).length
    )
      errors.push(`Missing paused ${variant} link: ${name}`);
  }
  if (!$('.evidence-label').text().includes('Simulation-based guide'))
    errors.push(`Missing simulation label: ${name}`);
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(
  `Validated ${files.filter((f) => f.endsWith('.html')).length} HTML pages, local links, metadata, feeds, and 100 KB JS budget.`,
);

await writeFile(
  join(root, 'build-info.json'),
  JSON.stringify({
    commit: execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim(),
    builtAt: new Date().toISOString(),
  }) + '\n',
);
