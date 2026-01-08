// web/src/mcts/types.ts

export type ChordQuality = 'major' | 'minor';

export interface Triad {
  root: number;      // 0-11 pitch class
  quality: ChordQuality;
}

export type Transform = 'P' | 'L' | 'R';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export function triadToString(t: Triad): string {
  const suffix = t.quality === 'major' ? '' : 'm';
  return `${NOTE_NAMES[t.root]}${suffix}`;
}

export function triadEquals(a: Triad, b: Triad): boolean {
  return a.root === b.root && a.quality === b.quality;
}

export function getTriadPitchClasses(t: Triad): [number, number, number] {
  if (t.quality === 'major') {
    return [t.root, (t.root + 4) % 12, (t.root + 7) % 12];
  } else {
    return [t.root, (t.root + 3) % 12, (t.root + 7) % 12];
  }
}
