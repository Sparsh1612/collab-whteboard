'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

export const ShortcutsModal: React.FC = () => {
  const showShortcuts = useUIStore((s) => s.showShortcuts);
  const setShowShortcuts = useUIStore((s) => s.setShowShortcuts);

  if (!showShortcuts) return null;

  const shortcuts = [
    {
      category: 'Drawing & Tools',
      items: [
        { key: 'V', desc: 'Select tool' },
        { key: 'H', desc: 'Hand / Pan tool' },
        { key: 'P', desc: 'Pencil / Freehand' },
        { key: 'R', desc: 'Rectangle shape' },
        { key: 'O', desc: 'Ellipse / Circle' },
        { key: 'L', desc: 'Line' },
        { key: 'A', desc: 'Arrow' },
        { key: 'T', desc: 'Text box' },
        { key: 'S', desc: 'Sticky note' },
        { key: 'F', desc: 'Frame container' },
        { key: 'E', desc: 'Eraser' },
      ],
    },
    {
      category: 'Navigation & Canvas',
      items: [
        { key: 'Space + Drag', desc: 'Pan around canvas' },
        { key: 'Wheel / Pinch', desc: 'Zoom toward cursor' },
        { key: 'Ctrl + 0', desc: 'Reset zoom to 100%' },
        { key: 'Shift + Drag', desc: 'Constrain proportions / Marquee' },
      ],
    },
    {
      category: 'Editing & History',
      items: [
        { key: 'Ctrl + Z', desc: 'Undo' },
        { key: 'Ctrl + Shift + Z', desc: 'Redo' },
        { key: 'Ctrl + C', desc: 'Copy selected' },
        { key: 'Ctrl + V', desc: 'Paste' },
        { key: 'Ctrl + D', desc: 'Duplicate selected' },
        { key: 'Ctrl + A', desc: 'Select all elements' },
        { key: 'Del / Backspace', desc: 'Delete selected' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-float overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-400">Pro-level navigation and whiteboard controls</p>
            </div>
          </div>
          <button
            onClick={() => setShowShortcuts(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800/60"
                  >
                    <span className="text-slate-300">{item.desc}</span>
                    <kbd className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[11px] font-mono text-slate-200 shadow-sm">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setShowShortcuts(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
