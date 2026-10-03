import { describe, expect, it } from 'vitest';
import { clampStep, parseSectionHash } from '../../src/lib/deep-link';

describe('parseSectionHash', () => {
  it('parses a section and a valid step', () => {
    expect(parseSectionHash('#attention?step=4')).toEqual({ section: 'attention', step: 4 });
  });

  it('parses a section with no step', () => {
    expect(parseSectionHash('#attention')).toEqual({ section: 'attention', step: null });
  });

  it('accepts the hash without the leading #', () => {
    expect(parseSectionHash('embeddings?step=2')).toEqual({ section: 'embeddings', step: 2 });
  });

  it.each(['#attention?step=-1', '#attention?step=abc', '#attention?step='])(
    'reports an invalid step as null for %s',
    hash => {
      expect(parseSectionHash(hash)).toEqual({ section: 'attention', step: null });
    }
  );

  it('an out-of-range step is clamped to the section bounds', () => {
    expect(clampStep(99, 8)).toBe(7);
    expect(clampStep(-3, 8)).toBe(0);
    expect(clampStep(4, 8)).toBe(4);
  });

  it('returns null for empty or missing sections', () => {
    expect(parseSectionHash('')).toBeNull();
    expect(parseSectionHash('#')).toBeNull();
    expect(parseSectionHash('#?step=1')).toBeNull();
  });
});
