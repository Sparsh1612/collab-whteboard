import { CanvasElement, UserPresence, BoardRole } from '@whiteboard/shared';

export interface RoomClient {
  socketId: string;
  userId: string;
  userName: string;
  userColor: string;
  role: BoardRole;
  joinedAt: number;
}

export interface BoardRoom {
  boardId: string;
  elements: Map<string, CanvasElement>;
  version: number;
  clients: Map<string, RoomClient>; // socketId -> client
  presences: Map<string, UserPresence>; // socketId -> presence
  lastActivity: number;
  isDirty: boolean;
}

export class RoomManager {
  private rooms: Map<string, BoardRoom> = new Map();

  public getOrCreateRoom(boardId: string, initialElements: CanvasElement[] = []): BoardRoom {
    let room = this.rooms.get(boardId);
    if (!room) {
      const elementMap = new Map<string, CanvasElement>();
      initialElements.forEach((el) => elementMap.set(el.id, el));

      room = {
        boardId,
        elements: elementMap,
        version: 1,
        clients: new Map(),
        presences: new Map(),
        lastActivity: Date.now(),
        isDirty: false,
      };
      this.rooms.set(boardId, room);
    }
    return room;
  }

  public getRoom(boardId: string): BoardRoom | undefined {
    return this.rooms.get(boardId);
  }

  public addClient(
    boardId: string,
    socketId: string,
    client: Omit<RoomClient, 'socketId' | 'joinedAt'>
  ): RoomClient {
    const room = this.getOrCreateRoom(boardId);
    const roomClient: RoomClient = {
      ...client,
      socketId,
      joinedAt: Date.now(),
    };
    room.clients.set(socketId, roomClient);

    // Initial presence
    const initialPresence: UserPresence = {
      userId: client.userId,
      socketId,
      userName: client.userName,
      userColor: client.userColor,
      cursor: null,
      activeTool: 'select',
      selectedElementIds: [],
      lastActiveAt: Date.now(),
    };
    room.presences.set(socketId, initialPresence);
    room.lastActivity = Date.now();

    return roomClient;
  }

  public removeClient(socketId: string): { boardId: string; client: RoomClient } | null {
    for (const [boardId, room] of this.rooms.entries()) {
      const client = room.clients.get(socketId);
      if (client) {
        room.clients.delete(socketId);
        room.presences.delete(socketId);
        room.lastActivity = Date.now();

        // If empty for long, could be flushed and evicted
        return { boardId, client };
      }
    }
    return null;
  }

  public updatePresence(
    boardId: string,
    socketId: string,
    updates: Partial<UserPresence>
  ): UserPresence | null {
    const room = this.rooms.get(boardId);
    if (!room) return null;
    const existing = room.presences.get(socketId);
    if (!existing) return null;

    const updated: UserPresence = {
      ...existing,
      ...updates,
      lastActiveAt: Date.now(),
    };
    room.presences.set(socketId, updated);
    return updated;
  }

  public getActivePresences(boardId: string): UserPresence[] {
    const room = this.rooms.get(boardId);
    if (!room) return [];
    return Array.from(room.presences.values());
  }

  public getAllRooms(): BoardRoom[] {
    return Array.from(this.rooms.values());
  }

  public getStats(): { totalRooms: number; totalClients: number } {
    let clients = 0;
    for (const r of this.rooms.values()) {
      clients += r.clients.size;
    }
    return {
      totalRooms: this.rooms.size,
      totalClients: clients,
    };
  }
}

export const roomManager = new RoomManager();
