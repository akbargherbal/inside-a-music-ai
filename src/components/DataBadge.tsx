import React from 'react';
import { Info } from 'lucide-react';
import { VISUAL_LANGUAGE } from '../app/visual-language';

export type DataKind = 'illustrative' | 'real-small-model' | 'yue2-fact';

interface DataBadgeProps {
  kind: DataKind;
  customText?: string;
  className?: string;
}

export const DataBadge: React.FC<DataBadgeProps> = ({ kind, customText, className = '' }) => {
  const meta = VISUAL_LANGUAGE.badges[kind];
  const blurb = customText || meta.defaultBlurb;

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium border ${meta.bg} ${meta.border} ${meta.text} ${className}`}
      title={blurb}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse`} />
      <span className="font-semibold tracking-wide uppercase text-[10px]">{meta.label}</span>
      <span className="hidden sm:inline font-normal">· {blurb}</span>
      <Info className="w-3 h-3 ml-auto opacity-70 shrink-0 sm:hidden" />
    </div>
  );
};
