import type { ConceptSection } from './types';

export const SECTION_W1: ConceptSection = {
  id: 'tokenization',
  title: 'Tokenization',
  subtitle: 'Everything becomes numbered bricks',
  hook: 'A computer cannot read words or listen to music directly — it only calculates with integers.',
  analogy: {
    title: 'The LEGO Catalogue',
    body: 'Imagine building a toy castle. Instead of sending the full plastic castle in the mail, you write down a list of part numbers from the official LEGO catalogue. The recipient looks up each number to find the exact brick.',
    breaksDown: 'LEGO bricks are thoughtfully designed by human engineers with obvious physical purposes. A model’s token catalogue is derived purely from machine statistics across gigabytes of text and audio.',
  },
  dataKind: 'illustrative',
  badgeCustomText: 'Illustrative toy tokenizer — demonstrating the exact logic used by real models.',
  steps: [
    {
      caption: 'We start with a plain line of song lyrics: "Sunlight on the kitchen floor". To us, this evokes a warm morning scene.',
      liveCaption: 'Raw text "Sunlight on the kitchen floor" displayed on screen.',
      newTerms: ['token', 'tokenizer'],
    },
    {
      caption: 'The tokenizer cuts the text into discrete chunks called tokens. Notice that "Sunlight" splits into "Sun" and "light" — pieces can be smaller than words.',
      liveCaption: 'Text splits into colorful rounded chips: Sun, light, on, the, kitchen, floor.',
      newTerms: ['vocabulary'],
    },
    {
      caption: 'Every token looks up its unique integer in a vocabulary dictionary. For example, "Sun" becomes 101 and "floor" becomes 106.',
      liveCaption: 'Each token chip displays its catalogue ID number beneath its label.',
      newTerms: ['id'],
    },
    {
      caption: 'The text disappears completely. All the model ever receives is an ordered list of integers: [101, 102, 103, 104, 105, 106].',
      liveCaption: 'Token chips collapse into a clean row of integer IDs.',
    },
    {
      caption: 'The exact same trick works on music notation! An ABC melody fragment (|CDEF G2E2|) splits into musical note tokens with their own IDs.',
      liveCaption: 'ABC music notation string splits into note token chips with integer IDs.',
      newTerms: ['abc-notation'],
    },
    {
      caption: 'And sound? A waveform gets sliced into tiny millisecond frames. Each frame matches the closest shape in a sound catalogue, turning audio into tokens.',
      liveCaption: 'Audio waveform slice mapped to discrete sound shape catalogue IDs.',
      newTerms: ['waveform'],
    },
  ],
  inYuE2: {
    text: 'YuE2 relies on tokenization across multiple stages: it reads lyrics via a Qwen-style BPE tokenizer (qwen.tiktoken), drafts musical scores in ABC notation, and uses discrete semantic tokens to organize song sections before synthesizing audio.',
    factIds: ['yue2-tokenizer-file', 'yue2-cot-abc', 'yue2-pipeline-stages'],
  },
  pythonCorner: [
    {
      title: 'A 10-Line Greedy Tokenizer in Pure Python',
      file: 'tokenizer.py',
      tag: 'runnable',
      explanation: 'Real tokenizers (like Byte-Pair Encoding) use similar lookup dictionaries. Run this directly in Python 3.10+:',
      code: `vocab = {
    "Sun": 101, "light": 102, " on": 103,
    " the": 104, " kitchen": 105, " floor": 106
}

text = "Sunlight on the kitchen floor"
tokens = []
cursor = 0

# Greedily match longest known vocabulary piece
while cursor < len(text):
    matched = False
    for piece in sorted(vocab.keys(), key=len, reverse=True):
        if text.startswith(piece, cursor):
            tokens.append(piece)
            cursor += len(piece)
            matched = True
            break
    if not matched:
        tokens.append(text[cursor])
        cursor += 1

token_ids = [vocab.get(t, -1) for t in tokens]
print("Tokens:", tokens)
print("IDs:   ", token_ids)`,
      expectedOutput: `Tokens: ['Sun', 'light', ' on', ' the', ' kitchen', ' floor']
IDs:    [101, 102, 103, 104, 105, 106]`,
    },
  ],
  recap: [
    'Computers cannot process raw characters or audio waves; they operate exclusively on numbers.',
    'A tokenizer slices text, sheet music, or audio into chunks called tokens and maps each to a vocabulary ID.',
    'Once tokenized, words and musical notes are treated identically: as an ordered list of integer IDs.',
  ],
  quiz: [
    {
      question: 'Why do modern models split words into sub-word tokens like "Sun" and "light"?',
      options: [
        'To save computer memory on vowels',
        'So rare or compound words can still be assembled from familiar pieces',
        'Because AI models cannot understand words longer than four letters',
        'To make the sound play faster in audio synthesis',
      ],
      answerIndex: 1,
      explanation: 'Sub-word tokenization lets the vocabulary remain compact while still being able to represent any rare or compound word by chaining smaller pieces together.',
    },
    {
      question: 'What is the only thing the transformer neural network receives at its input layer?',
      options: [
        'Audio vibrations directly from a microphone',
        'Formatted strings of text with grammatical labels',
        'An ordered list of integer token IDs',
        'A list of pre-rendered MP3 audio files',
      ],
      answerIndex: 2,
      explanation: 'The neural network never sees raw text strings or sound waves directly; it processes an ordered list of integer catalogue IDs.',
    },
  ],
};
