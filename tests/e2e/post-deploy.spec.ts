import { test, expect } from '@playwright/test';
import { SECTIONS } from './helpers';

/**
 * Post-deploy smoke suite. Run with BASE_URL set:
 *   BASE_URL=https://<site>.web.app npx playwright test tests/e2e/post-deploy.spec.ts
 * Also runs against the local preview when BASE_URL is unset.
 */
test.describe('post-deploy verification', () => {
  test('app shell, widgets and interactions work', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', m => m.type() === 'error' && consoleErrors.push(m.text()));
    await page.goto('/');
    await expect(page).toHaveTitle(/Inside a Music AI/i);
    for (const section of SECTIONS) {
      await page.evaluate(s => document.getElementById(s)?.scrollIntoView({ block: 'center' }), section);
      await expect(page.getByTestId(`widget-${section}`)).toBeVisible();
    }
    await page.goto('/#attention?step=4');
    await expect(page.getByTestId('widget-attention')).toHaveAttribute('data-step', '4');
    expect(consoleErrors).toEqual([]);
  });

  test('unknown paths load the SPA shell without crashing', async ({ page }) => {
    const response = await page.goto('/does-not-exist');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('#root')).toBeAttached();
  });

  test('security and cache headers are configured', async ({ request }) => {
    // Hosting headers only exist on Firebase, not on the local `vite preview`.
    test.skip(!process.env.BASE_URL, 'requires a deployed BASE_URL');
    const index = await request.get('/');
    expect(index.headers()['x-content-type-options']).toBe('nosniff');
    expect(index.headers()['x-frame-options']).toBe('DENY');
    expect(index.headers()['cache-control']).toContain('no-cache');
  });

  test('mobile viewport has no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
