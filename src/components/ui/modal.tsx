'use client';

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo?: string;
  descripcion?: string;
  children: ReactNode;
  tamano?: 'sm' | 'md' | 'lg' | 'xl';
}

const TAMANOS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  children,
  tamano = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!abierto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [abierto, onCerrar]);

  if (!abierto || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={onCerrar}
    >
      <div
        className={`w-full ${TAMANOS[tamano]} bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {(titulo || descripcion) && (
          <div className="p-5 border-b border-border flex items-start justify-between gap-4">
            <div>
              {titulo && <h3 className="text-lg font-semibold text-card-foreground">{titulo}</h3>}
              {descripcion && <p className="text-sm text-muted-foreground mt-1">{descripcion}</p>}
            </div>
            <button
              type="button"
              onClick={onCerrar}
              className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-md transition-colors"
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
