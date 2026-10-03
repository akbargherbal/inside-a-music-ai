import React from 'react';

export interface SectionMeta {
  id: string;
  number: number;
  shortTitle: string;
  fullTitle: string;
}

export const SECTIONS_META: SectionMeta[] = [
  { id: 'tokenization', number: 1, shortTitle: 'Tokens', fullTitle: 'Tokenization: Numbered Bricks' },
  { id: 'embeddings', number: 2, shortTitle: 'Embeddings', fullTitle: 'Embeddings: Map Coordinates' },
  { id: 'attention', number: 3, shortTitle: 'Attention', fullTitle: 'Self-Attention: Who to Listen to' },
  { id: 'multihead', number: 4, shortTitle: 'Multi-Head', fullTitle: 'Multi-Head: Multiple Views' },
  { id: 'block', number: 5, shortTitle: 'Block', fullTitle: 'Transformer Block: Assembly Line' },
  { id: 'sampling', number: 6, shortTitle: 'Sampling', fullTitle: 'Sampling: Rolling Weighted Dice' },
  { id: 'loop', number: 7, shortTitle: 'Loop', fullTitle: 'Generation Loop: Song Autocomplete' },
];

interface ProgressRailProps {
  currentSectionId: string;
  onNavigate: (sectionId: string) => void;
}

export const ProgressRail: React.FC<ProgressRailProps> = ({ currentSectionId, onNavigate }) => {
  return (
    <aside
      className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto"
      aria-label="Table of contents and section progress"
    >
      <div className="flex flex-col gap-2 p-2 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md shadow-2xl">
        {SECTIONS_META.map(section => {
          const isActive = currentSectionId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onNavigate(section.id)}
              className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
              title={section.fullTitle}
              aria-current={isActive ? 'true' : undefined}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] transition-colors ${
                  isActive
                    ? 'bg-sky-400 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                }`}
              >
                {section.number}
              </span>
              <span className="text-xs tracking-tight whitespace-nowrap">
                {section.shortTitle}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
