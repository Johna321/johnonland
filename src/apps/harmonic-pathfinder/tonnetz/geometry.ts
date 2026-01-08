import type { Point, TonnetzNode, TriadRegion } from './types';
import { NOTE_NAMES, LAYOUT } from './types';

/**
 * Tonnetz Geometry
 *
 * The Tonnetz is a triangular lattice where:
 * - Each NODE is a pitch class (one of 12 notes)
 * - Moving RIGHT = +7 semitones (perfect fifth)
 * - Moving UP-RIGHT = +4 semitones (major third)
 * - Moving UP-LEFT = +3 semitones (minor third)
 *
 * This creates a pattern where:
 * - Upward triangles (△) = minor triads
 * - Downward triangles (▽) = major triads
 *
 * The lattice is infinite (wraps as a torus), so we generate
 * enough nodes to fill the viewport with buffer for panning.
 */

const { nodeSpacing } = LAYOUT;

// Height of equilateral triangle with given base
const TRIANGLE_HEIGHT = nodeSpacing * Math.sqrt(3) / 2;

/**
 * Convert axial grid coordinates to screen position.
 * Uses a skewed coordinate system for triangular lattice.
 */
export function gridToScreen(col: number, row: number): Point {
  // Triangular lattice: each row is offset by half a column
  const x = col * nodeSpacing + row * (nodeSpacing / 2);
  const y = row * TRIANGLE_HEIGHT;
  return { x, y };
}

/**
 * Convert screen position to approximate grid coordinates.
 */
export function screenToGrid(x: number, y: number): Point {
  const row = y / TRIANGLE_HEIGHT;
  const col = (x - row * (nodeSpacing / 2)) / nodeSpacing;
  return { x: col, y: row };
}

/**
 * Calculate pitch class at a given grid position.
 *
 * Moving right (+1 col) = +7 semitones (fifth)
 * Moving up (+1 row) = +4 semitones (major third)
 */
export function getPitchClassAt(col: number, row: number): number {
  // Start from C (pitch class 0) at origin
  // Each column right = +7, each row up = +4
  const pc = (0 + col * 7 + row * 4) % 12;
  return pc < 0 ? pc + 12 : pc;
}

/**
 * Generate all nodes within a viewport.
 */
export function generateNodes(
  viewportWidth: number,
  viewportHeight: number,
  offsetX: number,
  offsetY: number,
  zoom: number
): TonnetzNode[] {
  const nodes: TonnetzNode[] = [];

  // Calculate visible range with buffer
  const buffer = 3;
  const effectiveWidth = viewportWidth / zoom;
  const effectiveHeight = viewportHeight / zoom;

  // Convert viewport bounds to grid coordinates
  const startGrid = screenToGrid(offsetX - buffer * nodeSpacing, offsetY - buffer * TRIANGLE_HEIGHT);
  const endGrid = screenToGrid(
    offsetX + effectiveWidth + buffer * nodeSpacing,
    offsetY + effectiveHeight + buffer * TRIANGLE_HEIGHT
  );

  const minCol = Math.floor(startGrid.x) - buffer;
  const maxCol = Math.ceil(endGrid.x) + buffer;
  const minRow = Math.floor(startGrid.y) - buffer;
  const maxRow = Math.ceil(endGrid.y) + buffer;

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const pc = getPitchClassAt(col, row);
      const screenPos = gridToScreen(col, row);

      nodes.push({
        id: `${NOTE_NAMES[pc]}_${col}_${row}`,
        pc,
        name: NOTE_NAMES[pc],
        gridPos: { x: col, y: row },
        screenPos,
      });
    }
  }

  return nodes;
}

/**
 * Generate triangular triad regions from nodes.
 *
 * For each pair of adjacent nodes, we can form triangles:
 * - Downward triangle (▽): node + right + down-right → PCs: base, +7, +3 = MINOR triad
 * - Upward triangle (△): node + right + up → PCs: base, +7, +4 = MAJOR triad
 */
export function generateTriadRegions(nodes: TonnetzNode[]): TriadRegion[] {
  const regions: TriadRegion[] = [];
  const nodeMap = new Map<string, TonnetzNode>();

  // Index nodes by grid position
  for (const node of nodes) {
    const key = `${node.gridPos.x},${node.gridPos.y}`;
    nodeMap.set(key, node);
  }

  const getNode = (col: number, row: number): TonnetzNode | undefined => {
    return nodeMap.get(`${col},${row}`);
  };

  // Track which triangles we've already created (by grid position to avoid duplicates)
  const seenTriangles = new Set<string>();

  for (const node of nodes) {
    const { x: col, y: row } = node.gridPos;

    const rightNode = getNode(col + 1, row);

    // Downward triangle (▽) = MINOR triad
    // Nodes: current (base), right (+7), down-right (+3)
    const downRightNode = getNode(col + 1, row - 1);

    if (rightNode && downRightNode) {
      // Key by grid position to avoid adding same physical triangle twice
      const triangleKey = `${col},${row},down`;

      if (!seenTriangles.has(triangleKey)) {
        const root = findMinorRoot(node.pc, rightNode.pc, downRightNode.pc);
        if (root !== null) {
          seenTriangles.add(triangleKey);
          regions.push({
            id: `${NOTE_NAMES[root]}-min-${col}-${row}`,
            root,
            quality: 'minor',
            nodes: [node, rightNode, downRightNode],
            center: triangleCenter([node.screenPos, rightNode.screenPos, downRightNode.screenPos]),
          });
        }
      }
    }

    // Upward triangle (△) = MAJOR triad
    // Nodes: current (base), right (+7), up (+4)
    const upNode = getNode(col, row + 1);

    if (rightNode && upNode) {
      const triangleKey = `${col},${row},up`;

      if (!seenTriangles.has(triangleKey)) {
        const root = findMajorRoot(node.pc, rightNode.pc, upNode.pc);
        if (root !== null) {
          seenTriangles.add(triangleKey);
          regions.push({
            id: `${NOTE_NAMES[root]}-maj-${col}-${row}`,
            root,
            quality: 'major',
            nodes: [node, rightNode, upNode],
            center: triangleCenter([node.screenPos, rightNode.screenPos, upNode.screenPos]),
          });
        }
      }
    }
  }

  return regions;
}

