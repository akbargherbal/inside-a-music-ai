/**
 * Runs every `runnable` Python Corner snippet exactly as it appears on the page
 * and fails if stdout does not match the snippet's `expectedOutput`.
 *
 * Usage:
 *   tsx scripts/run-python-snippets.ts            # verify
 *   tsx scripts/run-python-snippets.ts --export   # also (re)write src/content/python/*
 *
 * `needs-gpu` snippets are never executed (Build Spec §11.1).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ConceptSection } from '../src/content/sections/types';
import { SECTION_W1 } from '../src/content/sections/w1-tokenization';
import { SECTION_W2 } from '../src/content/sections/w2-embeddings';
import { SECTION_W3 } from '../src/content/sections/w3-attention';
import { SECTION_W4 } from '../src/content/sections/w4-multihead';
import { SECTION_W5 } from '../src/content/sections/w5-block';
import { SECTION_W6 } from '../src/content/sections/w6-sampling';
import { SECTION_W7 } from '../src/content/sections/w7-loop';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const pythonDir = path.join(repoRoot, 'src', 'content', 'python');
const shouldExport = process.argv.includes('--export');

const sections: ConceptSection[] = [
  SECTION_W1,
  SECTION_W2,
  SECTION_W3,
  SECTION_W4,
  SECTION_W5,
  SECTION_W6,
  SECTION_W7,
];

const pythonBin = process.env.PYTHON_BIN || 'python3';

let failures = 0;
let checked = 0;

function normalize(text: string): string {
  return text.replace(/\r\n/g, '\n').trimEnd();
}

mkdirSync(pythonDir, { recursive: true });

for (const section of sections) {
  for (const snippet of section.pythonCorner) {
    if (snippet.tag === 'needs-gpu') {
      // Never executed. Just make sure the required GPU header is present.
      if (!snippet.code.includes('Requires: Linux')) {
        console.error(`❌ ${section.id}/${snippet.file}: needs-gpu snippet missing "Requires: Linux" header`);
        failures++;
      }
      continue;
    }

    checked++;
    const tmpFile = path.join(tmpdir(), `yue2_snippet_${section.id}_${snippet.file}`);
    writeFileSync(tmpFile, snippet.code, 'utf8');

    let stdout: string;
    try {
      stdout = execFileSync(pythonBin, [tmpFile], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (err) {
      const e = err as { stdout?: string; stderr?: string };
      console.error(`❌ ${section.id}/${snippet.file}: Python exited with an error`);
      console.error(e.stderr || e.stdout || String(err));
      failures++;
      continue;
    } finally {
      if (existsSync(tmpFile)) rmSync(tmpFile);
    }

    const expected = snippet.expectedOutput ?? '';
    if (normalize(stdout) !== normalize(expected)) {
      console.error(`❌ ${section.id}/${snippet.file}: stdout does not match expectedOutput`);
      console.error('--- expected ---\n' + expected);
      console.error('--- actual ---\n' + stdout);
      failures++;
    } else {
      console.log(`✅ ${section.id}/${snippet.file}`);
    }

    if (shouldExport) {
      const outPy = path.join(pythonDir, snippet.file);
      const outTxt = path.join(pythonDir, snippet.file.replace(/\.py$/, '.expected.txt'));
      writeFileSync(outPy, snippet.code.replace(/\s+$/, '') + '\n', 'utf8');
      writeFileSync(outTxt, expected.replace(/\s+$/, '') + '\n', 'utf8');
    } else {
      // Verify the committed mirror exists and matches the inline snippet.
      const outPy = path.join(pythonDir, snippet.file);
      const outTxt = path.join(pythonDir, snippet.file.replace(/\.py$/, '.expected.txt'));
      if (!existsSync(outPy) || !existsSync(outTxt)) {
        console.error(`❌ ${section.id}/${snippet.file}: missing committed mirror in src/content/python/`);
        failures++;
      } else {
        const fileCode = readFileSync(outPy, 'utf8');
        const fileOut = readFileSync(outTxt, 'utf8');
        if (normalize(fileCode) !== normalize(snippet.code) || normalize(fileOut) !== normalize(expected)) {
          console.error(`❌ ${section.id}/${snippet.file}: committed mirror drifted from section content`);
          failures++;
        }
      }
    }
  }
}

if (shouldExport) {
  console.log(`Exported ${checked} runnable snippets to src/content/python/`);
}

console.log(`\nPython snippets: ${checked} runnable checked, ${failures} failed.`);
if (failures > 0) process.exit(1);
