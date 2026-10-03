import React, { useState } from 'react';
import { motion } from 'motion/react';
import rawData from './data.json';
import { W6DataSchema, type W6Data } from './schema';
import { getSceneState } from './scene';
import { Dices, Sliders, Sparkles, RefreshCw } from 'lucide-react';

const data: W6Data = W6DataSchema.parse(rawData);

interface W6Props {
  step: number;
  stepCount: number;
  reducedMotion: boolean;
}

export const W6SamplingWidget: React.FC<W6Props> = ({ step, reducedMotion }) => {
  const [temperature, setTemperature] = useState<number>(0.8);
  const [topK, setTopK] = useState<number>(8);
  const [topP, setTopP] = useState<number>(1.0);
  const [seed, setSeed] = useState<number>(7);
  const [cfgScale, setCfgScale] = useState<number>(2.5);
  const [rollCount, setRollCount] = useState<number>(0);

  const scene = getSceneState(step, data, {
    temperature: step === 2 ? temperature : undefined,
    topK: step === 3 ? topK : undefined,
    topP: step === 4 ? topP : undefined,
    seed: seed + rollCount,
    cfgScale,
  });

  const handleRollDice = () => {
    setRollCount(prev => prev + 1);
  };

  const handleResetSeed = () => {
    setRollCount(0);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 py-2">
      {/* Context Phrase with Winner Chip */}
      <div className="w-full p-3 bg-slate-950 rounded-xl border border-sky-500/40 text-center font-mono text-sm sm:text-base text-slate-200 flex items-center justify-center gap-2 flex-wrap">
        <span>Sunlight on the kitchen</span>
        {step >= 5 && scene.winner ? (
          <motion.span
            key={`${scene.winner.token}-${scene.seed}`}
            initial={reducedMotion ? false : { scale: 0.8, y: -5 }}
            animate={{ scale: 1, y: 0 }}
            className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30"
          >
            "{scene.winner.token}"
          </motion.span>
        ) : (
          <span className="w-16 h-6 border-b-2 border-dashed border-sky-400 inline-block align-middle" />
        )}
      </div>

      {/* Interactive Controls Deck */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
        {step === 2 && (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                Temperature:
              </span>
              <span className="text-sky-300 font-bold">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              aria-label="Temperature"
              min="0.1"
              max="2.0"
              step="0.05"
              value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.1 (Conservative / Sharp)</span>
              <span>2.0 (Creative / Flat)</span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <div className="flex justify-between text-slate-300 font-mono">
              <span>Top-K Cutoff:</span>
              <span className="text-sky-300 font-bold">K = {topK}</span>
            </div>
            <input
              type="range"
              aria-label="Top-K cutoff"
              min="1"
              max="8"
              step="1"
              value={topK}
              onChange={e => setTopK(parseInt(e.target.value, 10))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">
              Keeps only the top {topK} most probable candidate words.
            </span>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <div className="flex justify-between text-slate-300 font-mono">
              <span>Top-P (Nucleus Threshold):</span>
              <span className="text-sky-300 font-bold">P = {(topP * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              aria-label="Top-P nucleus threshold"
              min="0.2"
              max="1.0"
              step="0.05"
              value={topP}
              onChange={e => setTopP(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">
              Keeps smallest subset summing to at least {(topP * 100).toFixed(0)}% mass.
            </span>
          </div>
        )}

        {step >= 5 && (
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400">Seed:</span>
              <input
                type="number"
                aria-label="Random seed"
                value={seed}
                onChange={e => setSeed(parseInt(e.target.value, 10) || 0)}
                className="w-20 px-2 py-1 bg-slate-900 border border-slate-750 rounded text-slate-200 text-xs focus:ring-1 focus:ring-sky-400"
              />
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                (Fixed seed = identical roll)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRollDice}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
              >
                <Dices className="w-4 h-4" />
                <span>Roll Next!</span>
              </button>
              {rollCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetSeed}
                  title="Reset to initial seed roll"
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col gap-1 sm:col-span-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Classifier-Free Guidance (cfg_scale):
              </span>
              <span className="text-emerald-400 font-bold">{cfgScale.toFixed(1)}</span>
            </div>
            <input
              type="range"
              aria-label="Classifier-free guidance scale"
              min="1.0"
              max="5.0"
              step="0.2"
              value={cfgScale}
              onChange={e => setCfgScale(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400">
              Nudges generation harder toward the prompt instructions.
            </span>
          </div>
        )}
      </div>

      {/* Main Candidate Bars Grid */}
      <div className="w-full min-h-[220px] p-3 sm:p-4 bg-slate-900/60 rounded-xl border border-slate-800 shadow-inner flex flex-col justify-center gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1 border-b border-slate-850">
          <span>Candidate Word</span>
          <span>{step === 0 ? 'Raw Logit' : 'Probability (%)'}</span>
        </div>

        {scene.candidates.map(c => {
          const isWinner = c.selected;
          const isFiltered = c.filteredOut;
          const pct = Math.round(c.prob * 100);

          return (
            <div
              key={c.id}
              className={`flex items-center gap-2 text-xs font-mono transition-opacity ${
                isFiltered ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <span
                className={`w-20 truncate ${
                  isWinner ? 'text-emerald-300 font-bold' : 'text-slate-300'
                }`}
              >
                "{c.token}"
              </span>

              {/* Bar */}
              <div className="flex-1 h-3.5 bg-slate-950 rounded-xs overflow-hidden border border-slate-850 relative">
                <motion.div
                  initial={false}
                  animate={{
                    width: step === 0 ? `${Math.max(0, (c.logit + 3) / 7) * 100}%` : `${pct}%`,
                  }}
                  transition={{ duration: reducedMotion ? 0 : 0.3 }}
                  className={`h-full ${
                    isWinner
                      ? 'bg-emerald-400'
                      : isFiltered
                      ? 'bg-slate-700'
                      : 'bg-sky-400/80'
                  }`}
                />
              </div>

              {/* Numerical Readout */}
              <span
                className={`w-12 text-right font-mono text-[11px] ${
                  isWinner ? 'text-emerald-400 font-bold' : 'text-slate-400'
                }`}
              >
                {step === 0
                  ? c.logit.toFixed(1)
                  : isFiltered
                  ? 'cut'
                  : `${pct}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
