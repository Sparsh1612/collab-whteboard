'use client';

import React, { useState } from 'react';
import { X, Download, FileImage, FileCode, Check } from 'lucide-react';
import { getCombinedBounds } from '@whiteboard/shared';
import { useUIStore } from '../../stores/useUIStore';
import { useBoardStore } from '../../stores/useBoardStore';
import { Renderer } from '../../engine/Renderer';

type ExportFormat = 'PNG' | 'JSON';
type ExportBackground = 'canvas' | 'transparent';

export const ExportModal: React.FC = () => {
  const showExport = useUIStore((s) => s.showExport);
  const setShowExport = useUIStore((s) => s.setShowExport);
  const elements = useBoardStore((s) => s.elements);
  const title = useBoardStore((s) => s.title);

  const [format, setFormat] = useState<ExportFormat>('PNG');
  const [background, setBackground] = useState<ExportBackground>('canvas');
  const [scale, setScale] = useState<number>(2);
  const [exporting, setExporting] = useState(false);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowExport(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setShowExport]);

  if (!showExport) return null;

  const elementList = Array.from(elements.values());

  const handleExport = () => {
    if (elementList.length === 0) {
      alert('Canvas is empty. Add elements before exporting.');
      return;
    }

    setExporting(true);

    if (format === 'JSON') {
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
      setExporting(false);
      setShowExport(false);
      return;
    }

    // Export PNG
    const bounds = getCombinedBounds(elementList);
    if (!bounds) {
      setExporting(false);
      return;
    }

    const pad = 40;
    const width = Math.ceil(bounds.width + pad * 2);
    const height = Math.ceil(bounds.height + pad * 2);

    const offscreen = document.createElement('canvas');
    offscreen.width = width * scale;
    offscreen.height = height * scale;
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      setExporting(false);
      return;
    }

    ctx.scale(scale, scale);

    if (background === 'canvas') {
      ctx.fillStyle = '#0b0d13';
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
    setExporting(false);
    setShowExport(false);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowExport(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="bg-[#121622] border border-[#1e2536] rounded-xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e2536]">
          <h2 className="text-sm font-semibold text-white">Export canvas</h2>
          <button
            onClick={() => setShowExport(false)}
            className="p-1 rounded-md text-[#64748b] hover:text-[#cbd5e1] hover:bg-[#182030] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1.5">Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('PNG')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition ${
                  format === 'PNG'
                    ? 'bg-[#182238] border-blue-500/50 text-blue-400'
                    : 'bg-[#161c2b] border-[#1f283d] text-[#94a3b8] hover:text-[#f1f5f9]'
                }`}
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>PNG Image</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('JSON')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition ${
                  format === 'JSON'
                    ? 'bg-[#182238] border-blue-500/50 text-blue-400'
                    : 'bg-[#161c2b] border-[#1f283d] text-[#94a3b8] hover:text-[#f1f5f9]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JSON Data</span>
              </button>
            </div>
          </div>

          {format === 'PNG' && (
            <>
              {/* Resolution scale */}
              <div>
                <label className="block text-[11px] font-medium text-[#64748b] mb-1.5">
                  Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScale(s)}
                      className={`py-1.5 rounded-lg text-xs font-mono transition border ${
                        scale === s
                          ? 'bg-[#182238] border-blue-500/50 text-blue-400 font-semibold'
                          : 'bg-[#161c2b] border-[#1f283d] text-[#94a3b8] hover:text-[#f1f5f9]'
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Option */}
              <div>
                <label className="block text-[11px] font-medium text-[#64748b] mb-1.5">
                  Background
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBackground('canvas')}
                    className={`py-1.5 px-3 rounded-lg text-xs transition border ${
                      background === 'canvas'
                        ? 'bg-[#182238] border-blue-500/50 text-blue-400 font-medium'
                        : 'bg-[#161c2b] border-[#1f283d] text-[#94a3b8] hover:text-[#f1f5f9]'
                    }`}
                  >
                    Canvas
                  </button>
                  <button
                    type="button"
                    onClick={() => setBackground('transparent')}
                    className={`py-1.5 px-3 rounded-lg text-xs transition border ${
                      background === 'transparent'
                        ? 'bg-[#182238] border-blue-500/50 text-blue-400 font-medium'
                        : 'bg-[#161c2b] border-[#1f283d] text-[#94a3b8] hover:text-[#f1f5f9]'
                    }`}
                  >
                    Transparent
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Export Action */}
          <div className="pt-2">
            <button
              id="btn-export-png-confirm"
              onClick={handleExport}
              disabled={exporting}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exporting ? 'Exporting…' : `Export ${format}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
