/**
 * Scroll geometry shared by the scroll-driven step selector, the programmatic
 * "scroll this beat into view" path, and the e2e helpers.
 *
 * Desktop: the widget stage sits beside the text, so the reading line is the
 * viewport centre.
 *
 * Mobile: the widget stage is sticky at the top (about 45vh), so a beat behind
 * the stage is not really "current". We treat the middle of the area *below*
 * the stage as the reading line, which keeps the active beat's text visible.
 */
export const MOBILE_STAGE_QUERY = '(max-width: 1023px)';

/** Fraction of the viewport height used as the mobile reading line. */
export const MOBILE_READING_LINE_FRACTION = 0.78;

export function getReadingLineY(): number {
  const vh = window.innerHeight;
  return window.matchMedia(MOBILE_STAGE_QUERY).matches
    ? vh * MOBILE_READING_LINE_FRACTION
    : vh / 2;
}

/** Scrolls so the vertical centre of `el` sits on the reading line. */
export function scrollToReadingLine(el: HTMLElement): void {
  const rect = el.getBoundingClientRect();
  const target = window.scrollY + rect.top + rect.height / 2 - getReadingLineY();
  window.scrollTo({ top: Math.max(0, target), behavior: 'auto' });
}
