'use client';

import React from 'react';
import {
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Palette,
  Minus,
  Sparkles,
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

  // If nothing is selected, we still show the panel for active tool defaults if useful,
  // or show when elements are selected.
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
        x: el.x + 24,
        y: el.y + 24,
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
    <div className="fixed top-20 left-6 z-20 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-float rounded-2xl p-4 text-xs text-slate-300 space-y-4 animate-in fade-in slide-in-from-left-4 duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
          {selectedIds.length === 1 ? 'Object Properties' : `${selectedIds.length} Objects Selected`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDuplicate}
            title="Duplicate (Ctrl+D)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Delete (Backspace/Del)"
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sticky Note Palette */}
      {isSticky && (
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Note Color</label>
          <div className="grid grid-cols-6 gap-1.5">
            {STICKY_PALETTE.map((item) => (
              <button
                key={item.value}
                onClick={() => handleStickyColor(item.value)}
                style={{ backgroundColor: item.value }}
                className="w-7 h-7 rounded-lg border border-black/10 hover:scale-110 active:scale-95 transition-all shadow-sm"
              />
            ))}
          </div>
        </div>
      )}

      {/* Stroke Color */}
      {!isSticky && (
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Stroke Color</label>
          <div className="grid grid-cols-6 gap-1.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => handleStrokeColor(c)}
                style={{ backgroundColor: c === 'transparent' ? '#1e293b' : c }}
                className={`w-7 h-7 rounded-lg border transition-all ${
                  style.strokeColor === c ? 'border-teal-400 ring-2 ring-teal-400/30' : 'border-slate-700'
                } ${c === 'transparent' ? 'relative overflow-hidden after:content-[""] after:absolute after:inset-0 after:border-t after:border-red-500 after:rotate-45' : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fill Color */}
      {!isSticky && !isText && (
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Fill Color</label>
          <div className="grid grid-cols-6 gap-1.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => handleFillColor(c)}
                style={{ backgroundColor: c === 'transparent' ? '#1e293b' : c }}
                className={`w-7 h-7 rounded-lg border transition-all ${
                  style.fillColor === c ? 'border-teal-400 ring-2 ring-teal-400/30' : 'border-slate-700'
                } ${c === 'transparent' ? 'relative overflow-hidden after:content-[""] after:absolute after:inset-0 after:border-t after:border-red-500 after:rotate-45' : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stroke Width */}
      {!isSticky && !isText && (
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Stroke Width</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 4, 8].map((w) => (
              <button
                key={w}
                onClick={() => handleStrokeWidth(w)}
                className={`h-7 rounded-lg border flex items-center justify-center font-mono font-medium transition ${
                  style.strokeWidth === w
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
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
          <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Stroke Style</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['solid', 'dashed', 'dotted'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStrokeStyle(s)}
                className={`h-7 capitalize rounded-lg border text-center transition ${
                  style.strokeStyle === s
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Opacity Slider */}
      <div>
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>Opacity</span>
          <span className="font-mono">{Math.round(style.opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={style.opacity}
          onChange={(e) => handleOpacity(parseFloat(e.target.value))}
          className="w-full accent-teal-500 bg-slate-800 cursor-pointer"
        />
      </div>

      {/* Layer Ordering */}
      <div className="pt-2 border-t border-slate-800">
        <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Arrange Layers</label>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => selectedIds[0] && reorderElement(selectedIds[0], 'front')}
            title="Bring to Front"
            className="h-7 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800 flex items-center justify-center text-slate-300"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedIds[0] && reorderElement(selectedIds[0], 'forward')}
            title="Bring Forward"
            className="h-7 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800 flex items-center justify-center text-slate-300"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedIds[0] && reorderElement(selectedIds[0], 'backward')}
            title="Send Backward"
            className="h-7 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800 flex items-center justify-center text-slate-300"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedIds[0] && reorderElement(selectedIds[0], 'back')}
            title="Send to Back"
            className="h-7 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800 flex items-center justify-center text-slate-300"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
