import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import rawData from './data.json';
import { W7DataSchema, type W7Data } from './schema';
import { getSceneState } from './scene';
import { Repeat, Play, Pause, RotateCcw, GitCommit } from 'lucide-react';

const data: W7Data = W7DataSchema.parse(rawData);

interface W7Props {
  step: number;
  stepCount: number;
  reducedMotion: boolean;
}

export const W7LoopWidget: React.FC<W7Props> = ({ step, reducedMotion }) => {
  const [playbackIteration, setPlaybackIteration] = useState<number | undefined>(undefined);
  const [inspectedStepIndex, setInspectedStepIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(700);

  const scene = getSceneState(step, data, {
    playbackIteration,
    inspectedStepIndex,
  });

  const currentIteration =
    playbackIteration !== undefined ? playbackIteration : scene.history.length;

  const handleStepForward = () => {
    setPlaybackIteration(prev => {
      const current = prev !== undefined ? prev : (step >= 4 ? 4 : (step >= 2 ? 1 : 0));
      return Math.min(4, current + 1);
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPlaybackIteration(0);
    setInspectedStepIndex(null);
  };

  // Auto-play the loop one token at a time. Never starts on its own, so
  // reduced-motion users are unaffected until they press Play.
  useEffect(() => {
    if (!isPlaying) return;
    if (currentIteration >= data.scriptedSteps.length) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setPlaybackIteration(prev => {
        const current = prev !== undefined ? prev : (step >= 4 ? 4 : (step >= 2 ? 1 : 0));
        const next = Math.min(4, current + 1);
        if (next >= data.scriptedSteps.length) setIsPlaying(false);
        return next;
      });
    }, speedMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, currentIteration, speedMs, step, data.scriptedSteps.length]);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 py-2">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center gap-1.5">
          <Repeat className="w-4 h-4 text-sky-400" />
          <span>
            {step === 6
              ? 'YuE2: Autoregressive vs Non-Autoregressive'
              : 'Autoregressive Loop Progression'}
          </span>
        </div>
        {step < 6 && (
          <div className="flex items-center gap-2">
            <label className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
              Speed
              <select
                value={speedMs}
                onChange={e => setSpeedMs(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-slate-300"
                aria-label="Playback speed"
              >
                <option value={1200}>Slow</option>
                <option value={700}>Normal</option>
                <option value={350}>Fast</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setIsPlaying(p => !p)}
              disabled={scene.isFinished && !isPlaying}
              aria-label={isPlaying ? 'Pause generation loop' : 'Play generation loop'}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-medium hover:bg-emerald-900 disabled:opacity-30 disabled:border-slate-800 disabled:text-slate-500"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={handleStepForward}
              disabled={scene.isFinished}
              aria-label="Step forward one token"
              className="px-2.5 py-1 rounded bg-sky-950/80 border border-sky-600 text-sky-300 text-xs font-medium hover:bg-sky-900 disabled:opacity-30 disabled:border-slate-800 disabled:text-slate-500"
            >
              +1 Step
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset loop"
              aria-label="Reset generation loop"
              className="p-1 text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800 shadow-inner overflow-hidden">
        {/* Step 6: YuE2 Architecture Comparison */}
        {scene.isYuE2ComparisonView ? (
          <div className="w-full max-w-lg space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-800/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-sky-300 font-mono">
                  1. Autoregressive (AR) Stage · Symbolic Plan & Semantics
                </span>
                <span className="text-[10px] bg-sky-950 px-2 py-0.5 rounded text-sky-300 border border-sky-700 font-mono">
                  Sequential Loop
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tokens are written one by one using causal self-attention. YuE2 uses this to compose the musical structure, melody chords in ABC notation, and semantic lyrics tokens.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-800/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-300 font-mono">
                  2. Non-Autoregressive (NAR) Stage · Acoustic Flow Matching
                </span>
                <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 border border-emerald-700 font-mono">
                  Parallel Refinement
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Instead of slow token loops, flow matching starts with pure noise and refines the entire song's acoustic latents simultaneously across several velocity steps. The neural VAE then decodes these latents into 48 kHz stereo sound!
              </p>
            </div>
          </div>
        ) : (
          /* Steps 0 to 5: Autoregressive Sequence Builder */
          <div className="w-full max-w-lg flex flex-col items-center gap-4">
            {/* Sequence Row */}
            <div className="w-full p-3 bg-slate-950 rounded-xl border border-sky-500/40 flex flex-wrap items-center justify-center gap-1.5 min-h-[50px]">
              {scene.currentTokens.map((tok, idx) => {
                const isPrompt = idx < scene.prompt.length;
                const isNew = idx === scene.currentTokens.length - 1 && !isPrompt;

                return (
                  <motion.span
                    key={`${tok}-${idx}`}
                    initial={reducedMotion ? false : isNew ? { scale: 0.6, y: -8 } : false}
                    animate={{ scale: 1, y: 0 }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
                      isPrompt
                        ? 'bg-slate-900 border-slate-750 text-slate-300'
                        : isNew
                        ? 'bg-emerald-500 border-white text-slate-950 shadow-md ring-2 ring-emerald-400/50'
                        : 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                    }`}
                  >
                    {tok}
                  </motion.span>
                );
              })}

              {scene.isFinished && (
                <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-700 text-rose-300 text-[11px] font-mono font-bold">
                  &lt;end&gt; (HALTED)
                </span>
              )}
            </div>

            {/* Next Token Probability Distribution */}
            <div className="w-full p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col gap-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-850">
                <span>
                  {inspectedStepIndex !== null
                    ? `Inspecting Step ${inspectedStepIndex + 1} Decision:`
                    : 'Candidate Probabilities at Current Loop Step:'}
                </span>
                <span className="text-emerald-400 font-semibold">
                  Sampled: "{scene.lastGeneratedToken || '...'}"
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                {scene.activeProbabilities.map((cand, i) => {
                  const isWinner = cand.token === scene.lastGeneratedToken;
                  const pct = Math.round(cand.prob * 100);

                  return (
                    <div
                      key={i}
                      className={`p-2 rounded border flex items-center justify-between ${
                        isWinner
                          ? 'bg-emerald-950/70 border-emerald-600 text-emerald-200 font-bold'
                          : 'bg-slate-900/50 border-slate-850 text-slate-300'
                      }`}
                    >
                      <span>"{cand.token}"</span>
                      <span className="text-slate-400">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History timeline ticks */}
            <div className="w-full flex items-center justify-between text-[11px] text-slate-500 font-mono px-2 pt-1 border-t border-slate-850">
              <span className="flex items-center gap-1">
                <GitCommit className="w-3.5 h-3.5 text-sky-400" />
                History Timeline:
              </span>
              <div className="flex items-center gap-1.5">
                {data.scriptedSteps.map((s, idx) => {
                  const isCurrent = inspectedStepIndex === idx;
                  const isAvailable = idx < scene.history.length;

                  return (
                    <button
                      key={s.stepNumber}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() =>
                        setInspectedStepIndex(isCurrent ? null : idx)
                      }
                      className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                        isCurrent
                          ? 'bg-sky-500 text-slate-950 font-bold border-white'
                          : isAvailable
                          ? 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
                          : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
                      }`}
                    >
                      #{s.stepNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
