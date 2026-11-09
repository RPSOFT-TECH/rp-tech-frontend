'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo?: string;
  descripcion?: string;
  children: ReactNode;
  tamano?: 'sm' | 'md' | 'lg' | 'xl';
}

const TAMANOS = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
};

export function Modal({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  children,
  tamano = 'md',
}: ModalProps) {
  return (
    <Dialog open={abierto} onOpenChange={(abiertoAhora) => { if (!abiertoAhora) onCerrar(); }}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className={cn(
          'max-h-[min(85vh,720px)] gap-5 overflow-y-auto rounded-2xl bg-card! p-6 shadow-xl ring-1 ring-border/60 backdrop-blur-none',
          TAMANOS[tamano],
        )}
      >
        {(titulo || descripcion) && (
          <DialogHeader className="space-y-1 pr-8 text-left">
            {titulo ? <DialogTitle className="text-base font-bold tracking-tight">{titulo}</DialogTitle> : null}
            {descripcion ? <DialogDescription>{descripcion}</DialogDescription> : null}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
