import React, { useState } from 'react';
import { motion } from 'motion/react';
import rawData from './data.json';
import { W2DataSchema, type W2Data } from './schema';
import { getSceneState } from './scene';
import { Compass, RotateCcw } from 'lucide-react';

const data: W2Data = W2DataSchema.parse(rawData);

interface W2Props {
  step: number;
  stepCount: number;
  reducedMotion: boolean;
}

export const W2EmbeddingsWidget: React.FC<W2Props> = ({ step, reducedMotion }) => {
  const [selectedTokenId, setSelectedTokenId] = useState<number>(204);
  const [draggedCoords, setDraggedCoords] = useState<Record<number, [number, number]>>({});

  const scene = getSceneState(step, data, {
    selectedTokenId,
    draggedCoords,
  });

  const handleResetPositions = () => {
    setDraggedCoords({});
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 py-2">
      {/* Top status bar */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-sky-400" />
          <span>
            {step < 4
              ? 'Token Coordinate Representation'
              : '2D Semantic Concept Map (Interactive)'}
          </span>
        </div>
        {step >= 4 && Object.keys(draggedCoords).length > 0 && (
          <button
            type="button"
            onClick={handleResetPositions}
            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Map</span>
          </button>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="w-full min-h-[300px] flex items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 shadow-inner relative overflow-hidden">
        {/* Step 0: Single chip */}
        {scene.displayMode === 'chip' && (
          <motion.div
            initial={reducedMotion ? false : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-3 p-6 bg-slate-950 rounded-2xl border border-sky-500/50 shadow-xl"
          >
            <span className="font-mono text-2xl font-bold text-sky-300">
              "{scene.selectedItem.token}"
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              Vocabulary ID: {scene.selectedItem.id}
            </span>
            <p className="text-xs text-slate-400 max-w-[240px] text-center mt-2">
              Just an ID number — the computer doesn't know what this means yet.
            </p>
          </motion.div>
        )}

        {/* Step 1: Embedding table lookup */}
        {scene.displayMode === 'table-lookup' && (
          <div className="w-full max-w-md bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs">
            <div className="text-[11px] text-slate-500 mb-2 uppercase tracking-wider">
              Lookup Table: embedding_table[ID]
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/40 text-slate-500 border border-slate-850">
                <span>Row 202 ("singer")</span>
                <span>[0.42, 0.71, ...]</span>
              </div>
              <motion.div
                initial={reducedMotion ? false : { x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-sky-950/80 border border-sky-500 text-sky-200 font-semibold shadow-md"
              >
                <span>Row 204 ("{scene.selectedItem.token}") ★</span>
                <span>[{scene.selectedItem.vector.slice(0, 4).join(', ')}...]</span>
              </motion.div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900/40 text-slate-500 border border-slate-850">
                <span>Row 206 ("it")</span>
                <span>[0.10, -0.35, ...]</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vector bars (8 dimensions) */}
        {scene.displayMode === 'vector-bars' && (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-sky-300">
                "{scene.selectedItem.token}"
              </span>
              <span className="text-xs text-slate-400 font-mono">
                → 8-Dimensional Vector
              </span>
            </div>

            <div className="flex items-end justify-center gap-2.5 h-36 w-full p-4 bg-slate-950 rounded-xl border border-slate-800">
              {scene.selectedItem.vector.map((val, idx) => {
                const height = Math.abs(val) * 70;
                const isPos = val >= 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-[10px] font-mono text-slate-400 mb-1">
                      {val > 0 ? `+${val}` : val}
                    </span>
                    <motion.div
                      initial={reducedMotion ? false : { height: 0 }}
                      animate={{ height: `${height}px` }}
                      transition={{ duration: reducedMotion ? 0 : 0.4, delay: idx * 0.05 }}
                      className={`w-full rounded-t ${
                        isPos
                          ? 'bg-sky-400 shadow-sm shadow-sky-500/30'
                          : 'bg-rose-400 shadow-sm shadow-rose-500/30'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-slate-500 mt-1">
                      d{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Multi-token bar rows */}
        {scene.displayMode === 'multi-bars' && (
          <div className="w-full max-w-md space-y-2 text-xs font-mono">
            {scene.items.slice(0, 5).map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedTokenId(item.id)}
                className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                  item.id === scene.selectedItem.id
                    ? 'bg-sky-950/70 border-sky-500 text-sky-200 font-bold'
                    : 'bg-slate-950/60 border-slate-850 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span className="w-16 truncate font-semibold">"{item.token}"</span>
                <div className="flex items-center gap-1 flex-1 px-3">
                  {item.vector.map((val, i) => (
                    <div
                      key={i}
                      className="h-3 flex-1 rounded-xs"
                      style={{
                        backgroundColor:
                          val >= 0
                            ? `rgba(56, 189, 248, ${Math.min(1, Math.abs(val) + 0.2)})`
                            : `rgba(244, 63, 94, ${Math.min(1, Math.abs(val) + 0.2)})`,
                      }}
                      title={`Dim ${i + 1}: ${val}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500">#{item.id}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step 4 & 5: 2D Interactive Scatter Map */}
        {scene.displayMode === 'map-2d' && (
          <div className="relative w-full h-[320px] bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Grid coordinate lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-full h-px bg-slate-500" />
              <div className="h-full w-px bg-slate-500 absolute" />
            </div>

            {/* SVG Connecting lines to nearest neighbours */}
            {step === 5 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {scene.nearestNeighbors.map(nb => {
                  const target = scene.items.find(i => i.id === nb.id);
                  if (!target) return null;
                  // Center offsets (map range -100 to 100 onto SVG coords)
                  const x1 = 50 + (scene.selectedItem.currentCoords[0] / 220) * 100;
                  const y1 = 50 - (scene.selectedItem.currentCoords[1] / 220) * 100;
                  const x2 = 50 + (target.currentCoords[0] / 220) * 100;
                  const y2 = 50 - (target.currentCoords[1] / 220) * 100;

                  return (
                    <g key={nb.id}>
                      <line
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        strokeOpacity="0.8"
                      />
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Token Nodes on 2D map */}
            {scene.items.map(item => {
              const isSelected = item.id === scene.selectedItem.id;
              const isNeighbor = scene.nearestNeighbors.some(n => n.id === item.id);
              // Map -100..100 to percentage
              const leftPct = 50 + (item.currentCoords[0] / 220) * 100;
              const topPct = 50 - (item.currentCoords[1] / 220) * 100;

              return (
                <div
                  key={item.id}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                  }}
                  onClick={() => setSelectedTokenId(item.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 select-none transition-transform active:scale-95 ${
                    isSelected ? 'z-20' : ''
                  }`}
                >
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 shadow-md ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 border-white font-bold ring-4 ring-sky-500/30'
                        : isNeighbor
                        ? 'bg-sky-950 text-sky-200 border-sky-500/70'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    <span>{item.token}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 5: Distance Readout card */}
      {step === 5 && (
        <div className="w-full max-w-md bg-slate-950/70 rounded-xl border border-sky-900/50 p-3 text-xs">
          <div className="font-semibold text-sky-300 mb-1.5 flex items-center justify-between">
            <span>Nearest Neighbours to "{scene.selectedItem.token}":</span>
            <span className="text-[10px] text-slate-500 font-mono">Euclidean dist</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {scene.nearestNeighbors.map((nb, idx) => (
              <div
                key={nb.id}
                onClick={() => setSelectedTokenId(nb.id)}
                className="p-2 rounded-lg bg-sky-950/40 border border-sky-800/40 text-center cursor-pointer hover:border-sky-500 transition-colors"
              >
                <div className="font-medium text-slate-200 truncate">
                  {idx + 1}. "{nb.token}"
                </div>
                <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                  dist: {nb.distance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
