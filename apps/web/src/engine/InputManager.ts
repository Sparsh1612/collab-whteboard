import {
  Point,
  CanvasElement,
  ElementType,
  ResizeHandle,
  getElementBounds,
  hitTestElement,
  distance,
} from '@whiteboard/shared';
import { Camera } from './Camera';
import { SpatialIndex } from './SpatialIndex';
import { HistoryManager } from './History';
import { SnappingGuide } from './Renderer';
import { useBoardStore } from '../stores/useBoardStore';
import { useUIStore } from '../stores/useUIStore';

export type InteractionMode =
  | 'idle'
  | 'panning'
  | 'drawing'
  | 'moving'
  | 'resizing'
  | 'rotating'
  | 'marquee'
  | 'erasing';

export class InputManager {
  private camera: Camera;
  private spatialIndex: SpatialIndex;
  private history: HistoryManager;
  private canvasElement: HTMLCanvasElement;

  private mode: InteractionMode = 'idle';
  private startScreenPoint: Point = { x: 0, y: 0 };
  private startWorldPoint: Point = { x: 0, y: 0 };
  private lastScreenPoint: Point = { x: 0, y: 0 };
  
  // For freehand drawing & shape creation
  public activeElement: CanvasElement | null = null;
  public marqueeStart: Point | null = null;
  public marqueeCurrent: Point | null = null;
  public activeGuides: SnappingGuide[] = [];

  // For transforms (move, resize, rotate)
  private activeHandle: ResizeHandle | null = null;
  private initialTransformElements: Map<string, CanvasElement> = new Map();
  private onRemoteCursorThrottle: ((pos: Point) => void) | null = null;
  private lastCursorSendTime = 0;

  constructor(
    canvas: HTMLCanvasElement,
    camera: Camera,
    spatialIndex: SpatialIndex,
    history: HistoryManager
  ) {
    this.canvasElement = canvas;
    this.camera = camera;
    this.spatialIndex = spatialIndex;
    this.history = history;
  }

  public setCursorThrottleCallback(cb: (pos: Point) => void): void {
    this.onRemoteCursorThrottle = cb;
  }

