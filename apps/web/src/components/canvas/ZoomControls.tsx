'use client';

import React from 'react';
import { Plus, Minus, Maximize, RotateCcw } from 'lucide-react';
import { Camera } from '../../engine/Camera';

interface ZoomControlsProps {
  camera: Camera | null;
  onFitContent?: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ camera, onFitContent }) => {
  const [zoomPercent, setZoomPercent] = React.useState(100);

  React.useEffect(() => {
    if (!camera) return;
    const interval = setInterval(() => {
      setZoomPercent(Math.round(camera.zoom * 100));
    }, 100);
    return () => clearInterval(interval);
  }, [camera]);

  const handleZoomIn = () => {
    if (!camera) return;
    camera.setZoom(camera.zoom * 1.2);
  };

  const handleZoomOut = () => {
    if (!camera) return;
    camera.setZoom(camera.zoom / 1.2);
  };

  const handleResetZoom = () => {
    if (!camera) return;
    camera.setZoom(1.0);
  };

  return (
    <div className="fixed bottom-6 left-6 z-20 flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-panel rounded-2xl select-none text-slate-300 text-xs font-mono">
      <button
        id="btn-zoom-out"
        onClick={handleZoomOut}
        title="Zoom Out"
        className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <button
        id="btn-zoom-reset"
        onClick={handleResetZoom}
        title="Reset Zoom to 100%"
        className="px-2 py-1 min-w-[52px] text-center rounded-lg hover:bg-slate-800 transition font-semibold text-slate-200"
      >
        {zoomPercent}%
      </button>

      <button
        id="btn-zoom-in"
        onClick={handleZoomIn}
        title="Zoom In"
        className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

      {onFitContent && (
        <button
          id="btn-fit-content"
          onClick={onFitContent}
          title="Fit to Content (Shift+1)"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
