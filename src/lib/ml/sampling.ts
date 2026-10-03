import { softmax } from './softmax';
import type { PRNG } from '../rng';

export interface CandidateToken {
  id: number;
  token: string;
  logit: number;
  prob: number;
  selected?: boolean;
  filteredOut?: boolean;
}

export function applyTemperature(logits: number[], temperature: number): number[] {
  const temp = Math.max(temperature, 0.05);
  return logits.map(l => l / temp);
}

export function computeProbabilities(logits: number[], temperature = 1.0): number[] {
  return softmax(logits, temperature);
}

export function applyTopK(
  candidates: CandidateToken[],
  k: number
): CandidateToken[] {
  const boundedK = Math.max(1, Math.min(k, candidates.length));
  // Sort descending by prob
  const sorted = [...candidates].sort((a, b) => b.prob - a.prob);
  const keptIds = new Set(sorted.slice(0, boundedK).map(c => c.id));

  // Renormalize kept probabilities
  const keptSum = sorted.slice(0, boundedK).reduce((acc, c) => acc + c.prob, 0);

  return candidates.map(c => {
    const isKept = keptIds.has(c.id);
    return {
      ...c,
      filteredOut: !isKept,
      prob: isKept ? (keptSum > 0 ? c.prob / keptSum : 1 / boundedK) : 0,
    };
  });
}

export function applyTopP(
  candidates: CandidateToken[],
  p: number
): CandidateToken[] {
  const boundedP = Math.max(0.01, Math.min(p, 1.0));
  const sorted = [...candidates].sort((a, b) => b.prob - a.prob);

  let cumulative = 0;
  const keptIds = new Set<number>();
  for (const c of sorted) {
    keptIds.add(c.id);
    cumulative += c.prob;
    if (cumulative >= boundedP) break;
  }

  const keptSum = candidates
    .filter(c => keptIds.has(c.id))
    .reduce((acc, c) => acc + c.prob, 0);

  return candidates.map(c => {
    const isKept = keptIds.has(c.id);
    return {
      ...c,
      filteredOut: !isKept,
      prob: isKept ? (keptSum > 0 ? c.prob / keptSum : 0) : 0,
    };
  });
}

/**
 * Sample a candidate token using a deterministic PRNG function.
 */
export function sampleCategorical(
  candidates: CandidateToken[],
  rng: PRNG
): CandidateToken {
  const valid = candidates.filter(c => !c.filteredOut && c.prob > 0);
  if (valid.length === 0) {
    return candidates[0];
  }
  const roll = rng();
  let cumulative = 0;
  for (const candidate of valid) {
    cumulative += candidate.prob;
    if (roll <= cumulative) {
      return candidate;
    }
  }
  return valid[valid.length - 1];
}
