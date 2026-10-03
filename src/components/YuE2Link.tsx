import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { DataBadge } from './DataBadge';
import { YUE2_FACTS } from '../content/facts';

interface YuE2LinkProps {
  title?: string;
  text: string;
  factIds: string[];
}

export const YuE2Link: React.FC<YuE2LinkProps> = ({
  title = 'How This Works Inside YuE2-3B',
  text,
  factIds,
}) => {
  const facts = factIds.map(id => YUE2_FACTS[id]).filter(Boolean);

  return (
    <div className="my-8 p-5 rounded-xl border border-emerald-900/60 bg-emerald-950/20 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{title}</span>
        </div>
        <DataBadge kind="yue2-fact" />
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mb-4">{text}</p>

      {facts.length > 0 && (
        <div className="pt-3 border-t border-emerald-900/40 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/80">
            Verified Facts & Sources:
          </div>
          <ul className="space-y-1.5 text-xs text-slate-400">
            {facts.map(fact => (
              <li key={fact.id} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <div className="flex-1">
                  <span>{fact.claim}</span>{' '}
                  <a
                    href={fact.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-emerald-400 hover:text-emerald-300 underline font-medium ml-1"
                  >
                    <span>{fact.source}</span>
                    <ExternalLink className="w-2.5 h-2.5 inline" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
