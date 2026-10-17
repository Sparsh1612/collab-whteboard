import { Server, Socket } from 'socket.io';
import {
  SOCKET_EVENTS,
  JoinRoomPayload,
  JoinRoomAck,
  OpBatch,
  CursorUpdatePayload,
  BoardRole,
} from '@whiteboard/shared';
import { roomManager } from './RoomManager.js';
import { OperationProcessor } from './OperationProcessor.js';
import { pubsub } from '../services/redis.js';

export function setupSocketServer(io: Server): void {
  // Listen for distributed cross-instance operations from Redis
  pubsub.subscribe('board:cross_instance_ops', (raw) => {
    try {
      const data = JSON.parse(raw);
      if (data && data.boardId && data.ops) {
        // Broadcast to local room sockets (except sender socket if on this instance)
        io.to(`board:${data.boardId}`).emit(SOCKET_EVENTS.REMOTE_OPS, data);
      }
    } catch {}
  });

  io.on('connection', (socket: Socket) => {
    let currentBoardId: string | null = null;
    let currentUserRole: BoardRole = 'EDITOR';

    // 1. Join Room
    socket.on(
      SOCKET_EVENTS.JOIN_ROOM,
      async (payload: JoinRoomPayload, callback?: (ack: JoinRoomAck) => void) => {
        const { boardId, userId, userName } = payload;
        currentBoardId = boardId;

        // Auto-assign guest/collaborator info
        const finalUserId = userId || 'user-' + socket.id.substring(0, 6);
        const finalUserName = userName || 'Collaborator ' + socket.id.substring(0, 4);
        const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

        // Join Socket.IO room channel
        socket.join(`board:${boardId}`);

        const client = roomManager.addClient(boardId, socket.id, {
          userId: finalUserId,
          userName: finalUserName,
          userColor,
          role: currentUserRole,
        });

        const room = roomManager.getOrCreateRoom(boardId);

        // Notify other room peers of new user
        socket.to(`board:${boardId}`).emit(SOCKET_EVENTS.USER_JOINED, {
          userId: client.userId,
          socketId: socket.id,
          userName: client.userName,
          userColor: client.userColor,
          cursor: null,
          activeTool: 'select',
          selectedElementIds: [],
          lastActiveAt: Date.now(),
        });

        // Send full sync snapshot back in ACK
        if (callback) {
          callback({
            success: true,
            role: currentUserRole,
            boardId,
            title: boardId === 'demo' ? 'Distributed Systems Architecture' : `Board: ${boardId}`,
            elements: Array.from(room.elements.values()),
            presences: roomManager.getActivePresences(boardId),
            version: room.version,
          });
        }
      }
    );

    // 2. Cursor / Presence Updates
    socket.on(SOCKET_EVENTS.CURSOR_MOVE, (payload: CursorUpdatePayload) => {
      if (!currentBoardId) return;

      const updated = roomManager.updatePresence(currentBoardId, socket.id, {
        cursor: payload.cursor ? { ...payload.cursor, timestamp: Date.now() } : null,
        activeTool: payload.activeTool,
        selectedElementIds: payload.selectedElementIds,
      });

      if (updated) {
        socket.to(`board:${currentBoardId}`).emit(SOCKET_EVENTS.PRESENCE_UPDATE, updated);
      }
    });

    // 3. Operation Batch (Drawing, Transforms, Deletes)
    socket.on(SOCKET_EVENTS.OP_BATCH, async (batch: OpBatch) => {
      if (!currentBoardId || currentBoardId !== batch.boardId) return;

      const room = roomManager.getOrCreateRoom(currentBoardId);
      const result = OperationProcessor.processBatch(room, batch, currentUserRole);

      if (!result.success) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: result.error });
        return;
      }

      if (result.appliedOps.length > 0) {
        const broadcastPayload = {
          boardId: currentBoardId,
          userId: batch.userId,
          version: room.version,
          ops: result.appliedOps,
          timestamp: Date.now(),
        };

        // Broadcast to all other peers in this room
        socket.to(`board:${currentBoardId}`).emit(SOCKET_EVENTS.REMOTE_OPS, broadcastPayload);

        // Publish to Redis for multi-instance clusters
        pubsub.publish('board:cross_instance_ops', broadcastPayload);
      }
    });

    // 4. Request Manual Sync (e.g., after reconnect)
    socket.on(SOCKET_EVENTS.REQUEST_SYNC, ({ boardId }: { boardId: string }) => {
      const room = roomManager.getRoom(boardId);
      if (room) {
        socket.emit(SOCKET_EVENTS.SYNC_RESPONSE, {
          boardId,
          version: room.version,
          elements: Array.from(room.elements.values()),
        });
      }
    });

    // 5. Leave & Disconnect
    const handleLeave = () => {
      const removed = roomManager.removeClient(socket.id);
      if (removed) {
        io.to(`board:${removed.boardId}`).emit(SOCKET_EVENTS.USER_LEFT, {
          socketId: socket.id,
          userId: removed.client.userId,
        });
      }
    };

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, handleLeave);
    socket.on('disconnect', handleLeave);
  });
}
