import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'CanvasFlow — Real-Time Multiplayer Whiteboard',
  description: 'A fast, multiplayer canvas for ideas, diagrams, sketches, and visual planning.',
  keywords: ['whiteboard', 'real-time collaboration', 'infinite canvas', 'diagramming', 'canvasflow'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-[#0b0d13] text-[#f1f5f9] font-sans antialiased selection:bg-blue-600/25 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
