import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '../packages/shared/dist/index.js';

const SERVER_URL = 'http://localhost:4000';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runMemoryChurnTest() {
  console.log('===============================================================');
  console.log('  STRICT STEP 12: MEMORY / CLEANUP CHURN TEST');
  console.log('===============================================================');

  const NUM_BOARDS = 5;
  const CLIENTS_PER_BOARD = 6;
  const sockets: Socket[] = [];

  console.log(`[Step 1] Spawning ${NUM_BOARDS * CLIENTS_PER_BOARD} clients across ${NUM_BOARDS} rooms...`);

  for (let b = 0; b < NUM_BOARDS; b++) {
    const boardId = `churn-board-${b}-${Date.now()}`;
    for (let c = 0; c < CLIENTS_PER_BOARD; c++) {
      const s = io(SERVER_URL, { transports: ['websocket'] });
      sockets.push(s);

      s.on('connect', () => {
        s.emit(SOCKET_EVENTS.JOIN_ROOM, {
          boardId,
          userId: `churn-user-${b}-${c}`,
          userName: `User ${b}-${c}`,
        });
      });
    }
  }

  // Wait for all to connect and join
  await sleep(1000);

  // Check health endpoint
  const resMid = await fetch(`${SERVER_URL}/api/health`).then((r) => r.json());
  console.log('[Step 2] Mid-test server health:', resMid.realtime);

  if (resMid.realtime.connectedClients !== NUM_BOARDS * CLIENTS_PER_BOARD) {
    console.warn(`Expected ${NUM_BOARDS * CLIENTS_PER_BOARD} clients, found:`, resMid.realtime.connectedClients);
  }

  // Rapidly disconnect all sockets
  console.log('[Step 3] Rapidly disconnecting all sockets...');
  for (const s of sockets) {
    s.disconnect();
  }

  // Wait for disconnect events to settle
  await sleep(1000);

  const resEnd = await fetch(`${SERVER_URL}/api/health`).then((r) => r.json());
  console.log('[Step 4] Post-disconnect server health:', resEnd.realtime);

  if (resEnd.realtime.connectedClients !== 0) {
    throw new Error(`Memory leak: connectedClients should be 0, found ${resEnd.realtime.connectedClients}`);
  }

  console.log('===============================================================');
  console.log('  STEP 12 PASSED: ZERO LINGERING CLIENTS / CLEANUP VERIFIED');
  console.log('===============================================================');
}

runMemoryChurnTest().catch((err) => {
  console.error('STEP 12 FAILED:', err);
  process.exit(1);
});
