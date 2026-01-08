// Core types for Tonnetz visualization

export interface Point {
  x: number;
  y: number;
}

// A node in the Tonnetz lattice (represents a pitch class)
export interface TonnetzNode {
  id: string;              // e.g., "C_0_0" (note + grid coords)
  pc: number;              // pitch class 0-11
  name: string;            // note name: C, C#, D, etc.
  gridPos: Point;          // axial grid coordinates
  screenPos: Point;        // screen position (computed)
}

// A triangular region between 3 nodes (represents a triad)
export interface TriadRegion {
  id: string;              // e.g., "C-maj"
  root: number;            // pitch class of root
  quality: 'major' | 'minor';
  nodes: [TonnetzNode, TonnetzNode, TonnetzNode];  // the 3 corner nodes
  center: Point;           // center point for labels
}

// PLR transform types
export type Transform = 'P' | 'L' | 'R';

// Note names
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// Color scheme - matches CSS variables (LIGHT theme)
// --light: #111114 (dark text)
// --lightgray: #393639
// --gray: #646464
// --darkgray: #d4d4d4
// --dark: #ebebec (light background)
// --secondary: #b8ffff (cyan)
// --tertiary: #84a59d (muted teal)
export const COLORS = {
  background: '#ebebec',  // --dark (light background)

  // Nodes
  node: {
    fill: '#ffffff',
    stroke: '#d4d4d4',     // --darkgray
    text: '#111114',       // --light
    hoverFill: '#f5f5f5',
    hoverStroke: '#646464',  // --gray
    activeFill: '#84a59d',   // --tertiary
    activeStroke: '#84a59d',
    activeText: '#111114',
  },

  // Edges
  edge: {
    default: 'rgba(100, 100, 100, 0.25)',   // --gray with alpha
    fifth: 'rgba(100, 100, 100, 0.35)',
    majorThird: 'rgba(100, 100, 100, 0.25)',
    minorThird: 'rgba(100, 100, 100, 0.25)',
    active: '#84a59d',   // --tertiary
  },

  // Triad regions - subtle, using teal/cyan colors
  triad: {
    major: {
      fill: 'rgba(132, 165, 157, 0.08)',   // --tertiary, very subtle
      stroke: 'rgba(132, 165, 157, 0.2)',
      hoverFill: 'rgba(132, 165, 157, 0.18)',
      activeFill: 'rgba(132, 165, 157, 0.35)',
      activeStroke: 'rgba(132, 165, 157, 0.7)',
    },
    minor: {
      fill: 'rgba(184, 255, 255, 0.06)',   // --secondary cyan, subtle
      stroke: 'rgba(184, 255, 255, 0.15)',
      hoverFill: 'rgba(184, 255, 255, 0.15)',
      activeFill: 'rgba(184, 255, 255, 0.30)',
      activeStroke: 'rgba(184, 255, 255, 0.6)',
    },
  },
};

// Layout constants
export const LAYOUT = {
  nodeRadius: 22,
  nodeSpacing: 70,         // distance between adjacent nodes
  fontSize: 12,
  minZoom: 0.3,
  maxZoom: 3,
  defaultZoom: 1,
};
