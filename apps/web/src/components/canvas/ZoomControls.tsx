'use client';

import React from 'react';
import { Plus, Minus, Maximize } from 'lucide-react';
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
    }, 120);
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
    <div className="fixed bottom-5 left-4 z-20 flex items-center gap-0.5 p-1 bg-[#121622]/95 backdrop-blur-sm border border-[#1e2536] shadow-sm rounded-lg select-none text-[#cbd5e1] text-xs font-mono">
      <button
        id="btn-zoom-out"
        onClick={handleZoomOut}
        title="Zoom out"
        className="p-1.5 rounded-md text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182030] transition"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <button
        id="btn-zoom-reset"
        onClick={handleResetZoom}
        title="Reset zoom to 100%"
        className="px-2 py-0.5 min-w-[48px] text-center rounded text-[11px] hover:bg-[#182030] transition font-medium text-[#cbd5e1]"
      >
        {zoomPercent}%
      </button>

      <button
        id="btn-zoom-in"
        onClick={handleZoomIn}
        title="Zoom in"
        className="p-1.5 rounded-md text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182030] transition"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {onFitContent && (
        <>
          <div className="w-[1px] h-3.5 bg-[#1e2536] mx-0.5" />
          <button
            id="btn-fit-content"
            onClick={onFitContent}
            title="Fit to content (Shift+1)"
            className="p-1.5 rounded-md text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#182030] transition"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
};
