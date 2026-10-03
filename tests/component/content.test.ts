import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { YUE2_FACTS } from '../../src/content/facts';
import { GLOSSARY } from '../../src/content/glossary';
import { SECTION_W1 } from '../../src/content/sections/w1-tokenization';
import { SECTION_W2 } from '../../src/content/sections/w2-embeddings';
import { SECTION_W3 } from '../../src/content/sections/w3-attention';
import { SECTION_W4 } from '../../src/content/sections/w4-multihead';
import { SECTION_W5 } from '../../src/content/sections/w5-block';
import { SECTION_W6 } from '../../src/content/sections/w6-sampling';
import { SECTION_W7 } from '../../src/content/sections/w7-loop';
import type { ConceptSection } from '../../src/content/sections/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const sections: ConceptSection[] = [
  SECTION_W1,
  SECTION_W2,
  SECTION_W3,
  SECTION_W4,
  SECTION_W5,
  SECTION_W6,
  SECTION_W7,
];
const glossarySlugs = new Set(GLOSSARY.map(g => g.slug));

describe('section template completeness', () => {
  it.each(sections)('$id has a hook of at most 25 words', s => {
    expect(s.hook.split(/\s+/).length).toBeLessThanOrEqual(25);
  });

  it.each(sections)('$id has a non-empty "where the analogy breaks"', s => {
    expect(s.analogy.breaksDown.trim().length).toBeGreaterThan(10);
  });

  it.each(sections)('$id has captions of at most 40 words', s => {
    s.steps.forEach((step, i) =>
      expect(step.caption.split(/\s+/).length, `step ${i}`).toBeLessThanOrEqual(40)
    );
  });

  it.each(sections)('$id has exactly 3 recap bullets and 2 explained quizzes', s => {
    expect(s.recap).toHaveLength(3);
    expect(s.quiz).toHaveLength(2);
    s.quiz.forEach(q => {
      expect(q.explanation.length).toBeGreaterThan(10);
      expect(q.answerIndex).toBeGreaterThanOrEqual(0);
      expect(q.answerIndex).toBeLessThan(q.options.length);
    });
  });

  it.each(sections)('$id cites only verified YuE2 facts', s => {
    expect(s.inYuE2.factIds.length).toBeGreaterThan(0);
    s.inYuE2.factIds.forEach(id => {
      expect(YUE2_FACTS[id], `fact ${id}`).toBeDefined();
      expect(YUE2_FACTS[id].verified).toBe(true);
    });
  });

  it.each(sections)('$id introduces only glossary-defined terms', s => {
    s.steps.forEach((step, i) => {
      (step.newTerms ?? []).forEach(term => {
        expect(glossarySlugs.has(term), `${s.id} step ${i} term "${term}"`).toBe(true);
      });
    });
  });
});

describe('python corners', () => {
  it.each(sections)('$id has a python corner with a committed file and expected output', s => {
    expect(s.pythonCorner.length).toBeGreaterThan(0);
    s.pythonCorner.forEach(snippet => {
      if (snippet.tag === 'runnable') {
        const py = path.join(repoRoot, 'src', 'content', 'python', snippet.file);
        expect(existsSync(py), `${snippet.file} missing`).toBe(true);
        const txt = path.join(
          repoRoot,
          'src',
          'content',
          'python',
          snippet.file.replace(/\.py$/, '.expected.txt')
        );
        expect(existsSync(txt), `${snippet.file} expected output missing`).toBe(true);
        expect(snippet.expectedOutput?.length ?? 0).toBeGreaterThan(0);
      } else {
        // needs-gpu snippets are reference-only and must carry the GPU header.
        expect(snippet.code).toContain('Requires: Linux');
      }
    });
  });
});

describe('facts register', () => {
  it('every fact has a source and a URL', () => {
    Object.values(YUE2_FACTS).forEach(fact => {
      expect(fact.source.length).toBeGreaterThan(0);
      expect(fact.url).toMatch(/^https:\/\//);
    });
  });

  it('all currently displayed facts are verified', () => {
    Object.values(YUE2_FACTS).forEach(fact => expect(fact.verified).toBe(true));
  });
});
