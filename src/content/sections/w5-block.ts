import type { ConceptSection } from './types';

export const SECTION_W5: ConceptSection = {
  id: 'block',
  title: 'The Transformer Block',
  subtitle: 'How the pieces connect',
  hook: 'Self-attention is only one component — how do all the stations link together on the factory floor?',
  analogy: {
    title: 'The Conveyor Belt Assembly Line',
    body: 'Imagine an assembly line. Each token rides a conveyor belt holding a folder of notes. As it travels down the line, stations add new findings to the folder. A bypass shortcut carries the original notes forward so nothing is ever erased.',
    breaksDown: 'In a real factory, each worker has a specialized craft and manual tools. In a transformer block, every station is simply matrix multiplication, addition, and scaling.',
  },
  dataKind: 'illustrative',
  badgeCustomText: 'Illustrative schematic of a standard transformer layer assembly line.',
  steps: [
    {
      caption: 'Our tokens enter the factory from the left: token chips with their integer IDs.',
      liveCaption: 'Tokens enter conveyor belt from left with IDs displayed.',
      newTerms: ['transformer'],
    },
    {
      caption: 'Station 1 (Embedding Lookup): Each token integer ID looks up its coordinate list in the embedding table, turning integers into vectors.',
      liveCaption: 'IDs transform into colored vector bars at the Embedding station.',
      newTerms: ['block'],
    },
    {
      caption: 'Station 2 (Position Stamp): Since attention treats all words as a bag of tokens, we add position numbers so the model knows the exact order.',
      liveCaption: 'Position indices added to each token vector with a clock stamp symbol.',
      newTerms: ['positional-information'],
    },
    {
      caption: 'Station 3 (Self-Attention + Shortcut): Tokens communicate with each other. Crucially, the result is added back onto the original belt via a shortcut (residual connection).',
      liveCaption: 'Tokens cross-communicate in attention; bypass wire routes original vector past the block.',
      newTerms: ['residual-connection'],
    },
    {
      caption: 'Station 4 (Normalisation): Like a sound compressor keeping audio levels comfortable, normalisation rescales the vector numbers to avoid wild runaway values.',
      liveCaption: 'Vector bars smoothed and bounded into a standardized range.',
      newTerms: ['normalisation'],
    },
    {
      caption: 'Station 5 (Feed-Forward): Attention let tokens talk to each other; now each token thinks privately through its own small neural network.',
      liveCaption: 'Each token passes through an isolated neural network box individually.',
      newTerms: ['feed-forward-network'],
    },
    {
      caption: 'Station 6 (The Stack): We repeat this entire block dozens of times! Early layers notice simple rhymes or syllables; deeper layers grasp musical harmony and song themes.',
      liveCaption: 'Block shrinks and repeats in a vertical stack of layers.',
    },
    {
      caption: 'Station 7 (Vocabulary Projection): The final layer projects the vector into raw scores (logits) for every single token in the vocabulary — setting up Section 6.',
      liveCaption: 'Output vector projects into raw score bars across all vocabulary items.',
      newTerms: ['logits'],
    },
  ],
  inYuE2: {
    text: 'YuE2’s backbone is an AR–NAR Mixture-of-Transformers. It stacks dozens of these transformer blocks to process prompts, compose ABC scores, and output semantic tokens before generating audio.',
    factIds: ['yue2-pipeline-stages', 'yue2-size'],
  },
  pythonCorner: [
    {
      title: 'A Minimal Transformer Block Skeleton in Python',
      file: 'transformer_block.py',
      tag: 'runnable',
      explanation: 'Illustrates the order of operations, residual connections (x = x + ...), and normalisation:',
      code: `def add_vectors(a, b):
    return [x + y for x, y in zip(a, b)]

def normalize(vec):
    # Toy mean-zero normalisation (subtract the average, keep the shape)
    mean = sum(vec) / len(vec)
    return [round(x - mean, 3) for x in vec]

def toy_self_attention(x):
    # Tokens share information (stub toy blend)
    return [0.15, -0.20, 0.35, 0.10]

def toy_feed_forward(x):
    # Token processes its own state privately
    return [round(val * 1.5, 3) for val in x]

# Input token vector
x = [0.80, -0.40, 0.20, 0.50]

# 1. Attention with Residual Shortcut: x = x + Attention(x)
attn_out = toy_self_attention(x)
x = add_vectors(x, attn_out)

# 2. Normalisation
x = normalize(x)

# 3. Feed-Forward with Residual Shortcut: x = x + FFN(x)
ffn_out = toy_feed_forward(x)
x = add_vectors(x, ffn_out)

# 4. Final Normalisation
x = normalize(x)

print("Output representation:", x)`,
      expectedOutput: `Output representation: [1.437, -2.437, 0.437, 0.563]`,
    },
  ],
  recap: [
    'A transformer block combines self-attention (tokens talking) with a feed-forward network (each token thinking alone).',
    'Residual shortcut connections (x = x + sublayer(x)) prevent earlier knowledge from getting lost.',
    'Dozens of identical blocks are stacked; lower layers notice local patterns, higher layers coordinate global song structure.',
  ],
  quiz: [
    {
      question: 'What is the purpose of a "residual connection" (the shortcut lane)?',
      options: [
        'To add the original input vector directly to the sublayer output so valuable information is not lost',
        'To erase all past words so the model forgets old context',
        'To encrypt the neural network weights from hackers',
        'To play a loud beep when generation finishes',
      ],
      answerIndex: 0,
      explanation: 'Residual connections preserve gradient flow and allow the network to add refinements to the token vector without destroying original signals.',
    },
    {
      question: 'What is the fundamental difference between the Attention station and the Feed-Forward station?',
      options: [
        'Attention requires an internet connection; feed-forward works offline',
        'Attention lets tokens exchange info with other tokens; feed-forward processes each token vector independently',
        'Attention is only used for music; feed-forward is only used for text',
        'Feed-forward converts audio files to MP3',
      ],
      answerIndex: 1,
      explanation: 'Attention enables communication across sequence positions; feed-forward allows each token vector to transform its own features in isolation.',
    },
  ],
};
