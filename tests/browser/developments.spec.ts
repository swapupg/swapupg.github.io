import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const release = '/developments/jev-structured-decisions/';
const title = 'Jev: a different interface for AI decisions';

test('Perspectives focus survives refresh, history, and malformed filters', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Perspectives', exact: true })
    .click();
  await expect(page).toHaveURL(/\/notes\/$/);
  const total = await page.locator('[data-note]').count();
  await expect(
    page.getByText(
      'How AI changes what we build, how we lead, and how organizations work.',
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByLabel('Focus area', { exact: true })
    .selectOption('leadership');
  await expect(page.locator('[data-note]:visible')).toHaveCount(3);
  for (const card of await page.locator('[data-note]:visible').all())
    await expect(card).toHaveAttribute('data-topics', /Leadership/);
  await page.reload();
  await expect(page.getByLabel('Focus area', { exact: true })).toHaveValue(
    'leadership',
  );
  await page
    .getByRole('link', {
      name: 'What changes when managers lead teams using AI?',
      exact: true,
    })
    .click();
  await page
    .getByRole('link', { name: 'All perspectives', exact: true })
    .click();
  await page.goBack();
  await page.goBack();
  await expect(page.getByLabel('Focus area', { exact: true })).toHaveValue(
    'leadership',
  );
  await page.goto('/notes/?focus=unknown&topic=unknown&format=unknown');
  await expect(page.getByLabel('Focus area', { exact: true })).toHaveValue(
    'all',
  );
  await expect(page.locator('[data-note]:visible')).toHaveCount(total);
});

test('discover a release, inspect evidence, share, and follow the correct feeds', async ({
  page,
  request,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('blocked')) },
    });
  });
  await page.goto('/');
  await page
    .getByRole('link', { name: 'Explore Developments', exact: true })
    .click();
  await expect(page).toHaveURL(/\/developments\/$/);
  await page.getByLabel('Search developments').fill('Jev');
  await page
    .getByLabel('Format', { exact: true })
    .selectOption('Release analysis');
  await page.reload();
  await expect(page.getByLabel('Search developments')).toHaveValue('Jev');
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  await expect(page.locator('.release-disclosure time')).toHaveAttribute(
    'datetime',
    '2026-09-15T00:00:00.000Z',
  );
  await expect(page.locator('.release-disclosure')).toContainText(
    'not independently tested',
  );
  await expect(page.locator('.article-byline')).toContainText(
    'By Swapnil Upganlawar',
  );
  await expect(page.locator('#sources li')).toHaveCount(4);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://modelfieldnotes.com${release}`,
  );
  await page.getByRole('button', { name: 'Copy link', exact: true }).click();
  await expect(page.getByLabel('Select and copy this link')).toHaveValue(
    `https://modelfieldnotes.com${release}`,
  );
  await page
    .getByRole('navigation', { name: 'On this page' })
    .getByRole('link', { name: 'What remains unproven', exact: true })
    .click();
  await page.reload();
  await expect(page.locator('#what-remains-unproven')).toBeInViewport();
  await page
    .getByRole('link', { name: 'All developments', exact: true })
    .click();
  await page.getByLabel('Search developments').fill('no matching development');
  await expect(
    page.getByRole('heading', { name: 'No developments found.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(
    page.getByRole('link', { name: title, exact: true }),
  ).toBeVisible();
  for (const feed of [
    '/rss.xml',
    '/writing/rss.xml',
    '/developments/rss.xml',
    '/sitemap-0.xml',
  ])
    expect(await (await request.get(feed)).text()).toContain(release);
  expect(await (await request.get('/research/rss.xml')).text()).not.toContain(
    release,
  );
  expect(
    await (await request.get('/developments/rss.xml')).text(),
  ).not.toContain('/notes/cost-of-a-completed-task/');
});

test('new reading journeys work without scripts and across supported widths', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const origin = process.env.SITE_URL || 'http://127.0.0.1:4321';
    await page.goto(`${origin}/notes/`);
    await page
      .getByRole('link', { name: 'Explore Developments', exact: true })
      .click();
    await expect(page.locator('.archive-controls')).toBeHidden();
    await page.getByRole('link', { name: title, exact: true }).click();
    await expect(page.locator('#sources')).toBeVisible();
    for (const path of ['/notes/', '/developments/', release]) {
      await page.goto(`${origin}${path}`);
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBeTruthy();
      }
    }
  } finally {
    await context.close();
  }
});

test('archives and release support keyboard, reduced motion, and both themes', async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/developments/');
  await page.keyboard.press(
    process.platform === 'darwin' && browserName === 'webkit'
      ? 'Alt+Tab'
      : 'Tab',
  );
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  for (const path of ['/notes/', '/developments/', release]) {
    await page.goto(path);
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme });
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  }
});
