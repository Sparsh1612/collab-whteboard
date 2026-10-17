import { create } from 'zustand';
import { User, UserPresence } from '@whiteboard/shared';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'offline';

interface CollabState {
  status: ConnectionStatus;
  currentUserId: string;
  currentUser: User | null;
  collaborators: Map<string, UserPresence>;
  latencyMs: number;

  setStatus: (status: ConnectionStatus) => void;
  setCurrentUser: (user: User) => void;
  setCollaborator: (presence: UserPresence) => void;
  removeCollaborator: (socketIdOrUserId: string) => void;
  setAllCollaborators: (presences: UserPresence[]) => void;
  setLatency: (ms: number) => void;
}

export const useCollabStore = create<CollabState>((set, get) => ({
  status: 'disconnected',
  currentUserId: 'anonymous-' + Math.random().toString(36).substring(2, 8),
  currentUser: null,
  collaborators: new Map<string, UserPresence>(),
  latencyMs: 12,

  setStatus: (status) => set({ status }),
  setCurrentUser: (user) => set({ currentUser: user, currentUserId: user.id }),

  setCollaborator: (presence) => {
    const collaborators = new Map(get().collaborators);
    collaborators.set(presence.socketId || presence.userId, presence);
    set({ collaborators });
  },

  removeCollaborator: (key) => {
    const collaborators = new Map(get().collaborators);
    collaborators.delete(key);
    set({ collaborators });
  },

  setAllCollaborators: (presences) => {
    const map = new Map<string, UserPresence>();
    presences.forEach((p) => map.set(p.socketId || p.userId, p));
    set({ collaborators: map });
  },

  setLatency: (latencyMs) => set({ latencyMs }),
}));
