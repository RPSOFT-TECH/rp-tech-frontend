import Link from 'next/link';
import type { CasoDetalle } from '@/lib/datos/actions';
import { Badge } from '@/components/ui';
import { EstadoBadge } from '../EstadoCaso';
import { fechaHoraLima } from './formato';

export function EncabezadoDetalle({
  caso,
  consulta,
}: {
  caso: CasoDetalle;
  consulta: string;
}) {
  return (
    <div className="mb-6">
      <Link href={`/casos?${consulta}`} className="text-sm text-primary hover:underline mb-2 inline-block">
        ← Volver a la lista
      </Link>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Caso {caso.numero}
            {caso.reaperturas > 0 && (
              <span className="ml-2 rounded border border-chart-3/50 bg-chart-3/20 px-2 py-0.5 text-xs font-bold text-foreground">
                Reabierto {caso.reaperturas} vez{caso.reaperturas > 1 ? 'es' : ''}
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground">
            Registrado el {fechaHoraLima(caso.creado_en)} · Canal: {caso.canal_nombre}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EstadoBadge estado={caso.estado} />
          {caso.motivo_espera_id && (
            <Badge variant="outline" className="border-chart-5/40 bg-chart-5/15 text-xs whitespace-nowrap text-chart-5">
              En espera
            </Badge>
          )}
          {caso.caso_origen_id && (
            <Link href={`/casos/${caso.caso_origen_id}?${consulta}`} className="text-xs text-primary hover:underline">
              Vinculado al caso {caso.caso_origen_numero}
            </Link>
          )}
        </div>
      </div>
      {caso.motivo_anulacion && (
        <div className="mt-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <strong className="font-semibold">Motivo de anulación:</strong> {caso.motivo_anulacion}
        </div>
      )}
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
    <div className="mb-6">
      {caso.estado === 'programado' && visitaAbierta && (
        <div className="rounded-lg border border-chart-3/40 bg-chart-3/15 p-4 text-sm text-foreground">
          Visita en curso: espera a que el técnico registre su llegada.
        </div>
      )}
      {caso.estado === 'por_programar' && ultimaVisita && ultimaVisita.resultado === 'pendiente' && ultimaVisita.requerimiento && (
        <div className="rounded-lg border border-chart-3/40 bg-chart-3/15 p-4 text-sm text-foreground">
          Pendiente: se requiere {ultimaVisita.requerimiento}.
        </div>
      )}
      {caso.estado === 'atendido' && esTecnicoDelCaso && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
          La posventa la registra otro Coordinador o el Gerente (tú fuiste técnico de este caso).
        </div>
      )}
      {accionMensaje && (
        <div
          className={`mt-3 rounded-lg p-3 text-sm ${
            accionMensaje.includes('correctamente')
              ? 'border border-chart-2/40 bg-chart-2/15 text-foreground'
              : 'border border-destructive/40 bg-destructive/10 text-destructive'
          }`}
        >
          {accionMensaje}
        </div>
      )}
    </div>
  );
}
