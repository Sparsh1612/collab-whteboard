'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  SOCKET_EVENTS,
  OpBatch,
  BoardOp,
  Point,
  UserPresence,
  JoinRoomAck,
  CanvasElement,
} from '@whiteboard/shared';
import { useBoardStore, setBoardOpListener } from '../stores/useBoardStore';
import { useCollabStore } from '../stores/useCollabStore';
import { useUIStore } from '../stores/useUIStore';

const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export function useCollab(boardId: string) {
  const socketRef = useRef<Socket | null>(null);
  const outgoingQueueRef = useRef<BoardOp[]>([]);
  const latencyIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const setStatus = useCollabStore((s) => s.setStatus);
  const setCollaborator = useCollabStore((s) => s.setCollaborator);
  const removeCollaborator = useCollabStore((s) => s.removeCollaborator);
  const setAllCollaborators = useCollabStore((s) => s.setAllCollaborators);
  const setLatency = useCollabStore((s) => s.setLatency);
  const currentUserId = useCollabStore((s) => s.currentUserId);

  const addElement = useBoardStore((s) => s.addElement);
  const updateElement = useBoardStore((s) => s.updateElement);
  const deleteElements = useBoardStore((s) => s.deleteElements);
  const reorderElement = useBoardStore((s) => s.reorderElement);
  const clearBoard = useBoardStore((s) => s.clearBoard);
  const setBoard = useBoardStore((s) => s.setBoard);
  const markSaved = useBoardStore((s) => s.markSaved);

  // Emit cursor movement throttled
  const emitCursorMove = useCallback(
    (cursor: Point | null, activeTool?: any, selectedElementIds?: string[]) => {
      if (socketRef.current?.connected) {
        socketRef.current.volatile.emit(SOCKET_EVENTS.CURSOR_MOVE, {
          cursor,
          activeTool,
          selectedElementIds,
        });
      }
    },
    []
  );

  // Emit operations batch
  const emitOps = useCallback(
    (ops: BoardOp[]) => {
      if (ops.length === 0) return;
      const batch: OpBatch = {
        id: 'batch-' + Math.random().toString(36).substring(2, 9),
        boardId,
        userId: currentUserId,
        timestamp: Date.now(),
        ops,
      };

      if (socketRef.current?.connected) {
        socketRef.current.emit(SOCKET_EVENTS.OP_BATCH, batch);
      } else {
        outgoingQueueRef.current.push(...ops);
      }
    },
    [boardId, currentUserId]
  );

  // Connect Socket.IO
  useEffect(() => {
    if (!boardId) return;

    setStatus('connecting');

    const socket: Socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('connected');

      // Join room
      socket.emit(
        SOCKET_EVENTS.JOIN_ROOM,
        {
          boardId,
          userId: currentUserId,
          userName: 'Collaborator ' + currentUserId.slice(-4),
        },
        (ack: JoinRoomAck) => {
          if (ack && ack.success) {
            const serverElements = ack.elements || [];
            const queued = [...outgoingQueueRef.current];

            if (queued.length > 0) {
              // Reconcile server elements with pending offline edits
              const elementMap = new Map<string, CanvasElement>();
              serverElements.forEach((el) => elementMap.set(el.id, el));

              for (const op of queued) {
                if (op.type === 'create') {
                  op.elements.forEach((el) => elementMap.set(el.id, el));
                } else if (op.type === 'update') {
                  op.elements.forEach((up) => {
                    const existing = elementMap.get(up.id);
                    if (existing) {
                      elementMap.set(up.id, { ...existing, ...up });
                    }
                  });
                } else if (op.type === 'delete') {
                  op.ids.forEach((id) => elementMap.delete(id));
                }
              }

              // Update local board state with reconciled elements
              setBoard(ack.boardId, ack.title, ack.role, Array.from(elementMap.values()));
              setAllCollaborators(ack.presences);

              // Flush queued offline batch to server for distribution
              const batch: OpBatch = {
                id: 'reconnect-batch-' + Math.random().toString(36).substring(2, 9),
                boardId,
                userId: currentUserId,
                timestamp: Date.now(),
                ops: queued,
              };
              socket.emit(SOCKET_EVENTS.OP_BATCH, batch);
              outgoingQueueRef.current = [];
            } else {
              setBoard(ack.boardId, ack.title, ack.role, serverElements);
              setAllCollaborators(ack.presences);
            }
          }
        }
      );
    });

    socket.on('disconnect', () => {
      setStatus('disconnected');
    });

    socket.on('connect_error', () => {
      // In offline/standalone demo mode, gracefully remain usable locally
      setStatus('offline');
    });

    // Remote operations from collaborators
    socket.on(
      SOCKET_EVENTS.REMOTE_OPS,
      (payload: { boardId: string; userId: string; ops: BoardOp[] }) => {
        if (payload.userId === currentUserId) return; // Ignore own echoes

        for (const op of payload.ops) {
          switch (op.type) {
            case 'create':
              op.elements.forEach((el) => addElement(el, true));
              break;
            case 'update':
              op.elements.forEach((up) => updateElement(up.id, up, true));
              break;
            case 'delete':
              deleteElements(op.ids, true);
              break;
            case 'reorder':
              // Handled by zIndex updates in store
              break;
            case 'clear':
              clearBoard(true);
              break;
          }
        }
      }
    );

    // Register local board op listener to emit over WebSocket
    setBoardOpListener((op) => {
      emitOps([op]);
    });

    // Remote Presence & Cursor
    socket.on(SOCKET_EVENTS.PRESENCE_UPDATE, (presence: UserPresence) => {
      setCollaborator(presence);
    });

    socket.on(SOCKET_EVENTS.USER_JOINED, (presence: UserPresence) => {
      setCollaborator(presence);
    });

    socket.on(SOCKET_EVENTS.USER_LEFT, ({ socketId, userId }: { socketId: string; userId: string }) => {
      removeCollaborator(socketId || userId);
    });

    // Autosave notification
    socket.on(SOCKET_EVENTS.BOARD_SAVED, () => {
      markSaved();
    });

    // Ping latency check loop
    latencyIntervalRef.current = setInterval(() => {
      if (socket.connected) {
        const start = performance.now();
        socket.volatile.emit('ping', () => {
          const latency = Math.round(performance.now() - start);
          setLatency(latency);
          useUIStore.getState().setDevMetrics({ wsLatencyMs: latency });
        });
      }
    }, 5000);

    return () => {
      setBoardOpListener(null);
      if (latencyIntervalRef.current) clearInterval(latencyIntervalRef.current);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    boardId,
    currentUserId,
    emitOps,
    setStatus,
    setBoard,
    setCollaborator,
    removeCollaborator,
    setAllCollaborators,
    setLatency,
    addElement,
    updateElement,
    deleteElements,
    reorderElement,
    clearBoard,
    markSaved,
  ]);

  return {
    emitCursorMove,
    emitOps,
    socket: socketRef.current,
  };
}
