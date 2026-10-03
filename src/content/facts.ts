export interface YuE2Fact {
  id: string;
  claim: string;
  source: string;
  url: string;
  verified: boolean;
  category: 'architecture' | 'generation' | 'license' | 'tokens' | 'hardware';
}

export const YUE2_FACTS: Record<string, YuE2Fact> = {
  'yue2-developer': {
    id: 'yue2-developer',
    claim: 'YuE2 was developed by M-A-P (Multimodal Art Projection).',
    source: 'Official Model Card (Hugging Face)',
    url: 'https://huggingface.co/m-a-p/YuE2-3B',
    verified: true,
    category: 'architecture',
  },
  'yue2-task': {
    id: 'yue2-task',
    claim: 'YuE2 accepts text lyrics and a style description prompt and generates a full song with singing vocals and instrumental accompaniment.',
    source: 'Official Model Card & arXiv:2609.33757',
    url: 'https://arxiv.org/abs/2609.33757',
    verified: true,
    category: 'architecture',
  },
  'yue2-license': {
    id: 'yue2-license',
    claim: 'YuE2 model weights are released under the Creative Commons Attribution-NonCommercial 4.0 International license (CC BY-NC 4.0).',
    source: 'Official Model Card',
    url: 'https://huggingface.co/m-a-p/YuE2-3B',
    verified: true,
    category: 'license',
  },
  'yue2-audio-spec': {
    id: 'yue2-audio-spec',
    claim: 'YuE2 produces studio-grade 48 kHz stereo waveform audio output.',
    source: 'Official Model Card & Technical Report',
    url: 'https://arxiv.org/abs/2609.33757',
    verified: true,
    category: 'generation',
  },
  'yue2-languages': {
    id: 'yue2-languages',
    claim: 'YuE2 supports singing vocal generation in both English and Chinese.',
    source: 'Official Model Card',
    url: 'https://huggingface.co/m-a-p/YuE2-3B',
    verified: true,
    category: 'generation',
  },
  'yue2-pipeline-stages': {
    id: 'yue2-pipeline-stages',
    claim: 'YuE2 follows a 4-stage pipeline: (1) Symbolic score planning in ABC notation, (2) Autoregressive semantic token generation, (3) Non-autoregressive acoustic latent flow matching, and (4) VAE waveform decoding.',
    source: 'Official Model Card & arXiv:2609.33757',
    url: 'https://arxiv.org/abs/2609.33757',
    verified: true,
    category: 'architecture',
  },
  'yue2-cot-abc': {
    id: 'yue2-cot-abc',
    claim: 'YuE2 uses Chain-of-Thought (CoT) planning to first write out the musical melody and chords in text-based ABC notation before generating audio tokens.',
    source: 'Technical Report arXiv:2609.33757',
    url: 'https://arxiv.org/abs/2609.33757',
    verified: true,
    category: 'tokens',
  },
  'yue2-tokenizer-file': {
    id: 'yue2-tokenizer-file',
    claim: 'YuE2 uses a Qwen-style BPE text tokenizer referenced as qwen.tiktoken.',
    source: 'Official Model Card & Repository',
    url: 'https://huggingface.co/m-a-p/YuE2-3B',
    verified: true,
    category: 'tokens',
  },
  'yue2-cfg-guidance': {
    id: 'yue2-cfg-guidance',
    claim: 'YuE2 employs Classifier-Free Guidance (controlled via cfg_scale) to steer the musical style and vocals toward the user prompt.',
    source: 'Official Model Card Inference API',
    url: 'https://huggingface.co/m-a-p/YuE2-3B',
    verified: true,
    category: 'generation',
  },
  'yue2-seed-reproducibility': {
    id: 'yue2-seed-reproducibility',
    claim: 'YuE2 accepts a seed= parameter, ensuring identical pseudorandom choices and deterministic song reproduction across runs.',
    source: 'Official Model Card Inference API',
    url: 'https://huggingface.co/m-a-p/YuE2-3B',
    verified: true,
    category: 'generation',
  },
  'yue2-size': {
    id: 'yue2-size',
    claim: 'YuE2 contains approximately 3 to 4 billion parameters across its transformer modules.',
    source: 'Official Model Card metadata & paper',
    url: 'https://huggingface.co/m-a-p/YuE2-3B',
    verified: true,
    category: 'architecture',
  },
  'yue2-hardware': {
    id: 'yue2-hardware',
    claim: 'Running YuE2 locally requires a Linux workstation with Python 3.10+ and a 24 GB NVIDIA GPU running in BF16 precision.',
    source: 'Official Model Card Environment Requirements',
    url: 'https://huggingface.co/m-a-p/YuE2-3B',
    verified: true,
    category: 'hardware',
  },
};
