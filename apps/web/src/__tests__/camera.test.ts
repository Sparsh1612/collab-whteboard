import { describe, it, expect } from 'vitest';
import { Camera } from '../engine/Camera';

describe('Camera Viewport & Zoom Invariant Tests', () => {
  it('converts world to screen and back with exact precision across zoom levels', () => {
    const camera = new Camera({ width: 1920, height: 1080 });
    const zoomLevels = [0.25, 0.5, 1.0, 2.0, 4.0];
    const testPoints = [
      { x: 0, y: 0 },
      { x: 500, y: -300 },
      { x: -1250, y: 840 },
    ];

    for (const zoom of zoomLevels) {
      camera.setZoom(zoom);
      for (const pt of testPoints) {
        const screen = camera.worldToScreen(pt);
        const backToWorld = camera.screenToWorld(screen);
        expect(Math.abs(backToWorld.x - pt.x)).toBeLessThan(0.0001);
        expect(Math.abs(backToWorld.y - pt.y)).toBeLessThan(0.0001);
      }
    }
  });

  it('preserves the world point directly under cursor during zoomAt', () => {
    const camera = new Camera({ width: 1920, height: 1080 });
    const cursorScreen = { x: 800, y: 400 };

    const worldPointBefore = camera.screenToWorld(cursorScreen);
    // Zoom in 2x
    camera.zoomAt(cursorScreen, 2.0);
    const worldPointAfter = camera.screenToWorld(cursorScreen);

    expect(Math.abs(worldPointAfter.x - worldPointBefore.x)).toBeLessThan(0.0001);
    expect(Math.abs(worldPointAfter.y - worldPointBefore.y)).toBeLessThan(0.0001);

    // Zoom out 0.5x
    camera.zoomAt(cursorScreen, 0.5);
    const worldPointAfterZoomOut = camera.screenToWorld(cursorScreen);
    expect(Math.abs(worldPointAfterZoomOut.x - worldPointBefore.x)).toBeLessThan(0.0001);
    expect(Math.abs(worldPointAfterZoomOut.y - worldPointBefore.y)).toBeLessThan(0.0001);
  });

  it('calculates visible bounding box correctly for viewport culling', () => {
    const camera = new Camera({ width: 1000, height: 800 });
    camera.setPan(0, 0);
    camera.setZoom(1.0);

    const bounds = camera.getVisibleBounds();
    expect(bounds.minX).toBe(-500);
    expect(bounds.maxX).toBe(500);
    expect(bounds.minY).toBe(-400);
    expect(bounds.maxY).toBe(400);
    expect(bounds.width).toBe(1000);
    expect(bounds.height).toBe(800);
  });
});
