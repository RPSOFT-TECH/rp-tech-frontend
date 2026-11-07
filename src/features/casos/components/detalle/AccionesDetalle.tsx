import Link from 'next/link';
import type { CasoDetalle } from '@/lib/datos/actions';
import { Button } from '@/components/ui';
import { puedeCoordinador } from './formato';
import { FormAnularCaso, FormPonerEnEspera, FormReabrirCaso, FormRegistrarPosventa } from './FormulariosEstado';
import { FormProgramarVisita, FormReprogramarVisita } from './FormulariosVisita';
import type { EjecutarAccion } from './tipos';

export function AccionesDetalle({
  caso,
  roles,
  puedeProgramar,
  puedePosventa,
  puedeReabrir,
  puedeAnular,
  esTecnicoDelCaso,
  visitaAbierta,
  reporteAbierto,
  ultimaVisita,
  plazoVigente,
  accionAbierta,
  accionMensaje,
  onAbrir,
  onCerrarMensaje,
}: {
  caso: CasoDetalle;
  roles: string[];
  puedeProgramar: boolean;
  puedePosventa: boolean;
  puedeReabrir: boolean;
  puedeAnular: boolean;
  esTecnicoDelCaso: boolean;
  visitaAbierta: boolean;
  reporteAbierto: boolean;
  ultimaVisita: CasoDetalle['visitas'][number] | null;
  plazoVigente: boolean | null;
  accionAbierta: string | null;
  accionMensaje: string | null;
  onAbrir: (accion: string) => void;
  onCerrarMensaje: () => void;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Acciones disponibles
      </h2>
      <div className="flex flex-wrap gap-3">
        {puedeProgramar && (caso.estado === 'por_programar' || caso.estado === 'en_espera') && !visitaAbierta && (
          <Button onClick={() => onAbrir('programar')} className="min-h-11">
            Programar visita
          </Button>
        )}
        {puedeProgramar && reporteAbierto && ultimaVisita && !ultimaVisita.cerrado && (
          <Button onClick={() => onAbrir('reprogramar')} className="min-h-11">
            Reprogramar visita
          </Button>
        )}
        {puedeCoordinador(roles) && ['por_programar', 'programado', 'en_atencion'].includes(caso.estado) && !visitaAbierta && (
          <Button onClick={() => onAbrir('espera')} variant="outline" className="min-h-11">
            Poner en espera
          </Button>
        )}
        {puedePosventa && caso.estado === 'atendido' && !esTecnicoDelCaso && (
          <Button onClick={() => onAbrir('posventa')} className="min-h-11">
            Registrar posventa
          </Button>
        )}
        {puedeReabrir && caso.estado === 'cerrado' && plazoVigente === true && (
          <Button onClick={() => onAbrir('reabrir')} className="min-h-11">
            Reabrir por misma falla
          </Button>
        )}
        {puedeAnular && caso.estado !== 'cerrado' && caso.estado !== 'anulado' && !visitaAbierta && (
          <Button variant="destructive" onClick={() => onAbrir('anular')} className="min-h-11">
            Anular caso
          </Button>
        )}
        {puedeCoordinador(roles) && caso.estado === 'cerrado' && (
          <Link
            href={`/casos/nuevo?origen=${caso.id}`}
            className="min-h-11 inline-flex items-center justify-center bg-primary text-primary-foreground px-3 rounded-md text-sm font-medium"
          >
            Nuevo caso vinculado
          </Link>
        )}
        {accionAbierta === null && accionMensaje && (
          <Button variant="outline" onClick={onCerrarMensaje} className="min-h-11">
            Cerrar mensaje
          </Button>
        )}
      </div>
    </div>
  );
}

export function FormulariosAccion({
  accion,
  caso,
  onEjecutar,
  onCerrar,
}: {
  accion: string | null;
  caso: CasoDetalle;
  onEjecutar: EjecutarAccion;
  onCerrar: () => void;
}) {
  if (accion === 'programar') return <FormProgramarVisita caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  if (accion === 'reprogramar') return <FormReprogramarVisita caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  if (accion === 'espera') return <FormPonerEnEspera caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  if (accion === 'posventa') return <FormRegistrarPosventa caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  if (accion === 'reabrir') return <FormReabrirCaso caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  if (accion === 'anular') return <FormAnularCaso caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  return null;
}
