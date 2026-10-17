import { Point, BoundingBox, CanvasElement } from '../types/element.js';

export function getElementBounds(element: CanvasElement): BoundingBox {
  if (element.type === 'pencil' && element.points && element.points.length > 0) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const pt of element.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
    const padding = (element.strokeWidth || 2) / 2;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
      width: Math.max(1, maxX - minX + padding * 2),
      height: Math.max(1, maxY - minY + padding * 2),
    };
  }

  const minX = Math.min(element.x, element.x + element.width);
  const minY = Math.min(element.y, element.y + element.height);
  const maxX = Math.max(element.x, element.x + element.width);
  const maxY = Math.max(element.y, element.y + element.height);
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.abs(element.width),
    height: Math.abs(element.height),
  };
}

export function getCombinedBounds(elements: CanvasElement[]): BoundingBox | null {
  if (elements.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    const b = getElementBounds(el);
    if (b.minX < minX) minX = b.minX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.maxY > maxY) maxY = b.maxY;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function isPointInBounds(point: Point, bounds: BoundingBox, threshold = 0): boolean {
  return (
    point.x >= bounds.minX - threshold &&
    point.x <= bounds.maxX + threshold &&
    point.y >= bounds.minY - threshold &&
    point.y <= bounds.maxY + threshold
  );
}

export function distance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const l2 = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
  if (l2 === 0) return distance(p, a);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return distance(p, {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  });
}

export function hitTestElement(element: CanvasElement, point: Point, threshold = 8): boolean {
  const bounds = getElementBounds(element);
  if (!isPointInBounds(point, bounds, threshold + (element.strokeWidth || 2))) {
    return false;
  }

  switch (element.type) {
    case 'rectangle':
    case 'sticky':
    case 'frame':
    case 'text': {
      // If filled, check inside bounds. If transparent, check near border.
      const hasFill = element.fillColor && element.fillColor !== 'transparent';
      if (hasFill || element.type === 'sticky' || element.type === 'text') {
        return isPointInBounds(point, bounds, threshold);
      }
      // Check borders
      const p1 = { x: bounds.minX, y: bounds.minY };
      const p2 = { x: bounds.maxX, y: bounds.minY };
      const p3 = { x: bounds.maxX, y: bounds.maxY };
      const p4 = { x: bounds.minX, y: bounds.maxY };
      return (
        distanceToSegment(point, p1, p2) <= threshold ||
        distanceToSegment(point, p2, p3) <= threshold ||
        distanceToSegment(point, p3, p4) <= threshold ||
        distanceToSegment(point, p4, p1) <= threshold
      );
    }
    case 'ellipse': {
      const cx = bounds.minX + bounds.width / 2;
      const cy = bounds.minY + bounds.height / 2;
      const rx = bounds.width / 2;
      const ry = bounds.height / 2;
      if (rx <= 0 || ry <= 0) return false;
      const normX = (point.x - cx) / rx;
      const normY = (point.y - cy) / ry;
      const distFromCenter = normX * normX + normY * normY;
      const hasFill = element.fillColor && element.fillColor !== 'transparent';
      if (hasFill) {
        return distFromCenter <= 1;
      }
      return Math.abs(Math.sqrt(distFromCenter) - 1) * Math.min(rx, ry) <= threshold;
    }
    case 'line':
    case 'arrow': {
      const start = { x: element.x, y: element.y };
      const end = { x: element.x + element.width, y: element.y + element.height };
      return distanceToSegment(point, start, end) <= Math.max(threshold, element.strokeWidth);
    }
    case 'pencil': {
      if (!element.points || element.points.length < 2) return false;
      for (let i = 0; i < element.points.length - 1; i++) {
        if (distanceToSegment(point, element.points[i], element.points[i + 1]) <= Math.max(threshold, element.strokeWidth)) {
          return true;
        }
      }
      return false;
    }
    default:
      return isPointInBounds(point, bounds, threshold);
  }
}

// Catmull-Rom Spline interpolation for smooth freehand drawing
export function getSplinePoints(points: Point[], tension = 0.5, segments = 8): Point[] {
  if (points.length <= 2) return points;

  const result: Point[] = [];
  result.push(points[0]);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    for (let t = 1; t <= segments; t++) {
      const step = t / segments;
      const t2 = step * step;
      const t3 = t2 * step;

      const f1 = -tension * t3 + 2 * tension * t2 - tension * step;
      const f2 = (2 - tension) * t3 + (tension - 3) * t2 + 1;
      const f3 = (tension - 2) * t3 + (3 - 2 * tension) * t2 + tension * step;
      const f4 = tension * t3 - tension * t2;

      const x = p0.x * f1 + p1.x * f2 + p2.x * f3 + p3.x * f4;
      const y = p0.y * f1 + p1.y * f2 + p2.y * f3 + p3.y * f4;
      result.push({ x, y });
    }
  }

  return result;
}
