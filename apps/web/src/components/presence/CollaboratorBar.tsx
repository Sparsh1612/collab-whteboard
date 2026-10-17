'use client';

import React from 'react';
import Link from 'next/link';
import {
  Share2,
  Download,
  HelpCircle,
  Activity,
  Sun,
  Moon,
  ChevronLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { useCollabStore } from '../../stores/useCollabStore';
import { useBoardStore } from '../../stores/useBoardStore';
import { useUIStore } from '../../stores/useUIStore';
import { CanvasFlowLogo } from '../ui/CanvasFlowLogo';

export const CollaboratorBar: React.FC = () => {
  const status = useCollabStore((s) => s.status);
  const collaborators = useCollabStore((s) => s.collaborators);
  const currentUserId = useCollabStore((s) => s.currentUserId);
  const title = useBoardStore((s) => s.title);
  const setTitle = useBoardStore((s) => s.setTitle);
  const isDirty = useBoardStore((s) => s.isDirty);
  const role = useBoardStore((s) => s.role);

  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const setShowShare = useUIStore((s) => s.setShowShare);
  const setShowExport = useUIStore((s) => s.setShowExport);
  const setShowShortcuts = useUIStore((s) => s.setShowShortcuts);
  const showPerf = useUIStore((s) => s.showPerf);
  const setShowPerf = useUIStore((s) => s.setShowPerf);

  const collabList = Array.from(collaborators.values());

  return (
    <header className="fixed top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none select-none">
      {/* Top Left: CanvasFlow Icon + Dashboard Return + Title + Understated Save Status */}
      <div className="flex items-center gap-2 bg-[#121622]/90 backdrop-blur-sm border border-[#1e2536] shadow-sm rounded-lg px-2.5 py-1.5 pointer-events-auto">
        <Link
          href="/dashboard"
          title="Back to dashboard"
          className="p-1 rounded-md text-[#94a3b8] hover:text-white hover:bg-[#1a2133] transition flex items-center gap-1.5"
        >
          <CanvasFlowLogo size={18} showWordmark={false} />
          <ChevronLeft className="w-3.5 h-3.5 text-[#64748b]" />
        </Link>

        <div className="h-4 w-[1px] bg-[#1e2536] mx-0.5" />

        <div className="flex items-center gap-2">
          <input
            id="board-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-xs font-medium text-[#f1f5f9] hover:bg-[#182030] focus:bg-[#182030] px-1.5 py-0.5 rounded border border-transparent focus:border-blue-500/50 outline-none transition w-44 md:w-56 truncate"
            title="Rename board"
          />

          {/* Understated Status Text */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] shrink-0 font-sans">
            {status === 'connected' ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="hidden sm:inline">Live</span>
              </span>
            ) : status === 'connecting' ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Connecting…</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}

            <span className="text-[#334155]">•</span>
            <span className="text-[#94a3b8]">{isDirty ? 'Saving…' : 'Saved'}</span>
          </div>
        </div>
      </div>

      {/* Top Right: Collaborators + Utility Actions + Primary Share */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Collaborators Stack */}
        <div className="flex items-center -space-x-1.5 bg-[#121622]/90 backdrop-blur-sm border border-[#1e2536] shadow-sm rounded-lg px-2 py-1">
          {collabList.length === 0 ? (
            <div className="flex items-center gap-1.5 text-[11px] text-[#94a3b8] px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Solo</span>
            </div>
          ) : (
            collabList.slice(0, 4).map((collab) => (
              <div
                key={collab.userId}
                title={`${collab.userName} (${collab.userId === currentUserId ? 'You' : 'Collaborator'})`}
                style={{ backgroundColor: collab.userColor || '#3b82f6' }}
                className="w-6 h-6 rounded-full border border-[#121622] flex items-center justify-center text-[10px] font-semibold text-white shadow-sm"
              >
                {collab.userName.slice(0, 1).toUpperCase()}
              </div>
            ))
          )}
          {collabList.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-[#1e2638] border border-[#121622] flex items-center justify-center text-[9px] font-medium text-[#94a3b8]">
              +{collabList.length - 4}
            </div>
          )}
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center gap-0.5 bg-[#121622]/90 backdrop-blur-sm border border-[#1e2536] shadow-sm rounded-lg p-1">
          {/* Performance HUD Toggle */}
          <button
            id="btn-toggle-perf"
            onClick={() => setShowPerf(!showPerf)}
            title="Developer Telemetry"
            className={`p-1.5 rounded-md transition ${
              showPerf ? 'bg-blue-600/20 text-blue-400' : 'text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#182030]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          {/* Shortcuts Modal Trigger */}
          <button
            id="btn-shortcuts"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard shortcuts (?)"
            className="p-1.5 rounded-md text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#182030] transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Export Modal Trigger */}
          <button
            id="btn-export"
            onClick={() => setShowExport(true)}
            title="Export canvas"
            className="p-1.5 rounded-md text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#182030] transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Theme Switcher */}
          <button
            id="btn-theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="p-1.5 rounded-md text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#182030] transition"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <div className="h-4 w-[1px] bg-[#1e2536] mx-1" />

          {/* Share Button */}
          <button
            id="btn-share"
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md shadow-sm transition active:scale-[0.98]"
          >
            <Share2 className="w-3 h-3" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </header>
  );
};
