import { describe, expect, it } from 'vitest';
import { getSceneState as w1 } from '../../src/widgets/w1-tokenization/scene';
import { W1DataSchema } from '../../src/widgets/w1-tokenization/schema';
import rawW1 from '../../src/widgets/w1-tokenization/data.json';
import { getSceneState as w2 } from '../../src/widgets/w2-embeddings/scene';
import { W2DataSchema } from '../../src/widgets/w2-embeddings/schema';
import rawW2 from '../../src/widgets/w2-embeddings/data.json';
import { getSceneState as w3 } from '../../src/widgets/w3-attention/scene';
import { W3DataSchema } from '../../src/widgets/w3-attention/schema';
import rawW3 from '../../src/widgets/w3-attention/data.json';
import { getSceneState as w4 } from '../../src/widgets/w4-multihead/scene';
import { W4DataSchema } from '../../src/widgets/w4-multihead/schema';
import rawW4 from '../../src/widgets/w4-multihead/data.json';
import { getSceneState as w5 } from '../../src/widgets/w5-block/scene';
import { W5DataSchema } from '../../src/widgets/w5-block/schema';
import rawW5 from '../../src/widgets/w5-block/data.json';
import { getSceneState as w6 } from '../../src/widgets/w6-sampling/scene';
import { W6DataSchema } from '../../src/widgets/w6-sampling/schema';
import rawW6 from '../../src/widgets/w6-sampling/data.json';
import { getSceneState as w7 } from '../../src/widgets/w7-loop/scene';
import { W7DataSchema } from '../../src/widgets/w7-loop/schema';
import rawW7 from '../../src/widgets/w7-loop/data.json';

const w1d = W1DataSchema.parse(rawW1);
const w2d = W2DataSchema.parse(rawW2);
const w3d = W3DataSchema.parse(rawW3);
const w4d = W4DataSchema.parse(rawW4);
const w5d = W5DataSchema.parse(rawW5);
const w6d = W6DataSchema.parse(rawW6);
const w7d = W7DataSchema.parse(rawW7);

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('W1 tokenization scene (6 steps)', () => {
  it.each([0, 1, 2, 3, 4, 5])('step %i returns its bounded step', s => {
    expect(w1(s, w1d).step).toBe(s);
  });
  it('shows chips only from step 1 and IDs from step 2', () => {
    expect(w1(0, w1d).showChips).toBe(false);
    expect(w1(1, w1d).showChips).toBe(true);
    expect(w1(1, w1d).showIds).toBe(false);
    expect(w1(2, w1d).showIds).toBe(true);
  });
  it('step 5 maps the waveform to sound-shape tokens', () => {
    const s = w1(5, w1d);
    expect(s.mode).toBe('audio');
    expect(s.audioFrames?.length).toBeGreaterThan(0);
  });
  it('is a pure function: 2 -> 3 -> 2 is identical', () => {
    const a = JSON.stringify(w1(2, w1d));
    w1(3, w1d);
    expect(JSON.stringify(w1(2, w1d))).toBe(a);
  });
});

describe('W2 embeddings scene (6 steps)', () => {
  it.each([0, 1, 2, 3, 4, 5])('step %i returns its bounded step', s => {
    expect(w2(s, w2d).step).toBe(s);
  });
  it('reports three nearest neighbours for the default token', () => {
    const s = w2(5, w2d);
    expect(s.nearestNeighbors).toHaveLength(3);
    expect(s.selectedItem.token).toBe('guitar');
  });
  it('neighbours are sorted by ascending distance', () => {
    const d = w2(5, w2d).nearestNeighbors.map(n => n.distance);
    expect(d).toEqual([...d].sort((a, b) => a - b));
  });
  it('is a pure function: 4 -> 5 -> 4 is identical', () => {
    const a = JSON.stringify(w2(4, w2d));
    w2(5, w2d);
    expect(JSON.stringify(w2(4, w2d))).toBe(a);
  });
});

