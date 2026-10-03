import React from 'react';
import { ArrowUp, BookOpen } from 'lucide-react';

interface FooterProps {
  onOpenGlossary: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGlossary }) => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-sm font-bold text-white tracking-tight">
            Inside a Music AI · Interactive Explainer
          </div>
          <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
            YuE2 by M-A-P — model weights licensed under{' '}
            <strong className="text-slate-200">Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)</strong>.
            This application is an independent educational project and is not affiliated with M-A-P or Hugging Face.
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            No live GPU or network AI calls required. Pure in-browser simulation.
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={onOpenGlossary}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Search Glossary</span>
          </button>

          <a
            href="#hero"
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Jump back to top"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};
