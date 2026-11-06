import Link from 'next/link';
import type { CasoDetalle } from '@/lib/datos-simulados/actions';
import { Badge } from '@/components/ui';
import { etiquetaEstado } from '../EstadoCaso';
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
              <span className="ml-2 text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                Reabierto {caso.reaperturas} vez{caso.reaperturas > 1 ? 'es' : ''}
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground">
            Registrado el {fechaHoraLima(caso.creado_en)} · Canal: {caso.canal_nombre}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              caso.estado === 'anulado'
                ? 'destructive'
                : caso.estado === 'cerrado' || caso.estado === 'atendido'
                  ? 'ghost'
                  : 'default'
            }
            className="whitespace-nowrap"
          >
            {etiquetaEstado(caso.estado)}
          </Badge>
          {caso.motivo_espera_id && (
            <Badge variant="outline" className="text-xs whitespace-nowrap">
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
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm">
          Visita en curso: espera a que el técnico registre su llegada.
        </div>
      )}
      {caso.estado === 'por_programar' && ultimaVisita && ultimaVisita.resultado === 'pendiente' && ultimaVisita.requerimiento && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm">
          Pendiente: se requiere {ultimaVisita.requerimiento}.
        </div>
      )}
      {caso.estado === 'atendido' && esTecnicoDelCaso && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900 text-sm">
          La posventa la registra otro Coordinador o el Gerente (tú fuiste técnico de este caso).
        </div>
      )}
      {accionMensaje && (
        <div
          className={`mt-3 rounded-lg p-3 text-sm ${
            accionMensaje.includes('correctamente')
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {accionMensaje}
        </div>
      )}
    </div>
  );
}
