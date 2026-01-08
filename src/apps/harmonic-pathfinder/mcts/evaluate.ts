// web/src/mcts/evaluate.ts

import type { Triad } from './types';
import type { HarmonicState } from './state';
import { triadEquals } from './types';
import { totalVoiceLeading } from './voiceLeading';
import { getTransitionProbability } from './stylePrior';

export interface EvaluatorWeights {
  voiceLeading: number;
  function: number;
  style: number;
}

const DEFAULT_WEIGHTS: EvaluatorWeights = {
  voiceLeading: 0.35,
  function: 0.35,
  style: 0.30,
};

/**
 * Evaluate a harmonic state. Returns score in [0, 1].
 * @param explorationBonus 0-1: how much to reward harmonic exploration over style adherence
 */
export function evaluate(
  state: HarmonicState,
  weights: EvaluatorWeights = DEFAULT_WEIGHTS,
  explorationBonus: number = 0
): number {
  const prog = state.progression;

  const vl = voiceLeadingScore(prog);
  const func = functionScore(prog, state.keyRoot);
  const style = styleScore(prog, state.keyRoot);
  const exploration = explorationScore(prog);

  // When explorationBonus > 0, blend exploration into the score
  // At explorationBonus=1, style is fully replaced by exploration
  const effectiveStyle = style * (1 - explorationBonus) + exploration * explorationBonus;

  return (
    weights.voiceLeading * vl +
    weights.function * func +
    weights.style * effectiveStyle
  );
}

/**
 * Lower VL distance = higher score.
 */
function voiceLeadingScore(progression: Triad[]): number {
  if (progression.length < 2) return 1.0;

  const total = totalVoiceLeading(progression);
  const nTransitions = progression.length - 1;
  const avg = total / nTransitions;

  // PLR transforms have VL 1-2. Score based on avg.
  return Math.max(0, 1.0 - (avg - 1) * 0.15);
}

/**
 * Reward functional progressions and cadences.
 */
function functionScore(progression: Triad[], keyRoot: number): number {
  if (progression.length < 2) return 0.5;

  let score = 0.5;

  // Check for cadences
  const lastTwo = progression.slice(-2);
  if (isAuthenticCadence(lastTwo, keyRoot)) {
    score += 0.3;
  } else if (isPlagalCadence(lastTwo, keyRoot)) {
    score += 0.2;
  }

  // Reward ending on tonic
  if (progression[progression.length - 1].root === keyRoot) {
    score += 0.1;
  }

  // Penalize immediate repetition
  for (let i = 0; i < progression.length - 1; i++) {
    if (triadEquals(progression[i], progression[i + 1])) {
      score -= 0.1;
    }
  }

  return Math.max(0, Math.min(1, score));
}

function isAuthenticCadence(lastTwo: Triad[], keyRoot: number): boolean {
  if (lastTwo.length < 2) return false;
  const [prev, curr] = lastTwo;
  const dominantRoot = (keyRoot + 7) % 12;
  return prev.root === dominantRoot && curr.root === keyRoot;
}

function isPlagalCadence(lastTwo: Triad[], keyRoot: number): boolean {
  if (lastTwo.length < 2) return false;
  const [prev, curr] = lastTwo;
  const subdominantRoot = (keyRoot + 5) % 12;
  return prev.root === subdominantRoot && curr.root === keyRoot;
}

/**
 * Score based on corpus bigram probabilities.
 */
function styleScore(progression: Triad[], keyRoot: number): number {
  if (progression.length < 2) return 0.5;

  let totalProb = 0;
  for (let i = 0; i < progression.length - 1; i++) {
    totalProb += getTransitionProbability(progression[i], progression[i + 1], keyRoot);
  }

  const avgProb = totalProb / (progression.length - 1);
  // Scale up since probs are usually < 0.3
  return Math.min(1.0, avgProb * 3);
}

/**
 * Score based on harmonic exploration (how far and varied the journey).
 * Rewards visiting many distinct triads and traveling far from start.
 */
function explorationScore(progression: Triad[]): number {
  if (progression.length < 2) return 0.5;

  // 1. Diversity: how many unique triads visited
  const seen = new Set<string>();
  for (const t of progression) {
    seen.add(`${t.root}-${t.quality}`);
  }
  const diversityRatio = seen.size / progression.length;

  // 2. Maximum harmonic distance from starting chord
  const start = progression[0];
  let maxDistance = 0;
  for (const t of progression) {
    const dist = harmonicDistance(start, t);
    if (dist > maxDistance) maxDistance = dist;
  }
  // Normalize: 6 semitones (tritone) is max meaningful distance in 12-TET
  const distanceScore = Math.min(1.0, maxDistance / 6);

  // 3. Total journey length (sum of all transitions)
  let totalDist = 0;
  for (let i = 0; i < progression.length - 1; i++) {
    totalDist += harmonicDistance(progression[i], progression[i + 1]);
  }
  // Normalize: average of 2 semitones per step is moderate exploration
  const journeyScore = Math.min(1.0, totalDist / (progression.length * 2));

  // Combine scores
  return 0.4 * diversityRatio + 0.3 * distanceScore + 0.3 * journeyScore;
}

/**
 * Simple harmonic distance: minimum semitone distance between roots,
 * plus a bonus for quality change.
 */
function harmonicDistance(a: Triad, b: Triad): number {
  const rootDist = Math.min(
    Math.abs(a.root - b.root),
    12 - Math.abs(a.root - b.root)
  );
  const qualityChange = a.quality !== b.quality ? 1 : 0;
  return rootDist + qualityChange;
}
