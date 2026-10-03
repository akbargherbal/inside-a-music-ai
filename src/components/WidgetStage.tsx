import React, { useEffect, useRef, useState } from 'react';
import { DataBadge, type DataKind } from './DataBadge';
import { StepControls } from './StepControls';
import { AlertCircle } from 'lucide-react';

interface WidgetStageProps {
  id: string;
  title: string;
  step: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  dataKind: DataKind;
  badgeCustomText?: string;
  liveCaption: string;
  reducedMotion: boolean;
  children: React.ReactNode;
  stepLabels?: string[];
}

export const WidgetStage: React.FC<WidgetStageProps> = ({
  id,
  title,
  step,
  totalSteps,
  onStepChange,
  dataKind,
  badgeCustomText,
  liveCaption,
  children,
  stepLabels,
}) => {
  const [hasError, setHasError] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation when stage is focused
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!stageRef.current || !stageRef.current.contains(document.activeElement)) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        if (step < totalSteps - 1) onStepChange(step + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (step > 0) onStepChange(step - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        onStepChange(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        onStepChange(totalSteps - 1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, totalSteps, onStepChange]);

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      data-testid={`widget-${id}`}
      aria-label={`Interactive simulation stage: ${title}. Use left and right arrow keys to step.`}
      className="focus:outline-none focus:ring-1 focus:ring-sky-500/40 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between"
    >
      {/* Top Header of Stage */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500/80" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interactive Stage · {title}
          </h4>
        </div>
        <DataBadge kind={dataKind} customText={badgeCustomText} />
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="p-4 sm:p-6 min-h-[360px] sm:min-h-[420px] flex items-center justify-center relative overflow-hidden bg-slate-950/40">
        {hasError ? (
          <div className="flex flex-col items-center justify-center text-center p-6 bg-rose-950/20 border border-rose-900/50 rounded-xl">
            <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
            <p className="text-sm font-semibold text-rose-300">Widget simulation paused</p>
            <p className="text-xs text-slate-400 mt-1">An error occurred in this interactive step.</p>
            <button
              onClick={() => {
                setHasError(false);
                onStepChange(0);
              }}
              className="mt-3 px-3 py-1.5 text-xs bg-rose-900/50 hover:bg-rose-900 text-rose-200 rounded-md transition-colors"
            >
              Reset to Step 1
            </button>
          </div>
        ) : (
          <React.Fragment>{children}</React.Fragment>
        )}

        {/* Visually hidden screen reader live caption */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveCaption}
        </div>
      </div>

      {/* Bottom Step Controller */}
      <div className="p-3 sm:px-4 border-t border-slate-800/80 bg-slate-950/70">
        <StepControls
          currentStep={step}
          totalSteps={totalSteps}
          onStepChange={onStepChange}
          stepLabels={stepLabels}
        />
      </div>
    </div>
  );
};
