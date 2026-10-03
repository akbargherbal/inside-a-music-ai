import type { ConceptSection } from './types';

export const SECTION_W7: ConceptSection = {
  id: 'loop',
  title: 'The Generation Loop',
  subtitle: 'One token at a time, over and over',
  hook: 'How does an AI write a 3-minute song when it only knows how to pick a single next token?',
  analogy: {
    title: 'Smartphone Autocomplete on Repeat',
    body: 'Open your phone’s keyboard, type "I love", and repeatedly tap the middle suggestion button: "I love listening to music on the weekend...". Each tap appends a word and feeds the entire expanded phrase right back into the keyboard.',
    breaksDown: 'Your phone uses a tiny, local n-gram statistical model. A music AI re-evaluates the entire song structure through dozens of heavy transformer layers for every single token.',
  },
  dataKind: 'illustrative',
  badgeCustomText: 'Illustrative autoregressive loop with deterministic seeded rollout.',
  steps: [
    {
      caption: 'We start with our initial prompt: "Sunlight on the". The model box in front of us is the full stack of everything we explored in Sections 1 through 5.',
      liveCaption: 'Initial prompt chips enter model input slot: Sunlight on the.',
      newTerms: ['autoregressive'],
    },
    {
      caption: 'The model processes the entire prompt and produces a probability distribution for what could possibly follow next: "kitchen" leads comfortably.',
      liveCaption: 'Model computes next-token probability bars; kitchen is selected.',
    },
    {
      caption: 'We sample one token ("kitchen") and slide it into the sequence. Our text is now one token longer: "Sunlight on the kitchen".',
      liveCaption: 'New token chip slides smoothly into the output row.',
    },
    {
      caption: 'The entire expanded sequence loops right back into the model’s input. The model does not remember past runs; it simply re-reads the full context.',
      liveCaption: 'Animated loop arrow sends extended sequence back into model input.',
      newTerms: ['context'],
    },
    {
      caption: 'The cycle repeats: "floor", then "glows", until the model samples a special <end> stop token, halting the loop cleanly.',
      liveCaption: 'Loop repeats 3 times, ending with stop token <end>.',
      newTerms: ['stop-token'],
    },
    {
      caption: 'We now have our completed sequence! Clicking any past step in the timeline lets us inspect the exact probability distribution that generated that word.',
      liveCaption: 'Interactive decision timeline shows each token choice along with its candidate probabilities.',
    },
    {
      caption: 'In YuE2, this loop drafts the musical score and semantic tokens. But acoustic details are created differently: via flow matching, which refines sound in parallel!',
      liveCaption: 'Diagram contrasts autoregressive score writing with non-autoregressive flow matching.',
      newTerms: ['non-autoregressive', 'flow-matching', 'semantic-tokens', 'acoustic-latents'],
    },
  ],
  inYuE2: {
    text: 'YuE2 divides song generation into autoregressive (AR) and non-autoregressive (NAR) stages: AR is used for the symbolic ABC score and semantic tokens; NAR flow matching is then used to synthesize continuous acoustic latents before the neural VAE decodes them into 48 kHz audio.',
    factIds: ['yue2-pipeline-stages', 'yue2-audio-spec', 'yue2-task'],
  },
  pythonCorner: [
    {
      title: 'A 15-Line Autoregressive Generation Loop in Python',
      file: 'generation_loop.py',
      tag: 'runnable',
      explanation: 'A pure Python simulation showing how text loops back into the context until <end> is reached:',
      code: `import random

# Toy transition probability table (next word options)
transitions = {
    "the":     ["kitchen", "room"],
    "kitchen": ["floor", "table"],
    "floor":   ["glows", "creaks"],
    "glows":   ["<end>"],
    "creaks":  ["<end>"],
}

def generate_song_line(prompt=["Sunlight", "on", "the"], seed=42):
    rng = random.Random(seed)
    tokens = list(prompt)
    
    while tokens[-1] != "<end>" and len(tokens) < 8:
        last = tokens[-1]
        options = transitions.get(last, ["<end>"])
        next_token = rng.choice(options)
        tokens.append(next_token)
        
    return " ".join(tokens[:-1]) # Strip <end>

result = generate_song_line(seed=42)
print("Generated line:", result)`,
      expectedOutput: `Generated line: Sunlight on the kitchen floor glows`,
    },
    {
      title: 'YuE2 Official Pipeline Inference Usage (Hugging Face)',
      file: 'yue2_official_inference.py',
      tag: 'needs-gpu',
      explanation: 'Official pipeline usage from the YuE2-3B model card. Requires Linux, Python 3.10+, and a 24 GB NVIDIA GPU:',
      code: `# Requires: Linux, 24GB NVIDIA GPU, torch, transformers
from yue2 import YuE2Pipeline
import torch

# Load the official model weights
pipe = YuE2Pipeline.from_pretrained(
    "m-a-p/YuE2-3B",
    torch_dtype=torch.bfloat16,
    device_map="cuda"
)

# Generate a complete song from lyrics and style description
audio_tensor = pipe(
    prompt="Indie pop, warm female vocal, acoustic guitar, soft drums",
    lyrics="Sunlight on the kitchen floor\\nCoffee brewing in the morning light",
    cot="full",        # CoT: generate melody + chords in ABC notation first
    cfg_scale=4.5,     # Classifier-Free Guidance strength
    seed=42,           # Deterministic reproducible seed
)

# Save to 48 kHz stereo WAV file
pipe.save_audio(audio_tensor, "output_song.wav")
print("Song generated at 48 kHz stereo!")`,
    },
  ],
  recap: [
    'An autoregressive model generates one token at a time, appending it and re-feeding the expanded sequence back into the input.',
    'A designated stop token tells the loop when the musical phrase or song has concluded.',
    'YuE2 uses this loop for symbolic planning and semantic drafting, then applies non-autoregressive flow matching for fine audio textures.',
  ],
  quiz: [
    {
      question: 'What does "autoregressive" mean in generative AI?',
      options: [
        'The model automatically increases the volume of the audio track',
        'Each newly predicted token is added to the context and fed back into the model to predict the next token',
        'The model requires no training data whatsoever',
        'The model reverses the order of the song from back to front',
      ],
      answerIndex: 1,
      explanation: 'Autoregressive generation generates sequentially: each new output becomes part of the input context for the next step.',
    },
    {
      question: 'Why does YuE2 use flow matching for audio latents instead of an autoregressive loop?',
      options: [
        'Because raw audio has tens of thousands of samples per second, making step-by-step token looping impractically slow',
        'Because flow matching is only available in Python 2',
        'Because the model authors lost the tokenizer file for audio',
        'To make the song strictly instrumental without vocals',
      ],
      answerIndex: 0,
      explanation: 'Continuous 48 kHz audio requires immense data density; non-autoregressive flow matching can refine audio details across the whole track in parallel.',
    },
  ],
};
