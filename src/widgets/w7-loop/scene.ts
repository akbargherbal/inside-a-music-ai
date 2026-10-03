import type { W7Data, LoopStepRecord } from './schema';

export interface W7Controls {
  inspectedStepIndex?: number | null;
  playbackIteration?: number; // 0..4
}

export interface W7SceneState {
  step: number;
  prompt: string[];
  currentTokens: string[];
  activeProbabilities: { token: string; prob: number }[];
  lastGeneratedToken: string | null;
  isFinished: boolean;
  history: LoopStepRecord[];
  inspectedRecord: LoopStepRecord | null;
  isYuE2ComparisonView: boolean;
}

export function getSceneState(
  step: number,
  data: W7Data,
  controls: W7Controls = {}
): W7SceneState {
  const boundedStep = Math.max(0, Math.min(step, 6));

  // Determine how many tokens are in sequence based on step
  let iteration = 0;
  if (boundedStep === 0) iteration = 0;
  else if (boundedStep === 1) iteration = 0; // Model reading prompt
  else if (boundedStep === 2) iteration = 1; // "kitchen" appended
  else if (boundedStep === 3) iteration = 1; // loopback
  else if (boundedStep >= 4) iteration = 4; // completed through <end>

  if (controls.playbackIteration !== undefined) {
    iteration = Math.max(0, Math.min(controls.playbackIteration, data.scriptedSteps.length));
  }

  // Build current sequence
  const currentTokens = [...data.prompt];
  for (let i = 0; i < iteration; i++) {
    const stepRec = data.scriptedSteps[i];
    if (stepRec && !stepRec.isStopToken) {
      currentTokens.push(stepRec.sampledToken);
    }
  }

  const currentStepRec =
    iteration > 0
      ? data.scriptedSteps[Math.min(iteration - 1, data.scriptedSteps.length - 1)]
      : data.scriptedSteps[0];

  const inspectedIndex = controls.inspectedStepIndex ?? null;
  const inspectedRecord =
    inspectedIndex !== null ? data.scriptedSteps[inspectedIndex] : null;

  const isFinished = iteration >= data.scriptedSteps.length;

  return {
    step: boundedStep,
    prompt: data.prompt,
    currentTokens,
    activeProbabilities: inspectedRecord
      ? inspectedRecord.probabilities
      : currentStepRec.probabilities,
    lastGeneratedToken:
      iteration > 0 ? data.scriptedSteps[iteration - 1].sampledToken : null,
    isFinished,
    history: data.scriptedSteps.slice(0, iteration),
    inspectedRecord,
    isYuE2ComparisonView: boundedStep === 6,
  };
}
