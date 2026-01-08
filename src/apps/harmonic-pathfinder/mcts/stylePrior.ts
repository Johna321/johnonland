// web/src/mcts/stylePrior.ts

import type { Triad } from './types';
import bigrams from './data/billboardBigrams.json';

const DEGREE_MAP: Record<number, string> = {
  0: 'I', 1: 'bII', 2: 'II', 3: 'bIII', 4: 'III', 5: 'IV',
  6: 'bV', 7: 'V', 8: 'bVI', 9: 'VI', 10: 'bVII', 11: 'VII'
};

const UNIFORM_PROB = 1.0 / 12;

function toRoman(chord: Triad, keyRoot: number): string {
  const degree = (chord.root - keyRoot + 12) % 12;
  let roman = DEGREE_MAP[degree] || '?';

  if (chord.quality === 'minor') {
    roman = roman.toLowerCase();
  }

  return roman;
}

/**
 * Get bigram probability P(nextChord | prevChord) relative to key.
 */
export function getTransitionProbability(
  prevChord: Triad,
  nextChord: Triad,
  keyRoot: number = 0
): number {
  const prevRoman = toRoman(prevChord, keyRoot);
  const nextRoman = toRoman(nextChord, keyRoot);

  const transitions = (bigrams as Record<string, Record<string, number>>)[prevRoman];
  if (!transitions) return UNIFORM_PROB;

  return transitions[nextRoman] ?? 0.01; // Small smoothing for unseen
}

/**
 * Check if bigram data is loaded.
 */
export function hasBigramData(): boolean {
  return Object.keys(bigrams).length > 0;
}
