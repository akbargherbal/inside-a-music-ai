import { test, expect } from '@playwright/test';
import { SECTIONS } from './helpers';

test.describe('page smoke', () => {
  test('loads with the right title and no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    const failures: string[] = [];
    page.on('requestfailed', req => failures.push(`${req.url()} ${req.failure()?.errorText}`));

    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Inside a Music AI/i);

    for (const section of SECTIONS) {
      await expect(page.locator(`#${section}`)).toBeAttached();
    }
    await expect(page.locator('#hero')).toBeAttached();
    await expect(page.locator('#epilogue')).toBeAttached();

    expect(consoleErrors).toEqual([]);
    expect(failures).toEqual([]);
  });

  test('shows the licence and non-affiliation notice in hero and footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/CC BY-NC 4\.0/i).first()).toBeVisible();
    await page.locator('#epilogue').scrollIntoViewIfNeeded();
    const footer = page.locator('footer');
    await expect(footer.getByText(/CC BY-NC 4\.0/i)).toBeVisible();
    await expect(footer.getByText(/not affiliated with M-A-P or Hugging Face/i)).toBeVisible();
  });

  test('all seven widgets mount and render their step 0', async ({ page }) => {
    await page.goto('/');
    for (const section of SECTIONS) {
      await page.evaluate(s => document.getElementById(s)?.scrollIntoView(), section);
      const widget = page.getByTestId(`widget-${section}`);
      await expect(widget).toBeVisible();
      await expect(widget).toHaveAttribute('data-step', '0');
    }
  });
});
