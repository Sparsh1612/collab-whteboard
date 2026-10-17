import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../services/db.js';
import { config } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req: Request, res: Response): Promise<void> {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0]?.message || 'Invalid input' });
    return;
  }

  const { email, password, name } = result.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      },
      select: {
        id: true,
        email: true,
        name: true,
        color: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid email or password format' });
    return;
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        color: user.color,
      },
      token,
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, color: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
}
