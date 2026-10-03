import { useState, useEffect, useCallback } from 'react';

export function useWidgetStep(sectionId: string, totalSteps: number) {
  const [step, setStep] = useState<number>(0);

  // Check URL hash on initial mount e.g. #attention?step=3
  useEffect(() => {
    function parseHash() {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const [hashSection, query] = hash.split('?');
      if (hashSection === sectionId && query) {
        const params = new URLSearchParams(query);
        const stepParam = params.get('step');
        if (stepParam !== null) {
          const parsed = parseInt(stepParam, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < totalSteps) {
            setStep(parsed);
          }
        }
      }
    }

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, [sectionId, totalSteps]);

  // Set step and optionally scroll matching beat element into view
  const setStepAndScroll = useCallback(
    (newStep: number, scrollBeat = true) => {
      const bounded = Math.max(0, Math.min(newStep, totalSteps - 1));
      setStep(bounded);

      // Update URL hash without jumping
      try {
        const newUrl = `#${sectionId}?step=${bounded}`;
        window.history.replaceState(null, '', newUrl);
      } catch {
        // ignore
      }

      if (scrollBeat) {
        const beatEl = document.getElementById(`${sectionId}-beat-${bounded}`);
        if (beatEl) {
          beatEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },
    [sectionId, totalSteps]
  );

  return {
    step,
    setStep: setStepAndScroll,
  };
}
