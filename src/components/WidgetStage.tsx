import React, { Suspense, useEffect, useRef, useState } from 'react';
import { DataBadge, type DataKind } from './DataBadge';
import { StepControls } from './StepControls';
import { AlertCircle } from 'lucide-react';

interface WidgetErrorBoundaryProps {
  title: string;
  onReset: () => void;
  children: React.ReactNode;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render/lifecycle errors from a single widget so one broken visual
 * cannot white-screen the whole page.
 */
class WidgetErrorBoundary extends React.Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  state: WidgetErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WidgetErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Keep the failure visible in the console for debugging without crashing.
    console.error(`Widget "${this.props.title}" failed:`, error);
  }

  reset = () => {
    this.setState({ hasError: false });
    this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-6 bg-rose-950/20 border border-rose-900/50 rounded-xl">
          <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
          <p className="text-sm font-semibold text-rose-300">Widget simulation paused</p>
          <p className="text-xs text-slate-400 mt-1">
            An error occurred in this interactive step. The rest of the page still works.
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-3 px-3 py-1.5 text-xs bg-rose-900/50 hover:bg-rose-900 text-rose-200 rounded-md transition-colors"
          >
            Reset to Step 1
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  reducedMotion,
  children,
  stepLabels,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Keyboard navigation when the stage has focus.
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

  // Lazy-mount at >= 30% visibility, and pause animations while off-screen.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setInView(entry.isIntersecting);
          if (entry.isIntersecting) setHasMounted(true);
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animationsEnabled = reducedMotion || !inView;

  // Off-screen widgets render their final state with animation disabled.
  const renderedChildren = React.Children.map(children, child =>
    React.isValidElement(child)
      ? React.cloneElement(child as React.ReactElement<{ reducedMotion?: boolean }>, {
          reducedMotion: animationsEnabled,
        })
      : child
  );

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      data-testid={`widget-${id}`}
      data-step={step}
      data-in-view={inView ? 'true' : 'false'}
      aria-label={`Interactive simulation stage: ${title}. Use left and right arrow keys to step.`}
      className="h-full min-h-0 lg:h-auto focus:outline-none focus:ring-1 focus:ring-sky-500/40 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500/80" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Interactive Stage · {title}
          </h4>
        </div>
        <DataBadge kind={dataKind} customText={badgeCustomText} />
      </div>

      <div className="flex-1 min-h-0 relative bg-slate-950/40">
        {/* The widget body scrolls inside the 45vh mobile stage so the step
            controls below stay reachable; on desktop the stage grows to fit. */}
        <div
          tabIndex={0}
          aria-label={`${title} interactive content. Scroll for more.`}
          className="h-full overflow-y-auto lg:overflow-visible focus:outline-none focus:ring-1 focus:ring-sky-500/40"
        >
          <div className="min-h-full lg:min-h-[420px] p-4 sm:p-6 flex items-center justify-center">
            <WidgetErrorBoundary title={title} onReset={() => onStepChange(0)}>
              {hasMounted ? (
                <Suspense
                  fallback={
                    <div className="text-xs text-slate-500 font-mono" role="status">
                      Loading interactive stage…
                    </div>
                  }
                >
                  <React.Fragment>{renderedChildren}</React.Fragment>
                </Suspense>
              ) : (
                <div className="text-xs text-slate-500 font-mono" data-testid={`widget-${id}-loading`}>
                  Loading interactive stage…
                </div>
              )}
            </WidgetErrorBoundary>
          </div>
        </div>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveCaption}
        </div>
      </div>

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
