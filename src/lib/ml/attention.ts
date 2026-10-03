import { dot, scalarMultiply, vectorAdd } from './math';
import { softmax } from './softmax';

export interface SingleHeadAttentionResult {
  scores: number[];
  weights: number[];
  output: number[];
}

/**
 * Computes single query attention against a list of keys and values.
 * Optional causalMaskLimit: keys with index > causalMaskLimit are masked to -Infinity.
 */
export function singleHeadAttention(
  query: number[],
  keys: number[][],
  values: number[][],
  causalMaskLimit?: number
): SingleHeadAttentionResult {
  const d_k = query.length;
  const scale = Math.sqrt(d_k);

  const scores = keys.map((key, kIndex) => {
    if (causalMaskLimit !== undefined && kIndex > causalMaskLimit) {
      return -Infinity;
    }
    const rawDot = dot(query, key);
    return rawDot / scale;
  });

  const finiteIndices = scores
    .map((s, idx) => ({ s, idx }))
    .filter(item => item.s !== -Infinity);

  const finiteLogits = finiteIndices.map(item => item.s);
  const finiteWeights = softmax(finiteLogits, 1.0);

  const weights = new Array(keys.length).fill(0);
  finiteIndices.forEach((item, pos) => {
    weights[item.idx] = finiteWeights[pos];
  });

  // Blend values by attention weights
  const dim = values[0]?.length || 0;
  let output = new Array(dim).fill(0);
  for (let i = 0; i < values.length; i++) {
    if (weights[i] > 0) {
      const weightedVal = scalarMultiply(values[i], weights[i]);
      output = vectorAdd(output, weightedVal);
    }
  }

  return { scores, weights, output };
}

/**
 * Computes a full N x N attention matrix for queries and keys.
 */
export function computeAttentionMatrix(
  queries: number[][],
  keys: number[][],
  causal = false
): number[][] {
  return queries.map((q, qIndex) => {
    const d_k = q.length;
    const scale = Math.sqrt(d_k);
    const logits = keys.map((k, kIndex) => {
      if (causal && kIndex > qIndex) {
        return -Infinity;
      }
      return dot(q, k) / scale;
    });

    const finite = logits.map((val, idx) => ({ val, idx })).filter(x => x.val !== -Infinity);
    const sm = softmax(finite.map(x => x.val), 1.0);
    const row = new Array(keys.length).fill(0);
    finite.forEach((x, i) => {
      row[x.idx] = sm[i];
    });
    return row;
  });
}
