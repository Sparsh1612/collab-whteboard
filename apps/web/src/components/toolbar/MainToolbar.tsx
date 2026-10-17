'use client';

import React from 'react';
import {
  MousePointer2,
  Hand,
  Pencil,
  Square,
  Circle,
  Minus,
  ArrowUpRight,
  Type,
  StickyNote,
  Eraser,
  Undo2,
  Redo2,
  Layers,
} from 'lucide-react';
import { ToolType } from '@whiteboard/shared';
import { useUIStore } from '../../stores/useUIStore';

interface MainToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const MainToolbar: React.FC<MainToolbarProps> = ({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const activeTool = useUIStore((s) => s.activeTool);
  const setActiveTool = useUIStore((s) => s.setActiveTool);

  const tools: { id: ToolType; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'select', label: 'Select', icon: <MousePointer2 className="w-4 h-4" />, shortcut: 'V' },
    { id: 'hand', label: 'Pan / Hand', icon: <Hand className="w-4 h-4" />, shortcut: 'H' },
    { id: 'pencil', label: 'Draw / Pencil', icon: <Pencil className="w-4 h-4" />, shortcut: 'P' },
    { id: 'rectangle', label: 'Rectangle', icon: <Square className="w-4 h-4" />, shortcut: 'R' },
    { id: 'ellipse', label: 'Ellipse', icon: <Circle className="w-4 h-4" />, shortcut: 'O' },
    { id: 'line', label: 'Line', icon: <Minus className="w-4 h-4" />, shortcut: 'L' },
    { id: 'arrow', label: 'Arrow', icon: <ArrowUpRight className="w-4 h-4" />, shortcut: 'A' },
    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" />, shortcut: 'T' },
    { id: 'sticky', label: 'Sticky Note', icon: <StickyNote className="w-4 h-4" />, shortcut: 'S' },
    { id: 'frame', label: 'Frame', icon: <Layers className="w-4 h-4" />, shortcut: 'F' },
    { id: 'eraser', label: 'Eraser', icon: <Eraser className="w-4 h-4" />, shortcut: 'E' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 max-w-[calc(100vw-1.5rem)] overflow-x-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-float rounded-2xl select-none transition-all">
      {tools.map((t) => {
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            id={`tool-${t.id}`}
            onClick={() => setActiveTool(t.id)}
            title={`${t.label} (${t.shortcut})`}
            className={`relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 ${
              isActive
                ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/25 scale-105'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 active:scale-95'
            }`}
          >
            {t.icon}
            {/* Tooltip */}
            <span className="absolute -top-9 px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
              {t.label} <span className="text-slate-400 font-mono text-[10px] ml-1">({t.shortcut})</span>
            </span>
          </button>
        );
      })}

      <div className="w-[1px] h-6 bg-slate-800 mx-1" />

      {/* Undo / Redo */}
      <button
        id="btn-undo"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        id="btn-redo"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <Redo2 className="w-4 h-4" />
      </button>
    </div>
  );
};
