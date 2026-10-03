import type { W4Data, HeadLabel } from './schema';

export interface W4Controls {
  hoveredRow?: number | null; // query index 0..8
  hoveredCol?: number | null;
  selectedHead?: number | null;
}

export interface W4SceneState {
  step: number;
  tokens: string[];
  headsCount: number;
  headLabels: HeadLabel[];
  activeQueryIndex: number;
  hoveredRow: number | null;
  hoveredCol: number | null;
  selectedHead: number | null;
  weights: number[][][]; // [head][query][key]
  mergedVector: { headId: number; color: string; values: number[] }[];
}

export function getSceneState(
  step: number,
  data: W4Data,
  controls: W4Controls = {}
): W4SceneState {
  const boundedStep = Math.max(0, Math.min(step, 5));
  const hoveredRow = controls.hoveredRow !== undefined ? controls.hoveredRow : 6; // default "it"
  const hoveredCol = controls.hoveredCol ?? null;
  const selectedHead = controls.selectedHead ?? null;

  // Illustrative 2-dim output vector per head for token 6 ("it")
  const mergedVector = [
    { headId: 0, color: '#38bdf8', values: [0.12, 0.65] },
    { headId: 1, color: '#a855f7', values: [0.85, 0.42] },
    { headId: 2, color: '#f59e0b', values: [0.45, 0.20] },
    { headId: 3, color: '#10b981', values: [0.70, 0.38] },
  ];

  return {
    step: boundedStep,
    tokens: data.tokens,
    headsCount: data.headsCount,
    headLabels: data.headLabels,
    activeQueryIndex: hoveredRow ?? 6,
    hoveredRow,
    hoveredCol,
    selectedHead,
    weights: data.weights,
    mergedVector,
  };
}
