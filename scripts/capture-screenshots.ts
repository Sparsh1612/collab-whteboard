import { chromium } from '@playwright/test';
import * as path from 'path';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const outDir = 'C:\\Users\\spars\\.gemini\\antigravity-ide\\brain\\076e64f0-c7d2-4297-965a-0d9963df88a5';

  // 1. Landing Page
  console.log('Capturing Landing Page...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'landing_page_1920.png'), fullPage: false });

  // 2. Dashboard
  console.log('Capturing Dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, 'dashboard_page_1920.png'), fullPage: false });

  // 3. Whiteboard Editor
  console.log('Capturing Whiteboard Editor...');
  await page.goto('http://localhost:3000/board/demo', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'editor_page_1920.png'), fullPage: false });

  // 4. Share Modal
  console.log('Capturing Share Modal...');
  await page.click('#btn-share');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'share_modal_1920.png'), fullPage: false });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 5. Shortcuts Modal
  console.log('Capturing Shortcuts Modal...');
  await page.click('#btn-shortcuts');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'shortcuts_modal_1920.png'), fullPage: false });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 6. Export Modal
  console.log('Capturing Export Modal...');
  await page.click('#btn-export');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'export_modal_1920.png'), fullPage: false });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  await browser.close();
  console.log('Screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
