'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { leerSesionEstable } from '@/lib/datos/actions';

function marcaLima(): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

export function EncabezadoNuevoCaso({ numeroOrigen }: { numeroOrigen: string | null }) {
  const sesion = useSyncExternalStore(() => () => {}, leerSesionEstable, () => null);
  const [marca, setMarca] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setMarca(marcaLima()), 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="mb-4 space-y-2">
      <p className="text-xs text-muted-foreground">
        El número se asigna al guardar · {marca || 'Hora de Lima'} · Registra {sesion?.usuario.nombre_completo ?? '—'}
      </p>
      {numeroOrigen && (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          Caso nuevo vinculado al caso {numeroOrigen}
        </p>
      )}
    </div>
  );
}
