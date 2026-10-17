import { describe, it, expect, vi } from 'vitest';
import { HistoryManager } from '../engine/History';

describe('HistoryManager (Command Pattern Undo/Redo)', () => {
  it('executes undo and redo in proper order', () => {
    const history = new HistoryManager();
    let state = 0;

    const cmd1 = {
      description: 'Add 10',
      undo: () => { state -= 10; },
      redo: () => { state += 10; },
    };
    cmd1.redo();
    history.push(cmd1);

    expect(state).toBe(10);
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);

    history.undo();
    expect(state).toBe(0);
    expect(history.canRedo()).toBe(true);

    history.redo();
    expect(state).toBe(10);
  });

  it('clears redo stack when a new command is pushed', () => {
    const history = new HistoryManager();
    let state = 0;

    history.push({
      description: 'Step 1',
      undo: () => { state = 0; },
      redo: () => { state = 1; },
    });
    state = 1;

    history.undo();
    expect(history.canRedo()).toBe(true);

    // Push new command
    history.push({
      description: 'Step 2',
      undo: () => { state = 0; },
      redo: () => { state = 2; },
    });
    // Redo stack must be cleared
    expect(history.canRedo()).toBe(false);
  });

  it('notifies subscribers on push, undo, and redo', () => {
    const history = new HistoryManager();
    const subscriber = vi.fn();
    history.subscribe(subscriber);

    history.push({
      description: 'Action',
      undo: () => {},
      redo: () => {},
    });
    expect(subscriber).toHaveBeenCalledTimes(1);

    history.undo();
    expect(subscriber).toHaveBeenCalledTimes(2);

    history.redo();
    expect(subscriber).toHaveBeenCalledTimes(3);
  });
});
