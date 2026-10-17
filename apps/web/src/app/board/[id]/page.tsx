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
  const titleParam = searchParams.get('title');
  const role: BoardRole =
    roleParam === 'viewer' ? 'VIEWER' : roleParam === 'owner' ? 'OWNER' : 'EDITOR';

  const setBoard = useBoardStore((s) => s.setBoard);
  const setStatus = useCollabStore((s) => s.setStatus);
  const setCollaborator = useCollabStore((s) => s.setCollaborator);
  const initializedBoardRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (initializedBoardRef.current === boardId) return;
    initializedBoardRef.current = boardId;

    // If the board is the demo showcase, provide impressive architectural schematic
    const initialElements: CanvasElement[] = [];

    if (boardId === 'demo') {
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
        strokeWidth: 1.5,
        strokeStyle: 'dashed',
        opacity: 0.8,
        zIndex: 1,
        label: 'Application Topology',
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
        strokeColor: '#3b82f6',
        fillColor: '#1e293b',
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
        strokeColor: '#f8fafc',
        fillColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 15,
        text: 'Client App\n(Web & Mobile)',
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
        strokeColor: '#3b82f6',
        fillColor: 'transparent',
        strokeWidth: 2,
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
        fillColor: '#1e1b4b',
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
        strokeColor: '#f8fafc',
        fillColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 15,
        text: 'Sync Engine\n(Presence & Ops)',
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
        strokeColor: '#6366f1',
        fillColor: 'transparent',
        strokeWidth: 2,
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
        strokeColor: '#0ea5e9',
        fillColor: '#0c4a6e',
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
        strokeColor: '#f8fafc',
        fillColor: 'transparent',
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 15,
        text: 'State Store\n(Log & State)',
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
        rotation: -0.03,
        strokeColor: '#000000',
        fillColor: '#fef08a',
        stickyColor: '#fef08a',
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 25,
        text: 'Sprint Priorities:\n• Smooth 60 FPS interactions\n• Real-time multiplayer feedback\n• High object density support',
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
        rotation: 0.02,
        strokeColor: '#000000',
        fillColor: '#bae6fd',
        stickyColor: '#bae6fd',
        strokeWidth: 0,
        strokeStyle: 'solid',
        opacity: 1,
        zIndex: 25,
        text: 'Board Guidelines:\n• Workspace role management\n• Viewer read-only guardrails\n• Real-time edit synchronization',
        fontSize: 13,
        createdBy: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      });
    }

    const boardTitle =
      titleParam || (boardId === 'demo' ? 'Infrastructure Architecture' : `Board: ${boardId}`);

    setBoard(boardId, boardTitle, role, initialElements);

    // Set connection status
    setStatus('connected');

    if (boardId === 'demo') {
      // Add simulated remote collaborator for interactive realism on demo showcase
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
    }
  }, [boardId, role, titleParam, setBoard, setStatus, setCollaborator]);

  return <WhiteboardCanvas boardId={boardId} />;
}
