import type { ConceptSection } from './types';

export const SECTION_W2: ConceptSection = {
  id: 'embeddings',
  title: 'Embeddings',
  subtitle: 'Every token gets a spot on a map',
  hook: 'How can an equation know that "guitar" is closer to "piano" than to "kitchen"?',
  analogy: {
    title: 'The Conceptual City Map',
    body: 'Think of a tourist map of a city. Coffee shops naturally cluster near other cafés, music venues cluster in the arts district, and subway stations sit along transit lines. An embedding is a token’s GPS coordinate on a giant conceptual map.',
    breaksDown: 'A real city map has only two directions: North-South and East-West. In a language or music AI, the map has thousands of dimensions, and no human named the axes.',
  },
  dataKind: 'illustrative',
  badgeCustomText: 'Illustrative 8-dimensional vectors projected to 2D for visual intuition.',
  steps: [
    {
      caption: 'We start with our token chip for "guitar", which has an arbitrary integer ID like 204. But integer 204 tells the math nothing about what a guitar actually is.',
      liveCaption: 'Single token chip "guitar" with ID 204.',
      newTerms: ['embedding'],
    },
    {
      caption: 'The model looks up row 204 in an embedding table. An embedding is simply the row of numbers returned for that ID.',
      liveCaption: 'Embedding table row 204 lights up with a list of decimal values.',
      newTerms: ['vector'],
    },
    {
      caption: 'That row is a vector — an ordered list of numbers. Each number is called a dimension. In our toy model we use 8 numbers; real models use thousands.',
      liveCaption: 'Vector bars animate into view, displaying positive and negative coordinate heights.',
      newTerms: ['dimension'],
    },
    {
      caption: 'Look across our vocabulary: musical instruments like "guitar", "piano", and "drums" have similar vector patterns, while "sad" or "kitchen" look completely different.',
      liveCaption: 'Table showing 12 token vectors side by side with visible pattern alignments.',
      newTerms: ['similarity'],
    },
    {
      caption: 'When we project these vectors onto a 2D map, semantic clusters appear! Instruments group on one side, musical structure in another, emotions in a third.',
      liveCaption: 'Tokens fly into a 2D coordinate plane clustering by meaning.',
    },
    {
      caption: 'Calculating Euclidean distance between coordinates reveals the nearest neighbours. "Guitar" is nearest to "piano" (dist: 1.1) and "drums" (dist: 1.4), but far from "floor".',
      liveCaption: 'Selected token connects with dotted distance lines to its closest neighbours on the map.',
    },
  ],
  inYuE2: {
    text: 'YuE2 begins every stage by converting its text tokens, ABC musical notes, and discrete audio tokens into high-dimensional embedding vectors before feeding them to its transformer backbone.',
    factIds: ['yue2-task', 'yue2-pipeline-stages'],
  },
  pythonCorner: [
    {
      title: 'Finding Nearest Neighbours with Python’s math.dist',
      file: 'embeddings_distance.py',
      tag: 'runnable',
      explanation: 'Using standard Python 3.10+ math.dist to calculate distance between coordinate lists:',
      code: `import math

# Toy 4-dimensional embeddings for concepts
embeddings = {
    "guitar":  [ 0.82,  0.41, -0.15,  0.72],
    "piano":   [ 0.75,  0.48, -0.10,  0.68],
    "drums":   [ 0.65,  0.30,  0.22,  0.80],
    "kitchen": [-0.60, -0.72,  0.85, -0.40],
    "sad":     [-0.10,  0.88, -0.75, -0.20],
}

def find_nearest(target_word, table, top_n=2):
    target_vec = table[target_word]
    distances = []
    for word, vec in table.items():
        if word == target_word:
            continue
        dist = math.dist(target_vec, vec)
        distances.append((word, round(dist, 3)))
    distances.sort(key=lambda x: x[1])
    return distances[:top_n]

print("Nearest to 'guitar':", find_nearest("guitar", embeddings))`,
      expectedOutput: `Nearest to 'guitar': [('piano', 0.117), ('drums', 0.418)]`,
    },
  ],
  recap: [
    'An integer ID has no inherent meaning; an embedding turns each token into a rich list of numbers (a vector).',
    'Tokens with similar meanings or functions end up close together in high-dimensional embedding space.',
    'Measuring distance between vectors gives computers a mathematically precise way to judge conceptual similarity.',
  ],
  quiz: [
    {
      question: 'What is an "embedding" in plain terms?',
      options: [
        'A compressed MP3 file of a musical instrument',
        'A list of numbers that acts as coordinates for a token’s meaning',
        'A secret password required to unlock the AI model',
        'A font file used to print text on an album cover',
      ],
      answerIndex: 1,
      explanation: 'An embedding is simply a list of numbers (a vector) retrieved from a lookup table that represents where a token sits in meaning-space.',
    },
    {
      question: 'If two words are used in very similar contexts in songs, what happens to their embeddings?',
      options: [
        'Their coordinates will be close together, yielding a small distance',
        'Their token IDs will automatically be swapped',
        'One word will be deleted from the vocabulary',
        'Their numbers will multiply to zero',
      ],
      answerIndex: 0,
      explanation: 'During training, models adjust coordinates so that words appearing in similar contexts cluster close together.',
    },
  ],
};
