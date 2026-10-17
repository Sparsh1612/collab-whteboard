import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CanvasFlow — Real-Time Infinite Whiteboard',
  description: 'Ultra-fast, multiplayer infinite canvas for systems architecture, engineering diagrams, and visual collaboration.',
  keywords: ['whiteboard', 'real-time collaboration', 'infinite canvas', 'diagramming', 'figma alternative', 'excalidraw'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-teal-500/20 selection:text-teal-300">
        {children}
      </body>
    </html>
  );
}
