import { Server } from 'socket.io';
import { SOCKET_EVENTS } from '@whiteboard/shared';
import { roomManager } from '../realtime/RoomManager.js';
import { prisma } from './db.js';
import { config } from '../config/env.js';

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
          await prisma.boardSnapshot.create({
            data: {
              boardId: room.boardId,
              version: room.version,
              elements: elementsList as any,
            },
          });

          await prisma.board.update({
            where: { id: room.boardId },
            data: {
              version: room.version,
              updatedAt: new Date(),
            },
          });
        } catch (dbErr) {
          // If board not yet in DB (e.g. demo room or standalone test mode), log debug
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
  }
}

export const snapshotWorker = new SnapshotWorker();
