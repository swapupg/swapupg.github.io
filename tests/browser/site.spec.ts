import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('discover a project and read a sourced fieldnote', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'AI agents,',
  );
  await expect(
    page.getByRole('link', { name: 'Try Agent Explainer', exact: true }),
  ).toHaveAttribute('href', '/agent-explainer/');
  await page.getByRole('link', { name: 'Inside the project' }).click();
  await expect(
    page.getByRole('heading', { name: 'Agent Explainer', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open Agent Explainer' }),
  ).toHaveAttribute('href', '/agent-explainer/');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Notes', exact: true })
    .click();
  await page
    .getByRole('link', { name: 'When an agent retries a successful action' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'When an agent retries a successful action',
  );
  await expect(page.locator('#sources a').first()).toHaveAttribute(
    'href',
    /^https:\/\/aws.amazon.com/,
  );
  await page
    .getByRole('link', {
      name: 'Give the operation a stable identity',
      exact: true,
    })
    .click();
  await page.reload();
  await expect(
    page.locator('#give-the-operation-a-stable-identity'),
  ).toBeInViewport();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
test('search, filters, empty state, refresh, and history', async ({ page }) => {
  await page.goto('/notes/');
  const totalNotes = await page.locator('[data-note]').count();
  expect(totalNotes).toBeGreaterThanOrEqual(4);
  await page.getByLabel('Search fieldnotes').fill('cost');
  expect(await page.locator('[data-note]:visible').count()).toBeGreaterThan(0);
  for (const card of await page.locator('[data-note]:visible').all())
    await expect(card).toHaveAttribute('data-search', /cost/i);
  await page.reload();
  await expect(page.getByLabel('Search fieldnotes')).toHaveValue('cost');
  expect(await page.locator('[data-note]:visible').count()).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await page.getByLabel('Topic', { exact: true }).selectOption('Governance');
  expect(await page.locator('[data-note]:visible').count()).toBeGreaterThan(0);
  for (const card of await page.locator('[data-note]:visible').all())
    await expect(card).toHaveAttribute('data-topics', /Governance/);
  await page.getByLabel('Search fieldnotes').fill('no such topic');
  await expect(
    page.getByRole('heading', { name: 'No fieldnotes found.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.locator('[data-note]:visible')).toHaveCount(totalNotes);
  await page.getByRole('link', { name: 'How to compare AI models' }).click();
  await page.goBack();
  await expect(page.locator('[data-note]:visible')).toHaveCount(totalNotes);
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'compare AI models',
  );
});
test('research issue has five papers, working feeds, and related reading', async ({
  page,
  request,
}) => {
  await page.goto('/research/');
  await page.getByRole('link', { name: 'Five foundations' }).click();
  for (const title of [
    '01 — ReAct',
    '02 — Toolformer',
    '03 — Lost in the Middle',
    '04 — Reflexion',
    '05 — τ-bench',
  ])
    await expect(
      page.getByRole('heading', { name: new RegExp(title) }),
    ).toBeVisible();
  await expect(
    page.getByText(
      'Model Fieldnotes has not independently reproduced these experiments.',
      { exact: true },
    ),
  ).toBeVisible();
  for (const path of [
    '/rss.xml',
    '/writing/rss.xml',
    '/research/rss.xml',
    '/sitemap-index.xml',
  ]) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain('https://modelfieldnotes.com');
  }
});
test('clipboard failure offers a selectable canonical URL', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('blocked')) },
    });
  });
  await page.goto('/notes/cost-of-a-completed-task/');
  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByLabel('Select and copy this link')).toHaveValue(
    'https://modelfieldnotes.com/notes/cost-of-a-completed-task/',
  );
  await expect(page.getByLabel('Select and copy this link')).toBeFocused();
});
test('clipboard success and unavailable storage remain usable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw new Error('blocked');
      },
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });
  });
  await page.goto('/notes/comparing-ai-models/');
  await page.getByRole('button', { name: 'Switch color theme' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    /light|dark/,
  );
  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByRole('status')).toHaveText('Link copied.');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
test('no JavaScript still supports reading and navigation', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(process.env.SITE_URL || 'http://127.0.0.1:4321');
  await page.getByRole('link', { name: 'Notes', exact: true }).click();
  expect(await page.locator('[data-note]').count()).toBeGreaterThanOrEqual(4);
  await expect(page.locator('.archive-controls')).toBeHidden();
  await page.getByRole('link', { name: 'Reading AI regulation' }).click();
  await expect(page.locator('#sources')).toBeVisible();
  await context.close();
});
test('404 recovery and root experiment link compatibility', async ({
  page,
}) => {
  await page.goto('/404.html');
  await page.getByRole('link', { name: 'Back to the lab' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'AI agents,',
  );
  await page.goto('/#/experiment/duplicate-action/1/repaired/3');
  await expect(page).toHaveURL(
    /\/agent-explainer\/#\/experiment\/duplicate-action\/1\/repaired\/3$/,
  );
});
test('keyboard, contrast, reduced motion, and responsive layouts', async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await page.goto('/');
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
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe('auto');
});
test('article and archive accessibility', async ({ page }) => {
  for (const path of [
    '/notes/',
    '/notes/cost-of-a-completed-task/',
    '/research/five-foundations-for-ai-agents/',
    '/about/',
    '/fieldbook/',
    '/fieldbook/duplicate-action/',
    '/fieldbook/forgotten-instruction/',
    '/fieldbook/premature-done/',
  ]) {
    await page.goto(path);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});

test('format filter is bookmarkable and automation policy is transparent', async ({
  page,
}) => {
  await page.goto('/notes/?format=Daily+brief');
  await expect(page.getByLabel('Format', { exact: true })).toHaveValue(
    'Daily brief',
  );
  for (const card of await page.locator('[data-note]:visible').all())
    await expect(card).toHaveAttribute('data-kind', 'Daily brief');
  await page.reload();
  await expect(page.getByLabel('Format', { exact: true })).toHaveValue(
    'Daily brief',
  );
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  expect(
    await page.locator('[data-note]:visible').count(),
  ).toBeGreaterThanOrEqual(4);
  await page.getByRole('link', { name: 'Automation policy' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'How the notes get made.',
  );
  await expect(page.locator('main')).toContainText('not human review');
  await expect(
    page.getByRole('link', { name: 'Report a correction' }),
  ).toHaveAttribute('href', /github.com\/swapupg/);
});
