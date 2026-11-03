'use client';

import { useState, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  contenido: string;
  children: ReactNode;
  posicion?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ contenido, children, posicion = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const calcularCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    switch (posicion) {
      case 'bottom':
        setCoords({ x: rect.left + rect.width / 2, y: rect.bottom + gap });
        break;
      case 'left':
        setCoords({ x: rect.left - gap, y: rect.top + rect.height / 2 });
        break;
      case 'right':
        setCoords({ x: rect.right + gap, y: rect.top + rect.height / 2 });
        break;
      case 'top':
      default:
        setCoords({ x: rect.left + rect.width / 2, y: rect.top - gap });
        break;
    }
  };

  const handleMouseEnter = () => {
    calcularCoords();
    setVisible(true);
  };

  const transformClass =
    posicion === 'top'
      ? '-translate-x-1/2 -translate-y-full'
      : posicion === 'bottom'
      ? '-translate-x-1/2'
      : posicion === 'left'
      ? '-translate-x-full -translate-y-1/2'
      : '-translate-y-1/2';

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
      onFocus={handleMouseEnter}
      onBlur={() => setVisible(false)}
      className="inline-flex"
    >
      {children}
      {visible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={`fixed z-50 px-2.5 py-1 text-xs font-medium text-primary-foreground bg-foreground rounded-md shadow-md pointer-events-none transition-opacity duration-150 ${transformClass}`}
            style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
            role="tooltip"
          >
            {contenido}
          </div>,
          document.body
        )}
    </div>
  );
}
