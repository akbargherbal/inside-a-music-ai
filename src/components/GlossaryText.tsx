import React from 'react';
import { GLOSSARY } from '../content/glossary';
import { Term } from './Term';

interface GlossaryTextProps {
  text: string;
  /** Glossary slugs that this piece of text introduces (usually step.newTerms). */
  terms?: string[];
  onOpenGlossary: (slug?: string) => void;
}

/**
 * Renders a caption/hook and wraps the first-in-context use of every glossary
 * term it introduces in a <Term> popover (Golden Rule G1: no unexplained jargon).
 */
export const GlossaryText: React.FC<GlossaryTextProps> = ({
  text,
  terms,
  onOpenGlossary,
}) => {
  const entries = (terms ?? [])
    .map(slug => GLOSSARY.find(g => g.slug === slug))
    .filter((e): e is (typeof GLOSSARY)[number] => Boolean(e))
    .filter(e => e.term.trim().length > 0)
    .sort((a, b) => b.term.length - a.term.length);

  if (entries.length === 0) return <>{text}</>;

  const escaped = entries.map(e => e.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        const entry = entries.find(e => e.term.toLowerCase() === part.toLowerCase());
        if (entry) {
          return (
            <Term key={i} name={entry.slug} onOpenGlossary={onOpenGlossary}>
              {part}
            </Term>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};
