import { test, expect } from '@playwright/test';
import { focusStage } from './helpers';

test.describe('interactive controls', () => {
  test('W1 re-tokenizes text typed by the reader', async ({ page }) => {
    await page.goto('/');
    const widget = await focusStage(page, 'tokenization');
    await widget.getByRole('button', { name: /jump to step 2/i }).click(); // step 2 shows the input
    const input = widget.getByRole('textbox');
    await input.fill('Sunlight');
    await expect(widget.getByText('Sun', { exact: true })).toBeVisible();
    await expect(widget.getByText('light', { exact: true })).toBeVisible();
  });

  test('W2 token can be moved with the keyboard', async ({ page }) => {
    await page.goto('/');
    const widget = await focusStage(page, 'embeddings');
    await widget.getByRole('button', { name: /jump to step 6/i }).click(); // step index 5
    await expect(widget).toHaveAttribute('data-step', '5');
    const token = widget.getByRole('button', { name: /Token piano/i });
    await token.focus();
    await page.keyboard.press('ArrowRight');
    await expect(widget.getByText(/Nearest Neighbours/i)).toBeVisible();
  });

  test('W6 roll is deterministic for the same seed', async ({ page }) => {
    await page.goto('/');
    const widget = await focusStage(page, 'sampling');
    await widget.getByRole('button', { name: /jump to step 6/i }).click(); // step index 5 (roll)
    await expect(widget).toHaveAttribute('data-step', '5');
    await expect(widget.getByText(/"floor"/).first()).toBeVisible();
    await widget.getByRole('button', { name: /roll next/i }).click();
    await expect(widget.getByText(/"floor"/).first()).toBeVisible();
  });

  test('W7 Play advances the loop until the stop token', async ({ page }) => {
    await page.goto('/');
    const widget = await focusStage(page, 'loop');
    await widget.getByRole('button', { name: /play generation loop/i }).click();
    await expect(widget.getByRole('button', { name: /pause generation loop/i })).toBeVisible();
    await page.waitForTimeout(3000);
    await expect(widget.getByText(/HALTED/i).first()).toBeVisible();
  });

  test('W5 station popover opens and closes with Escape', async ({ page }) => {
    await page.goto('/');
    const widget = await focusStage(page, 'block');
    await widget.getByRole('button', { name: /inspect/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
