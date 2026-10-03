import type { W6Data } from './schema';
import {
  applyTemperature,
  computeProbabilities,
  applyTopK,
  applyTopP,
  sampleCategorical,
  type CandidateToken,
} from '../../lib/ml/sampling';
import { createMulberry32 } from '../../lib/rng';

export interface W6Controls {
  temperature?: number;
  topK?: number;
  topP?: number;
  seed?: number;
  cfgScale?: number;
  isRolled?: boolean;
}

export interface W6SceneState {
  step: number;
  contextPhrase: string;
  temperature: number;
  topK: number;
  topP: number;
  seed: number;
  cfgScale: number;
  candidates: CandidateToken[];
  winner: CandidateToken | null;
  mode: 'logits' | 'probs' | 'temp' | 'topk' | 'topp' | 'roll' | 'guidance';
}

export function getSceneState(
  step: number,
  data: W6Data,
  controls: W6Controls = {}
): W6SceneState {
  const boundedStep = Math.max(0, Math.min(step, 6));

  const temperature = controls.temperature ?? (boundedStep === 2 ? 1.4 : 0.8);
  const topK = controls.topK ?? (boundedStep === 3 ? 3 : 8);
  const topP = controls.topP ?? (boundedStep === 4 ? 0.85 : 1.0);
  const seed = controls.seed ?? 7;
  const cfgScale = controls.cfgScale ?? 1.0;

  // 1. Calculate raw logits with CFG if applicable
  const rawLogits = data.candidates.map(c => {
    if (boundedStep === 6 && c.uncondLogit !== undefined) {
      // CFG formula: uncond + scale * (cond - uncond)
      return c.uncondLogit + cfgScale * (c.logit - c.uncondLogit);
    }
    return c.logit;
  });

  // 2. Apply temperature (step >= 1)
  const scaledLogits = boundedStep >= 1 ? applyTemperature(rawLogits, temperature) : rawLogits;

  // 3. Compute softmax probabilities
  const probs = computeProbabilities(scaledLogits, 1.0);

  let candidateTokens: CandidateToken[] = data.candidates.map((c, idx) => ({
    id: c.id,
    token: c.token,
    logit: rawLogits[idx],
    prob: probs[idx],
    filteredOut: false,
  }));

  // 4. Apply Top-K filtering if step >= 3
  if (boundedStep >= 3 && topK < candidateTokens.length) {
    candidateTokens = applyTopK(candidateTokens, topK);
  }

  // 5. Apply Top-P filtering if step >= 4
  if (boundedStep >= 4 && topP < 1.0) {
    candidateTokens = applyTopP(candidateTokens, topP);
  }

  // 6. Sample with seeded PRNG if step >= 5 and rolled
  let winner: CandidateToken | null = null;
  if (boundedStep >= 5) {
    const rng = createMulberry32(seed);
    winner = sampleCategorical(candidateTokens, rng);
    candidateTokens = candidateTokens.map(c => ({
      ...c,
      selected: c.id === winner?.id,
    }));
  }

  let mode: W6SceneState['mode'] = 'logits';
  if (boundedStep === 1) mode = 'probs';
  else if (boundedStep === 2) mode = 'temp';
  else if (boundedStep === 3) mode = 'topk';
  else if (boundedStep === 4) mode = 'topp';
  else if (boundedStep === 5) mode = 'roll';
  else if (boundedStep === 6) mode = 'guidance';

  return {
    step: boundedStep,
    contextPhrase: data.contextPhrase,
    temperature,
    topK,
    topP,
    seed,
    cfgScale,
    candidates: candidateTokens,
    winner,
    mode,
  };
}
