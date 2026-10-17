import { chromium } from '@playwright/test';

async function diagnose() {
  console.log('Diagnosing client error on /board/demo...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
  });

  page.on('pageerror', (err) => {
    console.error('[BROWSER EXCEPTION]:', err.message);
    console.error(err.stack);
  });

  try {
    const res = await page.goto('http://localhost:3000/board/e2e-undo-redo-test', { waitUntil: 'networkidle' });
    console.log('Navigation response status:', res?.status());
    await page.waitForTimeout(2000);
  } catch (e) {
    console.error('Goto error:', e);
  }

  await browser.close();
}

diagnose().catch(console.error);
