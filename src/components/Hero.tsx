import React from 'react';
import { ArrowRight, Music } from 'lucide-react';
import { DataBadge } from './DataBadge';

interface HeroProps {
  onStartJourney: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartJourney }) => {
  const pipelineStages = [
    { title: '1. Your Words', desc: 'Lyrics & Style Prompt', color: 'border-sky-500/70 text-sky-300' },
    { title: '2. Symbolic Plan', desc: 'Melody & Chords (ABC)', color: 'border-amber-500/70 text-amber-300' },
    { title: '3. Rough Draft', desc: 'Semantic Tokens (AR)', color: 'border-purple-500/70 text-purple-300' },
    { title: '4. Detailed Sound', desc: 'Acoustic Latents (NAR)', color: 'border-emerald-500/70 text-emerald-300' },
    { title: '5. Audio Output', desc: '48 kHz Stereo Waveform', color: 'border-cyan-500/70 text-cyan-300' },
  ];

  return (
    <section id="hero" className="w-full pt-12 pb-16 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
      {/* License & Non-Commercial Notice */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full shadow-sm">
        <span className="text-emerald-400 font-semibold">● Open Source AI</span>
        <span>·</span>
        <span>Built around <strong>YuE2-3B</strong> by M-A-P</span>
        <span>·</span>
        <span className="text-amber-300 font-medium">CC BY-NC 4.0 (Non-Commercial)</span>
      </div>

      {/* Main Title & Promise */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl text-balance leading-tight">
        How can a machine write a <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">song?</span>
      </h1>

      <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl text-balance leading-relaxed">
        By the end of this page you'll know how modern generative music AI works — and you only need high-school intuition and basic Python.
      </p>

      {/* Pipeline Strip */}
      <div className="w-full mt-10 p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col items-center">
        <div className="w-full flex items-center justify-between gap-2 mb-4 px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Music className="w-4 h-4 text-sky-400" />
            <span>YuE2 Generative Audio Pipeline Architecture</span>
          </div>
          <DataBadge kind="yue2-fact" customText="Verified YuE2-3B 4-stage pipeline" />
        </div>

        {/* 5-step horizontal pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 w-full">
          {pipelineStages.map((stage, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl bg-slate-950/80 border ${stage.color} flex flex-col items-center justify-center text-center relative group`}
            >
              <span className="text-xs font-mono font-bold">{stage.title}</span>
              <span className="text-[11px] text-slate-400 mt-1">{stage.desc}</span>
              {idx < pipelineStages.length - 1 && (
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Visual Vocabulary & Badges Legend */}
      <div className="mt-8 w-full max-w-3xl p-4 rounded-xl bg-slate-950/60 border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wide">
            Honest Data Badges:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950 border border-amber-700 text-amber-300">
              Illustrative
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-950 border border-sky-700 text-sky-300">
              Real Stand-in
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950 border border-emerald-700 text-emerald-300">
              Fact about YuE2
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartJourney}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 transition-all shadow-md shadow-sky-500/20"
        >
          <span>Begin Explainer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 text-[11px] text-slate-500">
        Independent educational interactive explainer. No remote AI calls required at runtime.
      </div>
    </section>
  );
};