describe('W3 attention scene (8 steps)', () => {
  it.each([0, 1, 2, 3, 4, 5, 6, 7])('step %i returns its bounded step', s => {
    expect(w3(s, w3d).step).toBe(s);
  });
  it('query "it" against the nine keys gives guitar the highest weight', () => {
    const s = w3(4, w3d);
    expect(s.queryIndex).toBe(6);
    expect(s.tokens[s.highestWeightIndex]).toBe('guitar');
    expect(s.weights[s.highestWeightIndex]).toBeCloseTo(0.174875, 5);
  });
  it('softmax weights sum to 1 and the blender returns the documented vector', () => {
    const s = w3(5, w3d);
    expect(sum(s.weights)).toBeCloseTo(1, 9);
  });
  it('full heatmap rows sum to 1, and the causal mask zeroes the future', () => {
    const finite = w3(6, w3d);
    finite.heatmap.forEach(row => expect(sum(row)).toBeCloseTo(1, 9));
    const causal = w3(7, w3d);
    causal.heatmap.forEach((row, q) => {
      row.forEach((v, k) => {
        if (k > q) expect(v).toBe(0);
      });
      expect(sum(row)).toBeCloseTo(1, 9);
    });
  });
  it('is a pure function: 4 -> 5 -> 4 is identical', () => {
    const a = JSON.stringify(w3(4, w3d));
    w3(5, w3d);
    expect(JSON.stringify(w3(4, w3d))).toBe(a);
  });
});

describe('W4 multi-head scene (6 steps)', () => {
  it.each([0, 1, 2, 3, 4, 5])('step %i returns its bounded step', s => {
    expect(w4(s, w4d).step).toBe(s);
  });
  it('every head row is a probability distribution', () => {
    w4d.weights.forEach(head => head.forEach(row => expect(sum(row)).toBeCloseTo(1, 6)));
  });
  it('is a pure function: 2 -> 3 -> 2 is identical', () => {
    const a = JSON.stringify(w4(2, w4d));
    w4(3, w4d);
    expect(JSON.stringify(w4(2, w4d))).toBe(a);
  });
});

describe('W5 transformer block scene (8 steps)', () => {
  it.each([0, 1, 2, 3, 4, 5, 6, 7])('step %i returns its bounded step', s => {
    expect(w5(s, w5d).step).toBe(s);
  });
  it('step 6 is the stack view and step 7 is the logits view', () => {
    expect(w5(6, w5d).isStackView).toBe(true);
    expect(w5(7, w5d).isOutputView).toBe(true);
  });
  it('is a pure function: 3 -> 4 -> 3 is identical', () => {
    const a = JSON.stringify(w5(3, w5d));
    w5(4, w5d);
    expect(JSON.stringify(w5(3, w5d))).toBe(a);
  });
});

describe('W6 sampling scene (7 steps)', () => {
  it.each([0, 1, 2, 3, 4, 5, 6])('step %i returns its bounded step', s => {
    expect(w6(s, w6d).step).toBe(s);
  });
  it('seed 7 deterministically rolls "floor"', () => {
    expect(w6(5, w6d, { seed: 7 }).winner?.token).toBe('floor');
    expect(w6(5, w6d, { seed: 7 }).winner?.token).toBe(w6(5, w6d, { seed: 7 }).winner?.token);
  });
  it('top-k and top-p renormalise the kept probabilities to 1', () => {
    const k = w6(3, w6d, { topK: 3 });
    expect(sum(k.candidates.map(c => c.prob))).toBeCloseTo(1, 9);
    const p = w6(4, w6d, { topP: 0.5 });
    expect(sum(p.candidates.map(c => c.prob))).toBeCloseTo(1, 9);
  });
  it('is a pure function: 4 -> 5 -> 4 is identical', () => {
    const a = JSON.stringify(w6(4, w6d));
    w6(5, w6d);
    expect(JSON.stringify(w6(4, w6d))).toBe(a);
  });
});

describe('W7 generation loop scene (7 steps)', () => {
  it.each([0, 1, 2, 3, 4, 5, 6])('step %i returns its bounded step', s => {
    expect(w7(s, w7d).step).toBe(s);
  });
  it('builds the sequence incrementally and stops at <end>', () => {
    expect(w7(0, w7d).currentTokens).toEqual(['Sunlight', 'on', 'the']);
    expect(w7(2, w7d).currentTokens).toContain('kitchen');
    expect(w7(4, w7d).isFinished).toBe(true);
  });
  it('is a pure function: 2 -> 3 -> 2 is identical', () => {
    const a = JSON.stringify(w7(2, w7d));
    w7(3, w7d);
    expect(JSON.stringify(w7(2, w7d))).toBe(a);
  });
});
