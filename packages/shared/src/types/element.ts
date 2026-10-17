export type ElementType =
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'pencil'
  | 'text'
  | 'sticky'
  | 'frame';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type TextAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type ArrowMarker = 'none' | 'arrow' | 'circle';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // In radians
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  zIndex: number;
  locked?: boolean;
  
  // Specific properties
  points?: Point[]; // For pencil / freehand
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: TextAlign;
  verticalAlign?: VerticalAlign;
  stickyColor?: string;
  arrowStart?: ArrowMarker;
  arrowEnd?: ArrowMarker;
  label?: string; // For frame or groups
  
  // Metadata
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export type ResizeHandle = 'tl' | 'tr' | 'bl' | 'br' | 'tm' | 'bm' | 'ml' | 'mr' | 'rot';
