'use client';

import React from 'react';
import { Activity, Eye, Layers, Wifi, Cpu, X, Zap } from 'lucide-react';
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
    const colors = ['#0d9488', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6'];

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
    <aside aria-label="Engine Telemetry" className="fixed bottom-24 right-6 z-30 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-float rounded-2xl p-4 text-xs font-mono text-slate-300 animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-sans">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <span className="font-semibold text-slate-200">Engine Telemetry</span>
        </div>
        <button
          onClick={() => setShowPerf(false)}
          className="text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {/* FPS */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
          <div className="flex items-center gap-2 text-slate-400 font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Frame Rate</span>
          </div>
          <span className={`font-bold text-sm ${fpsColor}`}>{devMetrics.fps} FPS</span>
        </div>

        {/* Render Time */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
          <div className="flex items-center gap-2 text-slate-400 font-sans">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Frame Time</span>
          </div>
          <span className="text-slate-200 font-semibold">{devMetrics.renderTimeMs} ms</span>
        </div>

        {/* Culling stats: Visible vs Total */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
          <div className="flex items-center gap-2 text-slate-400 font-sans">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Visible Objects</span>
          </div>
          <span className="text-teal-400 font-semibold">
            {devMetrics.visibleCount}{' '}
            <span className="text-slate-500 font-normal">/ {devMetrics.totalCount}</span>
          </span>
        </div>

        {/* WebSocket Latency */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
          <div className="flex items-center gap-2 text-slate-400 font-sans">
            <Wifi className="w-3.5 h-3.5 text-amber-400" />
            <span>WS Roundtrip</span>
          </div>
          <span className="text-slate-200 font-semibold">{devMetrics.wsLatencyMs} ms</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-sans font-semibold text-slate-300 mb-2">
          <span>Benchmark Stress Test</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[100, 500, 1000, 5000].map((count) => (
            <button
              key={count}
              id={`btn-stress-${count}`}
              onClick={() => handleSpawnStress(count)}
              className="py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-teal-300 font-mono text-center border border-slate-700/60 transition active:scale-95"
            >
              +{count}
            </button>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-slate-400 text-center font-sans">
          Spatial Hash Grid Culling (500px Buckets)
        </div>
      </div>
    </aside>
  );
};
