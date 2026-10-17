'use client';

import React, { useState } from 'react';
import { X, Download, FileImage, Code2, FileText, Check } from 'lucide-react';
import { getCombinedBounds } from '@whiteboard/shared';
import { useUIStore } from '../../stores/useUIStore';
import { useBoardStore } from '../../stores/useBoardStore';
import { Renderer } from '../../engine/Renderer';

export const ExportModal: React.FC = () => {
  const showExport = useUIStore((s) => s.showExport);
  const setShowExport = useUIStore((s) => s.setShowExport);
  const elements = useBoardStore((s) => s.elements);
  const title = useBoardStore((s) => s.title);

  const [transparent, setTransparent] = useState(false);
  const [scale, setScale] = useState(2); // 2x retina crisp export
  const [downloading, setDownloading] = useState(false);

  if (!showExport) return null;

  const elementList = Array.from(elements.values());

  const handleExportPNG = () => {
    if (elementList.length === 0) {
      alert('Canvas is empty. Add elements before exporting.');
      return;
    }
    setDownloading(true);

    const bounds = getCombinedBounds(elementList);
    if (!bounds) return;

    const pad = 40;
    const width = Math.ceil(bounds.width + pad * 2);
    const height = Math.ceil(bounds.height + pad * 2);

    const offscreen = document.createElement('canvas');
    offscreen.width = width * scale;
    offscreen.height = height * scale;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);

    if (!transparent) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.save();
    ctx.translate(-bounds.minX + pad, -bounds.minY + pad);

    for (const el of elementList) {
      Renderer.renderElement(ctx, el, 'dark');
    }
    ctx.restore();

    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '-') || 'whiteboard'}.png`;
    link.href = offscreen.toDataURL('image/png');
    link.click();
    setDownloading(false);
    setShowExport(false);
  };

  const handleExportJSON = () => {
    const data = {
      title,
      version: 1,
      exportedAt: new Date().toISOString(),
      elements: elementList,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '-') || 'whiteboard'}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setShowExport(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-float overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Export Canvas</h2>
              <p className="text-xs text-slate-400">Save your board as high-res images or data</p>
            </div>
          </div>
          <button
            onClick={() => setShowExport(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Options */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs">
            <span className="text-slate-300">Transparent Background</span>
            <input
              type="checkbox"
              checked={transparent}
              onChange={(e) => setTransparent(e.target.checked)}
              className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs">
            <span className="text-slate-300">Resolution Scale</span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                    scale === s
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              id="btn-export-png-confirm"
              onClick={handleExportPNG}
              disabled={downloading}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-800/80 border border-slate-700/80 text-left transition group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 group-hover:scale-105 transition">
                  <FileImage className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-100">Export PNG Image</div>
                  <div className="text-[11px] text-slate-400">Crisp vector rasterization (recommended)</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition" />
            </button>

            <button
              id="btn-export-json-confirm"
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-800/80 border border-slate-700/80 text-left transition group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 group-hover:scale-105 transition">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-100">Export JSON Schema</div>
                  <div className="text-[11px] text-slate-400">Raw element definitions & layout data</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setShowExport(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
