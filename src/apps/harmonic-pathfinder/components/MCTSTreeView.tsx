import { useState, useCallback } from 'react';
import type { MCTSTreeNode } from '../mcts';
import { NOTE_NAMES } from '../mcts';

interface MCTSTreeViewProps {
  tree: MCTSTreeNode | null;
  onNodeHover?: (node: MCTSTreeNode | null) => void;
  maxDepth?: number;
}

function formatChord(node: MCTSTreeNode): string {
  const noteName = NOTE_NAMES[node.chord.root];
  const suffix = node.chord.quality === 'minor' ? 'm' : '';
  return `${noteName}${suffix}`;
}

function formatValue(value: number): string {
  return value.toFixed(2);
}

interface TreeNodeProps {
  node: MCTSTreeNode;
  depth: number;
  maxDepth: number;
  maxVisits: number;
  onHover: (node: MCTSTreeNode | null) => void;
}

function TreeNode({ node, depth, maxDepth, maxVisits, onHover }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const canExpand = hasChildren && depth < maxDepth;

  // Calculate visit intensity for background color
  const intensity = maxVisits > 0 ? node.visits / maxVisits : 0;
  const bgAlpha = 0.03 + intensity * 0.15;

  // Use theme colors (teal for major, cyan for minor)
  const bgColor = node.chord.quality === 'major'
    ? `rgba(132, 165, 157, ${bgAlpha})`   // --tertiary teal
    : `rgba(184, 255, 255, ${bgAlpha * 0.6})`; // --secondary cyan

  const handleClick = useCallback(() => {
    if (canExpand) {
      setExpanded(!expanded);
    }
  }, [canExpand, expanded]);

  return (
    <div className="ml-2">
      <div
        className="flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-colors text-sm"
        style={{
          backgroundColor: bgColor,
          color: 'var(--light)'
        }}
        onClick={handleClick}
        onMouseEnter={() => onHover(node)}
        onMouseLeave={() => onHover(null)}
      >
        {/* Expand/collapse indicator */}
        <span className="w-4 select-none text-xs" style={{ color: 'var(--darkgray)' }}>
          {canExpand ? (expanded ? '−' : '+') : hasChildren ? '·' : ''}
        </span>

        {/* Action label (P/L/R) */}
        {node.action && (
          <span
            className="px-1.5 py-0.5 text-[10px] font-mono"
            style={{ backgroundColor: 'var(--highlight)', color: 'var(--gray)' }}
          >
            {node.action}
          </span>
        )}

        {/* Chord name */}
        <span className="font-mono" style={{ color: 'var(--light)' }}>
          {formatChord(node)}
        </span>

        {/* Visit count */}
        <span className="text-xs" style={{ color: 'var(--darkgray)' }}>
          {node.visits}
        </span>

        {/* Average value */}
        <span className="text-xs" style={{ color: 'var(--darkgray)' }}>
          {formatValue(node.avgValue)}
        </span>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="ml-3" style={{ borderLeft: '1px solid var(--darkgray)' }}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              maxDepth={maxDepth}
              maxVisits={maxVisits}
              onHover={onHover}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MCTSTreeView({ tree, onNodeHover, maxDepth = 6 }: MCTSTreeViewProps) {
  const handleHover = useCallback((node: MCTSTreeNode | null) => {
    onNodeHover?.(node);
  }, [onNodeHover]);

  if (!tree) {
    return (
      <div className="p-6 text-xs" style={{ color: 'var(--darkgray)' }}>
        Generate a progression to view the search tree.
      </div>
    );
  }

  // Find max visits for intensity scaling
  function getMaxVisits(node: MCTSTreeNode): number {
    let max = node.visits;
    for (const child of node.children) {
      max = Math.max(max, getMaxVisits(child));
    }
    return max;
  }

  const maxVisits = getMaxVisits(tree);

  // Count total nodes for stats
  function countNodes(node: MCTSTreeNode): number {
    let count = 1;
    for (const child of node.children) {
      count += countNodes(child);
    }
    return count;
  }

  const totalNodes = countNodes(tree);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--dark)' }}>
      {/* Header with stats */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--darkgray)' }}>
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--gray)' }}>Tree</span>
          <span className="text-xs font-mono" style={{ color: 'var(--darkgray)' }}>
            {totalNodes} · {maxVisits}
          </span>
        </div>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-auto p-3">
        <TreeNode
          node={tree}
          depth={0}
          maxDepth={maxDepth}
          maxVisits={maxVisits}
          onHover={handleHover}
        />
      </div>
    </div>
  );
}

export default MCTSTreeView;
