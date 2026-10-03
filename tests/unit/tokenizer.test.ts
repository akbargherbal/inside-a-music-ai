import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TOY_VOCAB,
  detokenize,
  tokenizeGreedy,
} from '../../src/lib/ml/tokenizer';

describe('greedy tokenizer', () => {
  it('splits the running example into the expected word pieces', () => {
    const tokens = tokenizeGreedy('Sunlight on the kitchen floor');
    expect(tokens.map(t => t.text)).toEqual([
      'Sun',
      'light',
      ' on',
      ' the',
      ' kitchen',
      ' floor',
    ]);
    expect(tokens.map(t => t.id)).toEqual([101, 102, 103, 104, 105, 106]);
  });

  it('round-trips any input: detokenize(tokenize(x)) === x', () => {
    for (const input of [
      'Sunlight on the kitchen floor',
      '',
      'Indie pop, warm female vocal',
      'guitar 🎸 音乐',
      '   leading and trailing   ',
    ]) {
      expect(detokenize(tokenizeGreedy(input))).toBe(input);
    }
  });

  it('falls back to the unknown id for characters outside the vocabulary', () => {
    const tokens = tokenizeGreedy('q', { a: 1 });
    expect(tokens).toHaveLength(1);
    expect(tokens[0].text).toBe('q');
    expect(tokens[0].id).toBe(DEFAULT_TOY_VOCAB['<unk>']);
  });

  it('handles a long input without dropping characters', () => {
    const long = 'Sunlight on the kitchen floor '.repeat(500);
    expect(detokenize(tokenizeGreedy(long))).toBe(long);
  });
});
