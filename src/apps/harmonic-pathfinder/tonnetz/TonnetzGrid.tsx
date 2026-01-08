import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { TonnetzNode, TriadRegion, Point } from './types';
import { COLORS, LAYOUT } from './types';
import {
  generateNodes,
  generateTriadRegions,
  findNodeAtPoint,
  findTriadAtPoint,
} from './geometry';
import type { TriadVisitStats } from '../mcts';

interface TonnetzGridProps {
  width: number;
  height: number;
  selectedTriad: TriadRegion | null;
  onTriadSelect: (triad: TriadRegion | null) => void;
  onNodeClick: (node: TonnetzNode) => void;
  activeNodes?: Set<number>;  // pitch classes currently active (for audio feedback)
  heatmapData?: TriadVisitStats[];  // MCTS visit frequency for heatmap overlay
  showHeatmap?: boolean;  // whether to show heatmap overlay
}

interface ViewState {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

export function TonnetzGrid({
  width,
  height,
  selectedTriad,
  onTriadSelect,
  onNodeClick,
  activeNodes = new Set(),
  heatmapData,
  showHeatmap = false,
}: TonnetzGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // View state for pan/zoom
  const [view, setView] = useState<ViewState>({
    offsetX: -width / 2,
    offsetY: -height / 2,
    zoom: LAYOUT.defaultZoom,
  });

  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<TonnetzNode | null>(null);
  const [hoveredTriad, setHoveredTriad] = useState<TriadRegion | null>(null);

  // Generated data
  const [nodes, setNodes] = useState<TonnetzNode[]>([]);
  const [regions, setRegions] = useState<TriadRegion[]>([]);

  // Heatmap lookup: key is "root-quality", value is normalized intensity [0,1]
  const heatmapLookup = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return new Map<string, number>();

    const maxVisits = Math.max(...heatmapData.map(s => s.visits));
    const lookup = new Map<string, number>();

    for (const stat of heatmapData) {
      const key = `${stat.root}-${stat.quality}`;
      lookup.set(key, stat.visits / maxVisits);
    }

    return lookup;
  }, [heatmapData]);

  // Regenerate nodes when view changes
  useEffect(() => {
    if (width > 0 && height > 0) {
      const newNodes = generateNodes(width, height, view.offsetX, view.offsetY, view.zoom);
      setNodes(newNodes);
      const newRegions = generateTriadRegions(newNodes);
      setRegions(newRegions);
    }
  }, [width, height, view]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Apply view transform
    ctx.save();
    ctx.scale(view.zoom, view.zoom);
    ctx.translate(-view.offsetX, -view.offsetY);

    // Draw triad regions (background layer)
    for (const region of regions) {
      drawTriadRegion(ctx, region, selectedTriad, hoveredTriad, showHeatmap, heatmapLookup);
    }

    // Draw edges between nodes
    drawEdges(ctx, nodes);

    // Draw nodes
    for (const node of nodes) {
      const isActive = activeNodes.has(node.pc) ||
        !!(selectedTriad && selectedTriad.nodes.some(n => n.pc === node.pc));
      const isHovered = hoveredNode?.pc === node.pc;
      drawNode(ctx, node, isActive, isHovered);
    }

    ctx.restore();
  }, [nodes, regions, selectedTriad, hoveredNode, hoveredTriad, activeNodes, view, width, height, showHeatmap, heatmapLookup]);

  // Convert screen coords to world coords
  const screenToWorld = useCallback((screenX: number, screenY: number): Point => {
    return {
      x: screenX / view.zoom + view.offsetX,
      y: screenY / view.zoom + view.offsetY,
    };
  }, [view]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (isDragging) {
      // Pan
      const dx = (e.clientX - dragStart.x) / view.zoom;
      const dy = (e.clientY - dragStart.y) / view.zoom;
      setView(v => ({
        ...v,
        offsetX: v.offsetX - dx,
        offsetY: v.offsetY - dy,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Hover detection
      const worldPos = screenToWorld(screenX, screenY);

      // Check nodes first (higher priority)
      const node = findNodeAtPoint(worldPos, nodes, LAYOUT.nodeRadius);
      setHoveredNode(node);

      // Check triads if no node
      if (!node) {
        const triad = findTriadAtPoint(worldPos, regions);
        setHoveredTriad(triad);
      } else {
        setHoveredTriad(null);
      }
    }
  }, [isDragging, dragStart, view, nodes, regions, screenToWorld]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setHoveredNode(null);
    setHoveredTriad(null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    // Check nodes first (use smaller hit radius than visual to leave room for triangle clicks)
    const clickRadius = LAYOUT.nodeRadius * 0.7;
    const node = findNodeAtPoint(worldPos, nodes, clickRadius);
    if (node) {
      onNodeClick(node);
      return;
    }

    // Check triads
    const triad = findTriadAtPoint(worldPos, regions);
    if (triad) {
      onTriadSelect(triad);
    } else {
      onTriadSelect(null);
    }
  }, [nodes, regions, screenToWorld, onNodeClick, onTriadSelect]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Zoom toward mouse position
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(LAYOUT.minZoom, Math.min(LAYOUT.maxZoom, view.zoom * zoomFactor));

    // Adjust offset to zoom toward mouse
    const worldX = screenX / view.zoom + view.offsetX;
    const worldY = screenY / view.zoom + view.offsetY;
    const newOffsetX = worldX - screenX / newZoom;
    const newOffsetY = worldY - screenY / newZoom;

    setView({
      zoom: newZoom,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });
  }, [view]);

  const cursor = isDragging ? 'grabbing' : (hoveredNode || hoveredTriad) ? 'pointer' : 'grab';

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onWheel={handleWheel}
      style={{ cursor }}
      className="block"
    />
  );
}

