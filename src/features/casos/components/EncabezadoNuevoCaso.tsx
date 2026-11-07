'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { leerSesionEstable } from '@/lib/datos-simulados/actions';

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
    <div className="mb-6 space-y-2">
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>N° de caso: se asigna al guardar</p>
        <p>{marca || 'Hora de Lima'}</p>
        <p>Registrado por: {sesion?.usuario.nombre_completo ?? '—'}</p>
      </div>
      {numeroOrigen && (
        <p className="text-sm font-medium text-primary bg-primary/10 border border-border rounded-lg px-3 py-2">
          Caso nuevo vinculado al caso {numeroOrigen}
        </p>
      )}
    </div>
  );
}
