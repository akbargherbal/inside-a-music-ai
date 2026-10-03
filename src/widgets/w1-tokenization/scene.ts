import type { W1Data } from './schema';
import { tokenizeGreedy, type TokenChunk } from '../../lib/ml/tokenizer';

export interface W1Controls {
  customText?: string;
  selectedTokenId?: number | null;
}

export interface W1SceneState {
  step: number;
  mode: 'text' | 'music' | 'audio';
  displayText: string;
  tokens: TokenChunk[];
  showChips: boolean;
  showIds: boolean;
  showNumbersOnly: boolean;
  activeVocabId?: number | null;
  audioFrames?: { id: number; shapeName: string; freq: number }[];
}

export function getSceneState(
  step: number,
  data: W1Data,
  controls: W1Controls = {}
): W1SceneState {
  const boundedStep = Math.max(0, Math.min(step, 5));
  const activeText = controls.customText?.trim() || data.sampleText;

  if (boundedStep <= 3) {
    const tokens = tokenizeGreedy(activeText, data.vocab);
    return {
      step: boundedStep,
      mode: 'text',
      displayText: activeText,
      tokens,
      showChips: boundedStep >= 1,
      showIds: boundedStep >= 2,
      showNumbersOnly: boundedStep === 3,
      activeVocabId: controls.selectedTokenId ?? (tokens[0]?.id || null),
    };
  }

  if (boundedStep === 4) {
    const abcTokens = tokenizeGreedy(data.sampleAbc, data.vocab);
    return {
      step: 4,
      mode: 'music',
      displayText: data.sampleAbc,
      tokens: abcTokens,
      showChips: true,
      showIds: true,
      showNumbersOnly: false,
      activeVocabId: controls.selectedTokenId ?? abcTokens[0]?.id,
    };
  }

  // Step 5: Sound waveform to audio-shape tokens
  const audioFrames = [
    { id: 901, shapeName: 'Transient Attack (Kick)', freq: 80 },
    { id: 902, shapeName: 'Harmonic Decay (Vocal A)', freq: 440 },
    { id: 903, shapeName: 'Strum Resonator (Guitar)', freq: 330 },
    { id: 904, shapeName: 'Sibilance S-Sound', freq: 6500 },
  ];

  return {
    step: 5,
    mode: 'audio',
    displayText: 'Audio Waveform (48 kHz Stereo)',
    tokens: audioFrames.map(f => ({ id: f.id, text: f.shapeName, isWordPiece: false })),
    showChips: true,
    showIds: true,
    showNumbersOnly: false,
    audioFrames,
  };
}
