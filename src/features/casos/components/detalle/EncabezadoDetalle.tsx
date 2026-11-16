import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { diaLegible } from '../lista/bandejas';
import type { CasoDetalle } from '@/lib/datos/actions';
import { Badge } from '@/components/ui';
import { EstadoBadge } from '../EstadoCaso';
import { fechaHoraLima, horaLima } from './formato';

export function EncabezadoDetalle({
  caso,
  consulta,
  acciones,
  pestana,
  onPestana,
}: {
  caso: CasoDetalle;
  consulta: string;
  acciones: ReactNode;
  pestana: string;
  onPestana: (clave: string) => void;
}) {
  const ultima = caso.visitas.length > 0 ? caso.visitas[caso.visitas.length - 1] : null;
  const pestanas = [
    { clave: 'resumen', etiqueta: 'Resumen' },
    { clave: 'visitas', etiqueta: 'Visitas y reportes', total: caso.visitas.length },
    { clave: 'historial', etiqueta: 'Historial', total: caso.historial_estados.length + caso.posventas.length },
  ];
  return (
    <div className="-mx-4 -mt-4 mb-5 border-b border-border bg-card px-4 pt-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-5">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Link href={`/casos?${consulta}`} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Casos
        </Link>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{caso.numero}</h2>
              <EstadoBadge estado={caso.estado} />
              {caso.reaperturas > 0 && (
                <Badge className="h-6 border-0 bg-estado-por px-2.5 text-xs font-semibold text-estado-por-fg">
                  Reabierto {caso.reaperturas} {caso.reaperturas > 1 ? 'veces' : 'vez'}
                </Badge>
              )}
              {caso.caso_origen_id && (
                <Link href={`/casos/${caso.caso_origen_id}?${consulta}`} className="text-sm font-medium text-accent-foreground hover:underline">
                  Vinculado al caso {caso.caso_origen_numero}
                </Link>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Registrado el {fechaHoraLima(caso.creado_en)} · vía {caso.canal_nombre}
            </p>
          </div>
          {acciones}
        </div>
        {caso.motivo_anulacion && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <strong className="font-semibold">Motivo de anulación:</strong> {caso.motivo_anulacion}
          </div>
        )}
        <dl className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-muted/50 sm:grid-cols-2 lg:grid-cols-4">
          <Dato titulo="Cliente" valor={caso.cliente_razon_social} detalle={[caso.sede_nombre, caso.sede_distrito].filter(Boolean).join(' · ')} />
          <Dato
            titulo="Equipo"
            valor={<span className="font-mono text-[13px]">{caso.equipo_serie}</span>}
            detalle={[caso.equipo_linea, caso.equipo_modelo].filter(Boolean).join(' · ')}
          />
          <Dato titulo="Servicio" valor={caso.tipo_servicio_nombre} detalle={`${caso.modalidad_nombre} · ${caso.modo_servicio_nombre}`} />
          <Dato
            titulo={ultima?.cerrado ? 'Última visita' : 'Visita'}
            valor={ultima ? `${diaLegible(ultima.fecha_programada)}${ultima.hora_programada ? `, ${ultima.hora_programada.slice(0, 5)}` : ''}` : 'Sin programar'}
            detalle={ultima ? [ultima.tecnico_nombre, ultima.hora_llegada ? `llegó ${horaLima(ultima.hora_llegada)}` : null].filter(Boolean).join(' · ') : 'Aún no tiene técnico'}
          />
        </dl>
        <div role="tablist" className="no-scrollbar -mb-px flex gap-6 overflow-x-auto">
          {pestanas.map((item) => (
            <button
              key={item.clave}
              type="button"
              role="tab"
              aria-selected={pestana === item.clave}
              onClick={() => onPestana(item.clave)}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 pt-1 pb-3 text-sm whitespace-nowrap transition-colors',
                pestana === item.clave ? 'border-primary font-semibold text-foreground' : 'border-transparent font-medium text-muted-foreground hover:text-foreground',
              )}
            >
              {item.etiqueta}
              {item.total !== undefined && (
                <span className="rounded-full bg-muted px-1.5 text-xs leading-5 text-muted-foreground tabular-nums">{item.total}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dato({ titulo, valor, detalle }: { titulo: string; valor: ReactNode; detalle?: string }) {
  return (
    <div className="min-w-0 border-border px-4 py-3 not-first:border-t sm:not-first:border-t-0 sm:[&:nth-child(n+3)]:border-t lg:[&:nth-child(n+3)]:border-t-0 lg:not-first:border-l">
      <dt className="text-xs text-muted-foreground">{titulo}</dt>
      <dd className="truncate font-semibold text-foreground">{valor || '—'}</dd>
      {detalle ? <dd className="truncate text-xs text-muted-foreground">{detalle}</dd> : null}
    </div>
  );
}

export function MensajesDetalle({
  caso,
  visitaAbierta,
  ultimaVisita,
  esTecnicoDelCaso,
  accionMensaje,
}: {
  caso: CasoDetalle;
  visitaAbierta: boolean;
  ultimaVisita: CasoDetalle['visitas'][number] | null;
  esTecnicoDelCaso: boolean;
  accionMensaje: string | null;
}) {
  return (
    <div className="mb-4 space-y-3 empty:hidden">
      {caso.estado === 'programado' && visitaAbierta && (
        <div className="rounded-lg border border-amber-300/70 bg-estado-por p-3 text-sm text-estado-por-fg">
          Visita en curso: espera a que el técnico registre su llegada.
        </div>
      )}
      {caso.estado === 'por_programar' && ultimaVisita && ultimaVisita.resultado === 'pendiente' && ultimaVisita.requerimiento && (
        <div className="rounded-lg border border-amber-300/70 bg-estado-por p-3 text-sm text-estado-por-fg">
          Pendiente: se requiere {ultimaVisita.requerimiento}.
        </div>
      )}
      {caso.estado === 'atendido' && esTecnicoDelCaso && (
        <div className="rounded-lg border border-primary/30 bg-accent p-3 text-sm text-accent-foreground">
          La posventa la registra otro Coordinador o el Gerente (tú fuiste técnico de este caso).
        </div>
      )}
      {accionMensaje && (
        <div
          className={`rounded-lg p-3 text-sm ${
            accionMensaje.includes('correctamente')
              ? 'border border-emerald-300/70 bg-estado-ok text-estado-ok-fg'
              : 'border border-destructive/40 bg-destructive/10 text-destructive'
          }`}
        >
          {accionMensaje}
        </div>
      )}
    </div>
  );
}
