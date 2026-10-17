'use client';

import React, { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Shield, UserCheck } from 'lucide-react';
import { BoardRole } from '@whiteboard/shared';
import { useUIStore } from '../../stores/useUIStore';
import { useBoardStore } from '../../stores/useBoardStore';

export const ShareModal: React.FC = () => {
  const showShare = useUIStore((s) => s.showShare);
  const setShowShare = useUIStore((s) => s.setShowShare);
  const boardId = useBoardStore((s) => s.boardId);
  const title = useBoardStore((s) => s.title);

  const [role, setRole] = useState<BoardRole>('EDITOR');
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  if (!showShare) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/board/${boardId || 'demo'}?role=${role.toLowerCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-float overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Share & Collaborate</h2>
              <p className="text-xs text-slate-400">Invite team members to &ldquo;{title}&rdquo;</p>
            </div>
          </div>
          <button
            onClick={() => setShowShare(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Public Access Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-teal-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Anyone with link</div>
                <div className="text-[11px] text-slate-400">Allow instant join without approval</div>
              </div>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                isPublic ? 'bg-teal-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Default Link Permission
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('EDITOR')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                  role === 'EDITOR'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Can Edit (Editor)</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('VIEWER')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                  role === 'VIEWER'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Can View (Viewer)</span>
              </button>
            </div>
          </div>

          {/* Link Input & Copy */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Shareable Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 font-mono truncate outline-none select-all focus:border-teal-500"
              />
              <button
                id="btn-copy-share-link"
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                  copied
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setShowShare(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
