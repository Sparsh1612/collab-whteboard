'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Globe, Link2, ChevronDown, Shield } from 'lucide-react';
import { BoardRole } from '@whiteboard/shared';
import { useUIStore } from '../../stores/useUIStore';
import { useBoardStore } from '../../stores/useBoardStore';
import { useCollabStore } from '../../stores/useCollabStore';

export const ShareModal: React.FC = () => {
  const showShare = useUIStore((s) => s.showShare);
  const setShowShare = useUIStore((s) => s.setShowShare);
  const boardId = useBoardStore((s) => s.boardId);
  const title = useBoardStore((s) => s.title);
  const collaborators = useCollabStore((s) => s.collaborators);
  const currentUserId = useCollabStore((s) => s.currentUserId);

  const [role, setRole] = useState<BoardRole>('EDITOR');
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowShare(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setShowShare]);

  if (!showShare) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/board/${boardId || 'demo'}?role=${role.toLowerCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const collabList = Array.from(collaborators.values());

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowShare(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="bg-[#121622] border border-[#1e2536] rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e2536]">
          <div>
            <h2 className="text-sm font-semibold text-white">Share this board</h2>
            <p className="text-xs text-[#64748b] truncate max-w-xs">{title}</p>
          </div>
          <button
            onClick={() => setShowShare(false)}
            className="p-1 rounded-md text-[#64748b] hover:text-[#cbd5e1] hover:bg-[#182030] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* People with access */}
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-[#475569] uppercase block mb-2">
              People with access
            </span>
            <div className="space-y-2">
              {/* Board Owner (You) */}
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[#161c2b] border border-[#1f283d]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-semibold shrink-0">
                    SP
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#f1f5f9] truncate">You</div>
                    <div className="text-[10px] text-[#64748b] truncate">sparsh@example.com</div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-[#94a3b8] px-2 py-0.5 rounded bg-[#1c2438]">
                  Owner
                </span>
              </div>

              {/* Active Collaborators */}
              {collabList
                .filter((c) => c.userId !== currentUserId)
                .map((collab) => (
                  <div
                    key={collab.userId}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[#161c2b] border border-[#1f283d]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        style={{ backgroundColor: collab.userColor || '#3b82f6' }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                      >
                        {collab.userName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#f1f5f9] truncate">
                          {collab.userName}
                        </div>
                        <div className="text-[10px] text-[#64748b]">Collaborator</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-[#94a3b8] px-2 py-0.5 rounded bg-[#1c2438]">
                      Editor
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* General access */}
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-[#475569] uppercase block mb-2">
              General access
            </span>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#161c2b] border border-[#1f283d]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#1c2438] text-blue-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#e2e8f0]">Anyone with the link</div>
                  <div className="text-[11px] text-[#64748b]">
                    {isPublic ? 'Anyone who has the link can access' : 'Only invited members'}
                  </div>
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as BoardRole)}
                  className="bg-[#1c2438] border border-[#2a364f] text-xs text-[#cbd5e1] rounded-md px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Share link input and Copy CTA */}
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Link2 className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full bg-[#0a0d14] border border-[#1e2536] text-[#cbd5e1] text-xs rounded-lg pl-8 pr-3 py-2 font-mono truncate outline-none select-all focus:border-blue-500/70"
                />
              </div>
              <button
                id="btn-copy-share-link"
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition active:scale-[0.98] ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0e121a] border-t border-[#1e2536] flex justify-end">
          <button
            onClick={() => setShowShare(false)}
            className="px-3.5 py-1.5 bg-[#182030] hover:bg-[#202b40] text-[#e2e8f0] text-xs font-medium rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
