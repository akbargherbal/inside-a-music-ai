import { describe, expect, it } from 'vitest';
import { softmax } from '../../src/lib/ml/softmax';
import { dot, euclideanDistance, scalarMultiply, vectorAdd } from '../../src/lib/ml/math';
import {
  singleHeadAttention,
  computeAttentionMatrix,
} from '../../src/lib/ml/attention';
import {
  applyTemperature,
  applyTopK,
  applyTopP,
  sampleCategorical,
  type CandidateToken,
} from '../../src/lib/ml/sampling';
import { createMulberry32 } from '../../src/lib/rng';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('softmax', () => {
  it('produces a probability distribution that sums to 1', () => {
    const out = softmax([1, 2, 3]);
    expect(sum(out)).toBeCloseTo(1, 12);
    expect(out[2]).toBeGreaterThan(out[1]);
    expect(out[1]).toBeGreaterThan(out[0]);
  });

  it('is numerically stable for large and very negative inputs', () => {
    for (const logits of [
      [1000, 1001, 1002],
      [-1000, -1001, -1002],
      [1e6, 1e6 + 1],
    ]) {
      const out = softmax(logits);
      expect(out.every(Number.isFinite)).toBe(true);
      expect(sum(out)).toBeCloseTo(1, 12);
    }
  });

  it('returns an empty array for empty input', () => {
    expect(softmax([])).toEqual([]);
  });

  it('temperature = 1 leaves the distribution unchanged', () => {
    const a = softmax([0.5, -1, 2]);
    const b = softmax([0.5, -1, 2], 1);
    expect(a).toEqual(b);
  });

  it('temperature -> 0 approaches the argmax (one-hot) distribution', () => {
    const out = softmax([1, 5, 2], 1e-4);
    expect(out[1]).toBeCloseTo(1, 6);
    expect(out[0]).toBeCloseTo(0, 9);
    expect(out[2]).toBeCloseTo(0, 9);
  });
});

describe('vector math', () => {
  it('dot multiplies matching positions and adds up', () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32);
  });

  it('dot throws on length mismatch', () => {
    expect(() => dot([1, 2], [1])).toThrow();
  });

  it('euclideanDistance is the length of the difference vector', () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBe(5);
  });

  it('vectorAdd and scalarMultiply behave elementwise', () => {
    expect(vectorAdd([1, 2], [3, 4])).toEqual([4, 6]);
    expect(scalarMultiply([1, 2], 3)).toEqual([3, 6]);
  });
});

describe('singleHeadAttention', () => {
  const q = [1, 0];
  const keys = [
    [1, 0],
    [0, 1],
  ];
  const values = [
    [10, 0],
    [0, 10],
  ];

  it('scales scores by 1/sqrt(d_k) and softmaxes to a distribution', () => {
    const { scores, weights } = singleHeadAttention(q, keys, values);
    expect(scores[0]).toBeCloseTo(1 / Math.sqrt(2), 12);
    expect(scores[1]).toBeCloseTo(0, 12);
    expect(sum(weights)).toBeCloseTo(1, 12);
  });

  it('blends values proportionally to the attention weights', () => {
    const { weights, output } = singleHeadAttention(q, keys, values);
    expect(output[0]).toBeCloseTo(10 * weights[0], 12);
    expect(output[1]).toBeCloseTo(10 * weights[1], 12);
  });

  it('causal mask zeroes keys after the limit and renormalises', () => {
    const { weights } = singleHeadAttention(q, keys, values, 0);
    expect(weights[1]).toBe(0);
    expect(weights[0]).toBeCloseTo(1, 12);
  });
});

describe('computeAttentionMatrix', () => {
  const queries = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  const keys = [
    [1, 0.2, 0.1],
    [0.2, 1, 0.3],
    [0.1, 0.3, 1],
  ];

  it('gives every row a probability distribution', () => {
    const m = computeAttentionMatrix(queries, keys);
    m.forEach(row => expect(sum(row)).toBeCloseTo(1, 12));
  });

  it('causal mask sets the strict upper triangle to exactly 0 and renormalises', () => {
    const m = computeAttentionMatrix(queries, keys, true);
    m.forEach((row, q) => {
      row.forEach((v, k) => {
        if (k > q) expect(v).toBe(0);
      });
      expect(sum(row)).toBeCloseTo(1, 12);
    });
    // Row 0 can only attend to itself.
    expect(m[0][0]).toBeCloseTo(1, 12);
  });
});

function candidates(): CandidateToken[] {
  return [
    { id: 0, token: 'a', logit: 2, prob: 0.6 },
    { id: 1, token: 'b', logit: 1, prob: 0.25 },
    { id: 2, token: 'c', logit: 0, prob: 0.1 },
    { id: 3, token: 'd', logit: -1, prob: 0.05 },
  ];
}

describe('temperature', () => {
  it('clamps extreme low temperatures instead of dividing by zero', () => {
    expect(applyTemperature([1, 2], 0).every(Number.isFinite)).toBe(true);
  });
  it('T = 1 returns the same logits', () => {
    expect(applyTemperature([1, 2], 1)).toEqual([1, 2]);
  });
});

describe('top-k', () => {
  it('k = 1 keeps only the single most probable token', () => {
    const out = applyTopK(candidates(), 1);
    const kept = out.filter(c => !c.filteredOut);
    expect(kept).toHaveLength(1);
    expect(kept[0].token).toBe('a');
    expect(kept[0].prob).toBeCloseTo(1, 12);
  });

  it('k >= n keeps everything and renormalises to 1', () => {
    const out = applyTopK(candidates(), 99);
    expect(out.every(c => !c.filteredOut)).toBe(true);
    expect(sum(out.map(c => c.prob))).toBeCloseTo(1, 12);
  });

  it('renormalises the kept probabilities to sum to 1', () => {
    const out = applyTopK(candidates(), 2);
    expect(sum(out.map(c => c.prob))).toBeCloseTo(1, 12);
    expect(out.find(c => c.token === 'c')?.prob).toBe(0);
  });
});

describe('top-p', () => {
  it('p = 1 keeps everything', () => {
    const out = applyTopP(candidates(), 1);
    expect(out.filter(c => !c.filteredOut)).toHaveLength(4);
  });

  it('always keeps at least one token even for a tiny p', () => {
    const out = applyTopP(candidates(), 0);
    expect(out.filter(c => !c.filteredOut).length).toBeGreaterThanOrEqual(1);
    expect(sum(out.map(c => c.prob))).toBeCloseTo(1, 12);
  });

  it('keeps the smallest prefix whose probability reaches p', () => {
    const out = applyTopP(candidates(), 0.8);
    const kept = out.filter(c => !c.filteredOut).map(c => c.token).sort();
    expect(kept).toEqual(['a', 'b']);
  });
});

describe('seeded sampling and RNG', () => {
  it('mulberry32 stays in [0, 1) and repeats for the same seed', () => {
    const a = createMulberry32(42);
    const b = createMulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = a();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      expect(v).toBe(b());
    }
  });

  it('different seeds produce different sequences', () => {
    const a = createMulberry32(1)();
    const b = createMulberry32(2)();
    expect(a).not.toBe(b);
  });

  it('sampleCategorical with the same seed returns the same token', () => {
    const c = candidates();
    const first = sampleCategorical(c, createMulberry32(7));
    const second = sampleCategorical(c, createMulberry32(7));
    expect(first.token).toBe(second.token);
  });
});
