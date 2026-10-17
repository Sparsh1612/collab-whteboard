'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Clock,
  MoreVertical,
  ExternalLink,
  Trash2,
  Copy,
  Users,
  Sparkles,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { BoardMetadata } from '@whiteboard/shared';

export default function DashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Sample initial boards
  const [boards, setBoards] = useState<BoardMetadata[]>([
    {
      id: 'demo',
      title: 'Distributed Systems & Microservices Architecture',
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
      title: 'Database Sharding & Replication Topology',
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
      title: 'API Gateway & OAuth2 PKCE Flow Diagram',
      ownerId: 'usr-2',
      isPublic: false,
      publicRole: 'VIEWER',
      createdAt: '2026-10-10T14:20:00Z',
      updatedAt: '2026-10-15T09:10:00Z',
      memberCount: 5,
      userRole: 'EDITOR',
    },
    {
      id: 'kafka-event-streaming',
      title: 'Kafka Event Streaming & CQRS Pipelines',
      ownerId: 'usr-1',
      isPublic: true,
      publicRole: 'EDITOR',
      createdAt: '2026-10-08T11:00:00Z',
      updatedAt: '2026-10-12T16:20:00Z',
      memberCount: 3,
      userRole: 'OWNER',
    },
  ]);

  const filteredBoards = boards.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

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
    router.push(`/board/${id}`);
  };

  const handleDeleteBoard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this board?')) {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/25 group-hover:scale-105 transition">
                W
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                Canvas<span className="text-teal-400">Flow</span>
              </span>
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-xs font-medium text-slate-400">Workspaces</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              id="btn-create-board"
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold rounded-xl shadow-md shadow-teal-500/20 active:scale-95 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Board</span>
            </button>

            {/* Profile Avatar */}
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-300 shadow-sm">
              SP
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Controls Bar: Search, View switch, Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-boards-input"
              type="text"
              placeholder="Search boards by name or diagram type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 text-slate-200 placeholder:text-slate-500 outline-none focus:border-teal-500 transition"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Board List / Grid */}
        {filteredBoards.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-800 rounded-3xl">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No boards found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try adjusting your search query or create a brand new whiteboard.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-teal-500 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition"
            >
              Create Board
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoards.map((board) => (
              <Link
                key={board.id}
                href={`/board/${board.id}`}
                className="group relative flex flex-col rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 shadow-panel transition duration-200 overflow-hidden"
              >
                {/* Board Preview Thumbnail Canvas placeholder */}
                <div className="h-44 bg-[#090d16] border-b border-slate-800/80 relative p-4 overflow-hidden flex items-center justify-center">
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />
                  {/* Schematic Mockup Shape */}
                  <div className="relative z-10 w-4/5 h-24 border border-teal-500/30 rounded-xl bg-slate-900/80 flex items-center justify-around p-2 shadow-inner group-hover:scale-105 transition duration-300">
                    <div className="w-12 h-12 rounded-lg bg-teal-500/10 border border-teal-500/40 flex items-center justify-center text-[10px] text-teal-300 font-mono">
                      API
                    </div>
                    <div className="w-8 h-0.5 bg-teal-500/40" />
                    <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-300 font-mono">
                      SRV
                    </div>
                  </div>
                  {/* Role badge */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-slate-900/90 border border-slate-700/60 rounded-md text-[10px] font-semibold text-slate-300">
                    {board.userRole}
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100 group-hover:text-teal-300 transition line-clamp-1">
                      {board.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(board.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {board.memberCount} members
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-teal-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition">
                      Open Board <ArrowRight className="w-3 h-3" />
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDuplicateBoard(board, e)}
                        title="Duplicate"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteBoard(board.id, e)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <div className="col-span-6">Title</div>
              <div className="col-span-2">Last Modified</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {filteredBoards.map((board) => (
              <Link
                key={board.id}
                href={`/board/${board.id}`}
                className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-800/60 hover:bg-slate-800/40 text-xs items-center transition group"
              >
                <div className="col-span-6 font-medium text-slate-200 group-hover:text-teal-300 transition truncate flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400" />
                  {board.title}
                </div>
                <div className="col-span-2 text-slate-400">
                  {new Date(board.updatedAt).toLocaleDateString()}
                </div>
                <div className="col-span-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium">
                    {board.userRole}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => handleDuplicateBoard(board, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteBoard(board.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-float p-6">
            <h3 className="text-base font-semibold text-slate-100 mb-1">Create New Whiteboard</h3>
            <p className="text-xs text-slate-400 mb-4">Give your workspace a title to get started</p>
            <input
              id="new-board-title-input"
              type="text"
              autoFocus
              placeholder="e.g. Distributed Consensus Engine"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-teal-500 transition mb-5"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-create-board"
                onClick={handleCreateBoard}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold rounded-xl shadow-md transition"
              >
                Create Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
