'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Clock,
  Trash2,
  Copy,
  Users,
  FolderOpen,
  Star,
  Home,
  Share2,
  Settings,
  ChevronDown,
  Sparkles,
  Command,
  FileCode2,
  Layers,
  ArrowUpRight,
  MoreHorizontal,
} from 'lucide-react';
import { BoardMetadata } from '@whiteboard/shared';
import { CanvasFlowLogo } from '../../components/ui/CanvasFlowLogo';

type NavSection = 'all' | 'recent' | 'starred' | 'shared';

export default function DashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<NavSection>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set(['demo']));

  // Sample production boards
  const [boards, setBoards] = useState<BoardMetadata[]>([
    {
      id: 'demo',
      title: 'Infrastructure & Data Pipeline Architecture',
      ownerId: 'usr-1',
      isPublic: true,
      publicRole: 'EDITOR',
      createdAt: '2026-10-15T10:00:00Z',
      updatedAt: '2026-10-17T12:30:00Z',
      memberCount: 4,
      userRole: 'OWNER',
    },
    {
      id: 'db-sharding-topology',
      title: 'Database Sharding & Partitioning Topology',
      ownerId: 'usr-1',
      isPublic: true,
      publicRole: 'VIEWER',
      createdAt: '2026-10-14T08:15:00Z',
      updatedAt: '2026-10-16T18:45:00Z',
      memberCount: 2,
      userRole: 'OWNER',
    },
    {
      id: 'api-gateway-auth-flow',
      title: 'API Gateway & OAuth2 Session Flow',
      ownerId: 'usr-2',
      isPublic: false,
      publicRole: 'VIEWER',
      createdAt: '2026-10-10T14:20:00Z',
      updatedAt: '2026-10-15T09:10:00Z',
      memberCount: 5,
      userRole: 'EDITOR',
    },
    {
      id: 'event-streaming-spec',
      title: 'Real-time Event Streaming & Queue Topology',
      ownerId: 'usr-1',
      isPublic: true,
      publicRole: 'EDITOR',
      createdAt: '2026-10-08T11:00:00Z',
      updatedAt: '2026-10-12T16:20:00Z',
      memberCount: 3,
      userRole: 'OWNER',
    },
  ]);

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredBoards = useMemo(() => {
    return boards.filter((b) => {
      const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (activeSection === 'starred') return starredIds.has(b.id);
      if (activeSection === 'shared') return b.userRole !== 'OWNER';
      return true;
    });
  }, [boards, search, activeSection, starredIds]);

  const handleCreateBoard = () => {
    const id = 'board-' + Math.random().toString(36).substring(2, 9);
    const title = newTitle.trim() || 'Untitled Board';
    const newBoard: BoardMetadata = {
      id,
      title,
      ownerId: 'usr-local',
      isPublic: true,
      publicRole: 'EDITOR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 1,
      userRole: 'OWNER',
    };
    setBoards([newBoard, ...boards]);
    setIsCreating(false);
    setNewTitle('');
    router.push(`/board/${id}?title=${encodeURIComponent(title)}`);
  };

  const handleDeleteBoard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Delete this board? This action cannot be undone.')) {
      setBoards(boards.filter((b) => b.id !== id));
    }
  };

  const handleDuplicateBoard = (board: BoardMetadata, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const dup: BoardMetadata = {
      ...board,
      id: 'board-' + Math.random().toString(36).substring(2, 9),
      title: `${board.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBoards([dup, ...boards]);
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] text-[#e2e8f0] flex flex-col md:flex-row antialiased">
      {/* SaaS Sidebar */}
      <aside className="w-full md:w-60 border-b md:border-b-0 md:border-r border-[#1a2030] bg-[#0e121a] flex flex-col shrink-0 justify-between">
        <div>
          {/* Workspace Brand Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-[#1a2030]">
            <Link href="/" className="flex items-center group">
              <CanvasFlowLogo size={20} />
            </Link>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#64748b] bg-[#141926] px-1.5 py-0.5 rounded border border-[#20273a]">
              <span>v1.2</span>
            </div>
          </div>

          {/* User Workspace Switcher */}
          <div className="p-3">
            <button className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#141926] hover:bg-[#1a2133] border border-[#20273a] text-left transition text-xs">
              <div className="flex items-center gap-2 truncate">
                <div className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[10px]">
                  P
                </div>
                <span className="font-medium text-[#cbd5e1] truncate">Personal Workspace</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-2 space-y-0.5">
            <button
              onClick={() => setActiveSection('all')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeSection === 'all'
                  ? 'bg-[#182033] text-blue-400'
                  : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#141926]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>All boards</span>
              <span className="ml-auto text-[10px] text-[#64748b] font-mono">{boards.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('recent')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeSection === 'recent'
                  ? 'bg-[#182033] text-blue-400'
                  : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#141926]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Recent</span>
            </button>

            <button
              onClick={() => setActiveSection('starred')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeSection === 'starred'
                  ? 'bg-[#182033] text-blue-400'
                  : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#141926]'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Starred</span>
              {starredIds.size > 0 && (
                <span className="ml-auto text-[10px] text-[#64748b] font-mono">{starredIds.size}</span>
              )}
            </button>

            <button
              onClick={() => setActiveSection('shared')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeSection === 'shared'
                  ? 'bg-[#182033] text-blue-400'
                  : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#141926]'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Shared with me</span>
            </button>
          </nav>

          <div className="mx-3 my-3 border-t border-[#1a2030]" />

          {/* Folders / Categories */}
          <div className="px-3">
            <span className="text-[10px] font-semibold tracking-wider text-[#475569] uppercase px-2 mb-1 block">
              Spaces
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#141926] cursor-pointer transition">
                <span className="w-2 h-2 rounded-full bg-blue-500/80" />
                <span>Architecture</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#141926] cursor-pointer transition">
                <span className="w-2 h-2 rounded-full bg-purple-500/80" />
                <span>Design Specs</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#141926] cursor-pointer transition">
                <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                <span>Engineering</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: User Capsule */}
        <div className="p-3 border-t border-[#1a2030]">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#141926] transition cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#1e2738] border border-[#2d3748] flex items-center justify-center text-xs font-semibold text-blue-400">
                SP
              </div>
              <div>
                <div className="text-xs font-medium text-[#f1f5f9]">Sparsh</div>
                <div className="text-[10px] text-[#64748b]">Pro Workspace</div>
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-[#64748b] hover:text-[#94a3b8] transition" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <header className="h-14 border-b border-[#1a2030] bg-[#0b0d13]/80 backdrop-blur-sm px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-boards-input"
              type="text"
              placeholder="Search boards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#121622] border border-[#1e2536] text-xs rounded-lg pl-8 pr-12 py-1.5 text-[#e2e8f0] placeholder:text-[#64748b] outline-none focus:border-blue-500/60 transition"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-[#475569] font-mono bg-[#161d2d] px-1 py-0.5 rounded border border-[#222a3d]">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#121622] border border-[#1e2536] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'grid' ? 'bg-[#1c2436] text-blue-400' : 'text-[#64748b] hover:text-[#cbd5e1]'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'list' ? 'bg-[#1c2436] text-blue-400' : 'text-[#64748b] hover:text-[#cbd5e1]'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              id="btn-create-board"
              onClick={() => setIsCreating(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-sm active:scale-[0.98] transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New board</span>
            </button>
          </div>
        </header>

        {/* Board Listing Content */}
        <main className="flex-1 p-6 max-w-6xl w-full">
          {/* Section Heading */}
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h1 className="text-base font-semibold text-white tracking-tight">
                {activeSection === 'all' && 'All boards'}
                {activeSection === 'recent' && 'Recent boards'}
                {activeSection === 'starred' && 'Starred boards'}
                {activeSection === 'shared' && 'Shared with me'}
              </h1>
              <p className="text-xs text-[#64748b] mt-0.5">
                {filteredBoards.length} {filteredBoards.length === 1 ? 'board' : 'boards'} available
              </p>
            </div>
          </div>

          {filteredBoards.length === 0 ? (
            /* Human Calm Empty State */
            <div className="py-20 text-center border border-dashed border-[#1e2536] rounded-xl bg-[#0e121a]/50">
              <div className="w-10 h-10 rounded-lg bg-[#141926] border border-[#20273a] flex items-center justify-center text-[#64748b] mx-auto mb-3">
                <FolderOpen className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-medium text-[#e2e8f0]">No boards yet</h2>
              <p className="text-xs text-[#64748b] mt-1 mb-4 max-w-xs mx-auto">
                Create a board and start putting ideas down.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition"
              >
                Create board
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Refined Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBoards.map((board) => {
                const isStarred = starredIds.has(board.id);
                return (
                  <Link
                    key={board.id}
                    href={`/board/${board.id}`}
                    className="group relative flex flex-col rounded-xl bg-[#121622] border border-[#1e2536] hover:border-[#2d374d] hover:bg-[#141926] transition duration-150 overflow-hidden"
                  >
                    {/* Board Thumbnail Preview */}
                    <div className="h-36 bg-[#0a0d14] border-b border-[#1a2030] relative p-4 flex items-center justify-center overflow-hidden">
                      {/* Architectural Canvas Grid Background */}
                      <div
                        className="absolute inset-0 opacity-15 pointer-events-none"
                        style={{
                          backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
                          backgroundSize: '16px 16px',
                        }}
                      />

                      {/* Schematic Geometry Preview */}
                      <div className="relative z-10 w-full max-w-[200px] h-16 rounded border border-[#222c40] bg-[#0e131d]/90 flex items-center justify-around px-3 py-2 group-hover:border-blue-500/40 transition">
                        <div className="w-7 h-7 rounded border border-blue-500/30 bg-blue-500/10 flex items-center justify-center text-[9px] font-mono text-blue-400">
                          UI
                        </div>
                        <div className="w-10 h-[1.5px] bg-[#222c40] group-hover:bg-blue-500/30 transition" />
                        <div className="w-7 h-7 rounded border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center text-[9px] font-mono text-indigo-400">
                          WS
                        </div>
                        <div className="w-10 h-[1.5px] bg-[#222c40] group-hover:bg-blue-500/30 transition" />
                        <div className="w-7 h-7 rounded border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-[9px] font-mono text-emerald-400">
                          DB
                        </div>
                      </div>

                      {/* Top-right Star action */}
                      <button
                        onClick={(e) => toggleStar(board.id, e)}
                        title={isStarred ? 'Unstar' : 'Star'}
                        className={`absolute top-2.5 right-2.5 p-1 rounded-md transition ${
                          isStarred
                            ? 'text-amber-400 bg-[#161d2d]'
                            : 'text-[#475569] hover:text-[#94a3b8] opacity-0 group-hover:opacity-100 hover:bg-[#161d2d]'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>

                      {/* Role Pill */}
                      <div className="absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded bg-[#161d2d] border border-[#232c3f] text-[10px] font-medium text-[#94a3b8]">
                        {board.userRole === 'OWNER' ? 'Owner' : 'Editor'}
                      </div>
                    </div>

                    {/* Card Meta */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-xs font-medium text-[#f1f5f9] group-hover:text-blue-400 transition-colors line-clamp-1">
                          {board.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#64748b]">
                          <span>Edited {formatRelativeTime(board.updatedAt)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-[#475569]" />
                            {board.memberCount} {board.memberCount === 1 ? 'member' : 'members'}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-3 pt-2.5 border-t border-[#1a2030] flex items-center justify-between text-[11px]">
                        <span className="text-blue-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Open canvas <ArrowUpRight className="w-3 h-3" />
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={(e) => handleDuplicateBoard(board, e)}
                            title="Duplicate"
                            className="p-1 rounded text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1a2030] transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteBoard(board.id, e)}
                            title="Delete"
                            className="p-1 rounded text-[#64748b] hover:text-rose-400 hover:bg-rose-950/20 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Clean List View */
            <div className="rounded-xl border border-[#1e2536] bg-[#121622] overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-[#1e2536] text-[11px] font-medium text-[#64748b]">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Last modified</div>
                <div className="col-span-2">Access</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {filteredBoards.map((board) => (
                <Link
                  key={board.id}
                  href={`/board/${board.id}`}
                  className="grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-[#1a2030] hover:bg-[#161c2b] text-xs items-center transition group last:border-b-0"
                >
                  <div className="col-span-6 font-medium text-[#e2e8f0] group-hover:text-blue-400 transition truncate flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="truncate">{board.title}</span>
                  </div>
                  <div className="col-span-2 text-[11px] text-[#64748b]">
                    {formatRelativeTime(board.updatedAt)}
                  </div>
                  <div className="col-span-2">
                    <span className="px-1.5 py-0.5 rounded bg-[#182030] border border-[#232d42] text-[10px] text-[#94a3b8] font-medium">
                      {board.userRole === 'OWNER' ? 'Owner' : 'Editor'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => handleDuplicateBoard(board, e)}
                      title="Duplicate"
                      className="p-1 rounded text-[#64748b] hover:text-[#e2e8f0] hover:bg-[#1a2030] transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteBoard(board.id, e)}
                      title="Delete"
                      className="p-1 rounded text-[#64748b] hover:text-rose-400 hover:bg-rose-950/20 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Board Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#121622] border border-[#1e2536] rounded-xl w-full max-w-sm shadow-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Create new board</h3>
            <p className="text-xs text-[#64748b] mb-4">Give your canvas a name to get started.</p>
            <input
              id="new-board-title-input"
              type="text"
              autoFocus
              placeholder="e.g. Distributed Consensus Engine"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
              className="w-full bg-[#0a0d14] border border-[#1e2536] rounded-lg px-3 py-2 text-xs text-[#e2e8f0] placeholder:text-[#64748b] outline-none focus:border-blue-500/70 transition mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-[#94a3b8] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-create-board"
                onClick={handleCreateBoard}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-sm transition"
              >
                Create board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
