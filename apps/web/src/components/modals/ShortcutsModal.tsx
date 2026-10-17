'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

export const ShortcutsModal: React.FC = () => {
  const showShortcuts = useUIStore((s) => s.showShortcuts);
  const setShowShortcuts = useUIStore((s) => s.setShowShortcuts);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowShortcuts(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setShowShortcuts]);

  if (!showShortcuts) return null;

  const shortcutGroups = [
    {
      category: 'Tools',
      items: [
        { key: 'V', desc: 'Select tool' },
        { key: 'H', desc: 'Hand / Pan tool' },
        { key: 'P', desc: 'Pencil / Freehand' },
        { key: 'R', desc: 'Rectangle' },
        { key: 'O', desc: 'Ellipse' },
        { key: 'L', desc: 'Line' },
        { key: 'A', desc: 'Arrow' },
        { key: 'T', desc: 'Text box' },
        { key: 'S', desc: 'Sticky note' },
        { key: 'F', desc: 'Frame container' },
        { key: 'E', desc: 'Eraser' },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { key: 'Space + Drag', desc: 'Pan canvas' },
        { key: 'Wheel', desc: 'Zoom to point' },
        { key: 'Shift + 1', desc: 'Fit to content' },
        { key: 'Ctrl + 0', desc: 'Reset zoom (100%)' },
      ],
    },
    {
      category: 'Editing',
      items: [
        { key: 'Ctrl + Z', desc: 'Undo' },
        { key: 'Ctrl + Shift + Z', desc: 'Redo' },
        { key: 'Ctrl + C', desc: 'Copy selected' },
        { key: 'Ctrl + V', desc: 'Paste copied' },
        { key: 'Ctrl + D', desc: 'Duplicate selected' },
        { key: 'Backspace / Del', desc: 'Delete selected' },
      ],
    },
    {
      category: 'Selection',
      items: [
        { key: 'Ctrl + A', desc: 'Select all' },
        { key: 'Shift + Drag', desc: 'Marquee selection' },
        { key: 'Esc', desc: 'Clear selection' },
      ],
    },
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowShortcuts(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="bg-[#121622] border border-[#1e2536] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e2536]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Keyboard shortcuts</h2>
          </div>
          <button
            onClick={() => setShowShortcuts(false)}
            className="p-1 rounded-md text-[#64748b] hover:text-[#cbd5e1] hover:bg-[#182030] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="space-y-2">
              <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block">
                {group.category}
              </span>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-[#161c2b] border border-[#1f283d]"
                  >
                    <span className="text-[#94a3b8] text-[11px]">{item.desc}</span>
                    <kbd className="px-1.5 py-0.5 bg-[#0e121a] border border-[#252f44] rounded text-[10px] font-mono text-[#cbd5e1] shadow-xs">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0e121a] border-t border-[#1e2536] flex justify-end">
          <button
            onClick={() => setShowShortcuts(false)}
            className="px-3.5 py-1.5 bg-[#182030] hover:bg-[#202b40] text-[#e2e8f0] text-xs font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
