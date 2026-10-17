import { Point } from './element.js';
import { ToolType } from './tools.js';

export interface CursorPosition extends Point {
  timestamp: number;
}

export interface UserPresence {
  userId: string;
  socketId: string;
  userName: string;
  userColor: string;
  avatarUrl?: string;
  cursor: CursorPosition | null;
  activeTool: ToolType;
  selectedElementIds: string[];
  lastActiveAt: number;
}
