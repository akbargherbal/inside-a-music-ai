import { useState, useEffect, useCallback, useRef } from 'react';
import { clampStep, parseSectionHash } from '../lib/deep-link';
import { scrollToReadingLine } from '../lib/reading-line';

/**
 * Owns one section's `step`. Step can only change through this hook, so scroll,
 * buttons, scrubber, keyboard and deep links never disagree.
 */
export function useWidgetStep(sectionId: string, totalSteps: number, _reducedMotion = false) {
  const [step, setStepState] = useState<number>(0);
  // True while we are scrolling a beat into view on purpose, so the scroll
  // observer does not immediately bounce the step back.
  const isProgrammaticScroll = useRef(false);

  const clamp = useCallback((value: number) => clampStep(value, totalSteps), [totalSteps]);

  const scrollLock = useCallback(() => {
    isProgrammaticScroll.current = true;
  }, []);

  const scrollToBeat = useCallback(
    (bounded: number) => {
      const beat = document.getElementById(`${sectionId}-beat-${bounded}`);
      if (beat) {
        scrollLock();
        // Instant, not smooth: a long smooth scroll outlives the guard and the
        // observer would then latch onto whatever beat is mid-flight. The beat
        // lands on the reading line so the scroll observer agrees with us on
        // both desktop (centre) and mobile (below the sticky stage).
        scrollToReadingLine(beat);
        return;
      }
      const el = document.getElementById(sectionId);
      if (el) {
        scrollLock();
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    },
    [sectionId, scrollLock]
  );

  /** Programmatic step change (buttons, scrubber, keyboard, deep link). */
  const setStep = useCallback(
    (newStep: number, scrollBeat = true) => {
      const bounded = clamp(newStep);
      setStepState(bounded);

      try {
        window.history.replaceState(null, '', `#${sectionId}?step=${bounded}`);
      } catch {
        // history may be unavailable (e.g. file://)
      }

      if (scrollBeat) scrollToBeat(bounded);
    },
    [sectionId, clamp, scrollToBeat]
  );

  /** Called by the scroll observer. Ignored while a programmatic scroll runs. */
  const setStepFromScroll = useCallback(
    (newStep: number) => {
      if (isProgrammaticScroll.current) return;
      const bounded = clamp(newStep);
      setStepState(prev => (prev === bounded ? prev : bounded));
    },
    [clamp]
  );

  // Deep links: #attention?step=3 sets the step and scrolls the section in.
  useEffect(() => {
    function applyHash(scroll: boolean) {
      const target = parseSectionHash(window.location.hash);
      if (!target || target.section !== sectionId || target.step === null) return;
      const bounded = clamp(target.step);
      setStepState(bounded);
      if (scroll) scrollToBeat(bounded);
    }
    applyHash(true);
    function onHashChange() {
      // External hash changes (address bar, links, navigations) should bring
      // the section into view; internal step changes use replaceState and do
      // not fire hashchange, so this cannot loop.
      applyHash(true);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [sectionId, clamp, scrollToBeat]);

  // Release the programmatic-scroll lock only on genuine user intent (wheel,
  // touch, keyboard). We deliberately do NOT release on bare `scroll` events,
  // and there is no timeout: automated/assistive scrolling (e.g. centring a
  // button before a click, or browser scroll restoration) also fires `scroll`,
  // and treating it as the user let the observer yank the step to a stale beat
  // before the click's own handler ran. A real user gesture always follows with
  // ordinary scroll events that re-enable scroll-driven stepping.
  useEffect(() => {
    const release = () => {
      isProgrammaticScroll.current = false;
    };
    window.addEventListener('wheel', release, { passive: true });
    window.addEventListener('touchstart', release, { passive: true });
    window.addEventListener('keydown', release);
    return () => {
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchstart', release);
      window.removeEventListener('keydown', release);
    };
  }, []);

  return { step, setStep, setStepFromScroll };
}
