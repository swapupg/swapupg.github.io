import { test, expect } from '@playwright/test';

const ids = ['duplicate-action', 'forgotten-instruction', 'premature-done'];

test('discover the Fieldbook, read each guide, and follow revisioned lab links', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('link', { name: 'Explore the Fieldbook', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Agent reliability,',
  );
  await expect(page.locator('.fieldbook-card')).toHaveCount(3);
  for (const id of ids) {
    await page.locator(`.fieldbook-card a[href="/fieldbook/${id}/"]`).click();
    await expect(page.locator('.evidence-label')).toHaveText(
      'Simulation-based guide',
    );
    await expect(page.locator('.article-byline')).toContainText(
      'By Swapnil Upganlawar',
    );
    await expect(page.locator('.guide-launch')).toContainText(
      'do not measure real-model performance',
    );
    for (const [name, variant] of [
      ['Run the failure', 'baseline'],
      ['Explore the repair', 'repaired'],
    ]) {
      const link = page.getByRole('link', { name, exact: true });
      await expect(link).toHaveAttribute(
        'href',
        `/agent-explainer/#/experiment/${id}/1/${variant}/0`,
      );
    }
    await page
      .getByRole('link', { name: 'Why the repair works', exact: true })
      .click();
    await page.reload();
    await expect(page.locator('#why-the-repair-works')).toBeInViewport();
    await page
      .getByRole('link', { name: 'Agent Reliability Fieldbook', exact: false })
      .first()
      .click();
  }
});

test('guide navigation, sharing fallback, and signed feeds', async ({
  page,
  request,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('blocked')) },
    });
  });
  await page.goto('/fieldbook/duplicate-action/');
  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByLabel('Select and copy this link')).toHaveValue(
    'https://modelfieldnotes.com/fieldbook/duplicate-action/',
  );
  await page
    .getByRole('navigation', { name: 'Fieldbook entries' })
    .getByRole('link', { name: /Next guide/ })
    .click();
  await expect(page).toHaveURL(/\/fieldbook\/forgotten-instruction\/$/);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Retrying without duplicate actions',
  );
  for (const path of ['/writing/rss.xml', '/rss.xml']) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    for (const id of ids) expect(body).toContain(`/fieldbook/${id}/`);
  }
  expect(await (await request.get('/research/rss.xml')).text()).not.toContain(
    '/fieldbook/',
  );
});

test('Fieldbook works without JavaScript and fits narrow screens', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(
    `${process.env.SITE_URL || 'http://127.0.0.1:4321'}/fieldbook/`,
  );
  await page
    .getByRole('link', { name: /Retrying without duplicate actions/ })
    .click();
  await expect(
    page.getByRole('link', { name: 'Run the failure', exact: true }),
  ).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  await context.close();
});
