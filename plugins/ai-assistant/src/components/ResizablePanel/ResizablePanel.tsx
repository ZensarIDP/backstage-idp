import React, { useRef, useEffect, useState } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  direction: 'horizontal' | 'vertical';
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  direction,
  defaultSize = 300,
  minSize = 150,
  maxSize = 800,
  className,
}) => {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      const newSize = direction === 'horizontal' 
        ? e.clientX - rect.left 
        : e.clientY - rect.top;

      const clampedSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(clampedSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, direction, minSize, maxSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const panelStyle = direction === 'horizontal' 
    ? { width: size, minWidth: size, maxWidth: size }
    : { height: size, minHeight: size, maxHeight: size };

  const resizeHandleStyle = {
    position: 'absolute' as const,
    backgroundColor: 'transparent',
    zIndex: 10,
    ...(direction === 'horizontal' 
      ? {
          top: 0,
          right: -2,
          width: 4,
          height: '100%',
          cursor: 'col-resize',
        }
      : {
          bottom: -2,
          left: 0,
          width: '100%',
          height: 4,
          cursor: 'row-resize',
        }
    ),
  };

  const resizeHandleActiveStyle = {
    backgroundColor: '#007acc',
  };

  return (
    <div
      ref={panelRef}
      className={className}
      style={{
        ...panelStyle,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {children}
      <div
        ref={resizeRef}
        style={{
          ...resizeHandleStyle,
          ...(isResizing ? resizeHandleActiveStyle : {}),
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default ResizablePanel;
