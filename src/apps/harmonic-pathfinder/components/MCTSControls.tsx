// web/src/components/MCTSControls.tsx

import { useState, useCallback, useRef } from 'react';
import type { Triad, MCTSResult, MCTSProgress } from '../mcts';
import { triadToString, searchProgressive, createInitialState } from '../mcts';

interface MCTSControlsProps {
  selectedTriad: { root: number; quality: 'major' | 'minor' } | null;
  onProgressionGenerated: (progression: Triad[]) => void;
  onSearchComplete?: (result: MCTSResult) => void;
  onProgress?: (progress: MCTSProgress) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
}

export function MCTSControls({
  selectedTriad,
  onProgressionGenerated,
  onSearchComplete,
  onProgress,
  isGenerating,
  setIsGenerating,
}: MCTSControlsProps) {
  const [length, setLength] = useState(8);
  const [iterations, setIterations] = useState(500);
  const [explorationBonus, setExplorationBonus] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(25); // iterations per frame
  const abortRef = useRef(false);

  const handleGenerate = useCallback(async () => {
    if (!selectedTriad || isGenerating) return;

    setIsGenerating(true);
    abortRef.current = false;

    const startChord: Triad = {
      root: selectedTriad.root,
      quality: selectedTriad.quality,
    };

    const initialState = createInitialState(startChord, length, startChord.root);

    const result = await searchProgressive(initialState, {
      iterations,
      explorationBonus,
      progressInterval: animationSpeed,
      onProgress: (progress) => {
        if (!abortRef.current) {
          onProgress?.(progress);
        }
      },
    });

    if (!abortRef.current) {
      onProgressionGenerated(result.progression);
      onSearchComplete?.(result);
    }
    setIsGenerating(false);
  }, [selectedTriad, length, iterations, explorationBonus, animationSpeed, isGenerating, onProgressionGenerated, onSearchComplete, onProgress, setIsGenerating]);

  const handleStop = useCallback(() => {
    abortRef.current = true;
    setIsGenerating(false);
  }, [setIsGenerating]);

  return (
    <div className="flex items-end gap-16">
      {/* Start chord */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--gray)' }}>
          Start
        </span>
        <span className="font-mono text-lg" style={{ color: selectedTriad ? 'var(--light)' : 'var(--darkgray)' }}>
          {selectedTriad ? triadToString(selectedTriad) : '—'}
        </span>
      </div>

      {/* Length */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--gray)' }}>
          Length
        </span>
        <input
          min={4}
          max={16}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-12 text-lg font-mono bg-transparent border-b pb-1"
          style={{ borderColor: 'var(--darkgray)', color: 'var(--light)' }}
          disabled={isGenerating}
        />
      </div>

      {/* Iterations */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--gray)' }}>
          Iterations
        </span>
        <input
          min={100}
          max={2000}
          step={100}
          value={iterations}
          onChange={(e) => setIterations(Number(e.target.value))}
          className="w-16 text-lg font-mono bg-transparent border-b pb-1"
          style={{ borderColor: 'var(--darkgray)', color: 'var(--light)' }}
          disabled={isGenerating}
        />
      </div>

      {/* Exploration */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--gray)' }}>
          Explore
        </span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={explorationBonus}
            onChange={(e) => setExplorationBonus(Number(e.target.value))}
            className="w-24 h-[33px]!"
            disabled={isGenerating}
          />
          <span className="text-sm font-mono tabular-nums w-10" style={{ color: 'var(--gray)' }}>
            {Math.round(explorationBonus * 100)}%
          </span>
        </div>
      </div>

      {/* Speed */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--gray)' }}>
          Speed
        </span>
        <select
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(Number(e.target.value))}
          className="text-sm bg-transparent border-b pb-1 cursor-pointer appearance-none pr-4"
          style={{ borderColor: 'var(--darkgray)', color: 'var(--light)' }}
          disabled={isGenerating}
        >
          <option value={1}>Slow</option>
          <option value={25}>Normal</option>
          <option value={50}>Fast</option>
          <option value={100}>Instant</option>
        </select>
      </div>

      {/* Generate button */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] tracking-[0.15em] uppercase invisible">Action</span>
        {isGenerating ? (
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
            onClick={handleGenerate}
            disabled={!selectedTriad}
            className="text-[11px] tracking-[0.15em] uppercase px-6 py-2 transition-all"
            style={{
              color: selectedTriad ? 'var(--dark)' : 'var(--gray)',
              backgroundColor: selectedTriad ? 'var(--light)' : 'transparent',
              border: selectedTriad ? '1px solid var(--light)' : '1px solid var(--darkgray)',
              opacity: selectedTriad ? 1 : 0.5
            }}
          >
            Generate
          </button>
        )}
      </div>
    </div>
  );
}
