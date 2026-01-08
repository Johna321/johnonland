// web/src/mcts/voiceLeading.ts

import type { Triad } from './types';
import { getTriadPitchClasses } from './types';

/**
 * Compute minimal voice-leading distance (Tymoczko metric).
 * Sum of semitone movements in optimal voice assignment.
 */
export function voiceLeadingDistance(c1: Triad, c2: Triad): number {
  const p1 = getTriadPitchClasses(c1);
  const p2 = getTriadPitchClasses(c2);

  // Try all permutations of p2 to find minimal cost
  const permutations = [
    [p2[0], p2[1], p2[2]],
    [p2[0], p2[2], p2[1]],
    [p2[1], p2[0], p2[2]],
    [p2[1], p2[2], p2[0]],
    [p2[2], p2[0], p2[1]],
    [p2[2], p2[1], p2[0]],
  ];

  let minCost = Infinity;

  for (const perm of permutations) {
    let cost = 0;
    for (let i = 0; i < 3; i++) {
      const diff = Math.abs(p1[i] - perm[i]);
      cost += Math.min(diff, 12 - diff); // Shortest path on pitch class circle
    }
    minCost = Math.min(minCost, cost);
  }

  return minCost;
}

/**
 * Total voice-leading distance across a progression.
 */
export function totalVoiceLeading(progression: Triad[]): number {
  if (progression.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < progression.length - 1; i++) {
    total += voiceLeadingDistance(progression[i], progression[i + 1]);
  }
  return total;
}
