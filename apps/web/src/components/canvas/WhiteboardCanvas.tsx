'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CanvasElement, getCombinedBounds } from '@whiteboard/shared';
import { CanvasEngine } from '../../engine/CanvasEngine';
import { MainToolbar } from '../toolbar/MainToolbar';
import { PropertiesPanel } from '../properties/PropertiesPanel';
import { CollaboratorBar } from '../presence/CollaboratorBar';
import { ZoomControls } from './ZoomControls';
import { InlineTextEditor } from './InlineTextEditor';
import { ShortcutsModal } from '../modals/ShortcutsModal';
import { ShareModal } from '../modals/ShareModal';
import { ExportModal } from '../modals/ExportModal';
import { PerformanceHUD } from '../ui/PerformanceHUD';
import { useBoardStore } from '../../stores/useBoardStore';
import { useUIStore } from '../../stores/useUIStore';
import { useCollab } from '../../hooks/useCollab';

interface WhiteboardCanvasProps {
  boardId: string;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({ boardId }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CanvasEngine | null>(null);

  const { emitCursorMove, emitOps } = useCollab(boardId);

  const [editingElement, setEditingElement] = useState<CanvasElement | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const clipboardRef = useRef<CanvasElement[]>([]);

  const elements = useBoardStore((s) => s.elements);
  const addElement = useBoardStore((s) => s.addElement);
  const updateElement = useBoardStore((s) => s.updateElement);
  const deleteElements = useBoardStore((s) => s.deleteElements);
  const clearSelection = useUIStore((s) => s.clearSelection);
  const setSelectedIds = useUIStore((s) => s.setSelectedIds);
  const selectedIds = useUIStore((s) => s.selectedIds);
  const setActiveTool = useUIStore((s) => s.setActiveTool);
  const setIsSpacePressed = useUIStore((s) => s.setIsSpacePressed);

  // Initialize CanvasEngine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new CanvasEngine(canvasRef.current);
    engineRef.current = engine;
    engine.start();

    // Wire live cursor throttled emission to WebSocket
    engine.inputManager.setCursorThrottleCallback((pos) => {
      emitCursorMove(pos, useUIStore.getState().activeTool, useUIStore.getState().selectedIds);
    });

    // Subscribe to history changes for undo/redo button states
    const unsubscribeHistory = engine.history.subscribe(() => {
      setCanUndo(engine.history.canUndo());
      setCanRedo(engine.history.canRedo());
    });

    return () => {
      unsubscribeHistory();
      engine.destroy();
    };
  }, [emitCursorMove]);

  // Sync board elements to spatial index when elements change externally
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.spatialIndex.rebuild(Array.from(elements.values()));
    }
  }, [elements]);

  // Fit content to screen
  const handleFitContent = useCallback(() => {
    if (!engineRef.current) return;
    const all = Array.from(elements.values());
    const bounds = getCombinedBounds(all);
    if (bounds) {
      engineRef.current.camera.fitBounds(bounds);
    } else {
      engineRef.current.camera.reset();
    }
  }, [elements]);

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    engineRef.current?.history.undo();
  }, []);

  const handleRedo = useCallback(() => {
    engineRef.current?.history.redo();
  }, []);

  // Double click for text editing
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const screenPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldPt = engineRef.current.camera.screenToWorld(screenPt);

    const hit = engineRef.current.spatialIndex.hitTestPoint(worldPt, 12);
    if (hit && (hit.type === 'text' || hit.type === 'sticky')) {
      setEditingElement(hit);
    }
  };

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts when typing in inputs/textareas
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Space bar for pan
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          const toDelete = [...selectedIds];
          deleteElements(toDelete);
          clearSelection();
          if (engineRef.current) {
            toDelete.forEach((id) => engineRef.current!.spatialIndex.remove(id));
          }
        }
        return;
      }

      // Select All (Ctrl+A)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedIds(Array.from(elements.keys()));
        return;
      }

      // Copy (Ctrl+C)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        const selected = selectedIds.map((id) => elements.get(id)).filter(Boolean) as CanvasElement[];
        clipboardRef.current = selected.map((el) => ({ ...el }));
        return;
      }

      // Paste (Ctrl+V)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
        if (clipboardRef.current.length > 0) {
          e.preventDefault();
          const newIds: string[] = [];
          clipboardRef.current.forEach((el) => {
            const pasted: CanvasElement = {
              ...el,
              id: 'el-' + Math.random().toString(36).substring(2, 9),
              x: el.x + 30,
              y: el.y + 30,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            addElement(pasted);
            engineRef.current?.spatialIndex.insert(pasted);
            newIds.push(pasted.id);
          });
          setSelectedIds(newIds);
        }
        return;
      }

      // Duplicate (Ctrl+D)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        const newIds: string[] = [];
        selectedIds.forEach((id) => {
          const el = elements.get(id);
          if (el) {
            const dup: CanvasElement = {
              ...el,
              id: 'el-' + Math.random().toString(36).substring(2, 9),
              x: el.x + 24,
              y: el.y + 24,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            addElement(dup);
            engineRef.current?.spatialIndex.insert(dup);
            newIds.push(dup.id);
          }
        });
        setSelectedIds(newIds);
        return;
      }

      // Fit content shortcut (Shift+1)
      if (e.shiftKey && e.key === '!') {
        e.preventDefault();
        handleFitContent();
        return;
      }

      // Tool activation shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'h':
          setActiveTool('hand');
          break;
        case 'p':
          setActiveTool('pencil');
          break;
        case 'r':
          setActiveTool('rectangle');
          break;
        case 'o':
          setActiveTool('ellipse');
          break;
        case 'l':
          setActiveTool('line');
          break;
        case 'a':
          setActiveTool('arrow');
          break;
        case 't':
          setActiveTool('text');
          break;
        case 's':
          setActiveTool('sticky');
          break;
        case 'f':
          setActiveTool('frame');
          break;
        case 'e':
          setActiveTool('eraser');
          break;
        case '?':
          useUIStore.getState().setShowShortcuts(true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    elements,
    selectedIds,
    handleUndo,
    handleRedo,
    handleFitContent,
    addElement,
    deleteElements,
    clearSelection,
    setSelectedIds,
    setActiveTool,
    setIsSpacePressed,
  ]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Top Header / Collaborator Bar */}
      <CollaboratorBar />

      {/* Primary Whiteboard 2D Canvas */}
      <canvas
        id="whiteboard-canvas"
        ref={canvasRef}
        onDoubleClick={handleDoubleClick}
        className="canvas-container cursor-crosshair active:cursor-grabbing w-full h-full"
      />

      {/* Floating Properties Panel */}
      <PropertiesPanel />

      {/* Main Tool Dock */}
      <MainToolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Zoom / Pan Controls */}
      <ZoomControls
        camera={engineRef.current ? engineRef.current.camera : null}
        onFitContent={handleFitContent}
      />

      {/* In-place Text / Sticky Note Editor */}
      {editingElement && (
        <InlineTextEditor
          element={editingElement}
          camera={engineRef.current ? engineRef.current.camera : null}
          onCommit={(id, newText) => {
            updateElement(id, { text: newText });
            setEditingElement(null);
          }}
          onCancel={() => setEditingElement(null)}
        />
      )}

      {/* Modals & Panels */}
      <ShortcutsModal />
      <ShareModal />
      <ExportModal />
      <PerformanceHUD />
    </div>
  );
};
