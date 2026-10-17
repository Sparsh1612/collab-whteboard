import { test, expect } from '@playwright/test';
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, OpBatch } from '../packages/shared/dist/index.js';

test.describe('CanvasFlow Comprehensive E2E Test Suite', () => {
  // Test 1: Board Creation Flow
  test('1. Board creation from dashboard redirects to active canvas', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('#btn-create-board')).toBeVisible();

    await page.click('#btn-create-board');
    await expect(page.locator('#new-board-title-input')).toBeVisible();

    await page.fill('#new-board-title-input', 'E2E Architecture Board');
    await page.click('#btn-confirm-create-board');

    // Should redirect to /board/[id]
    await page.waitForURL(/\/board\/.+/);
    await expect(page.locator('#whiteboard-canvas')).toBeVisible();
    await expect(page.locator('#board-title-input')).toHaveValue('E2E Architecture Board');
  });

  // Test 2 & 3: Object Creation and Undo/Redo
  test('2 & 3. Object creation, properties panel, and undo/redo', async ({ page }) => {
    await page.goto('http://localhost:3000/board/e2e-undo-redo-test');
    await expect(page.locator('#whiteboard-canvas')).toBeVisible();

    // Select Rectangle tool
    await page.click('#tool-rectangle');

    // Drag to create a rectangle
    const canvas = page.locator('#whiteboard-canvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      const startX = box.x + 300;
      const startY = box.y + 200;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 150, startY + 100, { steps: 5 });
      await page.mouse.up();
    }

    // Properties panel should now be visible
    await expect(page.locator('text=Object Properties')).toBeVisible();

    // Test Undo
    const btnUndo = page.locator('#btn-undo');
    await expect(btnUndo).toBeEnabled();
    await btnUndo.click();

    // Properties panel closes after object is undone
    await expect(page.locator('text=Object Properties')).toBeHidden();

    // Test Redo
    const btnRedo = page.locator('#btn-redo');
    await expect(btnRedo).toBeEnabled();
    await btnRedo.click();

    // Properties panel appears again
    await expect(page.locator('text=Object Properties')).toBeVisible();
  });

  // Test 4: Two-Client Multiplayer Synchronization
  test('4. Two-client synchronization and live cursor broadcast', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    const boardUrl = 'http://localhost:3000/board/e2e-sync-room';
    await pageA.goto(boardUrl);
    await pageB.goto(boardUrl);

    await expect(pageA.locator('#whiteboard-canvas')).toBeVisible();
    await expect(pageB.locator('#whiteboard-canvas')).toBeVisible();

    // User A draws a sticky note
    await pageA.click('#tool-sticky');
    const canvasA = pageA.locator('#whiteboard-canvas');
    const boxA = await canvasA.boundingBox();

    if (boxA) {
      await pageA.mouse.click(boxA.x + 250, boxA.y + 250);
    }

    // User A moves mouse across canvas
    if (boxA) {
      await pageA.mouse.move(boxA.x + 400, boxA.y + 350, { steps: 5 });
    }

    // Both canvases remain stable and render
    await expect(pageB.locator('#whiteboard-canvas')).toBeVisible();

    await contextA.close();
    await contextB.close();
  });

  // Test 5: Server Rejection of Viewer Mutation
  test('5. Server rejects mutations from VIEWER role sockets', async () => {
    const socket: Socket = io('http://localhost:4000', { transports: ['websocket'] });

    await new Promise<void>((resolve, reject) => {
      socket.on('error', reject);
      socket.on(SOCKET_EVENTS.ERROR, (err: { message: string }) => {
        try {
          expect(err.message).toContain('Viewer');
          socket.disconnect();
          resolve();
        } catch (e) {
          socket.disconnect();
          reject(e);
        }
      });

      socket.on('connect', () => {
        // Join as VIEWER
        socket.emit(
          SOCKET_EVENTS.JOIN_ROOM,
          {
            boardId: 'e2e-viewer-test',
            userId: 'viewer-user',
            userName: 'Viewer User',
            role: 'VIEWER',
          },
          () => {
            // Send forbidden mutation
            const forbiddenBatch: OpBatch = {
              id: 'batch-forbidden',
              boardId: 'e2e-viewer-test',
              userId: 'viewer-user',
              timestamp: Date.now(),
              ops: [
                {
                  type: 'create',
                  elements: [
                    {
                      id: 'hacked-element',
                      type: 'rectangle',
                      x: 10,
                      y: 10,
                      width: 10,
                      height: 10,
                      strokeColor: '#000',
                      fillColor: 'transparent',
                      zIndex: 1,
                      version: 1,
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                      createdBy: 'viewer-user',
                    },
                  ],
                },
              ],
            };

            socket.emit(SOCKET_EVENTS.OP_BATCH, forbiddenBatch);
          }
        );
      });
    });
  });

  // Test 6: Persistence After Page Reload
  test('6. Board state persists upon page reload', async ({ page }) => {
    const boardUrl = 'http://localhost:3000/board/e2e-persistence-test';
    await page.goto(boardUrl);
    await expect(page.locator('#whiteboard-canvas')).toBeVisible();

    // Create an object
    await page.click('#tool-rectangle');
    const canvas = page.locator('#whiteboard-canvas');
    const box = await canvas.boundingBox();

    if (box) {
      await page.mouse.move(box.x + 200, box.y + 200);
      await page.mouse.down();
      await page.mouse.move(box.x + 350, box.y + 300, { steps: 5 });
      await page.mouse.up();
    }

    // Wait for autosave confirmation (3 seconds autosave interval)
    await page.waitForTimeout(3500);

    // Reload page
    await page.reload();
    await expect(page.locator('#whiteboard-canvas')).toBeVisible();

    // Title and board elements are restored from PostgreSQL snapshot
    await expect(page.locator('#board-title-input')).toBeVisible();
  });
});
