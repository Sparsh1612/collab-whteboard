import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { config, isOriginAllowed } from './config/env.js';
import { setupSocketServer } from './realtime/socketServer.js';
import { snapshotWorker } from './services/snapshotWorker.js';
import { roomManager } from './realtime/RoomManager.js';
import { pubsub } from './services/redis.js';
import { checkDatabaseConnection } from './services/db.js';

// Controllers & Middleware
import { register, login, getMe } from './controllers/authController.js';
import { createBoard, getBoards, getBoardById, deleteBoard } from './controllers/boardController.js';
import { requireAuth, optionalAuth } from './middleware/auth.js';

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json());

// Initialize Socket.IO with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Socket.IO CORS blocked for origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

// Setup Realtime WebSocket Engine
setupSocketServer(io);

// Start Autosave Background Worker
snapshotWorker.start(io);

// Health & Telemetry Endpoint
app.get('/api/health', async (_req, res) => {
  const stats = roomManager.getStats();
  const dbOk = await checkDatabaseConnection();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    realtime: {
      activeRooms: stats.totalRooms,
      connectedClients: stats.totalClients,
      redisConnected: pubsub.isConnected,
    },
    database: {
      connected: dbOk,
    },
  });
});

// Auth REST Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', requireAuth, getMe);

// Board REST Routes
app.post('/api/boards', optionalAuth, createBoard);
app.get('/api/boards', optionalAuth, getBoards);
app.get('/api/boards/:id', optionalAuth, getBoardById);
app.delete('/api/boards/:id', requireAuth, deleteBoard);

// Root Welcome
app.get('/', (_req, res) => {
  res.json({
    name: 'CanvasFlow Realtime API Server',
    version: '1.0.0',
    status: 'online',
    health: '/api/health',
  });
});

// Start Server
server.listen(config.PORT, () => {
  console.log(`====================================================`);
  console.log(`  CanvasFlow Realtime Server listening on port ${config.PORT}`);
  console.log(`  Environment: ${config.NODE_ENV}`);
  console.log(`  Health Check: http://localhost:${config.PORT}/api/health`);
  console.log(`====================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  snapshotWorker.stop();
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received. Shutting down gracefully...');
  snapshotWorker.stop();
  server.close(() => process.exit(0));
});

export { app, server, io };
