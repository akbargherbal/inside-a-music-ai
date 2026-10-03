import React, { useState } from 'react';
import { motion } from 'motion/react';
import rawData from './data.json';
import { W4DataSchema, type W4Data } from './schema';
import { getSceneState } from './scene';
import { Layers, Combine } from 'lucide-react';

const data: W4Data = W4DataSchema.parse(rawData);

interface W4Props {
  step: number;
  stepCount: number;
  reducedMotion: boolean;
}

export const W4MultiHeadWidget: React.FC<W4Props> = ({ step, reducedMotion }) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(6); // "it"

  const scene = getSceneState(step, data, {
    hoveredRow,
  });

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 py-2">
      {/* Top Status */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>
            {step === 0
              ? 'Single Viewpoint (1 Head)'
              : 'Multi-Head Parallel Attention (4 Heads)'}
          </span>
        </div>
        <div className="font-mono text-slate-300">
          Inspecting row: <span className="text-sky-300 font-bold">"{scene.tokens[scene.activeQueryIndex]}"</span>
        </div>
      </div>

      {/* Main Visual Display */}
      <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-900/60 rounded-xl border border-slate-800 shadow-inner">
        {/* Step 0: Single Heatmap view */}
        {step === 0 && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              One Head = Single set of Query & Key projections
            </span>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <div className="grid grid-cols-9 gap-1">
                {scene.weights[1].map((row, rIdx) =>
                  row.map((val, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className="w-5 h-5 rounded-xs"
                      style={{
                        backgroundColor: `rgba(168, 85, 247, ${Math.max(0.1, val)})`,
                      }}
                      title={`${(val * 100).toFixed(0)}%`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 1 to 4: 4 Heatmaps Grid */}
        {step >= 1 && step <= 4 && (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full max-w-lg">
              {scene.headLabels.map(head => {
                const headMatrix = scene.weights[head.id];
                return (
                  <div
                    key={head.id}
                    className="p-2 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col items-center shadow-md"
                  >
                    <div className="w-full flex items-center justify-between mb-1.5 px-1">
                      <span
                        className="text-[10px] font-mono font-semibold truncate"
                        style={{ color: `var(--w4-head-${head.id}, ${head.color})` }}
                      >
                        {head.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-9 gap-0.5">
                      {headMatrix.map((row, rIdx) => {
                        const isHovered = rIdx === scene.activeQueryIndex;
                        return row.map((val, cIdx) => (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            onMouseEnter={() => setHoveredRow(rIdx)}
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs transition-all cursor-pointer ${
                              isHovered ? 'ring-1 ring-white/80' : ''
                            }`}
                            style={{
                              backgroundColor: `${head.color}${Math.round(
                                Math.max(0.15, val) * 255
                              )
                                .toString(16)
                                .padStart(2, '0')}`,
                            }}
                            title={`Head ${head.id + 1} | Query: "${scene.tokens[rIdx]}" → Key: "${
                              scene.tokens[cIdx]
                            }" (${(val * 100).toFixed(0)}%)`}
                          />
                        ));
                      })}
                    </div>

                    {step === 3 && (
                      <p className="text-[10px] text-slate-400 mt-2 text-center line-clamp-2 leading-tight">
                        {head.blurb}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-400 font-mono text-center">
              Hover any row to see how all 4 heads interpret the same word simultaneously
            </div>
          </div>
        )}

        {/* Step 5: Vector Concatenation */}
        {step === 5 && (
          <div className="w-full max-w-md flex flex-col items-center gap-4">
            <div className="text-xs font-mono text-slate-300 text-center flex items-center gap-1.5">
              <Combine className="w-4 h-4 text-emerald-400" />
              <span>Merging 4 Specialized Head Views into 1 Unified Representation</span>
            </div>

            {/* Visual Head Pieces */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {scene.mergedVector.map(h => (
                <div
                  key={h.headId}
                  className="p-2.5 rounded-lg border bg-slate-950 flex flex-col items-center"
                  style={{ borderColor: h.color }}
                >
                  <span
                    className="text-[10px] font-mono font-bold mb-1"
                    style={{ color: `var(--w4-head-${h.headId}, ${h.color})` }}
                  >
                    Head {h.headId + 1}
                  </span>
                  <div className="text-xs font-mono text-slate-300">
                    [{h.values.join(', ')}]
                  </div>
                </div>
              ))}
            </div>

            {/* Combined Concatenated Vector Bar */}
            <motion.div
              initial={reducedMotion ? false : { scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full p-3 bg-slate-950 rounded-xl border border-emerald-500/70 shadow-lg text-center"
            >
              <div className="text-[11px] font-semibold text-emerald-400 mb-1 font-mono uppercase tracking-wider">
                Concatenated Vector: [Head 1 + Head 2 + Head 3 + Head 4]
              </div>
              <div className="font-mono text-xs sm:text-sm text-slate-200 font-semibold tracking-wide">
                [{scene.mergedVector.flatMap(h => h.values).join(', ')}]
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 font-sans">
                8 dimensions capturing grammar, pronouns, sentence anchor, and verb relations in one shot!
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Row selector chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-mono">
        <span className="text-slate-500 text-[11px]">Hover/Select word:</span>
        {scene.tokens.map((tok, idx) => (
          <button
            key={idx}
            type="button"
            onMouseEnter={() => setHoveredRow(idx)}
            onClick={() => setHoveredRow(idx)}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              idx === scene.activeQueryIndex
                ? 'bg-sky-500 text-slate-950 font-bold border-white'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {tok}
          </button>
        ))}
      </div>
    </div>
  );
};
