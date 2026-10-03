import React from 'react';
import { BookOpen, Activity, Sun, Moon } from 'lucide-react';

interface TopBarProps {
  onOpenGlossary: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  currentSectionId?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenGlossary,
  reducedMotion,
  onToggleReducedMotion,
  currentSectionId,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#hero"
          className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-sky-300 transition-colors whitespace-nowrap"
        >
          Inside a Music AI
        </a>

        {/* Zone 2: 4-6 clean single-line nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
          <a
            href="#tokenization"
            className={`hover:text-white transition-colors ${
              currentSectionId === 'tokenization' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Tokens
          </a>
          <a
            href="#embeddings"
            className={`hover:text-white transition-colors ${
              currentSectionId === 'embeddings' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Embeddings
          </a>
          <a
            href="#attention"
            className={`hover:text-white transition-colors ${
              currentSectionId === 'attention' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Attention
          </a>
          <a
            href="#multihead"
            className={`hover:text-white transition-colors ${
              currentSectionId === 'multihead' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Multi-Head
          </a>
          <a
            href="#block"
            className={`hover:text-white transition-colors ${
              currentSectionId === 'block' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Transformer
          </a>
          <a
            href="#sampling"
            className={`hover:text-white transition-colors ${
              currentSectionId === 'sampling' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Sampling
          </a>
          <a
            href="#loop"
            className={`hover:text-white transition-colors ${
              currentSectionId === 'loop' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Generation
          </a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            aria-label="Toggle colour theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleReducedMotion}
            title={reducedMotion ? 'Enable animations' : 'Reduce motion'}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              reducedMotion
                ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Toggle reduced motion preference"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">
              {reducedMotion ? 'Motion: Off' : 'Motion: On'}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenGlossary}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Glossary</span>
          </button>
        </div>
      </div>
    </header>
  );
};
