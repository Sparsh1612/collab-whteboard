import {
  CanvasElement,
  BoundingBox,
  Point,
  UserPresence,
  getSplinePoints,
  ResizeHandle,
} from '@whiteboard/shared';
import { Camera } from './Camera';

export interface SnappingGuide {
  type: 'x' | 'y';
  position: number;
  start: number;
  end: number;
}

export class Renderer {
  // Render infinite adaptive grid
  public static renderGrid(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    theme: 'dark' | 'light' = 'dark'
  ): void {
    const { width, height, zoom } = camera;
    const isDark = theme === 'dark';

    // Clear background
    ctx.fillStyle = isDark ? '#0b0d13' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Compute base grid step in world coordinates
    let step = 32;
    if (zoom < 0.25) step = 128;
    else if (zoom < 0.5) step = 64;
    else if (zoom > 3) step = 16;

    const visible = camera.getVisibleBounds();
    const startX = Math.floor(visible.minX / step) * step;
    const endX = Math.ceil(visible.maxX / step) * step;
    const startY = Math.floor(visible.minY / step) * step;
    const endY = Math.ceil(visible.maxY / step) * step;

    ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(100, 116, 139, 0.22)';
    const dotRadius = Math.max(0.75, Math.min(1.5, 1.0 * Math.sqrt(zoom)));

    ctx.beginPath();
    for (let wx = startX; wx <= endX; wx += step) {
      for (let wy = startY; wy <= endY; wy += step) {
        const screenPt = camera.worldToScreen({ x: wx, y: wy });
        ctx.moveTo(screenPt.x + dotRadius, screenPt.y);
        ctx.arc(screenPt.x, screenPt.y, dotRadius, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  }

  // Render a single whiteboard element
  public static renderElement(
    ctx: CanvasRenderingContext2D,
    element: CanvasElement,
    theme: 'dark' | 'light' = 'dark'
  ): void {
    ctx.save();
    ctx.globalAlpha = element.opacity ?? 1;

    // Apply rotation around element center if present
    if (element.rotation) {
      const cx = element.x + element.width / 2;
      const cy = element.y + element.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(element.rotation);
      ctx.translate(-cx, -cy);
    }

    // Configure stroke style
    ctx.lineWidth = Math.max(1, element.strokeWidth || 2);
    ctx.strokeStyle = element.strokeColor || '#334155';
    if (element.strokeStyle === 'dashed') {
      ctx.setLineDash([8, 6]);
    } else if (element.strokeStyle === 'dotted') {
      ctx.setLineDash([3, 4]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (element.type) {
      case 'rectangle': {
        const r = Math.min(8, Math.abs(element.width) / 4, Math.abs(element.height) / 4);
        const x = element.x;
        const y = element.y;
        const w = element.width;
        const h = element.height;

        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);

        if (element.fillColor && element.fillColor !== 'transparent') {
          ctx.fillStyle = element.fillColor;
          ctx.fill();
        }
        if (element.strokeWidth > 0 && element.strokeColor !== 'transparent') {
          ctx.stroke();
        }
        break;
      }

      case 'ellipse': {
        const cx = element.x + element.width / 2;
        const cy = element.y + element.height / 2;
        const rx = Math.abs(element.width / 2);
        const ry = Math.abs(element.height / 2);

        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

        if (element.fillColor && element.fillColor !== 'transparent') {
          ctx.fillStyle = element.fillColor;
          ctx.fill();
        }
        if (element.strokeWidth > 0 && element.strokeColor !== 'transparent') {
          ctx.stroke();
        }
        break;
      }

      case 'line':
      case 'arrow': {
        const startX = element.x;
        const startY = element.y;
        const endX = element.x + element.width;
        const endY = element.y + element.height;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        if (element.type === 'arrow' || element.arrowEnd === 'arrow') {
          this.renderArrowhead(ctx, startX, startY, endX, endY, element.strokeWidth);
        }
        break;
      }

      case 'pencil': {
        if (!element.points || element.points.length < 2) break;
        const smoothed = getSplinePoints(element.points);

        ctx.beginPath();
        ctx.moveTo(smoothed[0].x, smoothed[0].y);
        for (let i = 1; i < smoothed.length; i++) {
          ctx.lineTo(smoothed[i].x, smoothed[i].y);
        }
        ctx.stroke();
        break;
      }

      case 'text': {
        const fontSize = element.fontSize || 18;
        const fontFamily = element.fontFamily || 'Inter, system-ui, sans-serif';
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = element.strokeColor || (theme === 'dark' ? '#f8fafc' : '#0f172a');
        ctx.textBaseline = 'top';

        const lines = (element.text || 'Text').split('\n');
        const lineHeight = fontSize * 1.35;
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], element.x, element.y + i * lineHeight);
        }
        break;
      }

      case 'sticky': {
        const x = element.x;
        const y = element.y;
        const w = element.width;
        const h = element.height;
        const color = element.stickyColor || '#fef08a';

        // Sticky note shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 6);
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Sticky tape or subtle top bar highlight
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(x, y, w, 16);

        // Render sticky note text
        const fontSize = element.fontSize || 16;
        ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = '#1e293b'; // High-contrast readable ink
        ctx.textBaseline = 'top';

        const text = element.text || '';
        if (text) {
          const lines = this.wrapText(ctx, text, w - 24);
          const lineHeight = fontSize * 1.35;
          for (let i = 0; i < lines.length; i++) {
            if (y + 24 + (i + 1) * lineHeight > y + h - 8) break; // Clip text within card
            ctx.fillText(lines[i], x + 12, y + 24 + i * lineHeight);
          }
        }
        break;
      }

      case 'frame': {
        const x = element.x;
        const y = element.y;
        const w = element.width;
        const h = element.height;

        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x, y, w, h);

        // Frame header label badge
        const label = element.label || 'Frame';
        ctx.setLineDash([]);
        ctx.font = '600 12px Inter, system-ui, sans-serif';
        const labelWidth = ctx.measureText(label).width + 16;

        ctx.fillStyle = theme === 'dark' ? '#1e293b' : '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(x, y - 24, labelWidth, 20, [4, 4, 0, 0]);
        ctx.fill();

        ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#475569';
        ctx.fillText(label, x + 8, y - 10);
        break;
      }
    }

    ctx.restore();
  }

