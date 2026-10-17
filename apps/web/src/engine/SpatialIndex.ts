import { CanvasElement, BoundingBox, getElementBounds, isPointInBounds, Point } from '@whiteboard/shared';

export class SpatialIndex {
  private cellSize: number;
  private grid: Map<string, Set<string>> = new Map();
  private elementMap: Map<string, CanvasElement> = new Map();
  private boundsMap: Map<string, BoundingBox> = new Map();

  constructor(cellSize = 500) {
    this.cellSize = cellSize;
  }

  private getCellKeysForBounds(bounds: BoundingBox): string[] {
    const minCellX = Math.floor(bounds.minX / this.cellSize);
    const maxCellX = Math.floor(bounds.maxX / this.cellSize);
    const minCellY = Math.floor(bounds.minY / this.cellSize);
    const maxCellY = Math.floor(bounds.maxY / this.cellSize);

    const keys: string[] = [];
    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        keys.push(`${cx}:${cy}`);
      }
    }
    return keys;
  }

  public insert(element: CanvasElement): void {
    this.remove(element.id);
    const bounds = getElementBounds(element);
    this.elementMap.set(element.id, element);
    this.boundsMap.set(element.id, bounds);

    const keys = this.getCellKeysForBounds(bounds);
    for (const key of keys) {
      let bucket = this.grid.get(key);
      if (!bucket) {
        bucket = new Set();
        this.grid.set(key, bucket);
      }
      bucket.add(element.id);
    }
  }

  public update(element: CanvasElement): void {
    this.insert(element);
  }

  public remove(id: string): void {
    const bounds = this.boundsMap.get(id);
    if (!bounds) return;

    const keys = this.getCellKeysForBounds(bounds);
    for (const key of keys) {
      const bucket = this.grid.get(key);
      if (bucket) {
        bucket.delete(id);
        if (bucket.size === 0) {
          this.grid.delete(key);
        }
      }
    }
    this.elementMap.delete(id);
    this.boundsMap.delete(id);
  }

  public clear(): void {
    this.grid.clear();
    this.elementMap.clear();
    this.boundsMap.clear();
  }

  public rebuild(elements: CanvasElement[]): void {
    this.clear();
    for (const el of elements) {
      this.insert(el);
    }
  }

  // Query objects intersecting visible viewport bounds
  public queryVisible(viewport: BoundingBox): CanvasElement[] {
    const keys = this.getCellKeysForBounds(viewport);
    const candidateIds = new Set<string>();

    for (const key of keys) {
      const bucket = this.grid.get(key);
      if (bucket) {
        for (const id of bucket) {
          candidateIds.add(id);
        }
      }
    }

    const visible: CanvasElement[] = [];
    for (const id of candidateIds) {
      const el = this.elementMap.get(id);
      const bounds = this.boundsMap.get(id);
      if (el && bounds) {
        // Fast AABB intersection test
        const intersects =
          bounds.minX <= viewport.maxX &&
          bounds.maxX >= viewport.minX &&
          bounds.minY <= viewport.maxY &&
          bounds.maxY >= viewport.minY;
        if (intersects) {
          visible.push(el);
        }
      }
    }

    // Sort by zIndex to preserve layer order
    return visible.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  }

  // Find topmost element at a world point
  public hitTestPoint(point: Point, threshold = 8): CanvasElement | null {
    const cellX = Math.floor(point.x / this.cellSize);
    const cellY = Math.floor(point.y / this.cellSize);
    const key = `${cellX}:${cellY}`;
    const bucket = this.grid.get(key);
    if (!bucket || bucket.size === 0) return null;

    const candidates: CanvasElement[] = [];
    for (const id of bucket) {
      const el = this.elementMap.get(id);
      if (el) candidates.push(el);
    }

    // Sort descending by zIndex so top elements get tested first
    candidates.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
    return candidates[0] || null;
  }

  public size(): number {
    return this.elementMap.size;
  }
}
