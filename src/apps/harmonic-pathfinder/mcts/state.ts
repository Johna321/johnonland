// web/src/mcts/state.ts

import type { Triad, Transform } from './types';
import { applyTransform, ALL_TRANSFORMS } from './transforms';

export interface HarmonicState {
  progression: Triad[];
  targetLength: number;
  keyRoot: number;  // For Roman numeral analysis (0 = C)
}

export interface HarmonicAction {
  transform: Transform;
}

export const ALL_ACTIONS: HarmonicAction[] = ALL_TRANSFORMS.map(t => ({ transform: t }));

export function getCurrentChord(state: HarmonicState): Triad {
  return state.progression[state.progression.length - 1];
}

export function getRemaining(state: HarmonicState): number {
  return state.targetLength - state.progression.length;
}

export function isTerminal(state: HarmonicState): boolean {
  return getRemaining(state) <= 0;
}

export function applyAction(state: HarmonicState, action: HarmonicAction): HarmonicState {
  const currentChord = getCurrentChord(state);
  const nextChord = applyTransform(currentChord, action.transform);

  return {
    ...state,
    progression: [...state.progression, nextChord],
  };
}

export function createInitialState(
  startChord: Triad,
  targetLength: number,
  keyRoot: number = 0
): HarmonicState {
  return {
    progression: [startChord],
    targetLength,
    keyRoot,
  };
}
