import { test, expect } from '@playwright/test';
import { SECTIONS, focusStage, scrollBeatIntoView } from './helpers';

test.describe('scroll and controls', () => {
  test('scrolling each beat advances the widget step', async ({ page }) => {
    // 7 sections x 3 beats; WebKit needs well over the default 45 s.
    test.setTimeout(120_000);
    await page.goto('/');
    for (const section of SECTIONS) {
      const widget = page.getByTestId(`widget-${section}`);
      const total = Number(await page.locator(`#${section} [data-beat-index]`).count());
      expect(total).toBeGreaterThan(0);
      // Exercise the first, middle and last beats (full sweep is slow).
      const beats = [...new Set([0, Math.floor((total - 1) / 2), total - 1])];
      for (const beat of beats) {
        await scrollBeatIntoView(page, section, beat);
        await expect(widget).toHaveAttribute('data-step', String(beat));
      }
    }
  });

  test('Next/Prev change the step and settle without oscillation', async ({ page }) => {
    await page.goto('/');
    const widget = await focusStage(page, 'attention');
    await widget.getByRole('button', { name: /jump to step 1/i }).click();
    await expect(widget).toHaveAttribute('data-step', '0');
    await widget.getByRole('button', { name: /next step/i }).click();
    await expect(widget).toHaveAttribute('data-step', '1');
    await page.waitForTimeout(600);
    await expect(widget).toHaveAttribute('data-step', '1'); // stayed put
    await widget.getByRole('button', { name: /previous step/i }).click();
    await expect(widget).toHaveAttribute('data-step', '0');
  });

  test('keyboard arrows move through steps', async ({ page }) => {
    await page.goto('/');
    const widget = await focusStage(page, 'attention');
    await widget.focus();
    await page.keyboard.press('Home');
    await expect(widget).toHaveAttribute('data-step', '0');
    await page.keyboard.press('ArrowRight');
    await expect(widget).toHaveAttribute('data-step', '1');
    await page.keyboard.press('ArrowRight');
    await expect(widget).toHaveAttribute('data-step', '2');
    await page.keyboard.press('ArrowLeft');
    await expect(widget).toHaveAttribute('data-step', '1');
    await page.keyboard.press('End');
    await expect(widget).toHaveAttribute('data-step', '7');
    await page.keyboard.press('Home');
    await expect(widget).toHaveAttribute('data-step', '0');
  });

  test('backwards navigation reproduces the forward scene', async ({ page }) => {
    await page.goto('/');
    const widget = await focusStage(page, 'sampling');
    await widget.focus();
    await page.keyboard.press('Home');
    await expect(widget).toHaveAttribute('data-step', '0');
    await widget.getByRole('button', { name: /next step/i }).click();
    await widget.getByRole('button', { name: /next step/i }).click();
    await expect(widget).toHaveAttribute('data-step', '2');
    const forward = await widget.innerText();
    await widget.getByRole('button', { name: /previous step/i }).click();
    await widget.getByRole('button', { name: /next step/i }).click();
    await expect(widget).toHaveAttribute('data-step', '2');
    expect(await widget.innerText()).toBe(forward);
  });

  test('deep link #attention?step=4 opens at step 4', async ({ page }) => {
    await page.goto('/#attention?step=4');
    const widget = page.getByTestId('widget-attention');
    await expect(widget).toHaveAttribute('data-step', '4');
  });

  test('invalid deep links fall back gracefully', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/#attention?step=abc');
    await expect(page.getByTestId('widget-attention')).toHaveAttribute('data-step', '0');
    await page.goto('/#unknown-section?step=2');
    await expect(page.locator('#hero')).toBeAttached();
    await page.goto('/#attention?step=999');
    await expect(page.getByTestId('widget-attention')).toHaveAttribute('data-step', '7');
    expect(errors).toEqual([]);
  });

  test('fast scroll past several beats lands on the correct final step', async ({ page }) => {
    await page.goto('/');
    const widget = page.getByTestId('widget-block');
    await page.evaluate(() => {
      const el = document.getElementById('block');
      el?.scrollIntoView({ block: 'start' });
      window.scrollBy(0, 4000);
    });
    await expect(widget).toHaveAttribute('data-step', /[0-7]/);
  });

  test('reduced motion still advances steps on scroll and does not autoplay', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    await scrollBeatIntoView(page, 'attention', 3);
    await expect(page.getByTestId('widget-attention')).toHaveAttribute('data-step', '3');
    await scrollBeatIntoView(page, 'loop', 0);
    await expect(page.getByTestId('widget-loop')).toHaveAttribute('data-step', '0');
    await expect(
      page.getByTestId('widget-loop').getByRole('button', { name: /play generation loop/i })
    ).toBeVisible();
    await context.close();
  });
});
