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
  '/writing/rss.xml',
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
for (const [name, engine] of Object.entries({
  chromium,
  firefox,
  webkit,
  mobile: webkit,
})) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage(
      name === 'mobile'
        ? {
            viewport: { width: 390, height: 844 },
            isMobile: true,
            hasTouch: true,
          }
        : {},
    );
    await page.goto(origin);
    await page
      .getByRole('link', { name: 'Read my perspective', exact: true })
      .click();
    await expect(page).toHaveURL(
      `${origin}/notes/what-changes-when-ai-can-do-the-work/`,
    );
    await expect(page.locator('.article-byline')).toContainText(
      'By Swapnil Upganlawar',
    );
    await page
      .locator('.prose')
      .getByRole('link', {
        name: 'retrying without duplicate actions',
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(`${origin}/fieldbook/duplicate-action/`);
    for (const scenario of [
      'duplicate-action',
      'forgotten-instruction',
      'premature-done',
    ]) {
      await page.goto(`${origin}/fieldbook/${scenario}/`);
      await expect(page.locator('.evidence-label')).toHaveText(
        'Simulation-based guide',
      );
      await page
        .getByRole('link', { name: 'Explore the repair', exact: true })
        .click();
      await expect(page).toHaveURL(
        `${origin}/agent-explainer/#/experiment/${scenario}/1/repaired/0`,
      );
      await expect(
        page.getByRole('button', { name: 'Run experiment', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Previous step' }),
      ).toBeDisabled();
      await page.goto(`${origin}/fieldbook/${scenario}/`);
      await page
        .getByRole('link', { name: 'Run the failure', exact: true })
        .click();
      await expect(page).toHaveURL(
        `${origin}/agent-explainer/#/experiment/${scenario}/1/baseline/0`,
      );
      await expect(
        page.getByRole('button', { name: 'Previous step' }),
      ).toBeDisabled();
      await page
        .getByRole('button', { name: 'Run experiment', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Pause experiment', exact: true })
        .click();
      await page.locator('.timeline button').last().click();
      const outcomes = {
        'duplicate-action': [
          'One request. Two tickets.',
          'One request. One ticket.',
        ],
        'forgotten-instruction': [
          'The draft went public.',
          'The draft stays a draft.',
        ],
        'premature-done': ['The report is not ready.', '“Done” means done.'],
      };
      await expect(page.locator('#outcome-title')).toHaveText(
        outcomes[scenario][0],
      );
      await page
        .getByRole('button', { name: 'Apply repair and replay', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Pause experiment', exact: true })
        .click();
      await page.locator('.timeline button').last().click();
      await expect(page.locator('#outcome-title')).toHaveText(
        outcomes[scenario][1],
      );
      await expect(page.locator('.comparison')).toBeVisible();
      await page
        .getByRole('button', { name: 'Share experiment', exact: true })
        .click();
      const shared = await page.getByLabel('Experiment link').inputValue();
      await page.keyboard.press('Escape');
      await page.goto(shared);
      await page.reload();
      await expect(page.locator('#outcome-title')).toHaveText(
        outcomes[scenario][1],
      );
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
      `${name}: three Fieldbook-to-lab failure/repair/share journeys, legacy hashes, www and nested article redirects verified.`,
    );
  } finally {
    await browser.close();
  }
}
const manifest = JSON.parse(await readFile('package.json', 'utf8'));
console.log(
  `${manifest.name}: deployed ${build.commit}; ${pages.length} sitemap pages and ${assets.size} assets/feeds verified over HTTPS.`,
);
