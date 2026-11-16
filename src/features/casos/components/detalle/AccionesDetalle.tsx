import Link from 'next/link';
import type { CasoDetalle } from '@/lib/datos/actions';
import { CalendarClock, CalendarPlus, CirclePause } from 'lucide-react';
import { Button } from '@/components/ui';
import { buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
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
  const boton = 'h-10 gap-2 px-4 font-semibold';
  return (
    <div className="flex flex-wrap items-center gap-2">
      {puedeProgramar && (caso.estado === 'por_programar' || caso.estado === 'en_espera') && !visitaAbierta && (
        <Button onClick={() => onAbrir('programar')} className={`${boton} shadow-sm`}>
          <CalendarPlus className="size-4" />
          Programar visita
        </Button>
      )}
      {puedeProgramar && reporteAbierto && ultimaVisita && !ultimaVisita.cerrado && (
        <Button onClick={() => onAbrir('reprogramar')} className={`${boton} shadow-sm`}>
          <CalendarClock className="size-4" />
          Reprogramar visita
        </Button>
      )}
      {puedeCoordinador(roles) && ['por_programar', 'programado', 'en_atencion'].includes(caso.estado) && !visitaAbierta && (
        <Button onClick={() => onAbrir('espera')} variant="outline" className={`${boton} shadow-xs`}>
          <CirclePause className="size-4" />
          Poner en espera
        </Button>
      )}
      {puedePosventa && caso.estado === 'atendido' && !esTecnicoDelCaso && (
        <Button onClick={() => onAbrir('posventa')} className={`${boton} shadow-sm`}>
          Registrar posventa
        </Button>
      )}
      {puedeReabrir && caso.estado === 'cerrado' && plazoVigente === true && (
        <Button onClick={() => onAbrir('reabrir')} className={`${boton} shadow-sm`}>
          Reabrir por misma falla
        </Button>
      )}
      {puedeCoordinador(roles) && caso.estado === 'cerrado' && (
        <Link href={`/casos/nuevo?origen=${caso.id}`} className={buttonVariants({ className: `${boton} shadow-sm` })}>
          Nuevo caso vinculado
        </Link>
      )}
      {puedeAnular && caso.estado !== 'cerrado' && caso.estado !== 'anulado' && !visitaAbierta && (
        <Button variant="outline" onClick={() => onAbrir('anular')} className={`${boton} text-destructive shadow-xs hover:bg-destructive/10 hover:text-destructive`}>
          Anular caso
        </Button>
      )}
      {accionAbierta === null && accionMensaje && (
        <Button variant="ghost" onClick={onCerrarMensaje} className="h-10 px-3 text-muted-foreground">
          Cerrar mensaje
        </Button>
      )}
    </div>
  );
}

const FORMULARIOS = ['programar', 'reprogramar', 'espera', 'posventa', 'reabrir', 'anular'];

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
  const abierto = accion !== null && FORMULARIOS.includes(accion);
  let contenido = null;
  if (accion === 'programar') contenido = <FormProgramarVisita caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  if (accion === 'reprogramar') contenido = <FormReprogramarVisita caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  if (accion === 'espera') contenido = <FormPonerEnEspera caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  if (accion === 'posventa') contenido = <FormRegistrarPosventa caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  if (accion === 'reabrir') contenido = <FormReabrirCaso caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  if (accion === 'anular') contenido = <FormAnularCaso caso={caso} onEjecutar={onEjecutar} onCerrar={onCerrar} />;
  return (
    <Sheet open={abierto} onOpenChange={(abrir) => !abrir && onCerrar()}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-card p-6 sm:max-w-md">
        <SheetTitle className="sr-only">Caso {caso.numero}</SheetTitle>
        <p className="mb-1 text-sm text-muted-foreground tabular-nums">Caso {caso.numero}</p>
        {contenido}
      </SheetContent>
    </Sheet>
  );
}
