import React, { useState } from 'react';
import { motion } from 'motion/react';
import rawData from './data.json';
import { W3DataSchema, type W3Data } from './schema';
import { getSceneState } from './scene';
import { Sparkles, Grid, Eye, ShieldCheck } from 'lucide-react';

const data: W3Data = W3DataSchema.parse(rawData);

interface W3Props {
  step: number;
  stepCount: number;
  reducedMotion: boolean;
}

export const W3AttentionWidget: React.FC<W3Props> = ({ step, reducedMotion }) => {
  const [queryIndex, setQueryIndex] = useState<number>(6); // "it"
  const [causalToggle, setCausalToggle] = useState<boolean | null>(null);

  const effectiveCausal = causalToggle !== null ? causalToggle : step === 7;
  const scene = getSceneState(step, data, {
    queryIndex,
    causalMask: effectiveCausal,
  });

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 py-2">
      {/* Control / Query Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">Query Word:</span>
          <span className="font-mono font-bold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
            "{scene.tokens[scene.queryIndex]}" (index {scene.queryIndex})
          </span>
        </div>

        {step >= 6 && (
          <button
            type="button"
            onClick={() => setCausalToggle(!effectiveCausal)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              effectiveCausal
                ? 'bg-amber-950/70 border-amber-700 text-amber-300'
                : 'bg-slate-900 border-slate-750 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Causal Mask: {effectiveCausal ? 'ON (No peeking)' : 'OFF'}</span>
          </button>
        )}
      </div>

      {/* Sentence Chips Ribbon */}
      <div className="w-full flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-850">
        {scene.tokens.map((token, idx) => {
          const isQuery = idx === scene.queryIndex;
          const isWinner = idx === scene.highestWeightIndex && step >= 4 && step <= 5;
          const weight = scene.weights[idx];

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setQueryIndex(idx)}
              className={`group flex flex-col items-center px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-mono transition-all ${
                isQuery
                  ? 'bg-sky-500 text-slate-950 border-white font-bold ring-2 ring-sky-400/50'
                  : isWinner
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              <span>{token}</span>
              {step >= 4 && step <= 5 && (
                <span className="text-[10px] opacity-75 font-normal mt-0.5">
                  {Math.round((weight || 0) * 100)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Area */}
      <div className="w-full min-h-[280px] sm:min-h-[320px] flex flex-col items-center justify-center p-4 bg-slate-900/70 rounded-xl border border-slate-800 shadow-inner overflow-hidden">
        {/* Step 0 & 1: Sentence inspection */}
        {step <= 1 && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-sm text-slate-300 max-w-sm">
              In this sentence, pronoun <strong className="text-sky-300">"it"</strong> could
              grammatically point to "singer" or "guitar".
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 text-sm font-mono text-slate-200">
              The singer dropped the <span className="text-emerald-400 font-bold">guitar</span>{' '}
              because <span className="text-sky-400 font-bold underline">it</span> was heavy
            </div>
            {step === 1 && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-sky-300 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Self-attention computes connection weights across all earlier words!</span>
              </motion.div>
            )}
          </div>
        )}

        {/* Step 2: Q, K, V vectors inspection */}
        {step === 2 && (
          <div className="w-full max-w-md space-y-3 font-mono text-xs">
            <div className="text-[11px] text-slate-400 text-center">
              Each token generates 3 distinct 4-element vectors:
            </div>
            <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/60 flex items-center justify-between">
              <span className="text-sky-300 font-bold">Query (Q for "{scene.tokens[scene.queryIndex]}"):</span>
              <span className="text-sky-200">[{scene.q.join(', ')}]</span>
            </div>
            <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/60 flex items-center justify-between">
              <span className="text-purple-300 font-bold">Key (K for "guitar"):</span>
              <span className="text-purple-200">[{scene.keys[4].join(', ')}]</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-center justify-between">
              <span className="text-amber-300 font-bold">Value (V for "guitar"):</span>
              <span className="text-amber-200">[{scene.values[4].join(', ')}]</span>
            </div>
          </div>
        )}

        {/* Step 3: Raw dot product scores */}
        {step === 3 && (
          <div className="w-full max-w-md space-y-2 font-mono text-xs">
            <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
              <span>Query "{scene.tokens[scene.queryIndex]}" · Dot Product with Keys:</span>
              <span className="text-slate-500 font-normal">Score = (Q · K) / √d</span>
            </div>
            <div tabIndex={0} aria-label="Dot-product scores list" className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 focus:outline-none focus:ring-1 focus:ring-sky-400">
              {scene.tokens.map((tok, idx) => {
                const score = scene.rawScores[idx];
                const isMasked = score === -Infinity;
                const isHighest = idx === scene.highestWeightIndex;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded border ${
                      isHighest
                        ? 'bg-sky-950 border-sky-500 text-sky-200 font-bold'
                        : isMasked
                        ? 'bg-slate-950/40 border-slate-900 text-slate-600'
                        : 'bg-slate-950 border-slate-850 text-slate-300'
                    }`}
                  >
                    <span>Key [{idx}]: "{tok}"</span>
                    <span>
                      {isMasked ? 'Masked (-∞)' : `Score: ${score.toFixed(3)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4 & 5: Softmax percentages and Value blending */}
        {(step === 4 || step === 5) && (
          <div className="w-full max-w-md space-y-3 font-mono text-xs">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Softmax Attention Weights (Percentages sum to 100%):</span>
              <span className="text-emerald-400 font-semibold">
                Winner: "{scene.tokens[scene.highestWeightIndex]}"
              </span>
            </div>

            <div tabIndex={0} aria-label="Attention weight percentages list" className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1 focus:outline-none focus:ring-1 focus:ring-sky-400">
              {scene.tokens.map((tok, idx) => {
                const weight = scene.weights[idx] || 0;
                const pct = Math.round(weight * 100);
                const isHighest = idx === scene.highestWeightIndex;

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-16 truncate text-slate-300">"{tok}"</span>
                    <div className="flex-1 h-3.5 bg-slate-950 rounded-sm overflow-hidden p-0.5 border border-slate-800">
                      <motion.div
                        initial={reducedMotion ? false : { width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className={`h-full rounded-xs ${
                          isHighest ? 'bg-emerald-400' : 'bg-sky-500/70'
                        }`}
                      />
                    </div>
                    <span className="w-10 text-right text-slate-300 font-semibold">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>

            {step === 5 && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-600/70 mt-3"
              >
                <div className="text-emerald-300 font-semibold text-[11px] mb-1">
                  Blended Value Output Vector for "{scene.tokens[scene.queryIndex]}":
                </div>
                <div className="text-emerald-200 text-xs">
                  [{scene.blendedOutput.map(v => v.toFixed(3)).join(', ')}]
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-sans">
                  "It" now carries the rich musical context of "guitar" into the next layer!
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Step 6 & 7: 9x9 Attention Heatmap */}
        {step >= 6 && (
          <div className="w-full max-w-sm flex flex-col items-center gap-2">
            <div className="flex items-center justify-between w-full text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Grid className="w-3.5 h-3.5 text-sky-400" />
                9×9 Full Attention Heatmap
              </span>
              <span>Rows = Query · Cols = Key</span>
            </div>

            {/* Grid */}
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <div className="grid grid-cols-9 gap-1">
                {scene.heatmap.map((row, rIdx) =>
                  row.map((val, cIdx) => {
                    const isMasked = effectiveCausal && cIdx > rIdx;
                    const isSelectedRow = rIdx === scene.queryIndex;
                    const opacity = isMasked ? 0.05 : Math.max(0.1, val);

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        title={`Query: "${scene.tokens[rIdx]}" → Key: "${
                          scene.tokens[cIdx]
                        }" = ${isMasked ? 'Masked' : (val * 100).toFixed(1) + '%'}`}
                        onClick={() => setQueryIndex(rIdx)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xs flex items-center justify-center cursor-pointer transition-all ${
                          isSelectedRow ? 'ring-1 ring-sky-400' : ''
                        }`}
                        style={{
                          backgroundColor: isMasked
                            ? 'rgba(30, 41, 59, 0.4)'
                            : isSelectedRow
                            ? `rgba(56, 189, 248, ${opacity})`
                            : `rgba(147, 51, 234, ${opacity})`,
                        }}
                      >
                        <span className="text-[8px] font-mono text-slate-300">
                          {isMasked ? '✕' : Math.round(val * 100)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono text-center">
              Click any cell row to inspect that word's attention query
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
