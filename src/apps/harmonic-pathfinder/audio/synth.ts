import * as Tone from 'tone';

// Simple polyphonic synth for playing notes and chords
let synth: Tone.PolySynth | null = null;

// Note names for each pitch class
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Initialize the audio context (must be called after user interaction).
 */
export async function initAudio(): Promise<void> {
  if (synth) return;

  await Tone.start();

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'sine',
    },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.4,
      release: 0.8,
    },
  }).toDestination();

  // Lower volume a bit
  synth.volume.value = -6;
}

/**
 * Convert pitch class to note name with octave.
 */
function pcToNote(pc: number, octave: number = 4): string {
  return `${NOTE_NAMES[pc]}${octave}`;
}

/**
 * Play a single note.
 */
export function playNote(pc: number, duration: string = '4n', octave: number = 4): void {
  if (!synth) {
    console.warn('Audio not initialized. Call initAudio() first.');
    return;
  }

  const note = pcToNote(pc, octave);
  synth.triggerAttackRelease(note, duration);
}

/**
 * Play a chord (multiple notes simultaneously).
 */
export function playChord(pcs: number[], duration: string = '2n', octave: number = 4): void {
  if (!synth) {
    console.warn('Audio not initialized. Call initAudio() first.');
    return;
  }

  const notes = pcs.map(pc => pcToNote(pc, octave));
  synth.triggerAttackRelease(notes, duration);
}

/**
 * Play a triad by root and quality.
 */
export function playTriad(
  root: number,
  quality: 'major' | 'minor',
  duration: string = '2n',
  octave: number = 4
): void {
  const third = quality === 'major' ? (root + 4) % 12 : (root + 3) % 12;
  const fifth = (root + 7) % 12;

  // Ensure chord is voiced in ascending order
  const rootNote = pcToNote(root, octave);
  const thirdNote = pcToNote(third, third < root ? octave + 1 : octave);
  const fifthNote = pcToNote(fifth, fifth < root ? octave + 1 : octave);

  if (!synth) {
    console.warn('Audio not initialized. Call initAudio() first.');
    return;
  }

  synth.triggerAttackRelease([rootNote, thirdNote, fifthNote], duration);
}

/**
 * Check if audio is ready.
 */
export function isAudioReady(): boolean {
  return synth !== null;
}

/**
 * Start playing a note (sustain until released).
 */
export function attackNote(pc: number, octave: number = 4): void {
  if (!synth) {
    console.warn('Audio not initialized. Call initAudio() first.');
    return;
  }

  const note = pcToNote(pc, octave);
  synth.triggerAttack(note);
}

/**
 * Stop playing a note.
 */
export function releaseNote(pc: number, octave: number = 4): void {
  if (!synth) return;

  const note = pcToNote(pc, octave);
  synth.triggerRelease(note);
}

/**
 * Release all notes.
 */
export function releaseAll(): void {
  if (!synth) return;
  synth.releaseAll();
}
