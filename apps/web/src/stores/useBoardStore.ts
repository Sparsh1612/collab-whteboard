import { create } from 'zustand';
import { CanvasElement, BoardRole, BoardOp } from '@whiteboard/shared';

let opListener: ((op: BoardOp) => void) | null = null;

export const setBoardOpListener = (fn: ((op: BoardOp) => void) | null): void => {
  opListener = fn;
};

interface BoardState {
  boardId: string | null;
  title: string;
  role: BoardRole;
  elements: Map<string, CanvasElement>;
  isDirty: boolean;
  lastSavedAt: number | null;
  version: number;

  // Actions
  setBoard: (boardId: string, title: string, role: BoardRole, elements?: CanvasElement[]) => void;
  setTitle: (title: string) => void;
  setRole: (role: BoardRole) => void;
  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement, isRemote?: boolean) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>, isRemote?: boolean) => void;
  deleteElements: (ids: string[], isRemote?: boolean) => void;
  reorderElement: (id: string, direction: 'front' | 'back' | 'forward' | 'backward', isRemote?: boolean) => void;
  clearBoard: (isRemote?: boolean) => void;
  markSaved: () => void;
  getElementsByZIndex: () => CanvasElement[];
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boardId: null,
  title: 'Untitled Board',
  role: 'EDITOR',
  elements: new Map<string, CanvasElement>(),
  isDirty: false,
  lastSavedAt: null,
  version: 1,

  setBoard: (boardId, title, role, elements = []) => {
    const map = new Map<string, CanvasElement>();
    elements.forEach((el) => map.set(el.id, el));
    set({
      boardId,
      title,
      role,
      elements: map,
      isDirty: false,
      lastSavedAt: Date.now(),
      version: 1,
    });
  },

  setTitle: (title) => set({ title, isDirty: true }),
  setRole: (role) => set({ role }),

  setElements: (elements) => {
    const map = new Map<string, CanvasElement>();
    elements.forEach((el) => map.set(el.id, el));
    set({ elements: map, isDirty: true });
  },

  addElement: (element, isRemote = false) => {
    const elements = new Map(get().elements);
    elements.set(element.id, element);
    set({ elements, isDirty: true });
    if (!isRemote && opListener) {
      opListener({ type: 'create', elements: [element] });
    }
  },

  updateElement: (id, updates, isRemote = false) => {
    const elements = new Map(get().elements);
    const existing = elements.get(id);
    if (!existing) return;
    const nextVersion = (existing.version || 1) + 1;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
      version: nextVersion,
    };
    elements.set(id, updated);
    set({ elements, isDirty: true });
    if (!isRemote && opListener) {
      opListener({ type: 'update', elements: [{ id, ...updates, version: nextVersion }] });
    }
  },

  deleteElements: (ids, isRemote = false) => {
    const elements = new Map(get().elements);
    ids.forEach((id) => elements.delete(id));
    set({ elements, isDirty: true });
    if (!isRemote && opListener) {
      opListener({ type: 'delete', ids });
    }
  },

  reorderElement: (id, direction, isRemote = false) => {
    const all = get().getElementsByZIndex();
    const idx = all.findIndex((el) => el.id === id);
    if (idx === -1) return;

    const elements = new Map(get().elements);
    if (direction === 'front') {
      const maxZ = all[all.length - 1]?.zIndex || 0;
      const target = elements.get(id);
      if (target) elements.set(id, { ...target, zIndex: maxZ + 1 });
    } else if (direction === 'back') {
      const minZ = all[0]?.zIndex || 0;
      const target = elements.get(id);
      if (target) elements.set(id, { ...target, zIndex: Math.max(0, minZ - 1) });
    } else if (direction === 'forward' && idx < all.length - 1) {
      const current = all[idx];
      const next = all[idx + 1];
      const currentEl = elements.get(current.id);
      const nextEl = elements.get(next.id);
      if (currentEl && nextEl) {
        const tempZ = currentEl.zIndex;
        elements.set(current.id, { ...currentEl, zIndex: nextEl.zIndex });
        elements.set(next.id, { ...nextEl, zIndex: tempZ });
      }
    } else if (direction === 'backward' && idx > 0) {
      const current = all[idx];
      const prev = all[idx - 1];
      const currentEl = elements.get(current.id);
      const prevEl = elements.get(prev.id);
      if (currentEl && prevEl) {
        const tempZ = currentEl.zIndex;
        elements.set(current.id, { ...currentEl, zIndex: prevEl.zIndex });
        elements.set(prev.id, { ...prevEl, zIndex: tempZ });
      }
    }
    set({ elements, isDirty: true });
    if (!isRemote && opListener) {
      const target = elements.get(id);
      if (target) {
        opListener({ type: 'reorder', orders: [{ id, zIndex: target.zIndex }] });
      }
    }
  },

  clearBoard: (isRemote = false) => {
    set({ elements: new Map(), isDirty: true });
    if (!isRemote && opListener) {
      opListener({ type: 'clear' });
    }
  },

  markSaved: () => set({ isDirty: false, lastSavedAt: Date.now() }),

  getElementsByZIndex: () => {
    return Array.from(get().elements.values()).sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    );
  },
}));
