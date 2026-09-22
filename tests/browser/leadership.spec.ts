import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const essays = [
  {
    slug: 'managing-teams-with-generative-ai',
    title: 'What changes when managers lead teams using AI?',
  },
  {
    slug: 'ai-productivity-organizational-performance',
    title: 'When faster AI work meets the organization',
  },
];

test('leadership discovery, evidence, authorship, feeds, and archive filter', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await page
    .getByRole('link', {
      name: 'Explore Leadership & Organizations',
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/leadership\/$/);
  await expect(page.locator('.leadership-readings li')).toHaveCount(7);
  await expect(page.locator('.leadership-readings li').first()).toContainText(
    'Full article not reviewed',
  );
  for (const essay of essays) {
    await page
      .locator('#analysis')
      .getByRole('link', { name: essay.title, exact: true })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      essay.title,
    );
    await expect(page.locator('.article-byline')).toContainText(
      'By Swapnil Upganlawar',
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      new RegExp(`social-notes-${essay.slug}\\.png$`),
    );
    expect(await page.locator('#sources li a').count()).toBeGreaterThanOrEqual(
      3,
    );
    await page
      .locator('nav[aria-label="On this page"]')
      .getByRole('link', { name: 'Sources & further reading' })
      .click();
    await page.reload();
    await expect(page.locator('#sources')).toBeInViewport();
    await page
      .locator('.article-topics')
      .getByRole('link', { name: 'Leadership & Organizations' })
      .click();
    await expect(page).toHaveURL(/\/leadership\/$/);
    for (const feed of ['/rss.xml', '/writing/rss.xml', '/sitemap-0.xml'])
      expect(await (await request.get(feed)).text()).toContain(
        `/notes/${essay.slug}/`,
      );
  }
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Perspectives', exact: true })
    .click();
  await page.getByLabel('Topic', { exact: true }).selectOption('Leadership');
  await expect(page.locator('[data-note]:visible')).toHaveCount(3);
  await page.reload();
  await expect(page.getByLabel('Topic', { exact: true })).toHaveValue(
    'Leadership',
  );
  for (const card of await page.locator('[data-note]:visible').all())
    await expect(card).toHaveAttribute('data-topics', /Leadership/);
});

test('leadership is readable without scripts, responsive, and accessible in both themes', async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const plain = await context.newPage();
    await plain.goto(
      `${process.env.SITE_URL || 'http://127.0.0.1:4321'}/leadership/`,
    );
    await plain
      .getByRole('link', { name: 'Curated readings', exact: true })
      .click();
    await expect(plain.locator('#reading-list')).toBeInViewport();
    for (const path of [
      '/leadership/',
      ...essays.map((e) => `/notes/${e.slug}/`),
    ]) {
      await plain.goto(
        `${process.env.SITE_URL || 'http://127.0.0.1:4321'}${path}`,
      );
      for (const width of [320, 390, 768, 1440]) {
        await plain.setViewportSize({ width, height: 900 });
        expect(
          await plain.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBeTruthy();
      }
    }
  } finally {
    await context.close();
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of [
    '/leadership/',
    ...essays.map((e) => `/notes/${e.slug}/`),
  ]) {
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
