'use client';

import { Toaster } from 'sonner';

/**
 * Wrapper de Sonner para notificaciones.
 * Úsalo en el layout raíz: <SonnerToaster />
 */
export function SonnerToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
    />
  );
}
