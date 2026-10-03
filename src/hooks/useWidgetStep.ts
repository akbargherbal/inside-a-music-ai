import { useState, useEffect, useCallback, useRef } from 'react';
import { clampStep, parseSectionHash } from '../lib/deep-link';

/**
 * Owns one section's `step`. Step can only change through this hook, so scroll,
 * buttons, scrubber, keyboard and deep links never disagree.
 */
export function useWidgetStep(sectionId: string, totalSteps: number, reducedMotion = false) {
  const [step, setStepState] = useState<number>(0);
  // True while we are scrolling a beat into view on purpose, so the scroll
  // observer does not immediately bounce the step back.
  const isProgrammaticScroll = useRef(false);
  const lockTime = useRef(0);
  const isProgrammaticScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clamp = useCallback((value: number) => clampStep(value, totalSteps), [totalSteps]);

  const scrollLock = useCallback(() => {
    isProgrammaticScroll.current = true;
    lockTime.current = Date.now();
    // Fallback so the lock can never stick forever if no scroll/input arrives.
    if (isProgrammaticScrollTimer.current) clearTimeout(isProgrammaticScrollTimer.current);
    isProgrammaticScrollTimer.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 4000);
  }, []);

  const scrollToBeat = useCallback(
    (bounded: number) => {
      const beat = document.getElementById(`${sectionId}-beat-${bounded}`);
      const el = beat ?? document.getElementById(sectionId);
      if (el) {
        scrollLock();
        // Instant, not smooth: a long smooth scroll outlives the guard and the
        // observer would then latch onto whatever beat is mid-flight.
        el.scrollIntoView({ behavior: 'auto', block: 'center' });
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
      applyHash(false);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [sectionId, clamp, scrollToBeat]);

  // Release the programmatic-scroll lock only on real user scroll intent. A
  // `scroll` event that lands long after our own instant scroll counts as the
  // user; wheel/touch always do. This stops a late IntersectionObserver
  // delivery from yanking the step to a stale beat after a button press.
  useEffect(() => {
    const release = () => {
      isProgrammaticScroll.current = false;
    };
    const onScroll = () => {
      if (isProgrammaticScroll.current && Date.now() - lockTime.current > 250) release();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', release, { passive: true });
    window.addEventListener('touchstart', release, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchstart', release);
      if (isProgrammaticScrollTimer.current) clearTimeout(isProgrammaticScrollTimer.current);
    };
  }, []);

  return { step, setStep, setStepFromScroll };
}
