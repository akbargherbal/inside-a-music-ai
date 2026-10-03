import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { singleHeadAttention } from '../../src/lib/ml/attention';
import {
  applyTemperature,
  applyTopK,
  sampleCategorical,
  type CandidateToken,
} from '../../src/lib/ml/sampling';
import { computeProbabilities } from '../../src/lib/ml/sampling';
import { createMulberry32 } from '../../src/lib/rng';
import goldenAttention from '../fixtures/golden-attention.json';
import goldenSampling from '../fixtures/golden-sampling.json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const pythonBin = process.env.PYTHON_BIN || 'python3';

describe('golden attention cross-check (W3)', () => {
  it('TypeScript reproduces the golden raw scores and softmax weights', () => {
    const result = singleHeadAttention(
      goldenAttention.query,
      goldenAttention.keys,
      goldenAttention.keys
    );
    goldenAttention.expectedRawScores.forEach((expected, i) => {
      expect(result.scores[i]).toBeCloseTo(expected, 5);
    });
    goldenAttention.expectedSoftmaxWeights.forEach((expected, i) => {
      expect(result.weights[i]).toBeCloseTo(expected, 5);
    });
    let max = -1;
    let arg = -1;
    result.weights.forEach((w, i) => {
      if (w > max) {
        max = w;
        arg = i;
      }
    });
    expect(arg).toBe(goldenAttention.winnerIndex);
    expect(goldenAttention.tokens[arg]).toBe(goldenAttention.winnerToken);
  });

  it('the page Python snippet reproduces the same golden weights', () => {
    const file = path.join(repoRoot, 'src/content/python/attention_single_head.py');
    const stdout = execFileSync(pythonBin, [file], { encoding: 'utf8' });
    // Winner and its percentage must match the widget's computation.
    const winnerPct = (goldenAttention.expectedSoftmaxWeights[goldenAttention.winnerIndex] * 100).toFixed(1);
    expect(stdout).toContain(`Winner:    ${goldenAttention.winnerToken} = ${winnerPct}%`);
  });
});

describe('golden sampling cross-check (W6)', () => {
  it('TypeScript reproduces the golden probabilities and seeded sample', () => {
    const scaled = applyTemperature(goldenSampling.logits, goldenSampling.temperature);
    const probs = computeProbabilities(scaled);
    goldenSampling.expectedProbs.forEach((expected, i) => {
      expect(probs[i]).toBeCloseTo(expected, 5);
    });

    const candidates: CandidateToken[] = goldenSampling.candidates.map((token, i) => ({
      id: i,
      token,
      logit: goldenSampling.logits[i],
      prob: probs[i],
    }));
    const filtered = applyTopK(candidates, goldenSampling.topK);
    const sample = sampleCategorical(filtered, createMulberry32(goldenSampling.seed));
    expect(sample.token).toBe(goldenSampling.expectedSampledToken);

    const winnerProb = probs.find(
      (_p, i) => goldenSampling.candidates[i] === goldenSampling.expectedSampledToken
    );
    expect(winnerProb).toBeCloseTo(goldenSampling.expectedSampledProb, 5);
  });

  it('the page Python snippet reports the same winner and probability', () => {
    const file = path.join(repoRoot, 'src/content/python/sampling_roll.py');
    const stdout = execFileSync(pythonBin, [file], { encoding: 'utf8' });
    expect(stdout).toContain(
      `Sampled: '${goldenSampling.expectedSampledToken}' (prob: ${goldenSampling.expectedSampledProb.toFixed(3)}) with seed=${goldenSampling.seed}`
    );
  });
});
