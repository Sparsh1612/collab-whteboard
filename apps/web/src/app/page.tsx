'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MousePointer2,
  Zap,
  Users2,
  Maximize2,
} from 'lucide-react';
import { CanvasFlowLogo } from '../components/ui/CanvasFlowLogo';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090b10] text-[#f8fafc] selection:bg-blue-500/20 selection:text-blue-300 antialiased font-sans">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/[0.08] bg-[#090b10]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CanvasFlowLogo size={20} />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
            <a href="#preview" className="hover:text-slate-200 transition-colors duration-fast">
              Editor
            </a>
            <a href="#collaboration" className="hover:text-slate-200 transition-colors duration-fast">
              Multiplayer
            </a>
            <a href="#performance" className="hover:text-slate-200 transition-colors duration-fast">
              Performance
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-200 transition-colors duration-fast flex items-center gap-1.5"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 transition-colors duration-fast"
            >
              Sign In
            </Link>
            <Link
              id="hero-launch-btn"
              href="/board/demo"
              className="text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-md shadow-sm transition-colors duration-fast flex items-center gap-1.5"
            >
              <span>Start a board</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-white leading-[1.12]">
          Think together.
          <br />
          Create without friction.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          A fast, multiplayer canvas for ideas, diagrams, sketches, and systems architecture. No lag,
          no clutter, no boundaries.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/board/demo"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all duration-fast flex items-center gap-2"
          >
            <span>Start a board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.1] text-xs font-medium rounded-lg transition-all duration-fast flex items-center gap-2"
          >
            <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>View on GitHub</span>
          </a>
        </div>
      </section>

      {/* Product Preview: Realistic Canvas Editor Shell */}
      <section id="preview" className="px-6 max-w-5xl mx-auto pb-24">
        <div className="rounded-xl border border-white/[0.1] bg-[#11141d] shadow-2xl overflow-hidden">
          {/* Editor Window Chrome */}
          <div className="h-10 border-b border-white/[0.08] bg-[#0c0e14] px-4 flex items-center justify-between text-xs text-slate-400 select-none">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
              </div>
              <span className="text-white/[0.15]">|</span>
              <span className="text-slate-300 font-medium text-[11px]">
                Distributed Architecture Topology
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
              <span className="text-[11px] text-slate-500 font-mono">• Saved</span>
            </div>
          </div>

          {/* Canvas Canvas Simulation */}
          <div className="relative h-[420px] bg-[#090b10] overflow-hidden flex items-center justify-center">
            {/* Subtle Canvas Dot Grid */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Diagram Elements */}
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6">
              {/* Node 1: API Gateway */}
              <div className="w-48 p-3.5 rounded-lg border border-blue-500/40 bg-[#121622] text-left shadow-lg">
                <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">
                  API Gateway
                </div>
                <div className="text-xs text-slate-300">Rate Limiter & Auth</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1.5">Latency: 2ms</div>
              </div>

              {/* Vector Connector Arrow */}
              <div className="flex items-center text-slate-500">
                <div className="w-10 h-[1.5px] bg-blue-500/40" />
                <ArrowRight className="w-3.5 h-3.5 text-blue-400 -ml-1" />
              </div>

              {/* Node 2: Realtime Engine */}
              <div className="w-52 p-3.5 rounded-lg border border-white/[0.14] bg-[#121622] text-left shadow-lg">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Realtime Engine
                </div>
                <div className="text-xs text-slate-300">WebSocket / Operation Bus</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1.5">Active Room Session</div>
              </div>

              {/* Sticky Note */}
              <div className="w-44 p-3 rounded-lg bg-[#fef08a] text-slate-900 shadow-md text-left rotate-1">
                <div className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider mb-1">
                  Note
                </div>
                <p className="text-xs font-normal leading-snug">
                  Hardware 2D canvas handles 10,000+ objects at solid 60 FPS.
                </p>
              </div>
            </div>

            {/* Collaborator Cursors */}
            <div className="absolute top-14 left-1/4 flex items-center gap-1 pointer-events-none">
              <MousePointer2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
              <span className="px-1.5 py-0.5 rounded bg-blue-500 text-[10px] font-medium text-white shadow-sm">
                Marcus
              </span>
            </div>

            <div className="absolute bottom-20 right-1/4 flex items-center gap-1 pointer-events-none">
              <MousePointer2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-[10px] font-medium text-slate-950 shadow-sm">
                Elena
              </span>
            </div>

            {/* Floating Bottom Toolbar Preview */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-[#121622]/90 border border-white/[0.1] rounded-lg shadow-panel select-none">
              <span className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 text-white text-xs font-medium">
                V
              </span>
              <span className="w-7 h-7 flex items-center justify-center rounded text-slate-400 text-xs">
                H
              </span>
              <span className="w-7 h-7 flex items-center justify-center rounded text-slate-400 text-xs">
                P
              </span>
              <span className="w-7 h-7 flex items-center justify-center rounded text-slate-400 text-xs">
                R
              </span>
              <span className="w-7 h-7 flex items-center justify-center rounded text-slate-400 text-xs">
                O
              </span>
              <span className="w-7 h-7 flex items-center justify-center rounded text-slate-400 text-xs">
                T
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Restrained Value Sections */}
      <section id="collaboration" className="py-20 px-6 max-w-5xl mx-auto border-t border-white/[0.06]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-blue-400 mb-4">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Sub-millisecond responsiveness</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Direct hardware-accelerated canvas execution. Viewport culling keeps interactions and
              panning fluid even with dense architectural diagrams.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-blue-400 mb-4">
              <Users2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Real-time presence</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Live cursor broadcasting, active selection highlights, and instant sync let entire
              teams brainstorm, sketch, and review simultaneously.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-blue-400 mb-4">
              <Maximize2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Full diagramming toolkit</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Shapes, connectors, text frames, sticky notes, and smooth freehand ink with
              precise multi-selection and smart alignment guides.
            </p>
          </div>
        </div>
      </section>

      {/* Engineering Discipline Section */}
      <section id="performance" className="py-16 px-6 max-w-5xl mx-auto border-t border-white/[0.06]">
        <div className="p-8 rounded-xl border border-white/[0.08] bg-[#10131c] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white">Engineered for large workspaces</h3>
            <p className="text-xs text-slate-400 max-w-xl font-normal leading-relaxed">
              Designed for reliability with automated board backups, robust state synchronization,
              and instant reconnect recovery.
            </p>
          </div>
          <Link
            href="/board/demo"
            className="px-4 py-2 bg-white text-slate-950 text-xs font-medium rounded-md hover:bg-slate-200 transition-colors duration-fast whitespace-nowrap"
          >
            Launch demo board
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-white/[0.06] py-10 px-6 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CanvasFlowLogo size={16} />
          </div>
          <div className="flex items-center gap-6 text-[11px] text-slate-500">
            <Link href="/dashboard" className="hover:text-slate-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/board/demo" className="hover:text-slate-400 transition-colors">
              Canvas
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
