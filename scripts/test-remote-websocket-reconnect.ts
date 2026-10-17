import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, CanvasElement, JoinRoomAck } from '../packages/shared/dist/index.js';

const SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:4000';
const BOARD_ID = `remote-recon-${Date.now()}`;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function testRemoteWebSocketReconnection() {
  console.log('===============================================================');
  console.log('  TESTING PRODUCTION WEBSOCKET RECONNECTION & CORS ORIGIN');
  console.log('===============================================================');
  console.log(`Connecting to server: ${SERVER_URL}`);

  // Test 1: Connect with custom origin header simulating Vercel preview deployment
  const customOrigin = 'https://canvasflow-preview-pr-42.vercel.app';
  console.log(`[Test 1] Testing cross-origin connection with Origin: ${customOrigin}`);

  const client: Socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 200,
    reconnectionDelayMax: 1000,
    extraHeaders: {
      Origin: customOrigin,
    },
  });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Connection timed out')), 5000);
    client.on('connect', () => {
      clearTimeout(timer);
      console.log(`✓ Successfully connected with socket ID: ${client.id}`);
      resolve();
    });
    client.on('connect_error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });

  // Test 2: Join room and sync initial state
  console.log(`[Test 2] Joining board room: ${BOARD_ID}`);
  await new Promise<void>((resolve, reject) => {
    client.emit(
      SOCKET_EVENTS.JOIN_ROOM,
      { boardId: BOARD_ID, userId: 'remote-test-user', userName: 'Remote Tester' },
      (ack: JoinRoomAck) => {
        if (ack && ack.success) {
          console.log(`✓ Joined room successfully. Version: ${ack.version}, Elements: ${ack.elements.length}`);
          resolve();
        } else {
          reject(new Error('Failed to join room'));
        }
      }
    );
  });

  // Test 3: Create an initial element
  console.log('[Test 3] Creating element before disconnect...');
  const testElement: CanvasElement = {
    id: 'el-remote-1',
    type: 'sticky',
    x: 200,
    y: 200,
    width: 140,
    height: 140,
    strokeColor: '#000000',
    fillColor: '#fef08a',
    stickyColor: '#fef08a',
    text: 'Pre-reconnect sticky',
    zIndex: 1,
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: 'remote-test-user',
  };

  client.emit(SOCKET_EVENTS.OP_BATCH, {
    id: 'batch-pre-drop',
    boardId: BOARD_ID,
    userId: 'remote-test-user',
    timestamp: Date.now(),
    ops: [{ type: 'create', elements: [testElement] }],
  });

  await sleep(200);

  // Test 4: Simulate network disconnect / server drop
  console.log('[Test 4] Simulating network drop / server restart...');
  let reconnectAttemptFired = false;
  let reconnectedFired = false;

  client.io.on('reconnect_attempt', () => {
    reconnectAttemptFired = true;
    console.log('-> Event: reconnect_attempt captured');
  });

  client.io.on('reconnect', () => {
    reconnectedFired = true;
    console.log('-> Event: reconnect captured');
  });

  // Force disconnect underlying engine transport to trigger manager reconnection loop
  (client as any).io.engine.close();

  // Wait for automatic manager reconnection
  console.log('[Test 5] Awaiting automatic reconnection...');
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Reconnection failed or timed out')), 8000);
    client.on('connect', () => {
      clearTimeout(timer);
      console.log(`✓ Client automatically reconnected! New socket ID: ${client.id}`);
      resolve();
    });
  });

  // Test 6: Verify room re-join and state retention after reconnect
  console.log('[Test 6] Re-joining room after reconnection and verifying state...');
  await new Promise<void>((resolve, reject) => {
    client.emit(
      SOCKET_EVENTS.JOIN_ROOM,
      { boardId: BOARD_ID, userId: 'remote-test-user', userName: 'Remote Tester' },
      (ack: JoinRoomAck) => {
        if (ack && ack.success) {
          const found = ack.elements.find((el) => el.id === 'el-remote-1');
          if (found) {
            console.log(`✓ Board state verified post-reconnect! Element "el-remote-1" preserved.`);
            resolve();
          } else {
            reject(new Error('Element lost during reconnection!'));
          }
        } else {
          reject(new Error('Failed to rejoin room after reconnect'));
        }
      }
    );
  });

  client.disconnect();
  console.log('===============================================================');
  console.log('  ALL WEBSOCKET RECONNECTION TESTS PASSED SUCCESSFULLY');
  console.log('===============================================================');
}

testRemoteWebSocketReconnection().catch((err) => {
  console.error('Remote WebSocket Reconnect Test Failed:', err);
  process.exit(1);
});
