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
    { id: 'select', label: 'Select', icon: <MousePointer2 className="w-3.5 h-3.5" />, shortcut: 'V' },
    { id: 'hand', label: 'Hand / Pan', icon: <Hand className="w-3.5 h-3.5" />, shortcut: 'H' },
    { id: 'pencil', label: 'Draw', icon: <Pencil className="w-3.5 h-3.5" />, shortcut: 'P' },
    { id: 'rectangle', label: 'Rectangle', icon: <Square className="w-3.5 h-3.5" />, shortcut: 'R' },
    { id: 'ellipse', label: 'Ellipse', icon: <Circle className="w-3.5 h-3.5" />, shortcut: 'O' },
    { id: 'line', label: 'Line', icon: <Minus className="w-3.5 h-3.5" />, shortcut: 'L' },
    { id: 'arrow', label: 'Arrow', icon: <ArrowUpRight className="w-3.5 h-3.5" />, shortcut: 'A' },
    { id: 'text', label: 'Text', icon: <Type className="w-3.5 h-3.5" />, shortcut: 'T' },
    { id: 'sticky', label: 'Sticky note', icon: <StickyNote className="w-3.5 h-3.5" />, shortcut: 'S' },
    { id: 'frame', label: 'Frame', icon: <Layers className="w-3.5 h-3.5" />, shortcut: 'F' },
    { id: 'eraser', label: 'Eraser', icon: <Eraser className="w-3.5 h-3.5" />, shortcut: 'E' },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 p-1 max-w-[calc(100vw-1.5rem)] overflow-x-auto bg-[#121622]/95 backdrop-blur-sm border border-[#1e2536] shadow-lg rounded-xl select-none transition-all">
      {tools.map((t) => {
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            id={`tool-${t.id}`}
            onClick={() => setActiveTool(t.id)}
            title={`${t.label} (${t.shortcut})`}
            className={`relative group flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182030]'
            }`}
          >
            {t.icon}

            {/* Restrained Tooltip */}
            <span className="absolute -top-8 px-2 py-0.5 bg-[#0e121a] border border-[#1e2536] text-[#cbd5e1] text-[11px] rounded pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-40">
              {t.label} <kbd className="text-[#64748b] font-mono text-[10px] ml-1">{t.shortcut}</kbd>
            </span>
          </button>
        );
      })}

      <div className="w-[1px] h-5 bg-[#1e2536] mx-1" />

      {/* Undo / Redo */}
      <button
        id="btn-undo"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="flex items-center justify-center w-8 h-8 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182030] disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>

      <button
        id="btn-redo"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        className="flex items-center justify-center w-8 h-8 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182030] disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
