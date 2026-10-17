import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/db.js';
import { roomManager } from '../realtime/RoomManager.js';
import { AuthRequest } from '../middleware/auth.js';
import { BoardRole } from '@whiteboard/shared';

const createBoardSchema = z.object({
  title: z.string().min(1).max(120),
  isPublic: z.boolean().optional(),
  publicRole: z.enum(['EDITOR', 'VIEWER']).optional(),
});

export async function createBoard(req: AuthRequest, res: Response): Promise<void> {
  const result = createBoardSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0]?.message || 'Invalid board data' });
    return;
  }

  const userId = req.user?.id || 'usr-anonymous';
  const { title, isPublic = true, publicRole = 'EDITOR' } = result.data;

  try {
    const board = await prisma.board.create({
      data: {
        title,
        ownerId: userId,
        isPublic,
        publicRole,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
    });

    res.status(201).json({ board });
  } catch (err) {
    // If DB unavailable in demo mode, create local room directly
    const board = {
      id: 'board-' + Math.random().toString(36).substring(2, 9),
      title,
      ownerId: userId,
      isPublic,
      publicRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    roomManager.getOrCreateRoom(board.id);
    res.status(201).json({ board });
  }
}

export async function getBoards(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.json({ boards: [] });
    return;
  }

  try {
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
          { isPublic: true },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { members: true } },
      },
    });

    res.json({ boards });
  } catch (err) {
    res.json({ boards: [] });
  }
}

export async function getBoardById(req: AuthRequest, res: Response): Promise<void> {
  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  const userId = req.user?.id;

  try {
    const board: any = await prisma.board.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, color: true } } } },
        snapshots: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    let role: BoardRole = 'VIEWER';
    if (!board) {
      // In-memory / demo board handling
      const room = roomManager.getOrCreateRoom(id);
      res.json({
        board: {
          id,
          title: id === 'demo' ? 'Distributed Systems Architecture' : 'Untitled Board',
          ownerId: 'system',
          isPublic: true,
          publicRole: 'EDITOR',
          version: room.version,
        },
        role: 'EDITOR',
        elements: Array.from(room.elements.values()),
      });
      return;
    }

    if (board.ownerId === userId) {
      role = 'OWNER';
    } else {
      const membership = board.members?.find((m: any) => m.userId === userId);
      if (membership) {
        role = membership.role as BoardRole;
      } else if (board.isPublic) {
        role = board.publicRole as BoardRole;
      } else {
        res.status(403).json({ error: 'Access denied: private board' });
        return;
      }
    }

    // Check active in-memory room first for freshest realtime state
    const room = roomManager.getRoom(id);
    const elements = room
      ? Array.from(room.elements.values())
      : (board.snapshots?.[0]?.elements as any[]) || [];

    res.json({
      board,
      role,
      elements,
    });
  } catch (err) {
    // Graceful fallback for demo or tests
    const room = roomManager.getOrCreateRoom(id);
    res.json({
      board: { id, title: 'Whiteboard', version: room.version },
      role: 'EDITOR',
      elements: Array.from(room.elements.values()),
    });
  }
}

export async function deleteBoard(req: AuthRequest, res: Response): Promise<void> {
  const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
  const userId = req.user?.id;

  try {
    const board = await prisma.board.findUnique({ where: { id } });
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (board.ownerId !== userId) {
      res.status(403).json({ error: 'Only the board owner can delete this board' });
      return;
    }

    await prisma.board.delete({ where: { id } });
    res.json({ success: true, message: 'Board deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete board' });
  }
}
