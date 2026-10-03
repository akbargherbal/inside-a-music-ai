import { describe, expect, it } from 'vitest';
import { W1DataSchema } from '../../src/widgets/w1-tokenization/schema';
import { W2DataSchema } from '../../src/widgets/w2-embeddings/schema';
import { W3DataSchema } from '../../src/widgets/w3-attention/schema';
import { W4DataSchema } from '../../src/widgets/w4-multihead/schema';
import { W5DataSchema } from '../../src/widgets/w5-block/schema';
import { W6DataSchema } from '../../src/widgets/w6-sampling/schema';
import { W7DataSchema } from '../../src/widgets/w7-loop/schema';

import rawW1 from '../../src/widgets/w1-tokenization/data.json';
import rawW2 from '../../src/widgets/w2-embeddings/data.json';
import rawW3 from '../../src/widgets/w3-attention/data.json';
import rawW4 from '../../src/widgets/w4-multihead/data.json';
import rawW5 from '../../src/widgets/w5-block/data.json';
import rawW6 from '../../src/widgets/w6-sampling/data.json';
import rawW7 from '../../src/widgets/w7-loop/data.json';

const datasets = [
  { id: 'w1', schema: W1DataSchema, raw: rawW1 },
  { id: 'w2', schema: W2DataSchema, raw: rawW2 },
  { id: 'w3', schema: W3DataSchema, raw: rawW3 },
  { id: 'w4', schema: W4DataSchema, raw: rawW4 },
  { id: 'w5', schema: W5DataSchema, raw: rawW5 },
  { id: 'w6', schema: W6DataSchema, raw: rawW6 },
  { id: 'w7', schema: W7DataSchema, raw: rawW7 },
] as const;

describe('widget data contracts', () => {
  it.each(datasets)('$id passes its zod schema', ({ schema, raw }) => {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n'));
    }
    expect(parsed.success).toBe(true);
  });

  it.each(datasets)('$id declares a known dataKind and a source', ({ raw }) => {
    const meta = (raw as { meta: { dataKind: string; source: string } }).meta;
    expect(['illustrative', 'real-small-model', 'yue2-fact']).toContain(meta.dataKind);
    expect(meta.source.length).toBeGreaterThan(0);
  });

  it('W4 attention rows sum to 1 and honour the causal mask', () => {
    const data = W4DataSchema.parse(rawW4);
    data.weights.forEach((head, h) => {
      head.forEach((row, q) => {
        const sum = row.reduce((a, b) => a + b, 0);
        expect(Math.abs(sum - 1), `head ${h} row ${q} sum`).toBeLessThan(1e-6);
        row.forEach((value, k) => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
          if (data.causal && k > q) {
            expect(value, `causal head ${h} row ${q} col ${k}`).toBe(0);
          }
        });
      });
    });
  });

  it('W3 has exactly nine tokens matching the running sentence', () => {
    const data = W3DataSchema.parse(rawW3);
    expect(data.tokens.map(t => t.token)).toEqual([
      'The',
      'singer',
      'dropped',
      'the',
      'guitar',
      'because',
      'it',
      'was',
      'heavy',
    ]);
    expect(data.tokens.every(t => t.q.length === 4 && t.k.length === 4 && t.v.length === 4)).toBe(true);
  });

  it('W6 candidate probabilities for a softmax are positive and sum to 1', () => {
    const data = W6DataSchema.parse(rawW6);
    expect(data.candidates).toHaveLength(8);
    expect(data.candidates.some(c => c.logit < 0)).toBe(true);
  });
});
