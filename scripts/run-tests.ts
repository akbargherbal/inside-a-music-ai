import { dot, euclideanDistance } from '../src/lib/ml/math';
import { softmax } from '../src/lib/ml/softmax';
import { singleHeadAttention, computeAttentionMatrix } from '../src/lib/ml/attention';
import { applyTemperature, applyTopK, applyTopP, sampleCategorical } from '../src/lib/ml/sampling';
import { tokenizeGreedy } from '../src/lib/ml/tokenizer';
import { createMulberry32 } from '../src/lib/rng';

import { YUE2_FACTS } from '../src/content/facts';
import { GLOSSARY } from '../src/content/glossary';

import { SECTION_W1 } from '../src/content/sections/w1-tokenization';
import { SECTION_W2 } from '../src/content/sections/w2-embeddings';
import { SECTION_W3 } from '../src/content/sections/w3-attention';
import { SECTION_W4 } from '../src/content/sections/w4-multihead';
import { SECTION_W5 } from '../src/content/sections/w5-block';
import { SECTION_W6 } from '../src/content/sections/w6-sampling';
import { SECTION_W7 } from '../src/content/sections/w7-loop';

import { getSceneState as getW1Scene } from '../src/widgets/w1-tokenization/scene';
import { W1DataSchema } from '../src/widgets/w1-tokenization/schema';
import rawW1 from '../src/widgets/w1-tokenization/data.json';

import { getSceneState as getW2Scene } from '../src/widgets/w2-embeddings/scene';
import { W2DataSchema } from '../src/widgets/w2-embeddings/schema';
import rawW2 from '../src/widgets/w2-embeddings/data.json';

import { getSceneState as getW3Scene } from '../src/widgets/w3-attention/scene';
import { W3DataSchema } from '../src/widgets/w3-attention/schema';
import rawW3 from '../src/widgets/w3-attention/data.json';

import { getSceneState as getW4Scene } from '../src/widgets/w4-multihead/scene';
import { W4DataSchema } from '../src/widgets/w4-multihead/schema';
import rawW4 from '../src/widgets/w4-multihead/data.json';

import { getSceneState as getW5Scene } from '../src/widgets/w5-block/scene';
import { W5DataSchema } from '../src/widgets/w5-block/schema';
import rawW5 from '../src/widgets/w5-block/data.json';

import { getSceneState as getW6Scene } from '../src/widgets/w6-sampling/scene';
import { W6DataSchema } from '../src/widgets/w6-sampling/schema';
import rawW6 from '../src/widgets/w6-sampling/data.json';

import { getSceneState as getW7Scene } from '../src/widgets/w7-loop/scene';
import { W7DataSchema } from '../src/widgets/w7-loop/schema';
import rawW7 from '../src/widgets/w7-loop/data.json';

import goldenAttention from '../tests/fixtures/golden-attention.json';
import goldenSampling from '../tests/fixtures/golden-sampling.json';

let failed = 0;
let passed = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  } else {
    passed++;
  }
}

function approxEqual(a: number, b: number, epsilon = 1e-4) {
  return Math.abs(a - b) < epsilon;
}

console.log('--- 1. Testing Pure ML Core Functions ---');
// Softmax
const sm = softmax([1.0, 2.0, 3.0]);
const smSum = sm.reduce((a, b) => a + b, 0);
assert(approxEqual(smSum, 1.0), 'Softmax weights sum to 1.0');
assert(sm[2] > sm[1] && sm[1] > sm[0], 'Softmax preserves monotonic ordering');

// Numerical stability of softmax
const largeSm = softmax([1000, 1001, 1002]);
const largeSum = largeSm.reduce((a, b) => a + b, 0);
assert(approxEqual(largeSum, 1.0), 'Softmax handles large values without overflow NaN');

// Dot product
assert(dot([1, 2], [3, 4]) === 11, 'Dot product is correct');

// Distance
assert(approxEqual(euclideanDistance([0, 0], [3, 4]), 5.0), 'Euclidean distance is correct');

// Tokenizer
const tokens = tokenizeGreedy('Sunlight on the kitchen floor');
assert(tokens.length === 6, 'Tokenizer tokenized 6 chunks');
assert(tokens[0].text === 'Sun' && tokens[1].text === 'light', 'Word-piece split works');

// Mulberry32 deterministic PRNG
const rng1 = createMulberry32(42);
const rng2 = createMulberry32(42);
const roll1 = [rng1(), rng1(), rng1()];
const roll2 = [rng2(), rng2(), rng2()];
assert(
  roll1.every((v, i) => approxEqual(v, roll2[i])),
  'Mulberry32 produces identical sequence for same seed'
);

