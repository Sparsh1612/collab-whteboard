'use client';

import React, { useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { CanvasElement, BoardRole } from '@whiteboard/shared';
import { WhiteboardCanvas } from '../../../components/canvas/WhiteboardCanvas';
import { useBoardStore } from '../../../stores/useBoardStore';
import { useCollabStore } from '../../../stores/useCollabStore';

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

export default function BoardPage({ params }: BoardPageProps) {
  const resolvedParams = use(params);
  const boardId = resolvedParams.id;
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const role: BoardRole =
    roleParam === 'viewer' ? 'VIEWER' : roleParam === 'owner' ? 'OWNER' : 'EDITOR';

  const setBoard = useBoardStore((s) => s.setBoard);
  const elements = useBoardStore((s) => s.elements);
  const setStatus = useCollabStore((s) => s.setStatus);
  const setCollaborator = useCollabStore((s) => s.setCollaborator);

  useEffect(() => {
    // If the board has not been initialized or is empty, provide seed elements
    const initialElements: CanvasElement[] = [];

    if (boardId === 'demo' || elements.size === 0) {
      // Create impressive architectural seed schematic
      // 1. Frame
      initialElements.push({
        id: 'frame-arch',
        type: 'frame',
        x: -250,
        y: -180,
        width: 820,
        height: 480,
        rotation: 0,
        strokeColor: '#334155',
        fillColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'dashed',
        opacity: 0.8,
        zIndex: 1,
        label: 'High-Throughput Realtime Infrastructure',
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });

      // 2. Gateway Node
      initialElements.push({
        id: 'node-gateway',
        type: 'rectangle',
        x: -200,
        y: -60,
        width: 170,
        height: 90,
        rotation: 0,
        strokeColor: '#0d9488',
        fillColor: '#134e4a',
        strokeWidth: 2,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 10,
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });
      initialElements.push({
        id: 'text-gateway',
        type: 'text',
        x: -180,
        y: -40,
        width: 130,
        height: 40,
        rotation: 0,
        strokeColor: '#f0fdfa',
        fillColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 15,
        text: 'API Gateway\n(TLS & Rate Limit)',
        fontSize: 14,
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });

      // 3. Arrow from Gateway to Socket Server
      initialElements.push({
        id: 'arrow-gw-socket',
        type: 'arrow',
        x: -30,
        y: -15,
        width: 110,
        height: 0,
        rotation: 0,
        strokeColor: '#2dd4bf',
        fillColor: 'transparent',
        strokeWidth: 2.5,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 20,
        arrowEnd: 'arrow',
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });

      // 4. Socket Server Node
      initialElements.push({
        id: 'node-socket',
        type: 'rectangle',
        x: 80,
        y: -60,
        width: 180,
        height: 90,
        rotation: 0,
        strokeColor: '#6366f1',
        fillColor: '#312e81',
        strokeWidth: 2,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 10,
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });
      initialElements.push({
        id: 'text-socket',
        type: 'text',
        x: 100,
        y: -40,
        width: 140,
        height: 40,
        rotation: 0,
        strokeColor: '#e0e7ff',
        fillColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 15,
        text: 'Socket.IO Server\n(Batching & Rooms)',
        fontSize: 14,
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });

      // 5. Arrow from Socket Server to Redis
      initialElements.push({
        id: 'arrow-socket-redis',
        type: 'arrow',
        x: 260,
        y: -15,
        width: 100,
        height: 0,
        rotation: 0,
        strokeColor: '#f43f5e',
        fillColor: 'transparent',
        strokeWidth: 2.5,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 20,
        arrowEnd: 'arrow',
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });

      // 6. Redis Cluster Node (Ellipse)
      initialElements.push({
        id: 'node-redis',
        type: 'ellipse',
        x: 360,
        y: -65,
        width: 150,
        height: 100,
        rotation: 0,
        strokeColor: '#f43f5e',
        fillColor: '#881337',
        strokeWidth: 2,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 10,
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });
      initialElements.push({
        id: 'text-redis',
        type: 'text',
        x: 395,
        y: -30,
        width: 90,
        height: 30,
        rotation: 0,
        strokeColor: '#ffe4e6',
        fillColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 15,
        text: 'Redis Cluster\n(Pub / Sub)',
        fontSize: 13,
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });

      // 7. Sticky Notes
      initialElements.push({
        id: 'sticky-perf',
        type: 'sticky',
        x: -200,
        y: 110,
        width: 200,
        height: 150,
        rotation: -0.04,
        strokeColor: '#000000',
        fillColor: '#fef08a',
        stickyColor: '#fef08a',
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 25,
        text: 'Benchmark Target:\n• 60 FPS Canvas RAF\n• < 15ms WS roundtrip\n• Spatial grid culling with 5K+ elements',
        fontSize: 13,
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });

      initialElements.push({
        id: 'sticky-security',
        type: 'sticky',
        x: 120,
        y: 110,
        width: 210,
        height: 150,
        rotation: 0.03,
        strokeColor: '#000000',
        fillColor: '#bae6fd',
        stickyColor: '#bae6fd',
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 25,
        text: 'Security Rules:\n• Server-side token auth\n• Granular OWNER/EDITOR\n• Viewers cannot emit ops\n• Rate-limited pointer events',
        fontSize: 13,
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });
    }

    setBoard(
      boardId,
      boardId === 'demo' ? 'Distributed Systems Architecture' : `Board: ${boardId}`,
      role,
      initialElements
    );

    // Set connection status
    setStatus('connected');

    // Add simulated remote collaborator for interactive realism
    setCollaborator({
      userId: 'collab-ai-1',
      socketId: 'sock-ai-1',
      userName: 'Elena (Staff Eng)',
      userColor: '#ec4899',
      cursor: { x: 200, y: -20, timestamp: Date.now() },
      activeTool: 'pencil',
      selectedElementIds: ['node-socket'],
      lastActiveAt: Date.now(),
    });
  }, [boardId, role, setBoard, setStatus, setCollaborator, elements.size]);

  return <WhiteboardCanvas boardId={boardId} />;
}
