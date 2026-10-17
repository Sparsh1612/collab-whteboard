import { describe, it, expect } from 'vitest';
import {
  getElementBounds,
  getCombinedBounds,
  isPointInBounds,
  distance,
  distanceToSegment,
  hitTestElement,
  getSplinePoints,
  CanvasElement,
} from '../index.js';

describe('Geometry & Math Utilities', () => {
  it('calculates bounding box correctly for rectangle', () => {
    const el: CanvasElement = {
      id: 'rect-1',
      type: 'rectangle',
      x: 100,
      y: 50,
      width: 200,
      height: 100,
      rotation: 0,
      strokeColor: '#000',
      fillColor: '#fff',
      strokeWidth: 2,
      strokeStyle: 'solid',
      opacity: 1,
      zIndex: 1,
      createdBy: 'test',
      createdAt: 0,
      updatedAt: 0,
      version: 1,
    };

    const bounds = getElementBounds(el);
    expect(bounds.minX).toBe(100);
    expect(bounds.minY).toBe(50);
    expect(bounds.maxX).toBe(300);
    expect(bounds.maxY).toBe(150);
    expect(bounds.width).toBe(200);
    expect(bounds.height).toBe(100);
  });

  it('calculates combined bounds for multiple elements', () => {
    const el1: CanvasElement = {
      id: '1',
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
      createdBy: 'test',
      createdAt: 0,
      updatedAt: 0,
      version: 1,
    };
    const el2: CanvasElement = {
      id: '2',
      type: 'rectangle',
      x: 200,
      y: 100,
      width: 50,
      height: 80,
      rotation: 0,
      strokeColor: '#000',
      fillColor: 'transparent',
      strokeWidth: 2,
      strokeStyle: 'solid',
      opacity: 1,
      zIndex: 2,
      createdBy: 'test',
      createdAt: 0,
      updatedAt: 0,
      version: 1,
    };

    const combined = getCombinedBounds([el1, el2]);
    expect(combined).not.toBeNull();
    expect(combined?.minX).toBe(10);
    expect(combined?.minY).toBe(20);
    expect(combined?.maxX).toBe(250);
    expect(combined?.maxY).toBe(180);
    expect(combined?.width).toBe(240);
    expect(combined?.height).toBe(160);
  });

  it('tests point in bounds accurately', () => {
    const bounds = { minX: 50, minY: 50, maxX: 150, maxY: 150, width: 100, height: 100 };
    expect(isPointInBounds({ x: 100, y: 100 }, bounds)).toBe(true);
    expect(isPointInBounds({ x: 40, y: 100 }, bounds)).toBe(false);
    expect(isPointInBounds({ x: 45, y: 100 }, bounds, 10)).toBe(true); // with threshold
  });

  it('calculates euclidean distance and distance to line segment', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);

    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 0 };
    // Point directly on segment
    expect(distanceToSegment({ x: 5, y: 0 }, a, b)).toBe(0);
    // Point 5 units above midpoint
    expect(distanceToSegment({ x: 5, y: 5 }, a, b)).toBe(5);
    // Point beyond segment endpoint
    expect(distanceToSegment({ x: 15, y: 0 }, a, b)).toBe(5);
  });

  it('interpolates Catmull-Rom splines for smooth freehand drawing', () => {
    const rawPoints = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 50 },
      { x: 150, y: 120 },
    ];
    const smoothed = getSplinePoints(rawPoints, 0.5, 4);
    expect(smoothed.length).toBeGreaterThan(rawPoints.length);
    expect(smoothed[0].x).toBe(0);
    expect(smoothed[0].y).toBe(0);
  });
});
