import { describe, it, expect } from 'vitest';
import { OperationProcessor } from '../realtime/OperationProcessor.js';
import { RoomManager } from '../realtime/RoomManager.js';
import { OpBatch, CanvasElement } from '@whiteboard/shared';

describe('Realtime Collaboration & Conflict Resolution', () => {
  it('applies create operations for EDITOR role and increments room version', () => {
    const roomManager = new RoomManager();
    const room = roomManager.getOrCreateRoom('test-board');

    const el: CanvasElement = {
      id: 'rect-101',
      type: 'rectangle',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      rotation: 0,
      strokeColor: '#000',
      fillColor: 'transparent',
      strokeWidth: 2,
      strokeStyle: 'solid',
      opacity: 1,
      zIndex: 1,
      createdBy: 'user-1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    const batch: OpBatch = {
      id: 'batch-1',
      boardId: 'test-board',
      userId: 'user-1',
      timestamp: Date.now(),
      ops: [{ type: 'create', elements: [el] }],
    };

    const result = OperationProcessor.processBatch(room, batch, 'EDITOR');
    expect(result.success).toBe(true);
    expect(room.elements.has('rect-101')).toBe(true);
    expect(room.version).toBe(2);
    expect(room.isDirty).toBe(true);
  });

  it('rejects mutations from VIEWER role', () => {
    const roomManager = new RoomManager();
    const room = roomManager.getOrCreateRoom('view-only-board');

    const batch: OpBatch = {
      id: 'batch-2',
      boardId: 'view-only-board',
      userId: 'guest-1',
      timestamp: Date.now(),
      ops: [{ type: 'clear' }],
    };

    const result = OperationProcessor.processBatch(room, batch, 'VIEWER');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Viewer permission denied');
    expect(result.appliedOps.length).toBe(0);
  });

  it('handles concurrent updates with Last-Write-Wins and monotonic version increment', () => {
    const roomManager = new RoomManager();
    const room = roomManager.getOrCreateRoom('conflict-board');

    const initialEl: CanvasElement = {
      id: 'node-1',
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      rotation: 0,
      strokeColor: '#000',
      fillColor: 'transparent',
      strokeWidth: 2,
      strokeStyle: 'solid',
      opacity: 1,
      zIndex: 1,
      createdBy: 'user-1',
      createdAt: 1000,
      updatedAt: 1000,
      version: 1,
    };
    room.elements.set('node-1', initialEl);

    // Update 1 from User A
    const batchA: OpBatch = {
      id: 'b-a',
      boardId: 'conflict-board',
      userId: 'user-a',
      timestamp: 2000,
      ops: [{ type: 'update', elements: [{ id: 'node-1', x: 150, version: 1 }] }],
    };
    OperationProcessor.processBatch(room, batchA, 'EDITOR');
    expect(room.elements.get('node-1')?.x).toBe(150);
    expect(room.elements.get('node-1')?.version).toBe(2);

    // Update 2 from User B: stale version 1 arrives late -> ignored by LWW
    const batchBStale: OpBatch = {
      id: 'b-b',
      boardId: 'conflict-board',
      userId: 'user-b',
      timestamp: 1500,
      ops: [{ type: 'update', elements: [{ id: 'node-1', x: 300, version: 0 }] }],
    };
    const resStale = OperationProcessor.processBatch(room, batchBStale, 'EDITOR');
    // x remains 150 because stale version was ignored
    expect(room.elements.get('node-1')?.x).toBe(150);
  });
});
