import { ElementType } from './element.js';

export type ToolType =
  | 'select'
  | 'hand'
  | 'pencil'
  | 'eraser'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'text'
  | 'sticky'
  | 'frame';

export interface StyleDefaults {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  opacity: number;
  fontSize: number;
  fontFamily: string;
  stickyColor: string;
}

export const DEFAULT_STYLE: StyleDefaults = {
  strokeColor: '#1e293b',
  fillColor: 'transparent',
  strokeWidth: 2,
  strokeStyle: 'solid',
  opacity: 1,
  fontSize: 18,
  fontFamily: 'Inter, system-ui, sans-serif',
  stickyColor: '#fef08a', // Amber/Yellow
};

export const STICKY_PALETTE = [
  { name: 'Yellow', value: '#fef08a', text: '#713f12' },
  { name: 'Green', value: '#bbf7d0', text: '#14532d' },
  { name: 'Blue', value: '#bae6fd', text: '#0c4a6e' },
  { name: 'Pink', value: '#fbcfe8', text: '#831843' },
  { name: 'Purple', value: '#e9d5ff', text: '#581c87' },
  { name: 'Orange', value: '#fed7aa', text: '#7c2d12' },
];

export const COLOR_PALETTE = [
  '#000000',
  '#334155',
  '#64748b',
  '#dc2626',
  '#ea580c',
  '#d97706',
  '#16a34a',
  '#0284c7',
  '#2563eb',
  '#7c3aed',
  '#db2777',
  'transparent',
];