/**
 * Find the root of a major triad given 3 pitch classes.
 * Major triad: root, root+4, root+7
 */
function findMajorRoot(a: number, b: number, c: number): number | null {
  const pcs = [a, b, c];
  for (const root of pcs) {
    const third = (root + 4) % 12;
    const fifth = (root + 7) % 12;
    if (pcs.includes(third) && pcs.includes(fifth)) {
      return root;
    }
  }
  return null;
}

/**
 * Find the root of a minor triad given 3 pitch classes.
 * Minor triad: root, root+3, root+7
 */
function findMinorRoot(a: number, b: number, c: number): number | null {
  const pcs = [a, b, c];
  for (const root of pcs) {
    const third = (root + 3) % 12;
    const fifth = (root + 7) % 12;
    if (pcs.includes(third) && pcs.includes(fifth)) {
      return root;
    }
  }
  return null;
}

/**
 * Calculate center of a triangle.
 */
function triangleCenter(vertices: [Point, Point, Point]): Point {
  return {
    x: (vertices[0].x + vertices[1].x + vertices[2].x) / 3,
    y: (vertices[0].y + vertices[1].y + vertices[2].y) / 3,
  };
}

/**
 * Check if a point is inside a triangle.
 */
export function pointInTriangle(p: Point, v0: Point, v1: Point, v2: Point): boolean {
  const sign = (p1: Point, p2: Point, p3: Point) =>
    (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);

  const d1 = sign(p, v0, v1);
  const d2 = sign(p, v1, v2);
  const d3 = sign(p, v2, v0);

  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

  return !(hasNeg && hasPos);
}

/**
 * Find which triad region contains a point.
 */
export function findTriadAtPoint(p: Point, regions: TriadRegion[]): TriadRegion | null {
  for (const region of regions) {
    const [n0, n1, n2] = region.nodes;
    if (pointInTriangle(p, n0.screenPos, n1.screenPos, n2.screenPos)) {
      return region;
    }
  }
  return null;
}

/**
 * Find which node is closest to a point (within radius).
 */
export function findNodeAtPoint(p: Point, nodes: TonnetzNode[], radius: number): TonnetzNode | null {
  for (const node of nodes) {
    const dx = p.x - node.screenPos.x;
    const dy = p.y - node.screenPos.y;
    if (dx * dx + dy * dy <= radius * radius) {
      return node;
    }
  }
  return null;
}

/**
 * Get the 3 pitch classes of a triad.
 */
export function getTriadPitchClasses(root: number, quality: 'major' | 'minor'): [number, number, number] {
  if (quality === 'major') {
    return [root, (root + 4) % 12, (root + 7) % 12];
  } else {
    return [root, (root + 3) % 12, (root + 7) % 12];
  }
}

/**
 * Apply a PLR transform to get the adjacent triad.
 */
export function applyTransform(
  root: number,
  quality: 'major' | 'minor',
  transform: 'P' | 'L' | 'R'
): { root: number; quality: 'major' | 'minor' } {
  if (transform === 'P') {
    // Parallel: same root, flip quality
    return { root, quality: quality === 'major' ? 'minor' : 'major' };
  }

  if (transform === 'L') {
    // Leading-tone exchange
    if (quality === 'major') {
      return { root: (root + 4) % 12, quality: 'minor' };
    } else {
      return { root: (root + 8) % 12, quality: 'major' };
    }
  }

  if (transform === 'R') {
    // Relative
    if (quality === 'major') {
      return { root: (root + 9) % 12, quality: 'minor' };
    } else {
      return { root: (root + 3) % 12, quality: 'major' };
    }
  }

  return { root, quality };
}

/**
 * Find which nodes are shared between two triads (for PLR visualization).
 */
export function findSharedNodes(
  triad1: TriadRegion,
  triad2: TriadRegion
): TonnetzNode[] {
  const pcs1 = new Set(triad1.nodes.map(n => n.pc));
  return triad2.nodes.filter(n => pcs1.has(n.pc));
}
