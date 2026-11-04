'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  agenda_tecnico,
  hoyLima,
  sumarDias,
  tecnicos,
  type TecnicoLista,
  type VisitaAgenda,
} from '@/lib/datos/actions';
import { Button } from '@/components/ui';

interface ColumnaAgenda {
  tecnico: TecnicoLista;
  visitas: VisitaAgenda[];
}

function fechaPedida(valor: string | null): string {
  if (valor && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  return hoyLima();
}

function tituloDia(iso: string): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia, 12));
  const texto = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function AgendaView() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-muted-foreground">Cargando agenda...</p>}>
      <Contenido />
    </Suspense>
  );
}

function Contenido() {
  const router = useRouter();
  const params = useSearchParams();
  const fecha = fechaPedida(params.get('fecha'));
  const hoy = hoyLima();
  const [columnas, setColumnas] = useState<ColumnaAgenda[] | null>(null);

  useEffect(() => {
    let vigente = true;
    tecnicos().then(async (lista) => {
      const cargadas = await Promise.all(
        lista.map(async (tecnico) => ({
          tecnico,
          visitas: await agenda_tecnico(tecnico.id, fecha),
        })),
      );
      if (!vigente) return;
      cargadas.sort((a, b) => a.tecnico.nombre_completo.localeCompare(b.tecnico.nombre_completo, 'es'));
      setColumnas(cargadas);
    });
    return () => {
      vigente = false;
    };
  }, [fecha]);

  const ir = (iso: string) => {
    router.push(iso === hoy ? '/agenda' : `/agenda?fecha=${iso}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-foreground">{tituloDia(fecha)}</h1>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="min-h-11" onClick={() => ir(sumarDias(fecha, -1))}>
            Anterior
          </Button>
          <Button type="button" variant="outline" className="min-h-11" disabled={fecha === hoy} onClick={() => ir(hoy)}>
            Hoy
          </Button>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => ir(sumarDias(fecha, 1))}>
            Siguiente
          </Button>
        </div>
      </div>
      {columnas === null && <p className="text-sm text-muted-foreground">Cargando visitas...</p>}
      {columnas && columnas.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay técnicos vigentes.</p>
      )}
      {columnas && columnas.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-3 items-start">
            {columnas.map((columna) => (
              <section key={columna.tecnico.id} className="w-64 shrink-0 bg-card border border-border rounded-xl p-3 space-y-3">
                <h2 className="text-sm font-semibold text-foreground">{columna.tecnico.nombre_completo}</h2>
                {columna.visitas.length === 0 && (
                  <p className="text-xs text-muted-foreground">Sin visitas</p>
                )}
                {columna.visitas.map((visita) => (
                  <Link
                    key={visita.id}
                    href={`/casos/${visita.caso_id}`}
                    className="block rounded-lg border border-border bg-background p-3 min-h-11 hover:border-primary"
                  >
                    <p className="font-mono font-bold text-primary">{visita.hora_programada || '—'}</p>
                    <p className="text-sm font-medium text-foreground">{visita.numero_caso}</p>
                    <p className="text-xs text-muted-foreground">{visita.cliente_razon_social}</p>
                    {visita.como === 'adjunto' && <p className="text-xs text-muted-foreground">Adjunto</p>}
                  </Link>
                ))}
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