  public handlePointerDown(e: PointerEvent): void {
    if (e.button !== 0 && e.button !== 1) return; // Only primary or middle click
    this.canvasElement.setPointerCapture(e.pointerId);

    const rect = this.canvasElement.getBoundingClientRect();
    const screenPt: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldPt = this.camera.screenToWorld(screenPt);

    this.startScreenPoint = screenPt;
    this.lastScreenPoint = screenPt;
    this.startWorldPoint = worldPt;

    const ui = useUIStore.getState();
    const board = useBoardStore.getState();

    // Check middle mouse or space bar panning or hand tool
    if (e.button === 1 || ui.isSpacePressed || ui.activeTool === 'hand') {
      this.mode = 'panning';
      ui.setIsPanning(true);
      return;
    }

    if (ui.activeTool === 'pencil') {
      this.mode = 'drawing';
      const id = 'el-' + Math.random().toString(36).substring(2, 9);
      this.activeElement = {
        id,
        type: 'pencil',
        x: worldPt.x,
        y: worldPt.y,
        width: 1,
        height: 1,
        rotation: 0,
        strokeColor: ui.style.strokeColor,
        fillColor: 'transparent',
        strokeWidth: ui.style.strokeWidth,
        strokeStyle: ui.style.strokeStyle,
        opacity: ui.style.opacity,
        zIndex: Date.now(),
        points: [worldPt],
        createdBy: 'local',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };
      return;
    }

    if (ui.activeTool === 'eraser') {
      this.mode = 'erasing';
      this.eraseAtPoint(worldPt);
      return;
    }

    if (
      ui.activeTool === 'rectangle' ||
      ui.activeTool === 'ellipse' ||
      ui.activeTool === 'line' ||
      ui.activeTool === 'arrow' ||
      ui.activeTool === 'frame'
    ) {
      this.mode = 'drawing';
      const id = 'el-' + Math.random().toString(36).substring(2, 9);
      this.activeElement = {
        id,
        type: ui.activeTool as ElementType,
        x: worldPt.x,
        y: worldPt.y,
        width: 1,
        height: 1,
        rotation: 0,
        strokeColor: ui.style.strokeColor,
        fillColor: ui.activeTool === 'line' || ui.activeTool === 'arrow' ? 'transparent' : ui.style.fillColor,
        strokeWidth: ui.style.strokeWidth,
        strokeStyle: ui.style.strokeStyle,
        opacity: ui.style.opacity,
        zIndex: Date.now(),
        createdBy: 'local',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };
      return;
    }

    if (ui.activeTool === 'sticky') {
      const id = 'el-' + Math.random().toString(36).substring(2, 9);
      const sticky: CanvasElement = {
        id,
        type: 'sticky',
        x: worldPt.x - 100,
        y: worldPt.y - 100,
        width: 200,
        height: 200,
        rotation: 0,
        strokeColor: '#000000',
        fillColor: ui.style.stickyColor,
        stickyColor: ui.style.stickyColor,
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: Date.now(),
        text: 'Idea note...',
        fontSize: 16,
        createdBy: 'local',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };
      board.addElement(sticky);
      this.spatialIndex.insert(sticky);
      ui.setSelectedIds([sticky.id]);
      ui.setActiveTool('select');
      this.recordCreateHistory([sticky]);
      return;
    }

    if (ui.activeTool === 'text') {
      const id = 'el-' + Math.random().toString(36).substring(2, 9);
      const textEl: CanvasElement = {
        id,
        type: 'text',
        x: worldPt.x,
        y: worldPt.y,
        width: 160,
        height: 40,
        rotation: 0,
        strokeColor: ui.style.strokeColor,
        fillColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: Date.now(),
        text: 'Type text here',
        fontSize: ui.style.fontSize || 20,
        fontFamily: ui.style.fontFamily,
        createdBy: 'local',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };
      board.addElement(textEl);
      this.spatialIndex.insert(textEl);
      ui.setSelectedIds([textEl.id]);
      ui.setActiveTool('select');
      this.recordCreateHistory([textEl]);
      return;
    }

    // Select Tool
    if (ui.activeTool === 'select') {
      // Check handles first if something is selected
      if (ui.selectedIds.length > 0) {
        const handle = this.hitTestResizeHandle(screenPt);
        if (handle) {
          this.mode = handle === 'rot' ? 'rotating' : 'resizing';
          this.activeHandle = handle;
          this.snapshotSelectedElements();
          return;
        }
      }

      // Hit test existing element
      const hit = this.spatialIndex.hitTestPoint(worldPt, 12);
      if (hit) {
        if (e.shiftKey) {
          ui.toggleSelectId(hit.id);
        } else if (!ui.selectedIds.includes(hit.id)) {
          ui.setSelectedIds([hit.id]);
        }
        this.mode = 'moving';
        this.snapshotSelectedElements();
      } else {
        // Clicked blank space: clear selection and start marquee drag
        if (!e.shiftKey) {
          ui.clearSelection();
        }
        this.mode = 'marquee';
        this.marqueeStart = worldPt;
        this.marqueeCurrent = worldPt;
      }
    }
  }

  public handlePointerMove(e: PointerEvent): void {
    const rect = this.canvasElement.getBoundingClientRect();
    const screenPt: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldPt = this.camera.screenToWorld(screenPt);

    // Throttle cursor updates (every 40ms)
    const now = Date.now();
    if (now - this.lastCursorSendTime > 40 && this.onRemoteCursorThrottle) {
      this.onRemoteCursorThrottle(worldPt);
      this.lastCursorSendTime = now;
    }

    const dx = screenPt.x - this.lastScreenPoint.x;
    const dy = screenPt.y - this.lastScreenPoint.y;
    this.lastScreenPoint = screenPt;

    const ui = useUIStore.getState();
    const board = useBoardStore.getState();

    if (this.mode === 'panning') {
      this.camera.pan(dx, dy);
      return;
    }

    if (this.mode === 'drawing' && this.activeElement) {
      if (this.activeElement.type === 'pencil') {
        const lastPt = this.activeElement.points![this.activeElement.points!.length - 1];
        if (distance(lastPt, worldPt) > 2.5) {
          this.activeElement.points!.push(worldPt);
        }
      } else {
        // Shapes: rectangle, ellipse, line, arrow, frame
        this.activeElement.width = worldPt.x - this.startWorldPoint.x;
        this.activeElement.height = worldPt.y - this.startWorldPoint.y;
      }
      return;
    }

    if (this.mode === 'erasing') {
      this.eraseAtPoint(worldPt);
      return;
    }

    if (this.mode === 'moving') {
      const deltaX = worldPt.x - this.startWorldPoint.x;
      const deltaY = worldPt.y - this.startWorldPoint.y;

      for (const [id, original] of this.initialTransformElements.entries()) {
        board.updateElement(id, {
          x: original.x + deltaX,
          y: original.y + deltaY,
        });
        const current = board.elements.get(id);
        if (current) this.spatialIndex.update(current);
      }
      return;
    }

    if (this.mode === 'resizing' && this.activeHandle) {
      this.applyResize(worldPt);
      return;
    }

    if (this.mode === 'marquee' && this.marqueeStart) {
      this.marqueeCurrent = worldPt;
      this.updateMarqueeSelection();
      return;
    }
  }

