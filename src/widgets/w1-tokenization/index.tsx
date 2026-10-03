import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import rawData from './data.json';
import { W1DataSchema, type W1Data } from './schema';
import { getSceneState } from './scene';
import { Music, Mic, FileText, ArrowRight } from 'lucide-react';

const data: W1Data = W1DataSchema.parse(rawData);

interface W1Props {
  step: number;
  stepCount: number;
  reducedMotion: boolean;
}

export const W1TokenizationWidget: React.FC<W1Props> = ({ step, reducedMotion }) => {
  const [customText, setCustomText] = useState<string>('');
  const scene = getSceneState(step, data, { customText: customText || undefined });

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 py-2">
      {/* Mode Indicator & Optional Interactive Input */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          {scene.mode === 'text' && <FileText className="w-4 h-4 text-sky-400" />}
          {scene.mode === 'music' && <Music className="w-4 h-4 text-amber-400" />}
          {scene.mode === 'audio' && <Mic className="w-4 h-4 text-emerald-400" />}
          <span className="capitalize">{scene.mode} Tokenization Mode</span>
        </div>

        {step >= 1 && step <= 3 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Try your own text:</span>
            <input
              type="text"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="e.g. Sunlight on the guitar"
              className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-750 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 max-w-[200px]"
            />
            {customText && (
              <button
                type="button"
                onClick={() => setCustomText('')}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Visual Display Area */}
      <div className="w-full min-h-[160px] flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-xl border border-slate-800/80 shadow-inner">
        {step === 0 && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg sm:text-2xl font-medium text-slate-100 font-mono tracking-tight text-center"
          >
            "{scene.displayText}"
          </motion.div>
        )}

        {step > 0 && !scene.showNumbersOnly && scene.mode !== 'audio' && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <AnimatePresence mode="popLayout">
              {scene.tokens.map((token, idx) => (
                <motion.div
                  key={`${token.text}-${idx}`}
                  layout={!reducedMotion}
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: reducedMotion ? 0 : 0.3 }}
                  className={`flex flex-col items-center p-2.5 sm:px-3 sm:py-2 rounded-xl border transition-all ${
                    scene.mode === 'music'
                      ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                      : 'bg-sky-950/40 border-sky-700/60 text-sky-200 shadow-sm'
                  }`}
                >
                  <span className="font-mono text-sm sm:text-base font-semibold">
                    {token.text}
                  </span>
                  {scene.showIds && (
                    <span className="mt-1 font-mono text-[10px] text-slate-400 bg-slate-950/70 px-1.5 py-0.5 rounded border border-slate-800">
                      ID: {token.id}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Step 3: Collapsed integers list */}
        {scene.showNumbersOnly && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-slate-950 rounded-xl border border-sky-500/40 font-mono text-sky-300 text-sm sm:text-lg">
              <span>[</span>
              {scene.tokens.map((t, idx) => (
                <span key={idx} className="font-semibold text-emerald-400">
                  {t.id}
                  {idx < scene.tokens.length - 1 ? ',' : ''}
                </span>
              ))}
              <span>]</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              The model's actual raw input: a pure list of integers!
            </span>
          </motion.div>
        )}

        {/* Step 5: Sound slices */}
        {scene.mode === 'audio' && (
          <div className="w-full flex flex-col items-center gap-4">
            {/* Simulated audio waveform */}
            <div className="w-full max-w-md h-16 flex items-center justify-between gap-1 px-4 bg-slate-950 rounded-xl border border-emerald-900/60 overflow-hidden">
              {Array.from({ length: 28 }).map((_, i) => {
                const height = Math.sin(i * 0.5) * 20 + 24;
                return (
                  <motion.div
                    key={i}
                    animate={
                      reducedMotion
                        ? {}
                        : { height: [height * 0.5, height, height * 0.7] }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      delay: i * 0.04,
                      ease: 'easeInOut',
                    }}
                    className="w-1.5 bg-emerald-400 rounded-full"
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Waveform sliced into frames</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Matched to nearest sound catalogue entry</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg">
              {scene.audioFrames?.map(frame => (
                <div
                  key={frame.id}
                  className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-center flex flex-col gap-1"
                >
                  <span className="text-[11px] font-medium text-emerald-300 truncate">
                    {frame.shapeName}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-slate-950 py-0.5 rounded border border-slate-800">
                    Token #{frame.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vocabulary Reference Table Snippet */}
      {step >= 1 && step <= 4 && (
        <div className="w-full max-w-md bg-slate-950/60 rounded-xl border border-slate-850 p-3 text-xs">
          <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] mb-2 pb-1.5 border-b border-slate-850">
            <span>Vocabulary Lookup Table (dict[str, int])</span>
            <span>{Object.keys(data.vocab).length} total tokens</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[11px]">
            {Object.entries(data.vocab)
              .slice(0, 9)
              .map(([piece, id]) => {
                const isActive = scene.tokens.some(t => t.id === id);
                return (
                  <div
                    key={id}
                    className={`flex items-center justify-between px-2 py-1 rounded transition-colors ${
                      isActive
                        ? 'bg-sky-950 border border-sky-600/60 text-sky-200 font-bold'
                        : 'bg-slate-900/40 text-slate-400 border border-slate-850'
                    }`}
                  >
                    <span className="truncate mr-1">"{piece}"</span>
                    <span className="text-slate-400 font-normal">→ {id}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
