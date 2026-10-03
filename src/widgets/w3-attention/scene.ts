import type { W3Data } from './schema';
import { singleHeadAttention, computeAttentionMatrix } from '../../lib/ml/attention';

export interface W3Controls {
  queryIndex?: number;
  causalMask?: boolean;
}

export interface W3SceneState {
  step: number;
  tokens: string[];
  queryIndex: number;
  causalMask: boolean;
  q: number[];
  keys: number[][];
  values: number[][];
  rawScores: number[];
  weights: number[];
  blendedOutput: number[];
  heatmap: number[][];
  highestWeightIndex: number;
}

export function getSceneState(
  step: number,
  data: W3Data,
  controls: W3Controls = {}
): W3SceneState {
  const boundedStep = Math.max(0, Math.min(step, 7));
  const queryIndex = controls.queryIndex ?? 6; // default "it"
  const causalMask = controls.causalMask ?? (boundedStep === 7);

  const tokens = data.tokens.map(t => t.token);
  const qVectors = data.tokens.map(t => t.q);
  const kVectors = data.tokens.map(t => t.k);
  const vVectors = data.tokens.map(t => t.v);

  const currentQ = qVectors[queryIndex] || qVectors[0];

  // Run single head attention calculation live with ML core
  const limit = causalMask ? queryIndex : undefined;
  const result = singleHeadAttention(currentQ, kVectors, vVectors, limit);

  // Compute full 9x9 heatmap live
  const heatmap = computeAttentionMatrix(qVectors, kVectors, causalMask);

  // Find index with highest weight (excluding -Infinity)
  let maxWeight = -1;
  let highestIdx = 0;
  result.weights.forEach((w, idx) => {
    if (w > maxWeight) {
      maxWeight = w;
      highestIdx = idx;
    }
  });

  return {
    step: boundedStep,
    tokens,
    queryIndex,
    causalMask,
    q: currentQ,
    keys: kVectors,
    values: vVectors,
    rawScores: result.scores,
    weights: result.weights,
    blendedOutput: result.output,
    heatmap,
    highestWeightIndex: highestIdx,
  };
}
