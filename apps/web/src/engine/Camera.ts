import { Point, BoundingBox } from '@whiteboard/shared';

export interface ViewportState {
  x: number; // Center world X
  y: number; // Center world Y
  zoom: number; // 0.05 to 20
  width: number; // Canvas pixel width
  height: number; // Canvas pixel height
}

export class Camera {
  public x = 0;
  public y = 0;
  public zoom = 1;
  public width = window.innerWidth || 1920;
  public height = window.innerHeight || 1080;

  private minZoom = 0.05;
  private maxZoom = 20.0;

  constructor(initial?: Partial<ViewportState>) {
    if (initial) {
      if (initial.x !== undefined) this.x = initial.x;
      if (initial.y !== undefined) this.y = initial.y;
      if (initial.zoom !== undefined) this.zoom = initial.zoom;
      if (initial.width !== undefined) this.width = initial.width;
      if (initial.height !== undefined) this.height = initial.height;
    }
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  // Convert screen coordinates (e.g. mouse clientX/clientY relative to canvas) to world coordinates
  public screenToWorld(screenPoint: Point): Point {
    return {
      x: (screenPoint.x - this.width / 2) / this.zoom + this.x,
      y: (screenPoint.y - this.height / 2) / this.zoom + this.y,
    };
  }

  // Convert world coordinates to screen pixel coordinates
  public worldToScreen(worldPoint: Point): Point {
    return {
      x: (worldPoint.x - this.x) * this.zoom + this.width / 2,
      y: (worldPoint.y - this.y) * this.zoom + this.height / 2,
    };
  }

  // Pan by delta in screen pixels
  public pan(dx: number, dy: number): void {
    this.x -= dx / this.zoom;
    this.y -= dy / this.zoom;
  }

  // Set absolute pan
  public setPan(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  // Zoom towards a specific screen coordinate (cursor position)
  public zoomAt(screenPoint: Point, zoomDelta: number): void {
    const oldZoom = this.zoom;
    const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, oldZoom * zoomDelta));
    if (newZoom === oldZoom) return;

    // Preserve the world point under the cursor
    const worldBefore = this.screenToWorld(screenPoint);
    this.zoom = newZoom;
    const worldAfter = this.screenToWorld(screenPoint);

    this.x += worldBefore.x - worldAfter.x;
    this.y += worldBefore.y - worldAfter.y;
  }

  // Set zoom directly (centered or at point)
  public setZoom(targetZoom: number, centerScreenPoint?: Point): void {
    const pt = centerScreenPoint || { x: this.width / 2, y: this.height / 2 };
    const clamped = Math.min(this.maxZoom, Math.max(this.minZoom, targetZoom));
    const factor = clamped / this.zoom;
    this.zoomAt(pt, factor);
  }

  // Get current visible world bounding box for viewport culling
  public getVisibleBounds(): BoundingBox {
    const topLeft = this.screenToWorld({ x: 0, y: 0 });
    const bottomRight = this.screenToWorld({ x: this.width, y: this.height });
    return {
      minX: Math.min(topLeft.x, bottomRight.x),
      minY: Math.min(topLeft.y, bottomRight.y),
      maxX: Math.max(topLeft.x, bottomRight.x),
      maxY: Math.max(topLeft.y, bottomRight.y),
      width: Math.abs(bottomRight.x - topLeft.x),
      height: Math.abs(bottomRight.y - topLeft.y),
    };
  }

  // Reset to default origin
  public reset(): void {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
  }

  // Fit camera around a given bounding box with padding
  public fitBounds(bounds: BoundingBox, padding = 80): void {
    if (bounds.width <= 0 || bounds.height <= 0) return;
    const availableWidth = Math.max(100, this.width - padding * 2);
    const availableHeight = Math.max(100, this.height - padding * 2);

    const zoomX = availableWidth / bounds.width;
    const zoomY = availableHeight / bounds.height;
    this.zoom = Math.min(2.0, Math.max(this.minZoom, Math.min(zoomX, zoomY)));

    this.x = bounds.minX + bounds.width / 2;
    this.y = bounds.minY + bounds.height / 2;
  }
}