console.log('--- 2. Testing Golden Cross-Check Fixtures ---');
// Golden Attention
const goldenAttResult = singleHeadAttention(
  goldenAttention.query,
  goldenAttention.keys,
  goldenAttention.keys // values dummy
);
goldenAttResult.scores.forEach((s, idx) => {
  assert(
    approxEqual(s, goldenAttention.expectedRawScores[idx], 1e-3),
    `Golden attention score index ${idx} matches`
  );
});
goldenAttResult.weights.forEach((w, idx) => {
  assert(
    approxEqual(w, goldenAttention.expectedSoftmaxWeights[idx], 1e-3),
    `Golden attention weight index ${idx} matches`
  );
});

// Golden Sampling
const scaledLogits = applyTemperature(goldenSampling.logits, goldenSampling.temperature);
const sampledProbs = softmax(scaledLogits);
const candidates = goldenSampling.candidates.map((t, idx) => ({
  id: idx,
  token: t,
  logit: goldenSampling.logits[idx],
  prob: sampledProbs[idx],
}));
const topKFiltered = applyTopK(candidates, goldenSampling.topK);
const sampledWinner = sampleCategorical(topKFiltered, createMulberry32(goldenSampling.seed));
assert(
  sampledWinner.token === goldenSampling.expectedSampledToken,
  `Golden sampling winner token matches '${goldenSampling.expectedSampledToken}'`
);

console.log('--- 3. Testing Section Structure & Content Rules ---');
const sections = [
  SECTION_W1,
  SECTION_W2,
  SECTION_W3,
  SECTION_W4,
  SECTION_W5,
  SECTION_W6,
  SECTION_W7,
];

sections.forEach(sec => {
  assert(sec.hook.split(' ').length <= 25, `Section ${sec.id} hook <= 25 words`);
  assert(sec.analogy.breaksDown.length > 10, `Section ${sec.id} has required breaksDown`);
  assert(sec.recap.length === 3, `Section ${sec.id} has exactly 3 recap bullets`);
  assert(sec.quiz.length === 2, `Section ${sec.id} has exactly 2 quiz questions`);
  sec.quiz.forEach((q, qIdx) => {
    assert(q.explanation.length > 10, `Quiz ${sec.id} #${qIdx + 1} has explanation`);
  });

  sec.steps.forEach((st, sIdx) => {
    const wordCount = st.caption.split(/\s+/).length;
    assert(
      wordCount <= 40,
      `Section ${sec.id} step ${sIdx} caption (${wordCount} words) is <= 40 words`
    );
  });

  sec.inYuE2.factIds.forEach(fId => {
    const fact = YUE2_FACTS[fId];
    assert(!!fact, `Fact ID ${fId} exists in facts.ts`);
    assert(fact?.verified === true, `Fact ID ${fId} is verified: true`);
  });
});

console.log('--- 4. Testing Widget Data Schemas ---');
W1DataSchema.parse(rawW1);
W2DataSchema.parse(rawW2);
W3DataSchema.parse(rawW3);
W4DataSchema.parse(rawW4);
W5DataSchema.parse(rawW5);
W6DataSchema.parse(rawW6);
W7DataSchema.parse(rawW7);
assert(true, 'All widget data.json passed Zod schemas');

console.log('--- 5. Testing Scene State Pure Functions (Forward and Backward) ---');
const w1Data = W1DataSchema.parse(rawW1);
for (let s = 0; s < 6; s++) {
  const state = getW1Scene(s, w1Data);
  assert(state.step === s, `W1 scene step ${s} matches`);
}
// Backward test
const w1_step2 = getW1Scene(2, w1Data);
getW1Scene(3, w1Data);
const w1_step2_again = getW1Scene(2, w1Data);
assert(
  JSON.stringify(w1_step2) === JSON.stringify(w1_step2_again),
  'W1 step n -> n+1 -> n is 100% deterministic pure function'
);

const w3Data = W3DataSchema.parse(rawW3);
const w3Scene = getW3Scene(4, w3Data);
assert(w3Scene.highestWeightIndex === 4, 'W3 step 4 highest weight is "guitar" (index 4)');

const w6Data = W6DataSchema.parse(rawW6);
const w6Scene = getW6Scene(5, w6Data, { seed: 7 });
assert(w6Scene.winner?.token === 'floor', 'W6 step 5 seed 7 samples "floor"');

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
