import { test, expect } from '@playwright/test';
import { SECTIONS } from './helpers';

test.describe('mobile layout', () => {
  test('no horizontal overflow at 375px across all sections', async ({ page }) => {
    await page.goto('/');
    for (const section of SECTIONS) {
      await page.evaluate(s => document.getElementById(s)?.scrollIntoView({ block: 'center' }), section);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow, `section ${section} overflows by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });

  test('primary controls are at least 44px tall on mobile', async ({ page }) => {
    await page.goto('/');
    const widget = page.getByTestId('widget-attention');
    await widget.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    for (const name of [/next step/i, /previous step/i, /restart widget/i]) {
      const box = await widget.getByRole('button', { name }).boundingBox();
      expect(box?.height ?? 0, String(name)).toBeGreaterThanOrEqual(44);
    }
  });
});
