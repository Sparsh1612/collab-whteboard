/**
 * Client Environment Configuration for CanvasFlow Web
 * 
 * Centralizes production and development URLs for WebSockets and REST APIs.
 * Automatically strips trailing slashes to prevent malformed request routes.
 */

function sanitizeUrl(url?: string): string {
  if (!url) return '';
  return url.trim().replace(/\/+$/, '');
}

const rawSocketUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SOCKET_URL);
const rawApiUrl = sanitizeUrl(process.env.NEXT_PUBLIC_API_URL);

// In local development, fall back to default localhost server port
const isDev = process.env.NODE_ENV !== 'production';
const localFallback = isDev ? 'http://localhost:4000' : '';

export const env = {
  /**
   * Realtime WebSocket server endpoint (Socket.IO)
   * Priority: NEXT_PUBLIC_SOCKET_URL -> NEXT_PUBLIC_API_URL -> localhost:4000 (dev only)
   */
  SOCKET_URL: rawSocketUrl || rawApiUrl || localFallback,

  /**
   * REST API server endpoint
   * Priority: NEXT_PUBLIC_API_URL -> NEXT_PUBLIC_SOCKET_URL -> localhost:4000 (dev only)
   */
  API_URL: rawApiUrl || rawSocketUrl || localFallback,

  /**
   * Environment flags
   */
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;
