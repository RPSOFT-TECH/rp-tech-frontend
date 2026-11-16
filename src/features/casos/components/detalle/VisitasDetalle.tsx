'use client';

import { CalendarCheck2, CircleCheck, FileText, Wrench } from 'lucide-react';
import type { CasoDetalle } from '@/lib/datos/actions';
import { AvatarIniciales, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { EstadoBadge, etiquetaEstado } from '../EstadoCaso';
import { diaLegible } from '../lista/bandejas';
import { fechaHoraLima, horaLima } from './formato';

// Línea de tiempo: visitas (la más reciente arriba) y el registro del caso al final.
export function VisitasDetalle({
  caso,
  onAbrir,
}: {
  caso: CasoDetalle;
  onAbrir: (accion: string) => void;
}) {
  const visitas = [...caso.visitas].reverse();
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Avance</h3>
      <ol className="flex flex-col">
        {visitas.map((visita) => {
          const enCurso = !visita.cerrado && !!visita.hora_llegada;
          return (
            <li key={visita.id} className="relative grid grid-cols-[2rem_1fr] gap-3 pb-5 before:absolute before:top-8 before:bottom-0 before:left-[15px] before:w-0.5 before:bg-border">
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full border-2',
                  visita.cerrado
                    ? 'border-estado-ok-fg bg-estado-ok-fg text-white'
                    : enCurso
                      ? 'border-estado-aten-fg bg-estado-aten-fg text-white'
                      : 'border-border bg-card text-muted-foreground',
                )}
              >
                {visita.cerrado ? <CircleCheck className="size-4" /> : enCurso ? <Wrench className="size-4" /> : <CalendarCheck2 className="size-4" />}
              </span>
              <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Visita {visita.numero_visita}</span>
                  {visita.numero && <span className="font-mono text-xs text-muted-foreground">{visita.numero}</span>}
                  <EstadoBadge estado={visita.cerrado ? 'atendido' : enCurso ? 'en_atencion' : 'programado'} />
                  {visita.numero && (
                    <Button onClick={() => onAbrir(`ver-${visita.id}`)} variant="outline" className="ml-auto h-8 gap-1.5 px-3 shadow-xs">
                      <FileText className="size-3.5" />
                      Ver reporte
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {visita.tecnico_nombre ? (
                    <span className="flex items-center gap-1.5 text-foreground">
                      <AvatarIniciales nombre={visita.tecnico_nombre} className="size-6 text-[10px]" />
                      {visita.tecnico_nombre}
                      {visita.tecnico_adjunto_nombre ? <span className="text-muted-foreground">+ {visita.tecnico_adjunto_nombre}</span> : null}
                    </span>
                  ) : (
                    <span>Sin técnico</span>
                  )}
                  <span className="tabular-nums">
                    {diaLegible(visita.fecha_programada)}
                    {visita.hora_programada ? `, ${visita.hora_programada.slice(0, 5)}` : ''}
                  </span>
                  {visita.hora_llegada && <span className="tabular-nums">Llegada {horaLima(visita.hora_llegada)}</span>}
                  {visita.hora_salida && <span className="tabular-nums">Salida {horaLima(visita.hora_salida)}</span>}
                </div>
                {visita.resultado && (
                  <p className={cn('text-sm font-medium', visita.resultado === 'resuelto' ? 'text-estado-ok-fg' : 'text-estado-esp-fg')}>
                    {visita.resultado === 'resuelto' ? 'Resuelto' : 'Quedó pendiente'}
                    {visita.requerimiento ? `: se requiere ${visita.requerimiento}` : ''}
                  </p>
                )}
              </div>
            </li>
          );
        })}
        <li className="grid grid-cols-[2rem_1fr] gap-3">
          <span className="flex size-8 items-center justify-center rounded-full border-2 border-estado-ok-fg bg-estado-ok-fg text-white">
            <CircleCheck className="size-4" />
          </span>
          <div className="pt-1">
            <p className="font-semibold">Caso registrado</p>
            <p className="text-sm text-muted-foreground">
              {fechaHoraLima(caso.creado_en)} · vía {caso.canal_nombre}
            </p>
          </div>
        </li>
      </ol>
      {caso.visitas.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Este caso aún no tiene visitas programadas.</p>}
    </section>
  );
}

export function HistorialDetalle({ caso }: { caso: CasoDetalle }) {
  const eventos = [
    ...caso.historial_estados.map((h) => ({
      id: h.id,
      fecha: h.fecha,
      titulo: h.estado_anterior ? `${etiquetaEstado(h.estado_anterior)} → ${etiquetaEstado(h.estado_nuevo)}` : etiquetaEstado(h.estado_nuevo),
      detalle: h.motivo,
    })),
    ...caso.posventas.map((p) => ({
      id: p.id,
      fecha: p.fecha,
      titulo: `Posventa: ${p.resultado.replace(/_/g, ' ')}`,
      detalle: p.comentario,
    })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha));
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <h3 className="border-b border-border px-4 py-3 text-sm font-semibold">Historial del caso</h3>
      {eventos.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">Sin cambios registrados.</p>
      ) : (
        <ul>
          {eventos.map((e) => (
            <li key={e.id} className="grid grid-cols-[10rem_1fr] gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0">
              <span className="text-muted-foreground tabular-nums">{fechaHoraLima(e.fecha)}</span>
              <span>
                <span className="font-medium">{e.titulo}</span>
                {e.detalle ? <span className="block text-muted-foreground">{e.detalle}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