/**
 * Interpolate between two colors based on intensity.
 * Uses teal (#84a59d) for major and cyan (#b8ffff) for minor.
 */
function getHeatmapColor(intensity: number, quality: 'major' | 'minor'): string {
  // Intensity 0 = almost invisible, intensity 1 = fully saturated
  const alpha = 0.08 + intensity * 0.42;  // Range from 0.08 to 0.5

  if (quality === 'major') {
    // Tertiary color (#84a59d) - muted teal
    const r = Math.round(132 - intensity * 20);
    const g = Math.round(165 - intensity * 15);
    const b = Math.round(157 - intensity * 10);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } else {
    // Secondary color (#b8ffff) - cyan
    const r = Math.round(184 - intensity * 50);
    const g = Math.round(255 - intensity * 30);
    const b = Math.round(255 - intensity * 20);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

/**
 * Draw a triad region (triangular area between 3 nodes).
 */
function drawTriadRegion(
  ctx: CanvasRenderingContext2D,
  region: TriadRegion,
  selected: TriadRegion | null,
  hovered: TriadRegion | null,
  showHeatmap: boolean,
  heatmapLookup: Map<string, number>
) {
  const [n0, n1, n2] = region.nodes;
  const colors = region.quality === 'major' ? COLORS.triad.major : COLORS.triad.minor;

  const isSelected = selected?.id === region.id;
  const isHovered = hovered?.id === region.id;

  ctx.beginPath();
  ctx.moveTo(n0.screenPos.x, n0.screenPos.y);
  ctx.lineTo(n1.screenPos.x, n1.screenPos.y);
  ctx.lineTo(n2.screenPos.x, n2.screenPos.y);
  ctx.closePath();

  // Determine fill color
  let fillColor: string;

  if (isSelected) {
    fillColor = colors.activeFill;
  } else if (isHovered) {
    fillColor = colors.hoverFill;
  } else if (showHeatmap) {
    // Look up heatmap intensity for this triad
    const key = `${region.root}-${region.quality}`;
    const intensity = heatmapLookup.get(key) ?? 0;
    fillColor = getHeatmapColor(intensity, region.quality);
  } else {
    fillColor = colors.fill;
  }

  ctx.fillStyle = fillColor;
  ctx.fill();

  // Stroke for selected or high-intensity heatmap triads
  if (isSelected) {
    ctx.strokeStyle = colors.activeStroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (showHeatmap) {
    const key = `${region.root}-${region.quality}`;
    const intensity = heatmapLookup.get(key) ?? 0;
    if (intensity > 0.5) {
      // Add subtle stroke for high-visit triads - using teal/cyan
      ctx.strokeStyle = region.quality === 'major'
        ? `rgba(132, 165, 157, ${intensity * 0.5})`   // --tertiary teal
        : `rgba(184, 255, 255, ${intensity * 0.4})`; // --secondary cyan
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

/**
 * Draw edges connecting adjacent nodes.
 */
function drawEdges(ctx: CanvasRenderingContext2D, nodes: TonnetzNode[]) {
  const nodeMap = new Map<string, TonnetzNode>();
  for (const node of nodes) {
    nodeMap.set(`${node.gridPos.x},${node.gridPos.y}`, node);
  }

  ctx.strokeStyle = COLORS.edge.default;
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (const node of nodes) {
    const { x: col, y: row } = node.gridPos;

    // Right neighbor (fifth)
    const right = nodeMap.get(`${col + 1},${row}`);
    if (right) {
      ctx.moveTo(node.screenPos.x, node.screenPos.y);
      ctx.lineTo(right.screenPos.x, right.screenPos.y);
    }

    // Up neighbor (major third, +4)
    const up = nodeMap.get(`${col},${row + 1}`);
    if (up) {
      ctx.moveTo(node.screenPos.x, node.screenPos.y);
      ctx.lineTo(up.screenPos.x, up.screenPos.y);
    }

    // Down-right neighbor (minor third, +7-4 = +3)
    const downRight = nodeMap.get(`${col + 1},${row - 1}`);
    if (downRight) {
      ctx.moveTo(node.screenPos.x, node.screenPos.y);
      ctx.lineTo(downRight.screenPos.x, downRight.screenPos.y);
    }
  }

  ctx.stroke();
}

/**
 * Draw a pitch class node.
 */
function drawNode(
  ctx: CanvasRenderingContext2D,
  node: TonnetzNode,
  isActive: boolean,
  isHovered: boolean
) {
  const { screenPos, name } = node;
  const { nodeRadius, fontSize } = LAYOUT;

  // Determine colors
  let fillColor = COLORS.node.fill;
  let strokeColor = COLORS.node.stroke;
  let textColor = COLORS.node.text;

  if (isActive) {
    fillColor = COLORS.node.activeFill;
    strokeColor = COLORS.node.activeStroke;
    textColor = COLORS.node.activeText;
  } else if (isHovered) {
    fillColor = COLORS.node.hoverFill;
    strokeColor = COLORS.node.hoverStroke;
  }

  // Glow effect for active nodes
  if (isActive) {
    ctx.shadowColor = COLORS.node.activeFill;
    ctx.shadowBlur = 15;
  }

  // Circle
  ctx.beginPath();
  ctx.arc(screenPos.x, screenPos.y, nodeRadius, 0, Math.PI * 2);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isActive ? 2 : 1;
  ctx.stroke();

  // Reset shadow
  ctx.shadowBlur = 0;

  // Label
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, screenPos.x, screenPos.y);
}

export default TonnetzGrid;