  public handlePointerUp(e: PointerEvent): void {
    if (this.canvasElement.hasPointerCapture(e.pointerId)) {
      this.canvasElement.releasePointerCapture(e.pointerId);
    }

    const ui = useUIStore.getState();
    const board = useBoardStore.getState();

    if (this.mode === 'panning') {
      ui.setIsPanning(false);
    } else if (this.mode === 'drawing' && this.activeElement) {
      // Normalize shape width/height if drawn backwards
      if (
        this.activeElement.type !== 'pencil' &&
        this.activeElement.type !== 'line' &&
        this.activeElement.type !== 'arrow'
      ) {
        if (this.activeElement.width < 0) {
          this.activeElement.x += this.activeElement.width;
          this.activeElement.width = Math.abs(this.activeElement.width);
        }
        if (this.activeElement.height < 0) {
          this.activeElement.y += this.activeElement.height;
          this.activeElement.height = Math.abs(this.activeElement.height);
        }
      }

      // Add to board if significant size
      const isTiny =
        this.activeElement.type !== 'pencil' &&
        Math.abs(this.activeElement.width) < 4 &&
        Math.abs(this.activeElement.height) < 4;

      if (!isTiny) {
        board.addElement(this.activeElement);
        this.spatialIndex.insert(this.activeElement);
        this.recordCreateHistory([this.activeElement]);
        ui.setSelectedIds([this.activeElement.id]);
      }
      this.activeElement = null;
    } else if (this.mode === 'moving' || this.mode === 'resizing') {
      this.recordTransformHistory();
    }

    this.mode = 'idle';
    this.marqueeStart = null;
    this.marqueeCurrent = null;
    this.activeHandle = null;
    this.activeGuides = [];
    this.initialTransformElements.clear();
  }

