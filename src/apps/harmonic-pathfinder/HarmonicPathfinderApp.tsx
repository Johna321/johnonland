import { useState, useEffect, useCallback, useRef } from 'react';
import type { TriadRegion, TonnetzNode } from './tonnetz';
import { TonnetzGrid, NOTE_NAMES } from './tonnetz';
import { initAudio, playNote, playTriad, attackNote, releaseNote } from './audio/synth';
import type { Triad, MCTSResult, MCTSProgress, TriadVisitStats, MCTSTreeNode } from './mcts';
import { getTriadPitchClasses } from './mcts';
import { MCTSControls } from './components/MCTSControls';
import { ProgressionPlayer } from './components/ProgressionPlayer';
import { MCTSTreeView } from './components/MCTSTreeView';

// Keyboard mapping: piano-style layout
// Bottom row (white keys): A S D F G H J K = C D E F G A B C
// Top row (black keys): W E T Y U = C# D# F# G# A#
const KEY_TO_PC: Record<string, number> = {
  'a': 0,  // C
  'w': 1,  // C#
  's': 2,  // D
  'e': 3,  // D#
  'd': 4,  // E
  'f': 5,  // F
  't': 6,  // F#
  'g': 7,  // G
  'y': 8,  // G#
  'h': 9,  // A
  'u': 10, // A#
  'j': 11, // B
};

