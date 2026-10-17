'use client';

import React from 'react';
import {
  Users,
  Share2,
  Download,
  HelpCircle,
  Activity,
  Sun,
  Moon,
  CloudCheck,
  CloudAlert,
  Loader2,
} from 'lucide-react';
import { useCollabStore } from '../../stores/useCollabStore';
import { useBoardStore } from '../../stores/useBoardStore';
import { useUIStore } from '../../stores/useUIStore';

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
    <header className="fixed top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
      {/* Left: Brand + Board Title + Save status */}
      <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-panel rounded-2xl px-4 py-2 pointer-events-auto">
        <a href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20 group-hover:scale-105 transition">
            W
          </div>
        </a>

        <div className="flex flex-col">
          <input
            id="board-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-100 hover:bg-slate-800/60 focus:bg-slate-800 px-1.5 py-0.5 rounded-lg border border-transparent focus:border-teal-500/50 outline-none transition w-48 truncate"
            title="Rename board"
          />
          <div className="flex items-center gap-1.5 px-1.5 text-[11px] text-slate-400">
            {status === 'connected' ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            ) : status === 'connecting' ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Offline
              </span>
            )}

            <span>•</span>
            <span>{isDirty ? 'Saving...' : 'Saved'}</span>
            <span>•</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-medium">
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Presence Stack + Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Collaborators Avatar Stack */}
        <div className="flex items-center -space-x-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-panel rounded-2xl p-1.5 px-2.5">
          {collabList.length === 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 px-1">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>You (Solo)</span>
            </div>
          ) : (
            collabList.slice(0, 5).map((collab) => (
              <div
                key={collab.userId}
                title={`${collab.userName} (${collab.userId === currentUserId ? 'You' : 'Collaborator'})`}
                style={{ backgroundColor: collab.userColor || '#0d9488' }}
                className="w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/10"
              >
                {collab.userName.slice(0, 1).toUpperCase()}
              </div>
            ))
          )}
          {collabList.length > 5 && (
            <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-semibold text-slate-300">
              +{collabList.length - 5}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-panel rounded-2xl p-1">
          {/* Performance HUD Toggle */}
          <button
            id="btn-toggle-perf"
            onClick={() => setShowPerf(!showPerf)}
            title="Toggle Performance HUD"
            className={`p-2 rounded-xl transition ${
              showPerf ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Shortcuts Help */}
          <button
            id="btn-shortcuts"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts (?)"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Export */}
          <button
            id="btn-export"
            onClick={() => setShowExport(true)}
            title="Export Board (PNG / SVG)"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <button
            id="btn-theme-toggle"
            onClick={toggleTheme}
            title="Toggle Dark/Light Mode"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Share Button */}
          <button
            id="btn-share"
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 ml-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-xl shadow-md shadow-teal-500/25 active:scale-95 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </header>
  );
};
