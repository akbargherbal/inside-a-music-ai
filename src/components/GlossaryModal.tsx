import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, BookOpen, ExternalLink } from 'lucide-react';
import { GLOSSARY, type GlossaryEntry } from '../content/glossary';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlug?: string;
  onJumpToSection?: (sectionId: string) => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  initialSlug,
  onJumpToSection,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const categories = [
    { id: 'all', label: 'All Terms' },
    { id: 'core', label: 'Core / Data' },
    { id: 'attention', label: 'Attention' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'sampling', label: 'Sampling' },
    { id: 'audio', label: 'Audio & Music' },
  ];

  const filteredEntries = useMemo(() => {
    return GLOSSARY.filter(entry => {
      const matchesSearch =
        entry.term.toLowerCase().includes(search.toLowerCase()) ||
        entry.definition.toLowerCase().includes(search.toLowerCase()) ||
        entry.analogy.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || entry.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Glossary of terms"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Glossary of Generative AI Terms
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close glossary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category filter */}
        <div className="p-4 sm:px-6 bg-slate-950/40 border-b border-slate-800 flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search terms, definitions, analogies..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="p-6 overflow-y-auto space-y-4 divide-y divide-slate-800/80">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No matching terms found. Try a different search query.
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div
                key={entry.slug}
                id={`glossary-${entry.slug}`}
                className={`pt-4 first:pt-0 ${
                  initialSlug === entry.slug ? 'p-3 bg-sky-950/30 rounded-xl border border-sky-800' : ''
                }`}
              >
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h4 className="text-base font-semibold text-sky-300">{entry.term}</h4>
                  {onJumpToSection && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onJumpToSection(entry.firstSeenSection);
                      }}
                      className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                    >
                      <span>First seen: {entry.firstSeenSection}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-2">
                  {entry.definition}
                </p>
                <div className="text-xs text-amber-300/90 bg-amber-950/20 border border-amber-900/30 rounded-lg p-2.5 flex items-start gap-2">
                  <span className="shrink-0 font-medium">💡 Intuition:</span>
                  <span>{entry.analogy}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
