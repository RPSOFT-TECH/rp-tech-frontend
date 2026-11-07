'use client';

import { ReactNode } from 'react';
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
      <DialogContent className={TAMANOS[tamano]}>
        {(titulo || descripcion) && (
          <DialogHeader>
            {titulo ? <DialogTitle>{titulo}</DialogTitle> : null}
            {descripcion ? <DialogDescription>{descripcion}</DialogDescription> : null}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
