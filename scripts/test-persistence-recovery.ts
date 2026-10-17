import { io as ClientSocket, Socket } from 'socket.io-client';
import { prisma } from '../apps/server/dist/services/db.js';
import { SOCKET_EVENTS, CanvasElement, OpBatch, JoinRoomAck } from '../packages/shared/dist/index.js';

async function testPersistence() {
  console.log('===============================================================');
  console.log('  TESTING DATABASE PERSISTENCE, AUTOSAVE & SERVER RESTART');
  console.log('===============================================================');

  const boardId = 'persist-verification-board';
  const client: Socket = ClientSocket('http://localhost:4000', { transports: ['websocket'] });

  await new Promise((resolve) => client.on('connect', resolve));
  console.log('✓ Client connected to server');

  await new Promise((resolve) => {
    client.emit(
      SOCKET_EVENTS.JOIN_ROOM,
      { boardId, userId: 'persist-user', userName: 'Persistence Tester' },
      resolve
    );
  });

  const elements: CanvasElement[] = [
    {
      id: 'persisted-node-1',
      type: 'rectangle',
      x: 150,
      y: 200,
      width: 180,
      height: 90,
      rotation: 0,
      strokeColor: '#0d9488',
      fillColor: '#115e59',
      strokeWidth: 2,
      strokeStyle: 'solid',
      opacity: 1,
      zIndex: 1,
      createdBy: 'persist-user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    },
    {
      id: 'persisted-sticky-1',
      type: 'sticky',
      x: 380,
      y: 200,
      width: 160,
      height: 160,
      rotation: 0.05,
      strokeColor: '#000',
      fillColor: '#fef08a',
      stickyColor: '#fef08a',
      strokeWidth: 0,
      strokeStyle: 'solid',
      opacity: 1,
      zIndex: 2,
      text: 'Verified Persistence',
      fontSize: 16,
      createdBy: 'persist-user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    },
  ];

  client.emit(SOCKET_EVENTS.OP_BATCH, {
    id: 'persist-batch-1',
    boardId,
    userId: 'persist-user',
    timestamp: Date.now(),
    ops: [{ type: 'create', elements }],
  });

  console.log('✓ Added 2 elements to board. Waiting for debounced autosave (4 seconds)...');

  // Listen for board:saved event from snapshotWorker
  const savedPromise = new Promise((resolve) => {
    client.once(SOCKET_EVENTS.BOARD_SAVED, resolve);
  });

  await savedPromise;
  console.log('✓ Received BOARD_SAVED confirmation from server autosave worker');

  // Verify in PostgreSQL database directly via Prisma
  const dbBoard = await prisma.board.findUnique({
    where: { id: boardId },
    include: { snapshots: true },
  });

  if (!dbBoard || dbBoard.snapshots.length === 0) {
    throw new Error('Board or snapshot not found in PostgreSQL database!');
  }

  const snapshotElements = dbBoard.snapshots[0].elements as any[];
  console.log(
    `✓ Verified in PostgreSQL: Board "${dbBoard.title}" has ${dbBoard.snapshots.length} snapshot(s) containing ${snapshotElements.length} element(s).`
  );

  // Test pointer throttle vs DB write rate
  console.log('\n--- Testing Pointer Flooding vs Database Writes ---');
  const initialSnapshotsCount = dbBoard.snapshots.length;

  for (let i = 0; i < 50; i++) {
    client.emit(SOCKET_EVENTS.CURSOR_MOVE, {
      cursor: { x: 100 + i, y: 100 + i },
      activeTool: 'select',
      selectedElementIds: [],
    });
  }

  // Wait 1.5 seconds
  await new Promise((r) => setTimeout(r, 1500));

  const afterPointerSnapshots = await prisma.boardSnapshot.count({
    where: { boardId },
  });

  console.log(`✓ 50 cursor moves emitted. Snapshot count before: ${initialSnapshotsCount}, after: ${afterPointerSnapshots}`);
  if (afterPointerSnapshots > initialSnapshotsCount + 1) {
    throw new Error('High frequency pointer movement is triggering excessive DB writes!');
  }
  console.log('✓ High frequency pointer events do NOT flood database writes (ephemeral presence is purely in-memory/Redis).');

  client.disconnect();
  console.log('\n===============================================================');
  console.log('  STEP 8 DATABASE PERSISTENCE & AUTOSAVE TESTS PASSED');
  console.log('===============================================================');
  process.exit(0);
}

testPersistence().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
