// web/src/mcts/transforms.ts

import type { Triad, Transform } from './types';

/**
 * Apply a single PLR transform to a triad.
 *
 * P (Parallel): Same root, flip quality (C maj <-> C min)
 * L (Leading-tone): Move the root (C maj -> E min, C min -> Ab maj)
 * R (Relative): Move to relative major/minor (C maj -> A min, C min -> Eb maj)
 */
export function applyTransform(chord: Triad, t: Transform): Triad {
  const { root, quality } = chord;

  switch (t) {
    case 'P':
      // Parallel: same root, flip quality
      return { root, quality: quality === 'major' ? 'minor' : 'major' };

    case 'L':
      // Leading-tone exchange
      if (quality === 'major') {
        // C maj -> E min: root moves up major third
        return { root: (root + 4) % 12, quality: 'minor' };
      } else {
        // C min -> Ab maj: root moves down major third (up minor sixth)
        return { root: (root + 8) % 12, quality: 'major' };
      }

    case 'R':
      // Relative
      if (quality === 'major') {
        // C maj -> A min: root moves down minor third (up major sixth)
        return { root: (root + 9) % 12, quality: 'minor' };
      } else {
        // C min -> Eb maj: root moves up minor third
        return { root: (root + 3) % 12, quality: 'major' };
      }
  }
}

/** All basic transforms */
export const ALL_TRANSFORMS: Transform[] = ['P', 'L', 'R'];

/** Get all neighbors of a triad via PLR */
export function getNeighbors(chord: Triad): Array<{ triad: Triad; transform: Transform }> {
  return ALL_TRANSFORMS.map(t => ({
    triad: applyTransform(chord, t),
    transform: t,
  }));
}
