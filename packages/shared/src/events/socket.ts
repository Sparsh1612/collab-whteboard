import { CanvasElement } from '../types/element.js';
import { UserPresence, CursorPosition } from '../types/presence.js';
import { BoardRole } from '../types/user.js';
import { ToolType } from '../types/tools.js';

export type BoardOp =
  | { type: 'create'; elements: CanvasElement[] }
  | { type: 'update'; elements: (Partial<CanvasElement> & { id: string; version: number })[] }
  | { type: 'delete'; ids: string[] }
  | { type: 'reorder'; orders: { id: string; zIndex: number }[] }
  | { type: 'clear' };

export interface OpBatch {
  id: string;
  boardId: string;
  userId: string;
  timestamp: number;
  ops: BoardOp[];
}

export interface JoinRoomPayload {
  boardId: string;
  userId?: string;
  userName?: string;
  token?: string;
  role?: BoardRole;
}

export interface JoinRoomAck {
  success: boolean;
  role: BoardRole;
  boardId: string;
  title: string;
  elements: CanvasElement[];
  presences: UserPresence[];
  version: number;
  error?: string;
}

export interface CursorUpdatePayload {
  cursor: { x: number; y: number } | null;
  activeTool?: ToolType;
  selectedElementIds?: string[];
}

export interface BoardSnapshotPayload {
  boardId: string;
  version: number;
  elements: CanvasElement[];
  thumbnail?: string;
}

export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  OP_BATCH: 'board:ops',
  CURSOR_MOVE: 'presence:cursor',
  REQUEST_SYNC: 'board:sync_request',
  
  // Server -> Client
  ROOM_JOINED: 'room:joined',
  USER_JOINED: 'presence:user_joined',
  USER_LEFT: 'presence:user_left',
  PRESENCE_UPDATE: 'presence:update',
  REMOTE_OPS: 'board:remote_ops',
  SYNC_RESPONSE: 'board:sync_response',
  ERROR: 'system:error',
  BOARD_SAVED: 'board:saved',
} as const;
