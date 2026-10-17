'use client';

import React from 'react';
import {
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
} from 'lucide-react';
import { COLOR_PALETTE, STICKY_PALETTE } from '@whiteboard/shared';
import { useUIStore } from '../../stores/useUIStore';
import { useBoardStore } from '../../stores/useBoardStore';

export const PropertiesPanel: React.FC = () => {
  const selectedIds = useUIStore((s) => s.selectedIds);
  const style = useUIStore((s) => s.style);
  const setStyle = useUIStore((s) => s.setStyle);
  const elements = useBoardStore((s) => s.elements);
  const updateElement = useBoardStore((s) => s.updateElement);
  const deleteElements = useBoardStore((s) => s.deleteElements);
  const reorderElement = useBoardStore((s) => s.reorderElement);
  const addElement = useBoardStore((s) => s.addElement);

  const hasSelection = selectedIds.length > 0;
  const selectedElements = selectedIds.map((id) => elements.get(id)).filter(Boolean);
  const isSticky = selectedElements.some((el) => el?.type === 'sticky');
  const isText = selectedElements.some((el) => el?.type === 'text');

  const handleStrokeColor = (color: string) => {
    setStyle({ strokeColor: color });
    selectedIds.forEach((id) => updateElement(id, { strokeColor: color }));
  };

  const handleFillColor = (color: string) => {
    setStyle({ fillColor: color });
    selectedIds.forEach((id) => updateElement(id, { fillColor: color }));
  };

  const handleStickyColor = (color: string) => {
    setStyle({ stickyColor: color });
    selectedIds.forEach((id) => updateElement(id, { stickyColor: color, fillColor: color }));
  };

  const handleStrokeWidth = (w: number) => {
    setStyle({ strokeWidth: w });
    selectedIds.forEach((id) => updateElement(id, { strokeWidth: w }));
  };

  const handleStrokeStyle = (s: 'solid' | 'dashed' | 'dotted') => {
    setStyle({ strokeStyle: s });
    selectedIds.forEach((id) => updateElement(id, { strokeStyle: s }));
  };

  const handleOpacity = (op: number) => {
    setStyle({ opacity: op });
    selectedIds.forEach((id) => updateElement(id, { opacity: op }));
  };

  const handleDelete = () => {
    deleteElements(selectedIds);
    useUIStore.getState().clearSelection();
  };

  const handleDuplicate = () => {
    const newIds: string[] = [];
    selectedElements.forEach((el) => {
      if (!el) return;
      const dup = {
        ...el,
        id: 'el-' + Math.random().toString(36).substring(2, 9),
        x: el.x + 20,
        y: el.y + 20,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addElement(dup);
      newIds.push(dup.id);
    });
    useUIStore.getState().setSelectedIds(newIds);
  };

  if (!hasSelection) return null;

  return (
    <aside
      aria-label="Object Properties"
      className="fixed top-16 left-4 z-20 w-60 bg-[#121622]/95 backdrop-blur-sm border border-[#1e2536] shadow-lg rounded-xl p-3.5 text-xs text-[#cbd5e1] space-y-3.5 select-none animate-in fade-in duration-150"
    >
      {/* Header with Object Properties text */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1e2536]">
        <span className="font-semibold text-xs text-white tracking-tight">
          {selectedIds.length === 1 ? 'Object Properties' : `Object Properties (${selectedIds.length})`}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleDuplicate}
            title="Duplicate (Ctrl+D)"
            className="p-1 rounded text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1a2133] transition"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Delete (Del)"
            className="p-1 rounded text-[#64748b] hover:text-rose-400 hover:bg-rose-950/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sticky Note Palette */}
      {isSticky && (
        <div>
          <label className="block text-[11px] font-medium text-[#64748b] mb-1.5">Note color</label>
          <div className="grid grid-cols-6 gap-1.5">
            {STICKY_PALETTE.map((item) => (
              <button
                key={item.value}
                onClick={() => handleStickyColor(item.value)}
                style={{ backgroundColor: item.value }}
                className="w-6 h-6 rounded border border-black/15 hover:scale-105 active:scale-95 transition-transform"
              />
            ))}
          </div>
        </div>
      )}

      {/* Stroke Color */}
      {!isSticky && (
        <div>
          <label className="block text-[11px] font-medium text-[#64748b] mb-1.5">Stroke</label>
          <div className="grid grid-cols-6 gap-1.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => handleStrokeColor(c)}
                style={{ backgroundColor: c === 'transparent' ? '#182030' : c }}
                className={`w-6 h-6 rounded border transition-all ${
                  style.strokeColor === c ? 'border-blue-400 ring-1 ring-blue-400/50' : 'border-[#263147]'
                } ${c === 'transparent' ? 'relative overflow-hidden after:content-[""] after:absolute after:inset-0 after:border-t after:border-rose-500 after:rotate-45' : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fill Color */}
      {!isSticky && !isText && (
        <div>
          <label className="block text-[11px] font-medium text-[#64748b] mb-1.5">Fill</label>
          <div className="grid grid-cols-6 gap-1.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => handleFillColor(c)}
                style={{ backgroundColor: c === 'transparent' ? '#182030' : c }}
                className={`w-6 h-6 rounded border transition-all ${
                  style.fillColor === c ? 'border-blue-400 ring-1 ring-blue-400/50' : 'border-[#263147]'
                } ${c === 'transparent' ? 'relative overflow-hidden after:content-[""] after:absolute after:inset-0 after:border-t after:border-rose-500 after:rotate-45' : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stroke Width */}
      {!isSticky && !isText && (
        <div>
          <label className="block text-[11px] font-medium text-[#64748b] mb-1.5">Width</label>
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 4, 8].map((w) => (
              <button
                key={w}
                onClick={() => handleStrokeWidth(w)}
                className={`h-6 rounded text-[11px] font-mono transition ${
                  style.strokeWidth === w
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-[#182030] text-[#94a3b8] hover:text-[#e2e8f0]'
                }`}
              >
                {w}px
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stroke Style */}
      {!isSticky && !isText && (
        <div>
          <label className="block text-[11px] font-medium text-[#64748b] mb-1.5">Style</label>
          <div className="grid grid-cols-3 gap-1">
            {(['solid', 'dashed', 'dotted'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStrokeStyle(s)}
                className={`h-6 capitalize rounded text-[11px] transition ${
                  style.strokeStyle === s
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-[#182030] text-[#94a3b8] hover:text-[#e2e8f0]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Opacity */}
      <div>
        <div className="flex justify-between text-[11px] text-[#64748b] mb-1">
          <span>Opacity</span>
          <span className="font-mono text-[#94a3b8]">{Math.round(style.opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={style.opacity}
          onChange={(e) => handleOpacity(parseFloat(e.target.value))}
          className="w-full accent-blue-500 bg-[#1e2536] h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Layer Ordering */}
      <div className="pt-2 border-t border-[#1e2536]">
        <label className="block text-[11px] font-medium text-[#64748b] mb-1.5">Layer</label>
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => selectedIds[0] && reorderElement(selectedIds[0], 'front')}
            title="Bring to front"
            className="h-6 rounded bg-[#182030] hover:bg-[#202b40] flex items-center justify-center text-[#94a3b8] hover:text-white transition"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedIds[0] && reorderElement(selectedIds[0], 'forward')}
            title="Bring forward"
            className="h-6 rounded bg-[#182030] hover:bg-[#202b40] flex items-center justify-center text-[#94a3b8] hover:text-white transition"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedIds[0] && reorderElement(selectedIds[0], 'backward')}
            title="Send backward"
            className="h-6 rounded bg-[#182030] hover:bg-[#202b40] flex items-center justify-center text-[#94a3b8] hover:text-white transition"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedIds[0] && reorderElement(selectedIds[0], 'back')}
            title="Send to back"
            className="h-6 rounded bg-[#182030] hover:bg-[#202b40] flex items-center justify-center text-[#94a3b8] hover:text-white transition"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
