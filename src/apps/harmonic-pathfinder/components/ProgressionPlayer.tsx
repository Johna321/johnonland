// web/src/components/ProgressionPlayer.tsx

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Triad } from '../mcts';
import { triadToString } from '../mcts';
import { playTriad } from '../audio/synth';

// Convert chord to Roman numeral relative to key
function toRomanNumeral(chord: Triad, keyRoot: number): string {
  const degree = (chord.root - keyRoot + 12) % 12;

  const MAJOR_NUMERALS: Record<number, string> = {
    0: 'I', 1: 'bII', 2: 'II', 3: 'bIII', 4: 'III', 5: 'IV',
    6: 'bV', 7: 'V', 8: 'bVI', 9: 'VI', 10: 'bVII', 11: 'VII'
  };

  let numeral = MAJOR_NUMERALS[degree] || '?';

  // Lowercase for minor chords
  if (chord.quality === 'minor') {
    numeral = numeral.toLowerCase();
  }

  return numeral;
}

interface ProgressionPlayerProps {
  progression: Triad[];
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  onChordHighlight: (triad: Triad | null) => void;
}

export function ProgressionPlayer({
  progression,
  currentIndex,
  setCurrentIndex,
  onChordHighlight,
}: ProgressionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(80); // BPM
  const intervalRef = useRef<number | null>(null);

  const playCurrentChord = useCallback((index: number) => {
    if (index < progression.length) {
      const chord = progression[index];
      playTriad(chord.root, chord.quality, '2n', 4);
      onChordHighlight(chord);
    }
  }, [progression, onChordHighlight]);

  const handlePlay = useCallback(() => {
    if (progression.length === 0) return;

    setIsPlaying(true);
    let index = currentIndex;

    // Play first chord immediately
    playCurrentChord(index);

    // Set up interval for subsequent chords
    const msPerBeat = (60 / tempo) * 1000 * 2; // Half notes
    intervalRef.current = window.setInterval(() => {
      index++;
      if (index >= progression.length) {
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        onChordHighlight(null);
        return;
      }
      setCurrentIndex(index);
      playCurrentChord(index);
    }, msPerBeat);
  }, [progression, currentIndex, tempo, playCurrentChord, setCurrentIndex, onChordHighlight]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onChordHighlight(null);
  }, [onChordHighlight]);

  const handleStep = useCallback((direction: 1 | -1) => {
    const newIndex = Math.max(0, Math.min(progression.length - 1, currentIndex + direction));
    setCurrentIndex(newIndex);
    playCurrentChord(newIndex);
  }, [currentIndex, progression.length, setCurrentIndex, playCurrentChord]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (progression.length === 0) return null;

  return (
    <div
      className="flex items-center gap-12 px-12 py-8"
      style={{ borderTop: '1px solid var(--darkgray)', backgroundColor: 'var(--dark)' }}
    >
      {/* Transport controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleStep(-1)}
          disabled={currentIndex === 0 || isPlaying}
          className="p-2 transition-opacity hover:opacity-80"
          style={{ color: 'var(--light)', opacity: currentIndex === 0 || isPlaying ? 0.2 : 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2h2v12H1V2zm3 6l10-6v12L4 8z"/>
          </svg>
        </button>

        {isPlaying ? (
          <button
            onClick={handleStop}
            className="text-[11px] tracking-[0.15em] uppercase px-6 py-2 transition-all"
            style={{
              color: 'var(--light)',
              border: '1px solid var(--light)'
            }}
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handlePlay}
            className="text-[11px] tracking-[0.15em] uppercase px-6 py-2 transition-all"
            style={{
              color: 'var(--dark)',
              backgroundColor: 'var(--light)',
              border: '1px solid var(--light)'
            }}
          >
            Play
          </button>
        )}

        <button
          onClick={() => handleStep(1)}
          disabled={currentIndex === progression.length - 1 || isPlaying}
          className="p-2 transition-opacity hover:opacity-80"
          style={{ color: 'var(--light)', opacity: currentIndex === progression.length - 1 || isPlaying ? 0.2 : 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13 2h2v12h-2V2zM1 2l10 6-10 6V2z"/>
          </svg>
        </button>
      </div>

      {/* Tempo */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--gray)' }}>
          Tempo
        </span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={40}
            max={160}
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm font-mono tabular-nums w-8" style={{ color: 'var(--gray)' }}>{tempo}</span>
        </div>
      </div>

      {/* Chord progression display */}
      <div className="flex-1 flex items-center gap-3 overflow-x-auto">
        {progression.map((chord, i) => {
          const keyRoot = progression[0]?.root ?? 0;
          const roman = toRomanNumeral(chord, keyRoot);
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;

          return (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                playCurrentChord(i);
              }}
              className="flex flex-col items-center justify-center min-w-[4.5rem] py-3 px-4 transition-all"
              style={{
                backgroundColor: isActive ? 'var(--tertiary)' : 'transparent',
                color: isActive ? 'var(--dark)' : isPast ? 'var(--gray)' : 'var(--light)',
                border: isActive ? '1px solid var(--tertiary)' : '1px solid var(--darkgray)',
                opacity: isPast && !isActive ? 0.5 : 1,
              }}
            >
              <span className="font-mono text-base font-medium">{roman}</span>
              <span className="text-[9px] mt-1 uppercase tracking-wider" style={{ color: isActive ? 'var(--dark)' : 'var(--gray)' }}>
                {triadToString(chord)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Position indicator */}
      <span className="text-[10px] font-mono tabular-nums" style={{ color: 'var(--gray)' }}>
        {currentIndex + 1}/{progression.length}
      </span>
    </div>
  );
}
