# Research Notes: YuE2-3B & Model Architecture

### Primary Sources
1. **Model Card**: `m-a-p/YuE2-3B` on Hugging Face (https://huggingface.co/m-a-p/YuE2-3B)
2. **Technical Report**: arXiv:2609.33757 (*YuE2: Unifying Symbolic and Audio Music Generation at Frontier Quality*)
3. **Predecessor**: arXiv:2503.08638 (*YuE: Open Foundation Model for Full-Song Generation*)
4. **Code Repository**: https://github.com/multimodal-art-projection/YuE
5. **Project / Demo Page**: https://map-yue2.github.io/

### Verified Facts (from Official Model Card & Documentation)
- **Developer**: M-A-P (Multimodal Art Projection) team.
- **Task**: Turns lyrics and a style description into a full song with singing vocals and instrumental accompaniment.
- **Audio Output**: 48 kHz stereo audio.
- **Language Support**: English and Chinese lyrics.
- **Backbone Architecture**: AR–NAR Mixture-of-Transformers backbone.
  - Phase 1: Planning stage writes a musical score in **ABC notation** (Chain-of-Thought / CoT planning).
  - Phase 2: Generates **semantic tokens** autoregressively (AR) using causal self-attention.
  - Phase 3: Generates **acoustic latents** non-autoregressively (NAR) using **flow matching** over multiple refinement steps.
  - Phase 4: A neural audio decoder (VAE) turns acoustic latents into full 48 kHz stereo waveform audio.
- **CoT Planning Options**: `cot="full"` (melody + chords, default), `cot="melody"`, or `cot="off"`.
- **Text Tokenizer**: Uses `qwen.tiktoken` (Byte-Pair Encoding derived vocabulary from Qwen).
- **Conditioning & Guidance**: Uses Classifier-Free Guidance (`cfg_scale`).
- **Reproducibility**: Supported through fixed `seed=` initialization.
- **Model Size**: Named `YuE2-3B`; actual parameter footprint is roughly 3–4 billion parameters.
- **Recommended Hardware**: Linux, Python 3.10+, 24 GB NVIDIA GPU (BF16 precision).
- **License**: **CC BY-NC 4.0** (Creative Commons Attribution-NonCommercial 4.0 International).

### Boundary Rules for this Explainer
- **No anthropomorphic claims**: Never claim the AI "feels", "comprehends", or "composes with emotional intention". It is statistical pattern matching and next-token prediction over high-dimensional representations.
- **Honest Data Badges**: Every visual must explicitly state whether the numbers are *Illustrative* (hand-crafted toy values for clarity), *Real data from a small stand-in model* (e.g. GPT-2), or a verified *Fact about YuE2*.
- **No Invented Numbers**: If YuE2's exact internal layer dimensions or attention head counts are not explicitly disclosed in the public card, state them generically ("dozens of stacked transformer layers", "multi-head attention") rather than inventing numbers.
