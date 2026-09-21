import { test, expect } from '@playwright/test';

const essay = '/notes/what-changes-when-ai-can-do-the-work/';

test('perspective leads to evidence, a guide, and a paused simulation link', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(page.locator('#signed-notes')).not.toContainText(
    'What changes when AI can do the work?',
  );
  const sectionLinks = await page
    .locator('.perspective-card h3 a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
  expect(sectionLinks).toHaveLength(3);
  await page
    .getByRole('link', { name: 'Read my perspective', exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(`${essay}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'What changes when AI can do the work?',
  );
  await expect(page.locator('.article-byline')).toContainText(
    'By Swapnil Upganlawar',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /social-notes-what-changes-when-ai-can-do-the-work\.png$/,
  );
  for (const href of sectionLinks) {
    await page.goto(href);
    await expect(
      page.locator(new URL(href, 'https://modelfieldnotes.com').hash),
    ).toBeInViewport();
  }
  await page
    .getByRole('link', { name: 'What I expect next', exact: true })
    .click();
  await page.reload();
  await expect(page.locator('#what-i-expect-next')).toBeInViewport();
  await page.goBack();
  await page.goForward();
  await expect(page.locator('#what-i-expect-next')).toBeInViewport();
  await page
    .locator('.prose')
    .getByRole('link', {
      name: 'retrying without duplicate actions',
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('link', { name: 'Run the failure', exact: true }),
  ).toHaveAttribute(
    'href',
    '/agent-explainer/#/experiment/duplicate-action/1/baseline/0',
  );
  for (const path of ['/rss.xml', '/writing/rss.xml', '/sitemap-0.xml']) {
    expect(await (await request.get(path)).text()).toContain(essay);
  }
  expect(await (await request.get('/research/rss.xml')).text()).not.toContain(
    essay,
  );
});

test('perspective is readable without JavaScript across supported widths', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(process.env.SITE_URL || 'http://127.0.0.1:4321');
    await page
      .getByRole('link', { name: 'Read my perspective', exact: true })
      .click();
    await expect(page.locator('#sources')).toBeVisible();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
    await page
      .getByRole('link', { name: 'my signed writing', exact: true })
      .click();
    expect(page.url()).toContain('/writing/rss.xml');
  } finally {
    await context.close();
  }
});