  public handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const rect = this.canvasElement.getBoundingClientRect();
    const screenPt: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (e.ctrlKey || e.metaKey) {
      // Pinch to zoom or Ctrl+Wheel
      const zoomFactor = Math.pow(0.995, e.deltaY);
      this.camera.zoomAt(screenPt, zoomFactor);
    } else {
      // Two-finger pan
      this.camera.pan(-e.deltaX, -e.deltaY);
    }
  }

  private eraseAtPoint(worldPt: Point): void {
    const hit = this.spatialIndex.hitTestPoint(worldPt, 16);
    if (hit) {
      const board = useBoardStore.getState();
      board.deleteElements([hit.id]);
      this.spatialIndex.remove(hit.id);
      this.history.push({
        description: 'Erase element',
        undo: () => {
          board.addElement(hit);
          this.spatialIndex.insert(hit);
        },
        redo: () => {
          board.deleteElements([hit.id]);
          this.spatialIndex.remove(hit.id);
        },
      });
    }
  }

  private snapshotSelectedElements(): void {
    const board = useBoardStore.getState();
    const ui = useUIStore.getState();
    this.initialTransformElements.clear();

    for (const id of ui.selectedIds) {
      const el = board.elements.get(id);
      if (el) {
        this.initialTransformElements.set(id, { ...el });
      }
    }
  }

  private hitTestResizeHandle(screenPt: Point): ResizeHandle | null {
    // Check 8 handles and rotation stem
    const board = useBoardStore.getState();
    const ui = useUIStore.getState();
    const selected = ui.selectedIds.map((id) => board.elements.get(id)).filter(Boolean) as CanvasElement[];
    if (selected.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const el of selected) {
      const b = getElementBounds(el);
      if (b.minX < minX) minX = b.minX;
      if (b.minY < minY) minY = b.minY;
      if (b.maxX > maxX) maxX = b.maxX;
      if (b.maxY > maxY) maxY = b.maxY;
    }

    const tl = this.camera.worldToScreen({ x: minX, y: minY });
    const br = this.camera.worldToScreen({ x: maxX, y: maxY });
    const w = br.x - tl.x;
    const h = br.y - tl.y;
    const pad = 6;
    const threshold = 12;

    const rotPt = { x: tl.x + w / 2, y: tl.y - pad - 24 };
    if (distance(screenPt, rotPt) <= threshold) return 'rot';

    const handlePositions: { handle: ResizeHandle; x: number; y: number }[] = [
      { handle: 'tl', x: tl.x - pad, y: tl.y - pad },
      { handle: 'tm', x: tl.x + w / 2, y: tl.y - pad },
      { handle: 'tr', x: br.x + pad, y: tl.y - pad },
      { handle: 'mr', x: br.x + pad, y: tl.y + h / 2 },
      { handle: 'br', x: br.x + pad, y: br.y + pad },
      { handle: 'bm', x: tl.x + w / 2, y: br.y + pad },
      { handle: 'bl', x: tl.x - pad, y: br.y + pad },
      { handle: 'ml', x: tl.x - pad, y: tl.y + h / 2 },
    ];

    for (const hPos of handlePositions) {
      if (distance(screenPt, { x: hPos.x, y: hPos.y }) <= threshold) {
        return hPos.handle;
      }
    }

    return null;
  }

  private applyResize(worldPt: Point): void {
    const board = useBoardStore.getState();
    const deltaX = worldPt.x - this.startWorldPoint.x;
    const deltaY = worldPt.y - this.startWorldPoint.y;

    for (const [id, orig] of this.initialTransformElements.entries()) {
      let newX = orig.x;
      let newY = orig.y;
      let newW = orig.width;
      let newH = orig.height;

      switch (this.activeHandle) {
        case 'br':
          newW = Math.max(10, orig.width + deltaX);
          newH = Math.max(10, orig.height + deltaY);
          break;
        case 'mr':
          newW = Math.max(10, orig.width + deltaX);
          break;
        case 'bm':
          newH = Math.max(10, orig.height + deltaY);
          break;
        case 'tl':
          newX = orig.x + deltaX;
          newY = orig.y + deltaY;
          newW = Math.max(10, orig.width - deltaX);
          newH = Math.max(10, orig.height - deltaY);
          break;
        case 'tr':
          newY = orig.y + deltaY;
          newW = Math.max(10, orig.width + deltaX);
          newH = Math.max(10, orig.height - deltaY);
          break;
        case 'bl':
          newX = orig.x + deltaX;
          newW = Math.max(10, orig.width - deltaX);
          newH = Math.max(10, orig.height + deltaY);
          break;
      }

      board.updateElement(id, { x: newX, y: newY, width: newW, height: newH });
      const current = board.elements.get(id);
      if (current) this.spatialIndex.update(current);
    }
  }

  private updateMarqueeSelection(): void {
    if (!this.marqueeStart || !this.marqueeCurrent) return;
    const minX = Math.min(this.marqueeStart.x, this.marqueeCurrent.x);
    const maxX = Math.max(this.marqueeStart.x, this.marqueeCurrent.x);
    const minY = Math.min(this.marqueeStart.y, this.marqueeCurrent.y);
    const maxY = Math.max(this.marqueeStart.y, this.marqueeCurrent.y);

    const visible = this.spatialIndex.queryVisible({
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    });

    useUIStore.getState().setSelectedIds(visible.map((el) => el.id));
  }

  private recordCreateHistory(elements: CanvasElement[]): void {
    const board = useBoardStore.getState();
    this.history.push({
      description: 'Create ' + elements.length + ' element(s)',
      undo: () => {
        board.deleteElements(elements.map((e) => e.id));
        elements.forEach((e) => this.spatialIndex.remove(e.id));
      },
      redo: () => {
        elements.forEach((e) => {
          board.addElement(e);
          this.spatialIndex.insert(e);
        });
      },
    });
  }

  private recordTransformHistory(): void {
    const board = useBoardStore.getState();
    const oldSnapshots = new Map(this.initialTransformElements);
    const newSnapshots = new Map<string, CanvasElement>();

    for (const id of oldSnapshots.keys()) {
      const el = board.elements.get(id);
      if (el) newSnapshots.set(id, { ...el });
    }

    this.history.push({
      description: 'Transform elements',
      undo: () => {
        for (const [id, old] of oldSnapshots.entries()) {
          board.updateElement(id, old);
          this.spatialIndex.update(old);
        }
      },
      redo: () => {
        for (const [id, updated] of newSnapshots.entries()) {
          board.updateElement(id, updated);
          this.spatialIndex.update(updated);
        }
      },
    });
  }
}
