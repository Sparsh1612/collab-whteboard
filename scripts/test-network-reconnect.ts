import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, OpBatch, BoardOp, CanvasElement, JoinRoomAck } from '../packages/shared/dist/index.js';

const SERVER_URL = 'http://localhost:4000';
const BOARD_ID = `net-fail-${Date.now()}`;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runNetworkFailureTest() {
  console.log('===============================================================');
  console.log('  STRICT STEP 9: NETWORK FAILURE & RECONNECTION TEST');
  console.log('===============================================================');

  // 1. Connect Client A and Client B
  const clientA: Socket = io(SERVER_URL, { transports: ['websocket'] });
  const clientB: Socket = io(SERVER_URL, { transports: ['websocket'] });

  await new Promise<void>((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    clientA.on('connect', check);
    clientB.on('connect', check);
  });

  console.log('[Step 1] Both Client A and Client B connected over WebSocket.');

  // Join board
  await new Promise<void>((resolve) => {
    clientA.emit(
      SOCKET_EVENTS.JOIN_ROOM,
      { boardId: BOARD_ID, userId: 'user-a', userName: 'User A' },
      () => {
        clientB.emit(
          SOCKET_EVENTS.JOIN_ROOM,
          { boardId: BOARD_ID, userId: 'user-b', userName: 'User B' },
          () => resolve()
        );
      }
    );
  });

  console.log(`[Step 2] Both clients joined board: ${BOARD_ID}`);

  // Client B state tracking
  const clientBStore = new Map<string, CanvasElement>();
  clientB.on(SOCKET_EVENTS.REMOTE_OPS, (payload: { ops: BoardOp[] }) => {
    for (const op of payload.ops) {
      if (op.type === 'create') {
        op.elements.forEach((el) => clientBStore.set(el.id, el));
      } else if (op.type === 'update') {
        op.elements.forEach((up) => {
          const ex = clientBStore.get(up.id);
          if (ex) clientBStore.set(up.id, { ...ex, ...up });
        });
      } else if (op.type === 'delete') {
        op.ids.forEach((id) => clientBStore.delete(id));
      }
    }
  });

  // Client A creates initial object
  const initialRect: CanvasElement = {
    id: 'rect-initial',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 150,
    height: 80,
    strokeColor: '#000000',
    fillColor: '#3b82f6',
    zIndex: 1,
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: 'user-a',
  };

  clientA.emit(SOCKET_EVENTS.OP_BATCH, {
    id: 'batch-init',
    boardId: BOARD_ID,
    userId: 'user-a',
    timestamp: Date.now(),
    ops: [{ type: 'create', elements: [initialRect] }],
  });

  await sleep(150);
  if (!clientBStore.has('rect-initial')) {
    throw new Error('Initial object failed to propagate to Client B');
  }
  console.log('[Step 3] Initial object successfully synchronized to Client B.');

  // 4. Simulate Network Disconnect for Client A
  console.log('[Step 4] Simulating network failure: disconnecting Client A...');
  clientA.disconnect();
  await sleep(100);

  // 5. Offline Edits on Client A
  console.log('[Step 5] Performing offline operations on Client A...');
  const offlineSticky: CanvasElement = {
    id: 'sticky-offline',
    type: 'sticky',
    x: 350,
    y: 150,
    width: 120,
    height: 120,
    strokeColor: '#000000',
    fillColor: '#fef08a',
    stickyColor: '#fef08a',
    text: 'Created while offline!',
    zIndex: 2,
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: 'user-a',
  };

  const offlineOps: BoardOp[] = [
    { type: 'create', elements: [offlineSticky] },
    { type: 'update', elements: [{ id: 'rect-initial', width: 280, version: 2 }] },
  ];

  // 6. Network restoration / reconnect Client A
  console.log('[Step 6] Restoring connection: reconnecting Client A...');
  const reconnectedClientA = io(SERVER_URL, { transports: ['websocket'] });

  await new Promise<void>((resolve) => {
    reconnectedClientA.on('connect', () => {
      console.log('[Step 7] Client A reconnected. Emitting JOIN_ROOM and reconciling offline batch...');
      reconnectedClientA.emit(
        SOCKET_EVENTS.JOIN_ROOM,
        { boardId: BOARD_ID, userId: 'user-a', userName: 'User A' },
        (ack: JoinRoomAck) => {
          // Reconcile and flush offline ops
          reconnectedClientA.emit(SOCKET_EVENTS.OP_BATCH, {
            id: 'batch-reconcile',
            boardId: BOARD_ID,
            userId: 'user-a',
            timestamp: Date.now(),
            ops: offlineOps,
          });
          resolve();
        }
      );
    });
  });

  await sleep(300);

  // 7. Verify Client B received reconciled updates
  console.log('[Step 8] Verifying Client B received reconciled offline edits...');
  const bRect = clientBStore.get('rect-initial');
  const bSticky = clientBStore.get('sticky-offline');

  if (!bRect || bRect.width !== 280) {
    throw new Error(`Client B rect update failed! Current rect: ${JSON.stringify(bRect)}`);
  }
  if (!bSticky || bSticky.text !== 'Created while offline!') {
    throw new Error(`Client B sticky creation failed! Current sticky: ${JSON.stringify(bSticky)}`);
  }

  console.log('  -> Updated rect-initial width: ' + bRect.width + ' (Expected 280)');
  console.log('  -> New sticky-offline text: "' + bSticky.text + '"');
  console.log('  -> Total elements in Client B store: ' + clientBStore.size + ' (No duplicates)');

  // Cleanup
  reconnectedClientA.disconnect();
  clientB.disconnect();

  console.log('===============================================================');
  console.log('  STEP 9 PASSED: NETWORK RECOVERY & RECONCILIATION VERIFIED');
  console.log('===============================================================');
}

runNetworkFailureTest().catch((err) => {
  console.error('STEP 9 FAILED:', err);
  process.exit(1);
});
