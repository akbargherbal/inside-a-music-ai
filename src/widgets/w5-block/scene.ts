import type { W5Data, Station } from './schema';

export interface W5Controls {
  selectedStationId?: string | null;
  showShapes?: boolean;
}

export interface W5SceneState {
  step: number;
  activeStation: Station;
  progressPct: number; // 0..100 on conveyor
  showShapes: boolean;
  selectedStation: Station | null;
  isStackView: boolean;
  isOutputView: boolean;
  hasResidualActive: boolean;
}

export function getSceneState(
  step: number,
  data: W5Data,
  controls: W5Controls = {}
): W5SceneState {
  const boundedStep = Math.max(0, Math.min(step, 7));
  const activeStation = data.stations[boundedStep] || data.stations[0];
  const selectedStation = controls.selectedStationId
    ? data.stations.find(s => s.id === controls.selectedStationId) || null
    : null;

  const progressPct = Math.round((boundedStep / 7) * 100);

  return {
    step: boundedStep,
    activeStation,
    progressPct,
    showShapes: !!controls.showShapes,
    selectedStation,
    isStackView: boundedStep === 6,
    isOutputView: boundedStep === 7,
    hasResidualActive: boundedStep === 3 || boundedStep === 5,
  };
}
