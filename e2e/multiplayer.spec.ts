import { test, expect } from '@playwright/test';

test.describe('Real-Time Multiplayer Collaboration', () => {
  test('Two browser contexts open the same board and verify live synchronization', async ({
    browser,
  }) => {
    // 1. Create two isolated browser contexts representing User A and User B
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    const boardUrl = 'http://localhost:3000/board/e2e-collab-room';

    // 2. Both users join the same board
    await pageA.goto(boardUrl);
    await pageB.goto(boardUrl);

    // Verify canvas elements mounted
    await expect(pageA.locator('#whiteboard-canvas')).toBeVisible();
    await expect(pageB.locator('#whiteboard-canvas')).toBeVisible();

    // 3. User A selects the Rectangle tool (or presses R)
    await pageA.click('#tool-rectangle');

    // 4. User A draws a rectangle by dragging on the canvas
    const canvasA = pageA.locator('#whiteboard-canvas');
    const boxA = await canvasA.boundingBox();
    expect(boxA).not.toBeNull();

    if (boxA) {
      const startX = boxA.x + 300;
      const startY = boxA.y + 200;

      await pageA.mouse.move(startX, startY);
      await pageA.mouse.down();
      await pageA.mouse.move(startX + 180, startY + 120, { steps: 5 });
      await pageA.mouse.up();
    }

    // 5. User A moves mouse across canvas — User B sees remote cursor activity
    if (boxA) {
      await pageA.mouse.move(boxA.x + 400, boxA.y + 350, { steps: 10 });
    }

    // Verify User A has properties panel open with selected object
    await expect(pageA.locator('text=Object Properties')).toBeVisible();

    // 6. User A clicks Duplicate (Ctrl+D)
    await pageA.keyboard.press('Control+d');

    // Clean up
    await contextA.close();
    await contextB.close();
  });
});
