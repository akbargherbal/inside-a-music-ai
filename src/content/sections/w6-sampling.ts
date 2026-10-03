import type { ConceptSection } from './types';

export const SECTION_W6: ConceptSection = {
  id: 'sampling',
  title: 'Choosing the Next Token',
  subtitle: 'Rolling weighted dice',
  hook: 'How does an AI pick the next lyric: "Sunlight on the kitchen floor" or "table" or "dream"?',
  analogy: {
    title: 'The Weighted Multi-Sided Die',
    body: 'Imagine a die with one face for every word in the dictionary. But the faces are not equal: "floor" is wide and heavy, "table" is medium, and "purple" is a tiny sliver. When rolled, the widest faces win most often, but surprises can happen.',
    breaksDown: 'Real physical dice have fixed geometry. A model casts new weights fresh for every single token based on the entire evolving song so far.',
  },
  dataKind: 'illustrative',
  badgeCustomText: 'Illustrative 8 candidate tokens with live mathematical sampling.',
  steps: [
    {
      caption: 'Given "Sunlight on the kitchen ___", the model computes raw scores called logits for candidate words. Notice logits can be positive, zero, or negative.',
      liveCaption: 'Raw logits bars shown for 8 candidate words (floor, table, window, light, wall, sink, dream, purple).',
      newTerms: ['logits'],
    },
    {
      caption: 'Softmax turns raw logits into positive percentages that sum to 100%. "Floor" leads with ~45%, "table" has ~25%, and rare words get tiny percentages.',
      liveCaption: 'Logits convert into probability percentages summing to 100%.',
      newTerms: ['sampling'],
    },
    {
      caption: 'Temperature adjusts creativity: set it low (0.2) and the top choice dominates; set it high (1.5) and bars flatten, making surprising words more likely.',
      liveCaption: 'Temperature slider flattens or sharpens probability distribution bars.',
      newTerms: ['temperature'],
    },
    {
      caption: 'Top-K cuts off all but the K highest-probability tokens. If K=3, only "floor", "table", and "window" remain; all others are eliminated.',
      liveCaption: 'Top-K filter greys out candidates ranked below K and re-normalizes remaining bars.',
      newTerms: ['top-k'],
    },
    {
      caption: 'Top-P (nucleus sampling) keeps only the smallest set of top tokens whose cumulative probability reaches P (e.g. 85%), dynamically trimming the tail.',
      liveCaption: 'Top-P filter keeps candidates until cumulative sum reaches threshold P.',
      newTerms: ['top-p'],
    },
    {
      caption: 'Roll! The model picks one token using a seeded random roll. Using the exact same seed always reproduces the exact same roll!',
      liveCaption: 'Winner token chip slides into the blank sentence space with deterministic seed badge.',
      newTerms: ['seed'],
    },
    {
      caption: 'Classifier-Free Guidance (CFG): compares scores with the style prompt versus without it, boosting desired musical traits using cfg_scale.',
      liveCaption: 'Guidance comparison bars show prompt amplification via cfg_scale slider.',
      newTerms: ['classifier-free-guidance'],
    },
  ],
  inYuE2: {
    text: 'YuE2 relies on temperature and top-p sampling during autoregressive generation to ensure musical variety without falling into repetitive loops. It supports fixed seed= values for 100% reproducible songs and cfg_scale for classifier-free guidance.',
    factIds: ['yue2-seed-reproducibility', 'yue2-cfg-guidance', 'yue2-pipeline-stages'],
  },
  pythonCorner: [
    {
      title: 'Sampling with Temperature, Top-K, and Seed in Python',
      file: 'sampling_roll.py',
      tag: 'runnable',
      explanation: 'Notice how random.Random(seed).choices reproduces the identical roll every time:',
      code: `import math
import random

candidates = ["floor", "table", "window", "light", "wall", "sink", "dream", "purple"]
logits = [3.2, 2.5, 1.8, 1.2, 0.4, -0.2, -1.5, -2.8]

def sample_token(logits, temperature=0.8, top_k=4, seed=7):
    # 1. Apply temperature
    scaled = [l / temperature for l in logits]
    # 2. Softmax
    max_s = max(scaled)
    exps = [math.exp(s - max_s) for s in scaled]
    total = sum(exps)
    probs = [e / total for e in exps]
    
    # 3. Top-k filter
    indexed = sorted(list(enumerate(probs)), key=lambda x: x[1], reverse=True)[:top_k]
    k_indices, k_probs = zip(*indexed)
    k_sum = sum(k_probs)
    renorm = [p / k_sum for p in k_probs]
    
    # 4. Deterministic roll with fixed seed
    rng = random.Random(seed)
    chosen_idx = rng.choices(k_indices, weights=renorm, k=1)[0]
    return candidates[chosen_idx], round(probs[chosen_idx], 3)

word, prob = sample_token(logits, seed=7)
print(f"Sampled: '{word}' (prob: {prob}) with seed=7")`,
      expectedOutput: `Sampled: 'floor' (prob: 0.581) with seed=7`,
    },
  ],
  recap: [
    'Logits are raw scores that softmax transforms into percentage probabilities.',
    'Temperature controls peakiness (safe vs adventurous); Top-K and Top-P filter out improbable tail tokens.',
    'A fixed random seed guarantees that the same dice roll will occur every time, enabling reproducible song creation.',
  ],
  quiz: [
    {
      question: 'What happens when you increase the "temperature" parameter from 0.2 to 1.8?',
      options: [
        'The computer GPU temperature will rise and overheat',
        'Probabilities flatten across more tokens, making surprising or creative choices more likely',
        'The model will only ever pick the #1 top candidate',
        'The audio volume becomes twice as loud',
      ],
      answerIndex: 1,
      explanation: 'Higher temperature smooths out the probability distribution, giving lower-ranked candidate tokens a higher chance to be selected.',
    },
    {
      question: 'Why does providing a fixed "seed" value matter in generative music systems like YuE2?',
      options: [
        'It speeds up download times from Hugging Face',
        'It makes the pseudorandom generation 100% deterministic, letting you recreate the exact same song later',
        'It prevents the model from generating swear words',
        'It changes the audio format from WAV to MP3',
      ],
      answerIndex: 1,
      explanation: 'Random number generators are pseudorandom; initializing them with the same seed integer yields the exact same sequence of rolls.',
    },
  ],
};
