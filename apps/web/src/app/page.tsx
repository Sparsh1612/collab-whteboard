'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Users,
  Layers,
  Shield,
  Activity,
  Code2,
  MousePointer2,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500/20 selection:text-teal-300">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/25">
              W
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Canvas<span className="text-teal-400">Flow</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-teal-400 transition">Features</a>
            <a href="#architecture" className="hover:text-teal-400 transition">Architecture</a>
            <a href="#performance" className="hover:text-teal-400 transition">60 FPS Engine</a>
            <Link href="/dashboard" className="hover:text-teal-400 transition">Dashboard</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/board/demo"
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold rounded-xl shadow-md shadow-teal-500/20 active:scale-95 transition flex items-center gap-1.5"
            >
              <span>Launch Whiteboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-teal-500/30 text-teal-300 text-xs font-medium mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Real-Time Collaborative Infinite Canvas</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-mono">60 FPS Hardware Rendered</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Architect, sketch, and collaborate at{' '}
          <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            the speed of thought.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Engineered for technical diagrams, distributed system topologies, and instant multiplayer brainstorms.
          Powered by HTML5 2D spatial culling, Socket.IO real-time channels, and Redis Pub/Sub.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            id="hero-launch-btn"
            href="/board/demo"
            className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-semibold rounded-2xl shadow-xl shadow-teal-500/25 active:scale-95 transition flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Try Live Canvas Now</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-semibold rounded-2xl active:scale-95 transition flex items-center gap-2"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="mt-16 relative rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl p-2 sm:p-4 backdrop-blur-xl max-w-5xl mx-auto overflow-hidden">
          <div className="w-full h-80 sm:h-96 rounded-2xl bg-[#090d16] border border-slate-800/80 relative overflow-hidden flex flex-col justify-between p-6">
            {/* Fake canvas grid dots */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Simulated Live Diagram Elements */}
            <div className="relative z-10 flex flex-wrap gap-6 items-center justify-center my-auto">
              {/* Architecture Node 1 */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-teal-500/40 shadow-lg text-left w-52">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-1">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  Load Balancer (Nginx)
                </div>
                <div className="text-[11px] text-slate-400 font-mono">Reverse Proxy • Port 443</div>
              </div>

              {/* Arrow */}
              <div className="hidden sm:flex items-center text-teal-400">
                <div className="w-12 h-0.5 bg-teal-500/60" />
                <ArrowRight className="w-4 h-4 -ml-1 text-teal-400" />
              </div>

              {/* Architecture Node 2 */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/40 shadow-lg text-left w-52">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  Realtime Cluster
                </div>
                <div className="text-[11px] text-slate-400 font-mono">Socket.IO • Node.js Engine</div>
              </div>

              {/* Sticky note */}
              <div className="p-4 rounded-xl bg-amber-100 text-amber-950 shadow-xl text-left w-44 rotate-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1">Note</div>
                <div className="text-xs font-medium leading-snug">Sub-millisecond spatial hash culling enabled!</div>
              </div>
            </div>

            {/* Simulated collaborator cursors */}
            <div className="absolute top-16 left-1/4 flex items-center gap-1.5 animate-bounce duration-1000">
              <MousePointer2 className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-[10px] font-bold text-slate-950 shadow">
                Alex (Architect)
              </span>
            </div>

            <div className="absolute bottom-16 right-1/4 flex items-center gap-1.5">
              <MousePointer2 className="w-4 h-4 text-pink-400 fill-pink-400" />
              <span className="px-2 py-0.5 rounded bg-pink-500 text-[10px] font-bold text-slate-950 shadow">
                Sarah (Staff Eng)
              </span>
            </div>

            {/* Bottom Status bar */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-slate-400">12ms Latency • 60 FPS • 2 Active Peers</span>
              </div>
              <Link
                href="/board/demo"
                className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
              >
                Enter interactive canvas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-teal-400 uppercase tracking-widest">
            Engineering Precision
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Built from scratch for peak performance
          </p>
          <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
            No slow DOM nodes or bloated canvas frameworks. Dedicated vector rendering pipeline with hardware acceleration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/30 transition group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Spatial Hash Viewport Culling</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Handles 5,000+ complex vector objects effortlessly. Only elements intersecting the visible viewport bucket are processed during the requestAnimationFrame loop.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/30 transition group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Peer Cursor Interpolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smooth 60 FPS remote cursor trajectory smoothing with network throttling. See live selections, tool switches, and presences without latency lag.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/30 transition group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Role-Based Access & Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Granular OWNER, EDITOR, and VIEWER roles enforced server-side. Automatic debounced snapshots ensure data integrity during disconnects.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black text-xs">
              W
            </div>
            <span className="font-semibold text-slate-300">CanvasFlow Whiteboard</span>
          </div>
          <div>Next.js 15 • TypeScript • Socket.IO • Redis Pub/Sub • PostgreSQL • Tailwind CSS</div>
          <div>MIT License • Production Architecture</div>
        </div>
      </footer>
    </div>
  );
}
