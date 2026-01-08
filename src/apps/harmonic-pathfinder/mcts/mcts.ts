// web/src/mcts/mcts.ts

import type { Triad } from './types';
import type { HarmonicState, HarmonicAction } from './state';
import { ALL_ACTIONS, applyAction, getCurrentChord, isTerminal } from './state';
import { applyTransform } from './transforms';
import { evaluate } from './evaluate';
import { getTransitionProbability } from './stylePrior';

interface MCTSNode {
  state: HarmonicState;
  parent: MCTSNode | null;
  action: HarmonicAction | null;
  children: Map<string, MCTSNode>;  // keyed by transform
  visits: number;
  totalValue: number;
  untriedActions: HarmonicAction[];
}

function createNode(
  state: HarmonicState,
  parent: MCTSNode | null = null,
  action: HarmonicAction | null = null
): MCTSNode {
  // Shuffle actions for variety
  const untried = [...ALL_ACTIONS].sort(() => Math.random() - 0.5);

  return {
    state,
    parent,
    action,
    children: new Map(),
    visits: 0,
    totalValue: 0,
    untriedActions: untried,
  };
}

function nodeValue(node: MCTSNode): number {
  return node.visits === 0 ? 0 : node.totalValue / node.visits;
}

function ucb1(node: MCTSNode, explorationWeight: number = 1.41): number {
  if (node.visits === 0 || !node.parent) return Infinity;

  const exploitation = nodeValue(node);
  const exploration = explorationWeight * Math.sqrt(
    Math.log(node.parent.visits) / node.visits
  );

  return exploitation + exploration;
}

function bestChild(node: MCTSNode, explorationWeight: number): MCTSNode {
  let best: MCTSNode | null = null;
  let bestScore = -Infinity;

  for (const child of node.children.values()) {
    const score = ucb1(child, explorationWeight);
    if (score > bestScore) {
      bestScore = score;
      best = child;
    }
  }

  return best!;
}

function mostVisitedChild(node: MCTSNode): MCTSNode | null {
  let best: MCTSNode | null = null;
  let bestVisits = -1;

  for (const child of node.children.values()) {
    if (child.visits > bestVisits) {
      bestVisits = child.visits;
      best = child;
    }
  }

  return best;
}

export interface MCTSProgress {
  visitStats: TriadVisitStats[];
  tree: MCTSTreeNode;
  iteration: number;
  totalIterations: number;
}

export interface MCTSOptions {
  iterations: number;
  explorationWeight: number;
  maxRolloutDepth: number;
  // Progressive search options
  onProgress?: (progress: MCTSProgress) => void;
  progressInterval?: number;  // Call onProgress every N iterations
  explorationBonus?: number;  // 0-1, how much to reward exploration vs style
}

const DEFAULT_OPTIONS: MCTSOptions = {
  iterations: 500,
  explorationWeight: 1.41,
  maxRolloutDepth: 20,
  progressInterval: 25,
  explorationBonus: 0,
};

// Visualization data types
export interface TriadVisitStats {
  root: number;
  quality: 'major' | 'minor';
  visits: number;
  avgValue: number;
}

export interface MCTSTreeNode {
  id: string;
  chord: Triad;
  visits: number;
  avgValue: number;
  children: MCTSTreeNode[];
  action: string | null;  // P, L, R, or null for root
}

export interface MCTSResult {
  progression: Triad[];
  visitStats: TriadVisitStats[];
  tree: MCTSTreeNode;
  totalIterations: number;
}

/**
 * Run MCTS search and return best progression (simple API).
 */
export function search(
  initialState: HarmonicState,
  options: Partial<MCTSOptions> = {}
): Triad[] {
  return searchWithStats(initialState, options).progression;
}

/**
 * Run MCTS search and return full result with visualization data.
 */
export function searchWithStats(
  initialState: HarmonicState,
  options: Partial<MCTSOptions> = {}
): MCTSResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const root = createNode(initialState);

  for (let i = 0; i < opts.iterations; i++) {
    // Select
    let node = select(root, opts.explorationWeight);

    // Expand
    if (!isTerminal(node.state) && node.untriedActions.length > 0) {
      node = expand(node);
    }

    // Simulate
    const reward = simulate(node.state, opts.maxRolloutDepth, opts.explorationBonus ?? 0);

    // Backpropagate
    backpropagate(node, reward);
  }

  const progression = extractBestProgression(root);
  const visitStats = collectVisitStats(root);
  const tree = buildTreeView(root);

  return {
    progression,
    visitStats,
    tree,
    totalIterations: opts.iterations,
  };
}

/**
 * Run MCTS search progressively with animation support.
 * Calls onProgress at regular intervals and yields to the event loop.
 */
