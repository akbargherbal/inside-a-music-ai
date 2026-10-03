import React, { useEffect, useRef } from 'react';
import type { ConceptSection } from '../content/sections/types';
import { AnalogyBox } from './AnalogyBox';
import { WidgetStage } from './WidgetStage';
import { YuE2Link } from './YuE2Link';
import { PythonCorner } from './PythonCorner';
import { Quiz } from './Quiz';
import { Term } from './Term';
import { GlossaryText } from './GlossaryText';
import { getReadingLineY } from '../lib/reading-line';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface SectionContainerProps {
  section: ConceptSection;
  step: number;
  onStepChange: (step: number) => void;
  onStepFromScroll: (step: number) => void;
  reducedMotion: boolean;
  onOpenGlossary: (slug?: string) => void;
  nextSectionId?: string;
  nextSectionTitle?: string;
  children: React.ReactNode; // The widget rendered inside
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  section,
  step,
  onStepChange,
  onStepFromScroll,
  reducedMotion,
  onOpenGlossary,
  nextSectionId,
  nextSectionTitle,
  children,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Drive the step from scroll position by choosing the beat whose centre is
  // nearest the viewport centre. This is robust on mobile (where a sticky
  // stage can sit over the beats) and avoids the IntersectionObserver band
  // ambiguity that made the step jump to a stale beat.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = getReadingLineY();
      let bestIndex = -1;
      let bestDistance = Infinity;
      beatRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - line);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = idx;
        }
      });
      if (bestIndex >= 0) onStepFromScroll(bestIndex);
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [onStepFromScroll]);

  const currentStep = section.steps[step] || section.steps[0];
  const stepLabels = section.steps.map((_, i) => `Step ${i + 1}`);

  return (
    <section
      id={section.id}
      ref={containerRef}
      className="w-full py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-850 scroll-mt-14"
    >
      {/* 1. Header & Hook */}
      <div className="mb-6">
        <span className="font-mono text-xs uppercase tracking-wider text-sky-400 font-semibold">
          Concept Section
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
          {section.title}
        </h2>
        <p className="text-base text-slate-400 mt-1 font-medium">
          {section.subtitle}
        </p>

        {/* Hook */}
        <div className="mt-4 p-3.5 rounded-xl bg-sky-950/30 border border-sky-850 text-sky-200 text-sm italic">
          💡 {section.hook}
        </div>
      </div>

      {/* 2. Analogy First, Mechanism Second, Where it Breaks */}
      <AnalogyBox
        title={section.analogy.title}
        body={section.analogy.body}
        breaksDown={section.analogy.breaksDown}
      />

      {/* 3. Scrollytelling Two-Column Grid */}
      <div className="relative mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Scrolling Text Beats */}
        <div className="lg:col-span-5 space-y-12 sm:space-y-20 py-4 order-2 lg:order-1">
          {section.steps.map((s, idx) => {
            const isActive = idx === step;
            return (
              <div
                key={idx}
                id={`${section.id}-beat-${idx}`}
                data-beat-index={idx}
                ref={el => {
                  beatRefs.current[idx] = el;
                }}
                onClick={() => onStepChange(idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 border-sky-500/80 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                      isActive
                        ? 'bg-sky-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    Step {idx + 1} of {section.steps.length}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  <GlossaryText
                    text={s.caption}
                    terms={s.newTerms}
                    onOpenGlossary={onOpenGlossary}
                  />
                </p>

                {s.newTerms && s.newTerms.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">New Terms:</span>
                    {s.newTerms.map(termSlug => (
                      <Term
                        key={termSlug}
                        name={termSlug}
                        onOpenGlossary={onOpenGlossary}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Sticky Widget Stage. On mobile it is capped at ~45vh
            so its controls stay on screen and the active beat's text remains
            visible beneath it (Build Spec §150, QA Spec "Mobile sticky"). */}
        <div
          id={`${section.id}-stage`}
          ref={stageRef}
          className="lg:col-span-7 sticky top-16 z-20 order-1 lg:order-2 h-[45vh] lg:h-auto"
        >
          <WidgetStage
            id={section.id}
            title={section.title}
            step={step}
            totalSteps={section.steps.length}
            onStepChange={onStepChange}
            dataKind={section.dataKind}
            badgeCustomText={section.badgeCustomText}
            liveCaption={currentStep.liveCaption}
            reducedMotion={reducedMotion}
            stepLabels={stepLabels}
          >
            {children}
          </WidgetStage>
        </div>
      </div>

      {/* 4. In YuE2 Card */}
      <YuE2Link
        title={`How This Works Inside YuE2-3B`}
        text={section.inYuE2.text}
        factIds={section.inYuE2.factIds}
      />

      {/* 5. Python Corner */}
      {section.pythonCorner.map((snippet, idx) => (
        <PythonCorner
          key={idx}
          title={snippet.title}
          code={snippet.code}
          expectedOutput={snippet.expectedOutput}
          explanation={snippet.explanation}
          tag={snippet.tag}
        />
      ))}

      {/* 6. Section Recap (3 Bullets) */}
      <div className="my-8 p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
          Key Takeaways
        </h4>
        <ul className="space-y-2.5 text-sm text-slate-300">
          {section.recap.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 7. Quiz (2 questions) */}
      <Quiz sectionId={section.id} questions={section.quiz} />

      {/* 8. Next Section Link */}
      {nextSectionId && (
        <div className="mt-8 flex justify-end">
          <a
            href={`#${nextSectionId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-sky-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <span>Next: {nextSectionTitle}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </section>
  );
};
