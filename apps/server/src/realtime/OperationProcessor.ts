import { BoardOp, CanvasElement, OpBatch, BoardRole } from '@whiteboard/shared';
import { BoardRoom } from './RoomManager.js';

export interface ProcessResult {
  success: boolean;
  appliedOps: BoardOp[];
  error?: string;
}

export class OperationProcessor {
  public static processBatch(
    room: BoardRoom,
    batch: OpBatch,
    userRole: BoardRole
  ): ProcessResult {
    // 1. Permission Check: VIEWERS cannot mutate board elements!
    if (userRole === 'VIEWER') {
      return {
        success: false,
        appliedOps: [],
        error: 'Viewer permission denied: read-only access.',
      };
    }

    const appliedOps: BoardOp[] = [];

    for (const op of batch.ops) {
      switch (op.type) {
        case 'create': {
          const validElements: CanvasElement[] = [];
          for (const el of op.elements) {
            // Assign server version if missing
            el.version = el.version || 1;
            el.updatedAt = Date.now();
            room.elements.set(el.id, el);
            validElements.push(el);
          }
          if (validElements.length > 0) {
            appliedOps.push({ type: 'create', elements: validElements });
          }
          break;
        }

        case 'update': {
          const appliedUpdates: (Partial<CanvasElement> & { id: string; version: number })[] = [];
          for (const update of op.elements) {
            const existing = room.elements.get(update.id);
            if (!existing) continue;

            // Conflict resolution: LWW per object with monotonic versioning
            if (update.version !== undefined && update.version < existing.version) {
              // Stale update rejected or overwritten by existing server version
              continue;
            }

            const newVersion = (existing.version || 1) + 1;
            const updatedElement: CanvasElement = {
              ...existing,
              ...update,
              version: newVersion,
              updatedAt: Date.now(),
            };
            room.elements.set(update.id, updatedElement);
            appliedUpdates.push({ ...update, version: newVersion });
          }
          if (appliedUpdates.length > 0) {
            appliedOps.push({ type: 'update', elements: appliedUpdates });
          }
          break;
        }

        case 'delete': {
          const deletedIds: string[] = [];
          for (const id of op.ids) {
            if (room.elements.delete(id)) {
              deletedIds.push(id);
            }
          }
          if (deletedIds.length > 0) {
            appliedOps.push({ type: 'delete', ids: deletedIds });
          }
          break;
        }

        case 'reorder': {
          const validOrders: { id: string; zIndex: number }[] = [];
          for (const order of op.orders) {
            const el = room.elements.get(order.id);
            if (el) {
              el.zIndex = order.zIndex;
              el.version = (el.version || 1) + 1;
              el.updatedAt = Date.now();
              validOrders.push({ id: order.id, zIndex: order.zIndex });
            }
          }
          if (validOrders.length > 0) {
            appliedOps.push({ type: 'reorder', orders: validOrders });
          }
          break;
        }

        case 'clear': {
          room.elements.clear();
          appliedOps.push({ type: 'clear' });
          break;
        }
      }
    }

    if (appliedOps.length > 0) {
      room.version += 1;
      room.isDirty = true;
      room.lastActivity = Date.now();
    }

    return {
      success: true,
      appliedOps,
    };
  }
}