export async function searchProgressive(
  initialState: HarmonicState,
  options: Partial<MCTSOptions> = {}
): Promise<MCTSResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const root = createNode(initialState);
  const progressInterval = opts.progressInterval ?? 25;

  for (let i = 0; i < opts.iterations; i++) {
    // Select
    let node = select(root, opts.explorationWeight);

    // Expand
    if (!isTerminal(node.state) && node.untriedActions.length > 0) {
      node = expand(node);
    }

    // Simulate
    const reward = simulate(node.state, opts.maxRolloutDepth, opts.explorationBonus ?? 0);

    // Backpropagate
    backpropagate(node, reward);

    // Report progress and yield to event loop
    if (opts.onProgress && (i + 1) % progressInterval === 0) {
      const visitStats = collectVisitStats(root);
      const tree = buildTreeView(root);

      opts.onProgress({
        visitStats,
        tree,
        iteration: i + 1,
        totalIterations: opts.iterations,
      });

      // Yield to event loop for UI updates
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  const progression = extractBestProgression(root);
  const visitStats = collectVisitStats(root);
  const tree = buildTreeView(root);

  // Final progress update
  if (opts.onProgress) {
    opts.onProgress({
      visitStats,
      tree,
      iteration: opts.iterations,
      totalIterations: opts.iterations,
    });
  }

  return {
    progression,
    visitStats,
    tree,
    totalIterations: opts.iterations,
  };
}

function select(node: MCTSNode, explorationWeight: number): MCTSNode {
  while (!isTerminal(node.state)) {
    if (node.untriedActions.length > 0) {
      return node;
    }
    if (node.children.size === 0) {
      return node;
    }
    node = bestChild(node, explorationWeight);
  }
  return node;
}

function expand(node: MCTSNode): MCTSNode {
  if (node.untriedActions.length === 0) return node;

  const action = node.untriedActions.pop()!;
  const newState = applyAction(node.state, action);
  const child = createNode(newState, node, action);

  node.children.set(action.transform, child);
  return child;
}

function simulate(state: HarmonicState, maxDepth: number, explorationBonus: number = 0): number {
  let current = state;
  let depth = 0;

  while (!isTerminal(current) && depth < maxDepth) {
    const action = rolloutPolicy(current);
    current = applyAction(current, action);
    depth++;
  }

  return evaluate(current, undefined, explorationBonus);
}

function rolloutPolicy(state: HarmonicState): HarmonicAction {
  // Weighted selection by style prior
  const currentChord = getCurrentChord(state);
  const weights: number[] = [];

  for (const action of ALL_ACTIONS) {
    const nextChord = applyTransform(currentChord, action.transform);
    const prob = getTransitionProbability(currentChord, nextChord, state.keyRoot);
    weights.push(prob + 0.01); // Small smoothing
  }

  // Weighted random selection
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;

  for (let i = 0; i < ALL_ACTIONS.length; i++) {
    r -= weights[i];
    if (r <= 0) return ALL_ACTIONS[i];
  }

  return ALL_ACTIONS[ALL_ACTIONS.length - 1];
}

function backpropagate(node: MCTSNode | null, reward: number): void {
  while (node !== null) {
    node.visits++;
    node.totalValue += reward;
    node = node.parent;
  }
}

function extractBestProgression(root: MCTSNode): Triad[] {
  const progression = [...root.state.progression];
  let node: MCTSNode | null = root;
  const targetLength = root.state.targetLength;

  // Follow most-visited path
  while (node && node.children.size > 0) {
    node = mostVisitedChild(node);
    if (node && node.state.progression.length > progression.length) {
      progression.push(node.state.progression[node.state.progression.length - 1]);
    }
  }

  // Complete with rollout if needed
  while (progression.length < targetLength) {
    const currentChord = progression[progression.length - 1];
    const tempState: HarmonicState = {
      progression,
      targetLength,
      keyRoot: root.state.keyRoot,
    };
    const action = rolloutPolicy(tempState);
    const nextChord = applyTransform(currentChord, action.transform);
    progression.push(nextChord);
  }

  return progression;
}

/**
 * Collect visit statistics for each triad in the tree.
 * Aggregates visits across all nodes representing the same triad.
 */
function collectVisitStats(root: MCTSNode): TriadVisitStats[] {
  const statsMap = new Map<string, { visits: number; totalValue: number }>();

  function traverse(node: MCTSNode): void {
    const chord = getCurrentChord(node.state);
    const key = `${chord.root}-${chord.quality}`;

    const existing = statsMap.get(key);
    if (existing) {
      existing.visits += node.visits;
      existing.totalValue += node.totalValue;
    } else {
      statsMap.set(key, { visits: node.visits, totalValue: node.totalValue });
    }

    for (const child of node.children.values()) {
      traverse(child);
    }
  }

  traverse(root);

  const stats: TriadVisitStats[] = [];
  for (const [key, data] of statsMap) {
    const [rootStr, quality] = key.split('-');
    stats.push({
      root: parseInt(rootStr, 10),
      quality: quality as 'major' | 'minor',
      visits: data.visits,
      avgValue: data.visits > 0 ? data.totalValue / data.visits : 0,
    });
  }

  // Sort by visits descending
  stats.sort((a, b) => b.visits - a.visits);
  return stats;
}

/**
 * Build a tree view structure for visualization.
 */
function buildTreeView(root: MCTSNode): MCTSTreeNode {
  let idCounter = 0;

  function buildNode(node: MCTSNode): MCTSTreeNode {
    const chord = getCurrentChord(node.state);
    const children: MCTSTreeNode[] = [];

    // Sort children by visits for consistent display
    const sortedChildren = [...node.children.entries()]
      .sort((a, b) => b[1].visits - a[1].visits);

    for (const [_, child] of sortedChildren) {
      children.push(buildNode(child));
    }

    return {
      id: `node-${idCounter++}`,
      chord,
      visits: node.visits,
      avgValue: node.visits > 0 ? node.totalValue / node.visits : 0,
      children,
      action: node.action?.transform ?? null,
    };
  }

  return buildNode(root);
}
