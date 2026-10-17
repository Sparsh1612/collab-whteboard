import { io } from 'socket.io-client';
import { SOCKET_EVENTS, CanvasElement, OpBatch, JoinRoomAck } from '../packages/shared/dist/index.js';

async function testSocketAndRealtime() {
  console.log('--- TESTING REALTIME SOCKET.IO CONNECTION ---');
  const socket = io('http://localhost:4000', {
    transports: ['websocket'],
    timeout: 5000,
  });

  await new Promise<void>((resolve, reject) => {
    socket.on('connect', () => {
      console.log('✓ Socket connected successfully. Socket ID:', socket.id);
      resolve();
    });
    socket.on('connect_error', (err) => {
      reject(new Error('Connection failed: ' + err.message));
    });
  });

  console.log('--- TESTING ROOM JOIN ---');
  const ack: JoinRoomAck = await new Promise((resolve) => {
    socket.emit(
      SOCKET_EVENTS.JOIN_ROOM,
      {
        boardId: 'test-qa-board',
        userId: 'qa-user-1',
        userName: 'QA Inspector',
      },
      (res: JoinRoomAck) => {
        resolve(res);
      }
    );
  });

  console.log('✓ Joined room:', ack.boardId, 'with role:', ack.role, 'version:', ack.version);

  console.log('--- TESTING EMITTING OPERATIONS BATCH ---');
  const testElement: CanvasElement = {
    id: 'test-qa-rect',
    type: 'rectangle',
    x: 100,
    y: 150,
    width: 200,
    height: 100,
    rotation: 0,
    strokeColor: '#0d9488',
    fillColor: 'transparent',
    strokeWidth: 2,
    strokeStyle: 'solid',
    opacity: 1,
    zIndex: 1,
    createdBy: 'qa-user-1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  };

  const batch: OpBatch = {
    id: 'qa-batch-1',
    boardId: 'test-qa-board',
    userId: 'qa-user-1',
    timestamp: Date.now(),
    ops: [{ type: 'create', elements: [testElement] }],
  };

  socket.emit(SOCKET_EVENTS.OP_BATCH, batch);

  // Wait a moment for server to process and autosave worker
  await new Promise((r) => setTimeout(r, 600));

  // Request sync to verify object persisted in server memory
  const syncResponse: any = await new Promise((resolve) => {
    socket.on(SOCKET_EVENTS.SYNC_RESPONSE, (data) => resolve(data));
    socket.emit(SOCKET_EVENTS.REQUEST_SYNC, { boardId: 'test-qa-board' });
  });

  const created = syncResponse.elements.find((e: any) => e.id === 'test-qa-rect');
  if (created) {
    console.log('✓ Element verified on server:', created.id, 'version:', created.version);
  } else {
    throw new Error('Element not found in sync response!');
  }

  socket.disconnect();
  console.log('✓ Socket disconnected cleanly.');
  console.log('--- STEP 2 SOCKET VERIFICATION PASSED ---');
}

testSocketAndRealtime().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
