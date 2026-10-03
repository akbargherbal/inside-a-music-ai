import React, { useState, useRef, useEffect } from 'react';
import { GLOSSARY, type GlossaryEntry } from '../content/glossary';

interface TermProps {
  name: string; // Term name, or slug
  children?: React.ReactNode;
  onOpenGlossary?: (slug: string) => void;
}

export const Term: React.FC<TermProps> = ({ name, children, onOpenGlossary }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const entry: GlossaryEntry | undefined = GLOSSARY.find(
    g => g.term.toLowerCase() === name.toLowerCase() || g.slug === name.toLowerCase()
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!entry) {
    return <span className="font-medium text-slate-200">{children || name}</span>;
  }

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="font-medium text-sky-300 hover:text-sky-200 underline decoration-sky-500/50 decoration-dotted underline-offset-4 focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-sm cursor-help transition-colors"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {children || entry.term}
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-900 border border-slate-700/80 rounded-lg shadow-2xl text-left block text-xs"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <span className="font-semibold text-sky-300 block mb-1 text-sm">{entry.term}</span>
          <span className="text-slate-300 leading-relaxed block mb-2">{entry.definition}</span>
          <span className="block pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
            💡 {entry.analogy}
          </span>
          {onOpenGlossary && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onOpenGlossary(entry.slug);
              }}
              className="mt-2 text-[11px] font-medium text-sky-400 hover:text-sky-300 underline block"
            >
              View in full glossary →
            </button>
          )}
        </span>
      )}
    </span>
  );
};
