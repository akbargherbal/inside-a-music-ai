import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { ProgressRail, SECTIONS_META } from './components/ProgressRail';
import { Hero } from './components/Hero';
import { SectionContainer } from './components/SectionContainer';
import { Epilogue } from './components/Epilogue';
import { Footer } from './components/Footer';
import { GlossaryModal } from './components/GlossaryModal';

// Content definitions
import { SECTION_W1 } from './content/sections/w1-tokenization';
import { SECTION_W2 } from './content/sections/w2-embeddings';
import { SECTION_W3 } from './content/sections/w3-attention';
import { SECTION_W4 } from './content/sections/w4-multihead';
import { SECTION_W5 } from './content/sections/w5-block';
import { SECTION_W6 } from './content/sections/w6-sampling';
import { SECTION_W7 } from './content/sections/w7-loop';

// Widgets
import { W1TokenizationWidget } from './widgets/w1-tokenization';
import { W2EmbeddingsWidget } from './widgets/w2-embeddings';
import { W3AttentionWidget } from './widgets/w3-attention';
import { W4MultiHeadWidget } from './widgets/w4-multihead';
import { W5BlockWidget } from './widgets/w5-block';
import { W6SamplingWidget } from './widgets/w6-sampling';
import { W7LoopWidget } from './widgets/w7-loop';

import { useWidgetStep } from './hooks/useWidgetStep';

export default function App() {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [activeGlossarySlug, setActiveGlossarySlug] = useState<string | undefined>(undefined);
  const [currentSectionId, setCurrentSectionId] = useState<string>('hero');

  // Step state for each of the 7 sections
  const w1 = useWidgetStep('tokenization', SECTION_W1.steps.length);
  const w2 = useWidgetStep('embeddings', SECTION_W2.steps.length);
  const w3 = useWidgetStep('attention', SECTION_W3.steps.length);
  const w4 = useWidgetStep('multihead', SECTION_W4.steps.length);
  const w5 = useWidgetStep('block', SECTION_W5.steps.length);
  const w6 = useWidgetStep('sampling', SECTION_W6.steps.length);
  const w7 = useWidgetStep('loop', SECTION_W7.steps.length);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setCurrentSectionId(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: '-30% 0px -50% 0px', threshold: 0.1 }
    );

    const sectionIds = ['hero', ...SECTIONS_META.map(s => s.id), 'epilogue'];
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleOpenGlossary = (slug?: string) => {
    setActiveGlossarySlug(slug);
    setGlossaryOpen(true);
  };

  const handleJumpToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Bar Navigation */}
      <TopBar
        onOpenGlossary={() => handleOpenGlossary()}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(prev => !prev)}
        currentSectionId={currentSectionId}
      />

      {/* Side Progress Rail (Desktop) */}
      <ProgressRail
        currentSectionId={currentSectionId}
        onNavigate={handleJumpToSection}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* Hero */}
        <Hero onStartJourney={() => handleJumpToSection('tokenization')} />

        {/* W1: Tokenization */}
        <SectionContainer
          section={SECTION_W1}
          step={w1.step}
          onStepChange={w1.setStep}
          reducedMotion={reducedMotion}
          onOpenGlossary={handleOpenGlossary}
          nextSectionId={SECTION_W2.id}
          nextSectionTitle={SECTION_W2.title}
        >
          <W1TokenizationWidget
            step={w1.step}
            stepCount={SECTION_W1.steps.length}
            reducedMotion={reducedMotion}
          />
        </SectionContainer>

        {/* W2: Embeddings */}
        <SectionContainer
          section={SECTION_W2}
          step={w2.step}
          onStepChange={w2.setStep}
          reducedMotion={reducedMotion}
          onOpenGlossary={handleOpenGlossary}
          nextSectionId={SECTION_W3.id}
          nextSectionTitle={SECTION_W3.title}
        >
          <W2EmbeddingsWidget
            step={w2.step}
            stepCount={SECTION_W2.steps.length}
            reducedMotion={reducedMotion}
          />
        </SectionContainer>

        {/* W3: Attention */}
        <SectionContainer
          section={SECTION_W3}
          step={w3.step}
          onStepChange={w3.setStep}
          reducedMotion={reducedMotion}
          onOpenGlossary={handleOpenGlossary}
          nextSectionId={SECTION_W4.id}
          nextSectionTitle={SECTION_W4.title}
        >
          <W3AttentionWidget
            step={w3.step}
            stepCount={SECTION_W3.steps.length}
            reducedMotion={reducedMotion}
          />
        </SectionContainer>

        {/* W4: Multi-Head */}
        <SectionContainer
          section={SECTION_W4}
          step={w4.step}
          onStepChange={w4.setStep}
          reducedMotion={reducedMotion}
          onOpenGlossary={handleOpenGlossary}
          nextSectionId={SECTION_W5.id}
          nextSectionTitle={SECTION_W5.title}
        >
          <W4MultiHeadWidget
            step={w4.step}
            stepCount={SECTION_W4.steps.length}
            reducedMotion={reducedMotion}
          />
        </SectionContainer>

        {/* W5: Transformer Block */}
        <SectionContainer
          section={SECTION_W5}
          step={w5.step}
          onStepChange={w5.setStep}
          reducedMotion={reducedMotion}
          onOpenGlossary={handleOpenGlossary}
          nextSectionId={SECTION_W6.id}
          nextSectionTitle={SECTION_W6.title}
        >
          <W5BlockWidget
            step={w5.step}
            stepCount={SECTION_W5.steps.length}
            reducedMotion={reducedMotion}
          />
        </SectionContainer>

        {/* W6: Sampling */}
        <SectionContainer
          section={SECTION_W6}
          step={w6.step}
          onStepChange={w6.setStep}
          reducedMotion={reducedMotion}
          onOpenGlossary={handleOpenGlossary}
          nextSectionId={SECTION_W7.id}
          nextSectionTitle={SECTION_W7.title}
        >
          <W6SamplingWidget
            step={w6.step}
            stepCount={SECTION_W6.steps.length}
            reducedMotion={reducedMotion}
          />
        </SectionContainer>

        {/* W7: Generation Loop */}
        <SectionContainer
          section={SECTION_W7}
          step={w7.step}
          onStepChange={w7.setStep}
          reducedMotion={reducedMotion}
          onOpenGlossary={handleOpenGlossary}
          nextSectionId="epilogue"
          nextSectionTitle="Epilogue & Limits"
        >
          <W7LoopWidget
            step={w7.step}
            stepCount={SECTION_W7.steps.length}
            reducedMotion={reducedMotion}
          />
        </SectionContainer>

        {/* Epilogue */}
        <Epilogue />
      </main>

      {/* Footer */}
      <Footer onOpenGlossary={() => handleOpenGlossary()} />

      {/* Searchable Glossary Modal */}
      <GlossaryModal
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        initialSlug={activeGlossarySlug}
        onJumpToSection={handleJumpToSection}
      />
    </div>
  );
}
