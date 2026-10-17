'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CanvasElement } from '@whiteboard/shared';
import { Camera } from '../../engine/Camera';

interface InlineTextEditorProps {
  element: CanvasElement | null;
  camera: Camera | null;
  onCommit: (id: string, text: string) => void;
  onCancel: () => void;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  element,
  camera,
  onCommit,
  onCancel,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(element?.text || '');

  useEffect(() => {
    if (element) {
      setText(element.text || '');
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 50);
    }
  }, [element]);

  if (!element || !camera) return null;

  const isSticky = element.type === 'sticky';
  const screenPos = camera.worldToScreen({
    x: element.x + (isSticky ? 12 : 0),
    y: element.y + (isSticky ? 24 : 0),
  });

  const width = Math.max(120, (element.width - (isSticky ? 24 : 0)) * camera.zoom);
  const height = Math.max(40, (element.height - (isSticky ? 32 : 0)) * camera.zoom);
  const fontSize = (element.fontSize || 16) * camera.zoom;

  const handleBlur = () => {
    onCommit(element.id, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onCommit(element.id, text);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 40,
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1.35',
          fontFamily: element.fontFamily || 'Inter, system-ui, sans-serif',
          color: isSticky ? '#1e293b' : '#f8fafc',
          backgroundColor: isSticky ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.85)',
        }}
        className="w-full h-full p-2 border-2 border-blue-500 rounded-lg outline-none resize-none shadow-xl backdrop-blur-sm"
      />
    </div>
  );
};
