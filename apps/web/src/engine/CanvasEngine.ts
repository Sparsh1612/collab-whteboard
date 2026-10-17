import { CanvasElement, getCombinedBounds } from '@whiteboard/shared';
import { Camera } from './Camera';
import { SpatialIndex } from './SpatialIndex';
import { Renderer } from './Renderer';
import { HistoryManager } from './History';
import { InputManager } from './InputManager';
import { useBoardStore } from '../stores/useBoardStore';
import { useUIStore } from '../stores/useUIStore';
import { useCollabStore } from '../stores/useCollabStore';

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public camera: Camera;
  public spatialIndex: SpatialIndex;
  public history: HistoryManager;
  public inputManager: InputManager;

  private isRunning = false;
  private animFrameId: number | null = null;
  private dpr = 1;

  // Performance telemetry
  private frameCount = 0;
  private lastFpsUpdateTime = performance.now();
  private currentFps = 60;
  private lastRenderTimeMs = 1.0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) throw new Error('Failed to get 2D canvas context');
    this.ctx = ctx;

    this.camera = new Camera();
    this.spatialIndex = new SpatialIndex();
    this.history = new HistoryManager();
    this.inputManager = new InputManager(canvas, this.camera, this.spatialIndex, this.history);

    this.setupResizeHandler();
    this.attachEventListeners();
  }

  private resizeHandler: (() => void) | null = null;

  private setupResizeHandler(): void {
    this.resizeHandler = () => {
      this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;

      this.canvas.width = Math.floor(width * this.dpr);
      this.canvas.height = Math.floor(height * this.dpr);
      this.ctx.scale(this.dpr, this.dpr);

      this.camera.resize(width, height);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeHandler);
    }
    this.resizeHandler();
  }

  private attachEventListeners(): void {
    this.canvas.addEventListener('pointerdown', (e) => this.inputManager.handlePointerDown(e));
    this.canvas.addEventListener('pointermove', (e) => this.inputManager.handlePointerMove(e));
    this.canvas.addEventListener('pointerup', (e) => this.inputManager.handlePointerUp(e));
    this.canvas.addEventListener('wheel', (e) => this.inputManager.handleWheel(e), { passive: false });
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Initial spatial sync
    const board = useBoardStore.getState();
    this.spatialIndex.rebuild(Array.from(board.elements.values()));

    const loop = (timestamp: number) => {
      if (!this.isRunning) return;
      const startT = performance.now();

      this.render();

      this.lastRenderTimeMs = performance.now() - startT;
      this.updatePerfMetrics(timestamp);

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public destroy(): void {
    this.stop();
    if (this.resizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  public render(): void {
    const ctx = this.ctx;
    const camera = this.camera;
    const ui = useUIStore.getState();
    const board = useBoardStore.getState();
    const collab = useCollabStore.getState();

    // 1. Render Grid
    Renderer.renderGrid(ctx, camera, ui.theme);

    // 2. Query visible elements with Viewport Culling
    const visibleBounds = camera.getVisibleBounds();
    const visibleElements = this.spatialIndex.queryVisible(visibleBounds);

    // 3. Render Committed Elements in World Space
    ctx.save();
    // Transform ctx to camera coordinate space
    ctx.translate(camera.width / 2, camera.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    for (const el of visibleElements) {
      Renderer.renderElement(ctx, el, ui.theme);
    }

    // 4. Render Active In-Progress Element (during pencil or shape creation)
    if (this.inputManager.activeElement) {
      Renderer.renderElement(ctx, this.inputManager.activeElement, ui.theme);
    }

    ctx.restore();

    // 5. Render Selection Box & Transform Handles in Screen Space
    if (ui.selectedIds.length > 0) {
      const selected = ui.selectedIds
        .map((id) => board.elements.get(id))
        .filter(Boolean) as CanvasElement[];
      const combined = getCombinedBounds(selected);
      if (combined) {
        Renderer.renderSelectionBox(ctx, camera, combined);
      }
    }

    // 6. Render Marquee Drag Selection Box
    if (this.inputManager.marqueeStart && this.inputManager.marqueeCurrent) {
      Renderer.renderMarquee(
        ctx,
        camera,
        this.inputManager.marqueeStart,
        this.inputManager.marqueeCurrent
      );
    }

    // 7. Render Snapping Guides
    if (this.inputManager.activeGuides.length > 0) {
      Renderer.renderSnappingGuides(ctx, camera, this.inputManager.activeGuides);
    }

    // 8. Render Remote Collaborators' Cursors
    for (const presence of collab.collaborators.values()) {
      if (presence.userId !== collab.currentUserId) {
        Renderer.renderRemoteCursor(ctx, camera, presence);
      }
    }
  }

  private updatePerfMetrics(now: number): void {
    this.frameCount++;
    if (now - this.lastFpsUpdateTime >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdateTime));
      this.frameCount = 0;
      this.lastFpsUpdateTime = now;

      const board = useBoardStore.getState();
      const visible = this.spatialIndex.queryVisible(this.camera.getVisibleBounds());

      useUIStore.getState().setDevMetrics({
        fps: Math.min(120, this.currentFps),
        renderTimeMs: Math.round(this.lastRenderTimeMs * 100) / 100,
        visibleCount: visible.length,
        totalCount: board.elements.size,
      });
    }
  }
}
