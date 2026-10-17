'use client';

import React from 'react';
import { Activity, X, Eye, Cpu, Wifi } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useBoardStore } from '../../stores/useBoardStore';
import { CanvasElement } from '@whiteboard/shared';

export const PerformanceHUD: React.FC = () => {
  const showPerf = useUIStore((s) => s.showPerf);
  const setShowPerf = useUIStore((s) => s.setShowPerf);
  const devMetrics = useUIStore((s) => s.devMetrics);
  const addElement = useBoardStore((s) => s.addElement);

  const handleSpawnStress = (count: number) => {
    const types: ('rectangle' | 'ellipse' | 'sticky')[] = ['rectangle', 'ellipse', 'sticky'];
    const colors = ['#2563eb', '#6366f1', '#f59e0b', '#ec4899', '#10b981'];

    const spread = Math.sqrt(count) * 240;
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.round((Math.random() - 0.5) * spread);
      const y = Math.round((Math.random() - 0.5) * spread);
      const w = Math.round(120 + Math.random() * 80);
      const h = Math.round(80 + Math.random() * 60);

      const el: CanvasElement = {
        id: 'stress-' + Math.random().toString(36).substring(2, 9),
        type,
        x,
        y,
        width: w,
        height: h,
        rotation: 0,
        strokeColor: color,
        fillColor: type === 'sticky' ? '#fef08a' : color + '22',
        stickyColor: '#fef08a',
        strokeWidth: 2,
        strokeStyle: 'solid',
        opacity: 0.9,
        zIndex: i + 1,
        text: type === 'sticky' ? `Stress Item #${i + 1}` : undefined,
        fontSize: 14,
        createdBy: 'stress-test',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };
      addElement(el);
    }
  };

  if (!showPerf) return null;

  const fpsColor =
    devMetrics.fps >= 55
      ? 'text-emerald-400'
      : devMetrics.fps >= 30
      ? 'text-amber-400'
      : 'text-rose-400';

  return (
    <aside
      aria-label="Engine Telemetry"
      className="fixed bottom-20 right-4 z-30 w-64 bg-[#10141f]/95 backdrop-blur-sm border border-[#1e2536] shadow-lg rounded-xl p-3 text-xs font-mono text-[#cbd5e1] select-none animate-in fade-in duration-150"
    >
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#1e2536] font-sans">
        <div className="flex items-center gap-1.5 text-xs font-medium text-white">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>Telemetry</span>
        </div>
        <button
          onClick={() => setShowPerf(false)}
          className="text-[#64748b] hover:text-[#cbd5e1] transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5">
        {/* Frame Rate */}
        <div className="flex items-center justify-between py-1 px-2 rounded bg-[#161c2b] border border-[#1f283d]">
          <span className="text-[11px] text-[#64748b] font-sans">Frame rate</span>
          <span className={`font-semibold text-xs ${fpsColor}`}>{devMetrics.fps} FPS</span>
        </div>

        {/* Frame Time */}
        <div className="flex items-center justify-between py-1 px-2 rounded bg-[#161c2b] border border-[#1f283d]">
          <span className="text-[11px] text-[#64748b] font-sans">Frame time</span>
          <span className="text-[#cbd5e1] font-medium text-xs">{devMetrics.renderTimeMs} ms</span>
        </div>

        {/* Visible Objects */}
        <div className="flex items-center justify-between py-1 px-2 rounded bg-[#161c2b] border border-[#1f283d]">
          <span className="text-[11px] text-[#64748b] font-sans">Visible / Total</span>
          <span className="text-blue-400 font-medium text-xs">
            {devMetrics.visibleCount}{' '}
            <span className="text-[#64748b] font-normal">/ {devMetrics.totalCount}</span>
          </span>
        </div>

        {/* Roundtrip Latency */}
        <div className="flex items-center justify-between py-1 px-2 rounded bg-[#161c2b] border border-[#1f283d]">
          <span className="text-[11px] text-[#64748b] font-sans">WebSocket RTT</span>
          <span className="text-[#cbd5e1] font-medium text-xs">{devMetrics.wsLatencyMs} ms</span>
        </div>
      </div>

      {/* Stress Benchmark */}
      <div className="mt-2.5 pt-2 border-t border-[#1e2536]">
        <div className="text-[10px] text-[#64748b] font-sans mb-1.5">Stress test items</div>
        <div className="grid grid-cols-4 gap-1">
          {[100, 500, 1000, 5000].map((count) => (
            <button
              key={count}
              id={`btn-stress-${count}`}
              onClick={() => handleSpawnStress(count)}
              className="py-1 px-1 rounded bg-[#161c2b] hover:bg-[#1f283d] text-[10px] text-blue-400 font-mono text-center border border-[#1f283d] transition active:scale-95"
            >
              +{count}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
