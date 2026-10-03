import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const SECTIONS = [
  'tokenization',
  'embeddings',
  'attention',
  'multihead',
  'block',
  'sampling',
  'loop',
] as const;

/**
 * Brings a widget stage fully on screen and waits for the scroll observer to
 * settle, so control clicks don't make Playwright auto-scroll the page.
 */
export async function focusStage(page: Page, section: string) {
  const widget = page.getByTestId(`widget-${section}`);
  await widget.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  return widget;
}

export async function scrollBeatIntoView(page: Page, section: string, beat: number) {
  await page.evaluate(
    ([s, b]) => {
      const el = document.getElementById(`${s}-beat-${b}`);
      el?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
    },
    [section, beat] as const
  );
}

export async function expectNoSeriousA11yViolations(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter(
    v => v.impact === 'serious' || v.impact === 'critical'
  );
  expect(
    serious,
    `${label}: ${serious.map(v => `${v.id} (${v.nodes.length})`).join(', ')}`
  ).toEqual([]);
}
