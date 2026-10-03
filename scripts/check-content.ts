/**
 * Content lint (Build Spec §13.1 items 6–8). Fails the build on:
 *  - a step `newTerms` slug with no glossary entry
 *  - captions over 40 words / hooks over 25 words
 *  - a section missing a `breaksDown` analogy
 *  - an unverified fact cited in the UI
 *  - anthropomorphic language about YuE2
 *  - a runnable Python snippet without a committed file + expected output
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { YUE2_FACTS } from '../src/content/facts';
import { GLOSSARY } from '../src/content/glossary';
import { SECTION_W1 } from '../src/content/sections/w1-tokenization';
import { SECTION_W2 } from '../src/content/sections/w2-embeddings';
import { SECTION_W3 } from '../src/content/sections/w3-attention';
import { SECTION_W4 } from '../src/content/sections/w4-multihead';
import { SECTION_W5 } from '../src/content/sections/w5-block';
import { SECTION_W6 } from '../src/content/sections/w6-sampling';
import { SECTION_W7 } from '../src/content/sections/w7-loop';
import type { ConceptSection } from '../src/content/sections/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const glossarySlugs = new Set(GLOSSARY.map(g => g.slug));
const sections: ConceptSection[] = [
  SECTION_W1,
  SECTION_W2,
  SECTION_W3,
  SECTION_W4,
  SECTION_W5,
  SECTION_W6,
  SECTION_W7,
];

const problems: string[] = [];
const anthropomorphic = /\b(understands?|thinks?|feels?|is creative|dreams?|wants?|believes?)\b/i;

for (const s of sections) {
  if (s.hook.split(/\s+/).length > 25) problems.push(`${s.id}: hook exceeds 25 words`);
  if (s.analogy.breaksDown.trim().length <= 10) problems.push(`${s.id}: missing breaksDown`);
  if (s.recap.length !== 3) problems.push(`${s.id}: recap must have 3 bullets`);
  if (s.quiz.length !== 2) problems.push(`${s.id}: quiz must have 2 questions`);
  if (anthropomorphic.test(s.inYuE2.text)) {
    problems.push(`${s.id}: anthropomorphic wording in YuE2 callout`);
  }
  s.inYuE2.factIds.forEach(id => {
    if (!YUE2_FACTS[id]) problems.push(`${s.id}: unknown fact id ${id}`);
    else if (!YUE2_FACTS[id].verified) problems.push(`${s.id}: unverified fact ${id}`);
  });
  s.steps.forEach((step, i) => {
    if (step.caption.split(/\s+/).length > 40) {
      problems.push(`${s.id} step ${i}: caption exceeds 40 words`);
    }
    (step.newTerms ?? []).forEach(term => {
      if (!glossarySlugs.has(term)) problems.push(`${s.id} step ${i}: no glossary entry for "${term}"`);
    });
  });
  s.pythonCorner.forEach(snippet => {
    if (snippet.tag === 'runnable') {
      const py = path.join(repoRoot, 'src', 'content', 'python', snippet.file);
      if (!existsSync(py)) problems.push(`${s.id}: missing ${snippet.file}`);
      if (!snippet.expectedOutput) problems.push(`${s.id}: ${snippet.file} has no expected output`);
    }
  });
}

if (problems.length > 0) {
  console.error('Content lint failed:');
  problems.forEach(p => console.error(`  ❌ ${p}`));
  process.exit(1);
}
console.log(`Content lint passed for ${sections.length} sections, ${GLOSSARY.length} glossary terms.`);