export function HarmonicPathfinderApp() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedTriad, setSelectedTriad] = useState<TriadRegion | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [activeNodes, setActiveNodes] = useState<Set<number>>(new Set());
  const [showInfo, setShowInfo] = useState(false);
  const heldKeysRef = useRef<Set<string>>(new Set());

  // MCTS progression state
  const [progression, setProgression] = useState<Triad[]>([]);
  const [currentProgressionIndex, setCurrentProgressionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [highlightedChord, setHighlightedChord] = useState<Triad | null>(null);

  // MCTS visualization state
  const [visitStats, setVisitStats] = useState<TriadVisitStats[]>([]);
  const [mctsTree, setMctsTree] = useState<MCTSTreeNode | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTreeView, setShowTreeView] = useState(false);
  const [searchProgress, setSearchProgress] = useState<{ current: number; total: number } | null>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 120, // Leave room for header/info
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Keyboard handler for polyphonic input
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      const pc = KEY_TO_PC[key];

      if (pc !== undefined && !heldKeysRef.current.has(key)) {
        heldKeysRef.current.add(key);

        // Initialize audio on first keypress
        if (!audioReady) {
          await initAudio();
          setAudioReady(true);
        }

        attackNote(pc, 4);
        setActiveNodes(prev => new Set([...prev, pc]));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const pc = KEY_TO_PC[key];

      if (pc !== undefined && heldKeysRef.current.has(key)) {
        heldKeysRef.current.delete(key);
        releaseNote(pc, 4);
        setActiveNodes(prev => {
          const next = new Set(prev);
          next.delete(pc);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [audioReady]);

  // Initialize audio on first user interaction
  const handleInitAudio = useCallback(async () => {
    if (!audioReady) {
      await initAudio();
      setAudioReady(true);
    }
  }, [audioReady]);

  // Handle node click - play single note
  const handleNodeClick = useCallback(async (node: TonnetzNode) => {
    await handleInitAudio();
    playNote(node.pc, '4n', 4);

    // Brief visual feedback
    setActiveNodes(new Set([node.pc]));
    setTimeout(() => setActiveNodes(new Set()), 300);
  }, [handleInitAudio]);

  // Handle triad selection - play chord
  const handleTriadSelect = useCallback(async (triad: TriadRegion | null) => {
    setSelectedTriad(triad);

    if (triad) {
      await handleInitAudio();
      playTriad(triad.root, triad.quality, '2n', 4);

      // Visual feedback for all notes in chord
      const pcs = new Set(triad.nodes.map(n => n.pc));
      setActiveNodes(pcs);
      setTimeout(() => setActiveNodes(new Set()), 600);
    }
  }, [handleInitAudio]);

  // Handle MCTS progression generation complete
  const handleProgressionGenerated = useCallback((newProgression: Triad[]) => {
    setProgression(newProgression);
    setCurrentProgressionIndex(0);
  }, []);

  // Handle MCTS search progress (called during animation)
  const handleSearchProgress = useCallback((progress: MCTSProgress) => {
    setVisitStats(progress.visitStats);
    setMctsTree(progress.tree);
    setSearchProgress({ current: progress.iteration, total: progress.totalIterations });
    // Auto-enable heatmap to show progress
    if (!showHeatmap && progress.iteration > 0) {
      setShowHeatmap(true);
    }
  }, [showHeatmap]);

  // Handle MCTS search complete with visualization data
  const handleSearchComplete = useCallback((result: MCTSResult) => {
    setVisitStats(result.visitStats);
    setMctsTree(result.tree);
    setSearchProgress(null); // Clear progress indicator
    // Auto-enable heatmap when new search completes
    setShowHeatmap(true);
  }, []);

  // Handle chord highlight during playback
  const handleChordHighlight = useCallback((triad: Triad | null) => {
    setHighlightedChord(triad);
  }, []);

  // Compute active nodes including highlighted chord
  const computedActiveNodes = highlightedChord
    ? new Set([...activeNodes, ...getTriadPitchClasses(highlightedChord)])
    : activeNodes;

  return (
    <div className="harmonic-pathfinder-app flex flex-col h-screen" style={{ backgroundColor: 'var(--dark)', color: 'var(--light)' }}>
      {/* Top bar - extremely minimal */}
      <header className="flex items-center justify-between px-12 py-4">
        <h1 className="text-lg tracking-[0.2em] uppercase" style={{ color: 'var(--gray)' }}>
          Harmonic Pathfinder
        </h1>

        <div className="flex items-center gap-12">
          {/* Selected chord display */}
          {selectedTriad && (
            <span className="font-mono text-sm tracking-wide">
              {NOTE_NAMES[selectedTriad.root]}{selectedTriad.quality === 'minor' ? 'm' : ''}
            </span>
          )}

          {/* Audio indicator */}
          <div
            className="w-2 h-2 rounded-full transition-colors"
            style={{ backgroundColor: audioReady ? 'var(--tertiary)' : 'var(--darkgray)' }}
          />

          {/* Info button */}
          <button
            onClick={() => setShowInfo(true)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors"
            style={{ border: '1px solid var(--darkgray)', color: 'var(--gray)' }}
            aria-label="About this app"
          >
            ?
          </button>
        </div>
      </header>

      {/* Controls - spread out, gallery style */}
      <div className="px-12 py-2 flex items-end justify-between" style={{ borderBottom: '1px solid var(--darkgray)' }}>
        <MCTSControls
          selectedTriad={selectedTriad ? { root: selectedTriad.root, quality: selectedTriad.quality } : null}
          onProgressionGenerated={handleProgressionGenerated}
          onSearchComplete={handleSearchComplete}
          onProgress={handleSearchProgress}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />

        {/* Right side controls */}
        <div className="flex items-center gap-12">
          {/* Progress */}
          {searchProgress && (
            <div className="flex items-center gap-4">
              <div className="w-20 h-px overflow-hidden" style={{ backgroundColor: 'var(--darkgray)' }}>
                <div
                  className="h-full transition-all duration-75"
                  style={{
                    width: `${(searchProgress.current / searchProgress.total) * 100}%`,
                    backgroundColor: 'var(--tertiary)'
                  }}
                />
              </div>
              <span className="text-[10px] font-mono tabular-nums" style={{ color: 'var(--gray)' }}>
                {searchProgress.current}
              </span>
            </div>
          )}

          {/* View toggles */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              disabled={visitStats.length === 0}
              className="gallery-link text-[11px] tracking-[0.15em] uppercase transition-opacity"
              style={{
                opacity: visitStats.length === 0 ? 0.3 : 1,
                color: showHeatmap ? 'var(--light)' : 'var(--gray)'
              }}
            >
              Heatmap
            </button>
            <button
              onClick={() => setShowTreeView(!showTreeView)}
              disabled={!mctsTree}
              className="gallery-link text-[11px] tracking-[0.15em] uppercase transition-opacity"
              style={{
                opacity: !mctsTree ? 0.3 : 1,
                color: showTreeView ? 'var(--light)' : 'var(--gray)'
              }}
            >
              Tree
            </button>
          </div>
        </div>
      </div>

      {/* Main canvas area */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-hidden cursor-crosshair" onClick={handleInitAudio}>
          <TonnetzGrid
            width={showTreeView ? dimensions.width - 360 : dimensions.width}
            height={dimensions.height}
            selectedTriad={highlightedChord ? null : selectedTriad}
            onTriadSelect={handleTriadSelect}
            onNodeClick={handleNodeClick}
            activeNodes={computedActiveNodes}
            heatmapData={visitStats}
            showHeatmap={showHeatmap}
          />
        </main>

        {/* Tree panel */}
        {showTreeView && (
          <aside className="w-[360px] flex flex-col" style={{ borderLeft: '1px solid var(--darkgray)' }}>
            <MCTSTreeView tree={mctsTree} />
          </aside>
        )}
      </div>

      {/* Progression */}
      <ProgressionPlayer
        progression={progression}
        currentIndex={currentProgressionIndex}
        setCurrentIndex={setCurrentProgressionIndex}
        onChordHighlight={handleChordHighlight}
      />

      {/* Info modal */}
      {showInfo && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowInfo(false)}
        >
          <div
            className="max-w-md p-8 mx-4"
            style={{ backgroundColor: 'var(--dark)', border: '1px solid var(--darkgray)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg tracking-[0.15em] uppercase mb-6" style={{ color: 'var(--light)' }}>
              About
            </h2>
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
              <p>
                Harmonic Pathfinder visualizes chord relationships on a <strong style={{ color: 'var(--light)' }}>Tonnetz</strong> grid, where
                each triangle represents a major or minor triad and adjacent triangles share two notes.
              </p>
              <p>
                Select a starting chord, then generate progressions using <strong style={{ color: 'var(--light)' }}>Monte Carlo Tree Search</strong> (MCTS).
                The algorithm explores chord transitions weighted by voice-leading distance and style priors from real music.
              </p>
              <p>
                Play notes with keyboard keys <strong style={{ color: 'var(--light)' }}>A-K</strong> (white keys) and <strong style={{ color: 'var(--light)' }}>W, E, T, Y, U</strong> (black keys).
              </p>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-8 text-[11px] tracking-[0.15em] uppercase px-6 py-2"
              style={{ color: 'var(--dark)', backgroundColor: 'var(--light)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HarmonicPathfinderApp;
