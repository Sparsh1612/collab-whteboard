import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://whiteboard:whiteboard_secret@localhost:5432/whiteboard_db?schema=public',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'canvasflow-super-secret-jwt-key-2026',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  AUTOSAVE_INTERVAL_MS: parseInt(process.env.AUTOSAVE_INTERVAL_MS || '3000', 10),
};
