import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  MOBILE_READING_LINE_FRACTION,
  MOBILE_STAGE_QUERY,
} from '../../src/lib/reading-line';

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

/**
 * Scrolls a beat onto the app's reading line (viewport centre on desktop, the
 * area below the 45vh sticky stage on mobile) so the step selector and the
 * test agree on which beat is active.
 */
export async function scrollBeatIntoView(page: Page, section: string, beat: number) {
  await page.evaluate(
    ([s, b, mobileQuery, fraction]) => {
      const el = document.getElementById(`${s}-beat-${b}`);
      if (!el) return;
      const vh = window.innerHeight;
      const line = window.matchMedia(mobileQuery).matches ? vh * fraction : vh / 2;
      const rect = el.getBoundingClientRect();
      window.scrollTo({
        top: Math.max(0, window.scrollY + rect.top + rect.height / 2 - line),
        behavior: 'instant' as ScrollBehavior,
      });
    },
    [section, beat, MOBILE_STAGE_QUERY, MOBILE_READING_LINE_FRACTION] as const
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