  // Draw arrow tip
  private static renderArrowhead(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    strokeWidth = 2
  ): void {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = Math.max(12, strokeWidth * 4.5);
    const arrowWidth = Math.PI / 6; // 30 degrees

    ctx.save();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle - arrowWidth),
      toY - arrowLength * Math.sin(angle - arrowWidth)
    );
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle + arrowWidth),
      toY - arrowLength * Math.sin(angle + arrowWidth)
    );
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    ctx.restore();
  }

  // Word-wrap utility for text & sticky notes
  private static wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }

  // Render selection box, resize handles, and rotation handle in screen coordinates
  public static renderSelectionBox(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    bounds: BoundingBox
  ): void {
    const tl = camera.worldToScreen({ x: bounds.minX, y: bounds.minY });
    const br = camera.worldToScreen({ x: bounds.maxX, y: bounds.maxY });
    const w = br.x - tl.x;
    const h = br.y - tl.y;
    const pad = 6;

    ctx.save();
    // Bounding border
    ctx.strokeStyle = '#3b82f6'; // Clean product blue
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.strokeRect(tl.x - pad, tl.y - pad, w + pad * 2, h + pad * 2);

    // 8 resize handles
    const handleSize = 7;
    const halfH = handleSize / 2;
    const handles = [
      { x: tl.x - pad, y: tl.y - pad }, // tl
      { x: tl.x + w / 2, y: tl.y - pad }, // tm
      { x: br.x + pad, y: tl.y - pad }, // tr
      { x: br.x + pad, y: tl.y + h / 2 }, // mr
      { x: br.x + pad, y: br.y + pad }, // br
      { x: tl.x + w / 2, y: br.y + pad }, // bm
      { x: tl.x - pad, y: br.y + pad }, // bl
      { x: tl.x - pad, y: tl.y + h / 2 }, // ml
    ];

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;

    for (const pt of handles) {
      ctx.fillRect(pt.x - halfH, pt.y - halfH, handleSize, handleSize);
      ctx.strokeRect(pt.x - halfH, pt.y - halfH, handleSize, handleSize);
    }

    // Rotation handle connected with stem
    const rotStem = 20;
    const rotHandle = { x: tl.x + w / 2, y: tl.y - pad - rotStem };

    ctx.beginPath();
    ctx.moveTo(tl.x + w / 2, tl.y - pad);
    ctx.lineTo(rotHandle.x, rotHandle.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(rotHandle.x, rotHandle.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Render drag marquee selection box
  public static renderMarquee(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    start: Point,
    current: Point
  ): void {
    const s1 = camera.worldToScreen(start);
    const s2 = camera.worldToScreen(current);
    const x = Math.min(s1.x, s2.x);
    const y = Math.min(s1.y, s2.y);
    const w = Math.abs(s2.x - s1.x);
    const h = Math.abs(s2.y - s1.y);

    ctx.save();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  // Render alignment snapping guides
  public static renderSnappingGuides(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    guides: SnappingGuide[]
  ): void {
    ctx.save();
    ctx.strokeStyle = '#6366f1'; // Calm indigo snap line
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    for (const guide of guides) {
      if (guide.type === 'x') {
        const p1 = camera.worldToScreen({ x: guide.position, y: guide.start });
        const p2 = camera.worldToScreen({ x: guide.position, y: guide.end });
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      } else {
        const p1 = camera.worldToScreen({ x: guide.start, y: guide.position });
        const p2 = camera.worldToScreen({ x: guide.end, y: guide.position });
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Render remote collaborator cursors
  public static renderRemoteCursor(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    presence: UserPresence
  ): void {
    if (!presence.cursor) return;
    const screenPt = camera.worldToScreen(presence.cursor);
    const color = presence.userColor || '#3b82f6';
    const name = presence.userName || 'Anonymous';

    ctx.save();
    ctx.translate(screenPt.x, screenPt.y);

    // Refined cursor arrow
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 13);
    ctx.lineTo(3.5, 9.5);
    ctx.lineTo(8.5, 9.5);
    ctx.closePath();
    ctx.fill();

    // Dark hairline stroke
    ctx.strokeStyle = '#0b0d13';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Compact collaborator name tag
    ctx.font = '500 10px Inter, system-ui, sans-serif';
    const labelW = ctx.measureText(name).width + 10;
    const labelH = 17;
    const labelX = 8;
    const labelY = 12;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(labelX, labelY, labelW, labelH, 3);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, labelX + 5, labelY + labelH / 2);

    ctx.restore();
  }
}
