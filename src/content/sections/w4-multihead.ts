import type { ConceptSection } from './types';

export const SECTION_W4: ConceptSection = {
  id: 'multihead',
  title: 'Multi-Head Attention',
  subtitle: 'Several ways of looking at once',
  hook: 'A word has grammar, emotion, rhyming, and rhythm — how can one attention calculation track all four?',
  analogy: {
    title: 'The Film Crew Reviewing a Take',
    body: 'When reviewing a film scene, the director watches actor emotions, the audio technician listens for microphone buzz, and the lighting designer checks shadow consistency. Afterwards, they merge their notes into one unified assessment.',
    breaksDown: 'In a real film crew, specialists are hired with explicit job descriptions. In a transformer, attention heads learn their own specialized habits automatically during training without human job titles.',
  },
  dataKind: 'illustrative',
  badgeCustomText: 'Illustrative 4-head attention patterns showing distinct linguistic specializations.',
  steps: [
    {
      caption: 'In the previous section we watched a single attention heatmap. We call this "one attention head" — a single viewpoint on the sentence.',
      liveCaption: 'Single attention heatmap from Section 3 shown on screen.',
      newTerms: ['head'],
    },
    {
      caption: 'Instead of relying on one viewpoint, transformers run several attention heads side by side. Our single heatmap splits into four distinct heads.',
      liveCaption: 'Single heatmap splits into 4 smaller heatmaps displayed in a 2x2 grid.',
      newTerms: ['multi-head-attention'],
    },
    {
      caption: 'Each head receives its own separate set of Query, Key, and Value projection weights, allowing each to notice completely different patterns in the same sentence.',
      liveCaption: 'Four heatmaps side by side with the 9-token sentence on both axes.',
    },
    {
      caption: 'Look at their habits: Head 1 tracks grammar ("look one word back"), Head 2 links pronouns to objects, Head 3 anchors on the sentence subject, and Head 4 connects verbs to their objects.',
      liveCaption: 'Four head cards describe illustrative linguistic specializations.',
    },
    {
      caption: 'Hovering over token "it" highlights its row in all four heads at the same time. The exact same word is simultaneously interpreted through four different lenses.',
      liveCaption: 'Row for "it" highlighted across all four heatmaps with interactive cell inspection.',
    },
    {
      caption: 'Finally, the four output vectors are joined together (concatenated) and passed through a projection matrix, producing one rich, multi-faceted vector.',
      liveCaption: 'Four output vectors merge end-to-end into one combined vector.',
      newTerms: ['concatenate'],
    },
  ],
  inYuE2: {
    text: 'YuE2’s transformer backbone employs dozens of parallel attention heads across its layers. This lets the model simultaneously track lyrical meaning, rhythmic meter, harmonic chord progressions, and vocal phrasing.',
    factIds: ['yue2-task', 'yue2-size', 'yue2-pipeline-stages'],
  },
  pythonCorner: [
    {
      title: 'Multi-Head Attention and Concatenation in Python',
      file: 'multi_head_attention.py',
      tag: 'runnable',
      explanation: 'Running 4 separate attention calculations and concatenating their results:',
      code: `def single_head_toy(q, k, v):
    # Simplified dot and blend
    score = sum(a * b for a, b in zip(q, k))
    return [score * x for x in v]

def multi_head_attention(queries, keys, values, num_heads=4):
    head_outputs = []
    for h in range(num_heads):
        # Each head has distinct projections (toy mock slices)
        out_h = single_head_toy(queries[h], keys[h], values[h])
        head_outputs.append(out_h)
    
    # Concatenate: join all head outputs end-to-end
    combined_vector = []
    for out in head_outputs:
        combined_vector.extend(out)
    return combined_vector

# 4 heads with 2 dimensions each
q_heads = [[0.8, 0.2], [0.1, 0.9], [0.5, 0.5], [0.3, 0.7]]
k_heads = [[0.9, 0.1], [0.2, 0.8], [0.6, 0.4], [0.4, 0.6]]
v_heads = [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [0.5, 0.5]]

combined = multi_head_attention(q_heads, k_heads, v_heads, num_heads=4)
print("Heads count:       ", 4)
print("Output dimensions: ", len(combined))
print("Combined vector:   ", [round(x, 2) for x in combined])`,
      expectedOutput: `Heads count:        4
Output dimensions:  8
Combined vector:    [0.74, 0.0, 0.0, 0.74, 0.5, 0.5, 0.27, 0.27]`,
    },
  ],
  recap: [
    'A single attention head can only focus on one type of relationship at a time.',
    'Multi-head attention runs several independent attention views in parallel on the same tokens.',
    'Concatenating the outputs combines grammatical, musical, and semantic insights into one unified vector.',
  ],
  quiz: [
    {
      question: 'Why do modern music and language models use multiple attention heads instead of just one large head?',
      options: [
        'To reduce electricity consumption on laptops',
        'So the model can attend to multiple relationships (e.g. rhythm, rhyming, grammar) simultaneously',
        'Because computer chips can only perform math with even numbers',
        'To store the song in four different audio file formats',
      ],
      answerIndex: 1,
      explanation: 'Different heads learn different patterns: one might link pronouns to nouns, while another tracks musical cadence or rhyming schemes.',
    },
    {
      question: 'What does "concatenate" mean when merging head outputs?',
      options: [
        'Averaging all the numbers together into a single float',
        'Deleting the outputs from the slowest heads',
        'Joining the lists end-to-end to form one longer list of numbers',
        'Encrypting the vectors with an authentication key',
      ],
      answerIndex: 2,
      explanation: 'Concatenation simply connects the output vectors side-by-side (e.g. four 64-element vectors become one 256-element vector).',
    },
  ],
};
