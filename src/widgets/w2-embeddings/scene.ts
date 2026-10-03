import type { W2Data, EmbeddingItem } from './schema';
import { euclideanDistance } from '../../lib/ml/math';

export interface W2Controls {
  selectedTokenId?: number;
  draggedCoords?: Record<number, [number, number]>;
}

export interface NeighborInfo {
  token: string;
  id: number;
  distance: number;
}

export interface W2SceneState {
  step: number;
  selectedItem: EmbeddingItem & { currentCoords: [number, number] };
  displayMode: 'chip' | 'table-lookup' | 'vector-bars' | 'multi-bars' | 'map-2d';
  items: (EmbeddingItem & { currentCoords: [number, number] })[];
  nearestNeighbors: NeighborInfo[];
}

export function getSceneState(
  step: number,
  data: W2Data,
  controls: W2Controls = {}
): W2SceneState {
  const boundedStep = Math.max(0, Math.min(step, 5));
  const activeId = controls.selectedTokenId ?? 204; // default "guitar"
  const selectedItem = data.items.find(i => i.id === activeId) || data.items[0];

  const items = data.items.map(item => {
    const customCoords = controls.draggedCoords?.[item.id];
    return {
      ...item,
      currentCoords: customCoords ?? item.coords2D,
    };
  });

  const currentSelectedItem = items.find(i => i.id === selectedItem.id)!;

  // Calculate nearest neighbours based on 2D coordinates for visual honesty
  const neighbors: NeighborInfo[] = items
    .filter(i => i.id !== currentSelectedItem.id)
    .map(other => {
      const dist = euclideanDistance(
        currentSelectedItem.currentCoords,
        other.currentCoords
      );
      // Scale into intuitive range
      return {
        token: other.token,
        id: other.id,
        distance: Math.round((dist / 30) * 10) / 10,
      };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  let displayMode: W2SceneState['displayMode'] = 'chip';
  if (boundedStep === 1) displayMode = 'table-lookup';
  else if (boundedStep === 2) displayMode = 'vector-bars';
  else if (boundedStep === 3) displayMode = 'multi-bars';
  else if (boundedStep >= 4) displayMode = 'map-2d';

  return {
    step: boundedStep,
    selectedItem: currentSelectedItem,
    displayMode,
    items,
    nearestNeighbors: neighbors,
  };
}
