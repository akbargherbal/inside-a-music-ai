import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { SECTIONS } from './helpers';

async function mountAllWidgets(page: Page) {
  await page.goto('/');
  for (const section of SECTIONS) {
    await page.evaluate(s => document.getElementById(s)?.scrollIntoView({ block: 'center' }), section);
    await expect(page.getByTestId(`widget-${section}`)).toBeVisible();
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

async function expectAxeClean(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  expect(serious, `${label}: ${serious.map(v => `${v.id}(${v.nodes.length})`).join(', ')}`).toEqual([]);
}

test.describe('accessibility', () => {
  test.setTimeout(120_000);

  test.describe('dark theme', () => {
    test.use({ colorScheme: 'dark' });
    test('no serious/critical axe violations', async ({ page }) => {
      await mountAllWidgets(page);
      await expect(page.locator('html')).not.toHaveClass(/light/);
      await expectAxeClean(page, 'dark');
    });
  });

  test.describe('light theme', () => {
    test.use({ colorScheme: 'light' });
    test('no serious/critical axe violations', async ({ page }) => {
      await mountAllWidgets(page);
      await expect(page.locator('html')).toHaveClass(/light/);
      await expectAxeClean(page, 'light');
    });
  });

  test('document has one h1, a lang attribute and a title', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('h1').count()).toBe(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/./);
  });

  test('a Term popover can be opened with the keyboard', async ({ page }) => {
    await page.goto('/');
    await page.locator('#tokenization').scrollIntoViewIfNeeded();
    const term = page.getByRole('button', { name: /^token$/i }).first();
    await term.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tooltip').first()).toBeVisible();
  });
});
