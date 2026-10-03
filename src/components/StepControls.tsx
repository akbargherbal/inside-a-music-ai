import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  className?: string;
  stepLabels?: string[];
}

export const StepControls: React.FC<StepControlsProps> = ({
  currentStep,
  totalSteps,
  onStepChange,
  className = '',
  stepLabels,
}) => {
  const canGoPrev = currentStep > 0;
  const canGoNext = currentStep < totalSteps - 1;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 sm:px-4 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-sm ${className}`}
      role="region"
      aria-label="Interactive widget step navigation"
    >
      {/* Step scrubber & indicator */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-xs font-mono tabular-nums text-slate-400 font-medium">
          Step {currentStep + 1} / {totalSteps}
        </span>
        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onStepChange(idx)}
              className={`h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-sky-400 ${
                idx === currentStep
                  ? 'w-6 bg-sky-400 shadow-sm shadow-sky-500/50'
                  : idx < currentStep
                  ? 'w-2.5 bg-slate-600 hover:bg-slate-500'
                  : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
              title={stepLabels && stepLabels[idx] ? `Step ${idx + 1}: ${stepLabels[idx]}` : `Go to step ${idx + 1}`}
              aria-label={`Jump to step ${idx + 1}`}
              aria-current={idx === currentStep ? 'step' : undefined}
            />
          ))}
        </div>
      </div>

      {/* Button navigation */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => onStepChange(0)}
          disabled={!canGoPrev}
          title="Reset to first step (Home)"
          className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-lg hover:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-sky-400"
          aria-label="Restart widget"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => canGoPrev && onStepChange(currentStep - 1)}
          disabled={!canGoPrev}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-400"
          aria-label="Previous step (Left Arrow)"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        <button
          type="button"
          onClick={() => canGoNext && onStepChange(currentStep + 1)}
          disabled={!canGoNext}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 disabled:opacity-30 disabled:bg-slate-700 disabled:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm shadow-sky-500/30"
          aria-label="Next step (Right Arrow)"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
