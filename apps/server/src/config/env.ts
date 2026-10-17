import dotenv from 'dotenv';
dotenv.config();

export function parseCorsOrigins(raw?: string): (string | RegExp)[] {
  if (!raw || raw.trim() === '*') return ['*'];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pattern) => {
      let normalized = pattern;
      const hasProtocol = /^https?:\/\//i.test(pattern);
      if (!hasProtocol && pattern !== '*') {
        normalized = `https?://${pattern}`;
      }

      if (normalized.includes('*')) {
        const escaped = normalized
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*');
        return new RegExp(`^${escaped}$`, 'i');
      }

      if (!hasProtocol) {
        const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`^https?://${escaped}$`, 'i');
      }

      return pattern;
    });
}

const rawCors = process.env.CORS_ORIGIN || 'http://localhost:3000';
const parsedCors = parseCorsOrigins(rawCors);

export const config = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://whiteboard:whiteboard_secret@localhost:5432/whiteboard_db?schema=public',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'canvasflow-super-secret-jwt-key-2026',
  CORS_ORIGIN: rawCors,
  ALLOWED_ORIGINS: parsedCors,
  AUTOSAVE_INTERVAL_MS: parseInt(process.env.AUTOSAVE_INTERVAL_MS || '3000', 10),
};

export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true; // Allow non-browser agents (cURL, health checks, server-to-server)
  if (config.ALLOWED_ORIGINS.includes('*')) return true;

  // Always allow localhost in non-production environments
  if (config.NODE_ENV !== 'production') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true;
    }
  }

  return config.ALLOWED_ORIGINS.some((allowed) => {
    if (allowed === '*') return true;
    if (typeof allowed === 'string') {
      return allowed.toLowerCase() === origin.toLowerCase();
    }
    if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return false;
  });
}

