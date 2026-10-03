import React from 'react';
import { Lightbulb, AlertTriangle } from 'lucide-react';

interface AnalogyBoxProps {
  title: string;
  body: string;
  breaksDown: string;
}

export const AnalogyBox: React.FC<AnalogyBoxProps> = ({ title, body, breaksDown }) => {
  return (
    <div className="my-6 rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
        {/* Left: The Intuitive Analogy */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-sm">
            <Lightbulb className="w-4 h-4 shrink-0" />
            <span>The Intuition: {title}</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{body}</p>
        </div>

        {/* Right: Where the Analogy Breaks */}
        <div className="p-4 sm:p-5 bg-rose-950/10">
          <div className="flex items-center gap-2 mb-2 text-rose-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Where the Analogy Breaks</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">{breaksDown}</p>
        </div>
      </div>
    </div>
  );
};
