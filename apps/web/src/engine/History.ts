import { CanvasElement, BoardOp } from '@whiteboard/shared';

export interface HistoryCommand {
  description: string;
  undo: () => void;
  redo: () => void;
}

export class HistoryManager {
  private undoStack: HistoryCommand[] = [];
  private redoStack: HistoryCommand[] = [];
  private maxDepth = 100;
  private onChangeCallbacks: Set<() => void> = new Set();

  public subscribe(cb: () => void): () => void {
    this.onChangeCallbacks.add(cb);
    return () => this.onChangeCallbacks.delete(cb);
  }

  private notify(): void {
    for (const cb of this.onChangeCallbacks) {
      cb();
    }
  }

  public push(command: HistoryCommand): void {
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxDepth) {
      this.undoStack.shift();
    }
    // Any new action clears the redo stack
    this.redoStack = [];
    this.notify();
  }

  public undo(): boolean {
    const cmd = this.undoStack.pop();
    if (!cmd) return false;
    cmd.undo();
    this.redoStack.push(cmd);
    this.notify();
    return true;
  }

  public redo(): boolean {
    const cmd = this.redoStack.pop();
    if (!cmd) return false;
    cmd.redo();
    this.undoStack.push(cmd);
    this.notify();
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }
}
