import type { ConceptSection } from './types';

export const SECTION_W3: ConceptSection = {
  id: 'attention',
  title: 'Self-Attention',
  subtitle: 'Who should I listen to?',
  hook: 'In "The singer dropped the guitar because it was heavy", how does a machine know what "it" refers to?',
  analogy: {
    title: 'The Library Index (Query, Key, Value)',
    body: 'Imagine you want information in a library. Your Query is what you write in the search box ("heavy wooden instrument"). The Key is the topic label printed on each book’s spine. The Value is the actual knowledge inside the book. When a Key matches your Query, you read that book’s Value.',
    breaksDown: 'In a real library, a human reads words with conscious intent. In self-attention, "matching" is just arithmetic: multiplying matching numbers in lists and adding them up.',
  },
  dataKind: 'illustrative',
  badgeCustomText: 'Illustrative 4-element vectors computed live via real dot product & softmax.',
  steps: [
    {
      caption: 'Consider our sentence: "The singer dropped the guitar because it was heavy". Look at token 6, "it". Alone, "it" is meaningless — it needs context.',
      liveCaption: '9 token chips shown: The singer dropped the guitar because it was heavy.',
      newTerms: ['context', 'self-attention'],
    },
    {
      caption: 'Self-attention allows "it" to reach out and inspect every other token in the sentence to decide who holds the information it needs.',
      liveCaption: 'Arcs reach out from "it" to earlier words in the sequence.',
    },
    {
      caption: 'Every token generates three separate lists of numbers: Query (what I need), Key (what I offer), and Value (my actual contents).',
      liveCaption: 'Query (cyan), Key (purple), and Value (amber) vector bars appear under each token chip.',
      newTerms: ['query', 'key', 'value'],
    },
    {
      caption: 'We compare "it"’s Query against every other token’s Key. We multiply matching positions and add them up (the dot product) to calculate an attention score.',
      liveCaption: 'Pairwise score calculations displayed between Query of "it" and Keys of other tokens.',
      newTerms: ['score', 'dot-product'],
    },
    {
      caption: 'We run these scores through softmax, converting them into positive percentages that sum to 100%. "Guitar" wins with the highest percentage!',
      liveCaption: 'Softmax percentages shown; guitar receives ~58% attention weight.',
      newTerms: ['softmax'],
    },
    {
      caption: 'Each token’s Value vector is scaled by its percentage and blended together into a new vector for "it". "It" now carries the rich meaning of "guitar".',
      liveCaption: 'Value vectors fly toward "it" and blend into an updated green representation.',
    },
    {
      caption: 'Zooming out: every word does this at once, forming a 9×9 attention heatmap where rows are who is looking and columns are who is looked at.',
      liveCaption: 'Full 9x9 attention heatmap grid displayed with row "it" highlighted.',
      newTerms: ['heatmap'],
    },
    {
      caption: 'When generating new text or music, the model must not peek ahead. A causal mask greys out future cells, forcing each word to look only backward.',
      liveCaption: 'Upper triangle of heatmap masked out with diagonal line; rows re-normalized.',
      newTerms: ['causal-mask'],
    },
  ],
  inYuE2: {
    text: 'Self-attention is the beating heart of YuE2’s transformer backbone. During autoregressive generation of symbolic ABC scores and semantic tokens, causal self-attention ensures each musical note attends only to the notes and lyrics that came before it.',
    factIds: ['yue2-task', 'yue2-pipeline-stages'],
  },
  pythonCorner: [
    {
      title: 'Single-Head Attention in Pure Python (Stdlib Only)',
      file: 'attention_single_head.py',
      tag: 'runnable',
      explanation: 'Notice how dot product, softmax, and weighted blending match the animated widget steps exactly:',
      code: `import math

def dot_product(vec_a, vec_b):
    return sum(a * b for a, b in zip(vec_a, vec_b))

def softmax(scores):
    max_s = max(scores)
    exps = [math.exp(s - max_s) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]

# Query for "it", and Keys for ["The", "singer", "dropped", "guitar"]
q_it = [0.85, 0.10, 0.40, 0.90]
keys = [
    [0.10, 0.05, 0.20, 0.10], # "The"
    [0.40, 0.70, 0.30, 0.20], # "singer"
    [0.20, 0.30, 0.80, 0.10], # "dropped"
    [0.80, 0.15, 0.35, 0.95], # "guitar"
]

scale = math.sqrt(len(q_it)) # sqrt(d_k)
raw_scores = [dot_product(q_it, k) / scale for k in keys]
weights = softmax(raw_scores)

print("Raw scores: ", [round(s, 3) for s in raw_scores])
print("Softmax %:  ", [round(w * 100, 1) for w in weights])
print("Winner:      Index", weights.index(max(weights)), "(guitar)")`,
      expectedOutput: `Raw scores:  [0.13, 0.355, 0.305, 0.845]
Softmax %:   [18.2, 22.8, 21.7, 37.2]
Winner:      Index 3 (guitar)`,
    },
  ],
  recap: [
    'Self-attention calculates pairwise relevance between all tokens in a sequence so words understand their context.',
    'Query (what I need) matches Key (what I offer) via dot product; softmax turns raw scores into percentages.',
    'Causal masking prevents the model from peeking at future tokens during generation.',
  ],
  quiz: [
    {
      question: 'What is the role of the Query vector in self-attention?',
      options: [
        'It stores the raw audio recording of the singer',
        'It represents what information the current token is actively searching for in other tokens',
        'It shuts down the computer when the song ends',
        'It checks the user’s credit card balance',
      ],
      answerIndex: 1,
      explanation: 'The Query vector acts like a search query, comparing itself against every token’s Key vector to find relevant context.',
    },
    {
      question: 'Why do autoregressive models apply a "causal mask" during generation?',
      options: [
        'To speed up CPU clock speed',
        'To disguise the identity of the human author',
        'To prevent tokens from looking ahead at future words that have not been generated yet',
        'To eliminate negative numbers from the vector',
      ],
      answerIndex: 2,
      explanation: 'A causal mask zeroes out future positions so the model only attends to past context, mirroring real-time forward generation.',
    },
  ],
};
