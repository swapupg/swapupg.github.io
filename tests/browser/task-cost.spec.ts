import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('cost guide to calculator, compare, edit, reset, and copy fallback', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('blocked')) },
    });
  });
  await page.goto('/notes/cost-of-a-completed-task/');
  await page
    .getByRole('link', { name: 'Try the task cost calculator', exact: true })
    .click();
  await page.getByRole('button', { name: 'Calculate outcome cost' }).click();
  await expect(page.locator('.cost-primary')).toHaveText('$0.075');
  await page.getByLabel('Compare two designs').check();
  await expect(page.locator('#cost-results')).toBeHidden();
  await page.getByRole('button', { name: 'Calculate outcome cost' }).click();
  await expect(page.locator('.cost-primary')).toHaveText(['$0.075', '$0.0556']);
  await page.locator('#b-succeeded').fill('0');
  await page.getByRole('button', { name: 'Calculate outcome cost' }).click();
  await expect(page.locator('.cost-primary').last()).toHaveText(
    'No successful completions',
  );
  await page.getByRole('button', { name: 'Copy results' }).click();
  await expect(page.getByLabel('Select and copy these results')).toBeFocused();
  expect(
    await page.getByLabel('Select and copy these results').inputValue(),
  ).toContain('No successful completions');
  await page.getByRole('button', { name: 'Reset example' }).click();
  await expect(page.locator('[data-design="b"]')).toBeHidden();
  await expect(page.locator('#cost-results')).toBeHidden();
  await page.locator('#a-succeeded').fill('7');
  await page.getByLabel('Compare two designs').check();
  await page.reload();
  await expect(page.locator('#a-succeeded')).toHaveValue('40');
  await expect(page.locator('[data-design="b"]')).toBeHidden();
});
test('invalid data is recoverable and live results do not become stale', async ({
  page,
}) => {
  await page.goto('/tools/task-cost/');
  await page.locator('#a-succeeded').fill('101');
  await page.getByRole('button', { name: 'Calculate outcome cost' }).click();
  await expect(page.getByRole('alert')).toContainText('Successful tasks');
  await expect(page.locator('#cost-results')).toBeHidden();
  await page.locator('#a-succeeded').fill('40');
  await page.locator('#a-reviewMinutes').fill('30');
  await page.locator('#a-hourlyCost').fill('60');
  await page.getByRole('button', { name: 'Calculate outcome cost' }).click();
  await expect(page.locator('.cost-primary')).toHaveText('$0.825');
  await page.locator('#a-model').fill('');
  await page.getByRole('button', { name: 'Calculate outcome cost' }).click();
  await expect(page.getByRole('alert')).toContainText('Model cost');
  await expect(page.locator('#cost-results')).toBeHidden();
});
test('accessible results, mobile reflow, and no-script method', async ({
  page,
  browser,
}) => {
  await page.goto('/tools/task-cost/');
  await page.getByLabel('Compare two designs').check();
  await page.getByRole('button', { name: 'Calculate outcome cost' }).click();
  await expect(page.locator('#cost-results')).toBeFocused();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const plain = await context.newPage();
    await plain.goto(
      `${process.env.SITE_URL || 'http://127.0.0.1:4321'}/tools/task-cost/`,
    );
    await expect(
      plain.getByRole('heading', { name: 'The method', exact: true }),
    ).toBeVisible();
    await expect(plain.locator('#cost-form')).toBeHidden();
    await expect(plain.locator('noscript p')).toBeVisible();
    await expect(plain.locator('noscript p')).toContainText(
      'Enable JavaScript',
    );
  } finally {
    await context.close();
  }
});
