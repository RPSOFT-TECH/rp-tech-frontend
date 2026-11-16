import { Badge } from '@/components/ui';
import type { EstadoCaso } from '@/lib/datos/actions';

const ETIQUETA: Record<EstadoCaso, string> = {
  por_programar: 'Por programar',
  programado: 'Programado',
  en_atencion: 'En atención',
  en_espera: 'En espera',
  atendido: 'Atendido',
  cerrado: 'Cerrado',
  anulado: 'Anulado',
};

const TONO: Record<EstadoCaso, string> = {
  por_programar: 'bg-estado-por text-estado-por-fg',
  programado: 'bg-estado-prog text-estado-prog-fg',
  en_atencion: 'bg-estado-aten text-estado-aten-fg',
  en_espera: 'bg-estado-esp text-estado-esp-fg',
  atendido: 'bg-estado-ok text-estado-ok-fg',
  cerrado: 'bg-estado-ok text-estado-ok-fg',
  anulado: 'bg-estado-anu text-estado-anu-fg',
};

export function etiquetaEstado(estado: string): string {
  return estado in ETIQUETA ? ETIQUETA[estado as EstadoCaso] : estado;
}

export function EstadoBadge({ estado }: { estado: string }) {
  const clave = estado as EstadoCaso;
  return (
    <Badge className={`h-6 gap-1.5 border-0 px-2.5 text-xs font-semibold whitespace-nowrap ${TONO[clave] || TONO.programado}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {etiquetaEstado(estado)}
    </Badge>
  );
}

export const ESTADOS_FILTRO: EstadoCaso[] = [
  'por_programar',
  'programado',
  'en_atencion',
  'en_espera',
  'atendido',
  'cerrado',
  'anulado',
];
