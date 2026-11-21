'use client';

import { useSyncExternalStore } from 'react';
import { leerSesionEstable } from '@/lib/datos/actions';

export function marcaLima(): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

export function EncabezadoNuevoCaso({ numeroOrigen }: { numeroOrigen: string | null }) {
  const sesion = useSyncExternalStore(() => () => {}, leerSesionEstable, () => null);

  return (
    <div className="mb-4 space-y-2">
      <p className="text-xs text-muted-foreground">
        Registra: <span className="font-medium text-foreground">{sesion?.usuario.nombre_completo ?? '—'}</span>
      </p>
      {numeroOrigen && (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          Caso nuevo vinculado al caso {numeroOrigen}
        </p>
      )}
    </div>
  );
}
