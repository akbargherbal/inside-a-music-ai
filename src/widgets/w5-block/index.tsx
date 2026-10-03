import React, { useState } from 'react';
import { motion } from 'motion/react';
import rawData from './data.json';
import { W5DataSchema, type W5Data, type Station } from './schema';
import { getSceneState } from './scene';
import { Factory, CornerDownRight, X, Info } from 'lucide-react';

const data: W5Data = W5DataSchema.parse(rawData);

interface W5Props {
  step: number;
  stepCount: number;
  reducedMotion: boolean;
}

export const W5BlockWidget: React.FC<W5Props> = ({ step, reducedMotion }) => {
  const [showShapes, setShowShapes] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const scene = getSceneState(step, data, {
    showShapes,
    selectedStationId: selectedStation?.id,
  });

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 py-2">
      {/* Top Controls */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center gap-1.5">
          <Factory className="w-4 h-4 text-sky-400" />
          <span>Assembly Line Conveyor</span>
        </div>
        <button
          type="button"
          onClick={() => setShowShapes(!showShapes)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            showShapes
              ? 'bg-sky-950/80 border-sky-600 text-sky-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {showShapes ? 'Hide Tensor Shapes' : 'Show Shapes (Dimensions)'}
        </button>
      </div>

      {/* Main Assembly Line Canvas */}
      <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800 shadow-inner relative overflow-hidden">
        {/* Step 6: Stacked Layers View */}
        {scene.isStackView ? (
          <div className="w-full max-w-sm flex flex-col items-center gap-2">
            <div className="text-xs font-mono text-slate-300 font-semibold mb-1">
              Stack of 24 to 32 Transformer Blocks
            </div>
            <div className="w-full space-y-1.5">
              {[
                { layer: 'Layer 32 (Output Stage)', desc: 'High-level song theme & cadence' },
                { layer: 'Layer 16 (Middle Stage)', desc: 'Chord progressions & melody arcs' },
                { layer: 'Layer 8 (Early Stage)', desc: 'Rhyme schemes & phrase meter' },
                { layer: 'Layer 1 (Bottom Stage)', desc: 'Local token grammar & syllables' },
              ].map((lvl, idx) => (
                <motion.div
                  key={idx}
                  initial={reducedMotion ? false : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="p-2.5 rounded-lg bg-slate-950 border border-sky-800/60 flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-sky-300 font-bold">{lvl.layer}</span>
                  <span className="text-slate-400 text-[11px] font-sans">{lvl.desc}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Each layer builds on the representations refined by all earlier layers.
            </p>
          </div>
        ) : scene.isOutputView ? (
          /* Step 7: Logits Projection View */
          <div className="w-full max-w-md flex flex-col items-center gap-3">
            <div className="text-xs font-mono text-slate-300 text-center font-semibold">
              Final Layer: Vocabulary Projection Matrix
            </div>
            <div className="w-full p-4 rounded-xl bg-slate-950 border border-emerald-500/70 text-center font-mono">
              <span className="text-[11px] text-slate-400 block mb-1">
                Vector for final token [8 numbers] × Master Vocab Matrix
              </span>
              <span className="text-sm sm:text-base font-bold text-emerald-400 block my-1">
                = Unnormalized Logits for all 32,000+ Tokens!
              </span>
              <span className="text-xs text-slate-400 block mt-2 font-sans">
                Next: Section 6 turns these raw scores into probabilities for the dice roll.
              </span>
            </div>
          </div>
        ) : (
          /* Steps 0 to 5: Interactive Conveyor Belt */
          <div className="w-full max-w-lg flex flex-col items-center gap-4">
            {/* Belt track */}
            <div className="w-full relative py-6">
              {/* Conveyor Line */}
              <div className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden">
                <motion.div
                  className="h-full bg-sky-400"
                  initial={false}
                  animate={{ width: `${scene.progressPct}%` }}
                  transition={{ duration: reducedMotion ? 0 : 0.4 }}
                />
              </div>

              {/* Residual Shortcut visual overlay if active */}
              {scene.hasResidualActive && (
                <div className="absolute top-0 left-1/4 right-1/4 flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded-full border border-emerald-500/50">
                    <CornerDownRight className="w-3 h-3 text-emerald-400" />
                    <span>Residual Bypass: x = x + F(x)</span>
                  </div>
                </div>
              )}

              {/* Station Markers along the belt */}
              <div className="flex justify-between items-center w-full mt-3">
                {data.stations.slice(0, 6).map((st, idx) => {
                  const isActive = idx === scene.step;
                  const isPassed = idx < scene.step;

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStation(st)}
                      className={`flex flex-col items-center gap-1 group transition-all ${
                        isActive ? 'scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={`Click to inspect ${st.name}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] border transition-colors ${
                          isActive
                            ? 'bg-sky-400 text-slate-950 border-white font-bold ring-2 ring-sky-400/50'
                            : isPassed
                            ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 max-w-[50px] truncate text-center hidden sm:block">
                        {st.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Station Card */}
            <div className="w-full p-4 rounded-xl bg-slate-950 border border-sky-500/40 shadow-lg flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400">
                    Station {scene.step + 1}:
                  </span>
                  <span className="text-sm font-semibold text-slate-100">
                    {scene.activeStation.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStation(scene.activeStation)}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <Info className="w-3 h-3" />
                  <span>Inspect</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {scene.activeStation.details}
              </p>

              {showShapes && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Input: <strong className="text-sky-300">{scene.activeStation.inputShape}</strong></span>
                  <span>→</span>
                  <span>Output: <strong className="text-emerald-300">{scene.activeStation.outputShape}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Station Modal Popover */}
      {selectedStation && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setSelectedStation(null)}
        >
          <div
            className="w-full max-w-md p-5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col gap-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-sky-300 font-mono">
                Station: {selectedStation.name}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedStation(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedStation.details}
            </p>

            <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300/90">
              <strong>🏭 Assembly Analogy:</strong> {selectedStation.analogyStation}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 block">Input Shape:</span>
                <span className="text-sky-300 font-semibold">{selectedStation.inputShape}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Output Shape:</span>
                <span className="text-emerald-300 font-semibold">{selectedStation.outputShape}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
