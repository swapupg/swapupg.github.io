import { chromium, firefox, webkit, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';
const origin = 'https://modelfieldnotes.com';
const expectedCommit =
  process.env.EXPECTED_COMMIT ||
  execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const build = await (
  await fetch(`${origin}/build-info.json`, { cache: 'no-store' })
).json();
if (build.commit !== expectedCommit)
  throw new Error(`Expected ${expectedCommit}, deployed ${build.commit}`);
const sitemap = load(await (await fetch(`${origin}/sitemap-0.xml`)).text(), {
  xml: true,
});
const pages = sitemap('loc')
  .map((_, el) => sitemap(el).text())
  .get();
const assets = new Set();
for (const url of pages) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  const $ = load(await response.text());
  if ($('link[rel="canonical"]').attr('href') !== url)
    throw new Error(`Wrong canonical: ${url}`);
  for (const el of $(
    'img[src],script[src],link[rel="stylesheet"],link[rel="icon"],meta[property="og:image"]',
  ).toArray()) {
    const value =
      $(el).attr('src') || $(el).attr('href') || $(el).attr('content');
    assets.add(new URL(value, origin).href);
  }
}
for (const path of [
  '/rss.xml',
  '/research/rss.xml',
  '/assets/inter-latin.woff2',
  '/assets/space-grotesk-latin.woff2',
])
  assets.add(origin + path);
for (const url of assets) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Missing live asset ${url}: ${res.status}`);
  await res.body?.cancel();
}
if ((await fetch(`${origin}/a-path-that-does-not-exist/`)).status !== 404)
  throw new Error('Missing HTTP 404 response');
for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage();
    for (const scenario of [
      'duplicate-action',
      'forgotten-instruction',
      'premature-done',
    ]) {
      const fragment = `#/experiment/${scenario}/1/repaired/3`;
      for (const route of [
        'https://swapupg.github.io/agent-explainer/',
        'https://swapupg.github.io/',
        'https://www.modelfieldnotes.com/agent-explainer/',
      ]) {
        await page.goto(route + fragment);
        await expect(page).toHaveURL(`${origin}/agent-explainer/${fragment}`);
        await expect(
          page.getByRole('button', {
            name: 'Continue experiment',
            exact: true,
          }),
        ).toBeVisible();
        await expect(
          page.locator('.timeline button[aria-current="step"]'),
        ).toHaveCount(1);
      }
    }
    await page.goto(
      'https://swapupg.github.io/notes/cost-of-a-completed-task/',
    );
    await expect(page).toHaveURL(`${origin}/notes/cost-of-a-completed-task/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'The cost of a completed task',
    );
    console.log(
      `${name}: legacy root/project hashes, www and nested article redirects verified.`,
    );
  } finally {
    await browser.close();
  }
}
const manifest = JSON.parse(await readFile('package.json', 'utf8'));
console.log(
  `${manifest.name}: deployed ${build.commit}; ${pages.length} sitemap pages and ${assets.size} assets/feeds verified over HTTPS.`,
);
