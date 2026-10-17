import { Server } from 'socket.io';
import { SOCKET_EVENTS } from '@whiteboard/shared';
import { roomManager } from '../realtime/RoomManager.js';
import { prisma } from './db.js';
import { config } from '../config/env.js';

let cachedSystemUserId: string | null = null;

async function getOrCreateSystemUserId(): Promise<string> {
  if (cachedSystemUserId) return cachedSystemUserId;
  try {
    const user = await prisma.user.upsert({
      where: { email: 'system@canvasflow.local' },
      update: {},
      create: {
        id: 'usr-system',
        email: 'system@canvasflow.local',
        passwordHash: '$2a$10$systemplaceholderhashforlocaldevonly12345',
        name: 'System',
        color: '#0d9488',
      },
    });
    cachedSystemUserId = user.id;
    return user.id;
  } catch (err) {
    return 'usr-system';
  }
}

export class SnapshotWorker {
  private timer: NodeJS.Timeout | null = null;
  private io: Server | null = null;

  public start(io: Server): void {
    this.io = io;
    this.timer = setInterval(() => this.flushDirtyRooms(), config.AUTOSAVE_INTERVAL_MS);
    console.log(`[SnapshotWorker] Autosave loop active (interval: ${config.AUTOSAVE_INTERVAL_MS}ms)`);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async flushDirtyRooms(): Promise<void> {
    const rooms = roomManager.getAllRooms();

    for (const room of rooms) {
      if (!room.isDirty) continue;

      try {
        const elementsList = Array.from(room.elements.values());

        // Attempt persistence to PostgreSQL
        try {
          const ownerId = await getOrCreateSystemUserId();

          await prisma.board.upsert({
            where: { id: room.boardId },
            update: {
              version: room.version,
              updatedAt: new Date(),
            },
            create: {
              id: room.boardId,
              title: room.boardId === 'demo' ? 'Distributed Systems Architecture' : `Board ${room.boardId}`,
              ownerId,
              isPublic: true,
              publicRole: 'EDITOR',
              version: room.version,
            },
          });

          await prisma.boardSnapshot.create({
            data: {
              boardId: room.boardId,
              version: room.version,
              elements: elementsList as any,
            },
          });
        } catch (dbErr) {
          console.warn(`[SnapshotWorker] DB write skipped for board ${room.boardId}:`, (dbErr as Error).message);
        }

        room.isDirty = false;

        // Broadcast subtle save confirmation
        if (this.io) {
          this.io.to(`board:${room.boardId}`).emit(SOCKET_EVENTS.BOARD_SAVED, {
            boardId: room.boardId,
            version: room.version,
            savedAt: Date.now(),
          });
        }
      } catch (err) {
        console.error(`[SnapshotWorker] Error saving board ${room.boardId}:`, err);
      }
    }

    const evictedCount = roomManager.evictIdleRooms();
    if (evictedCount > 0) {
      console.log(`[SnapshotWorker] Evicted ${evictedCount} idle board rooms from memory.`);
    }
  }
}

export const snapshotWorker = new SnapshotWorker();
