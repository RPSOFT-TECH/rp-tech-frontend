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
  por_programar: 'border-chart-3/50 bg-chart-3/20 text-foreground',
  programado: 'border-primary/40 bg-primary/15 text-primary',
  en_atencion: 'border-chart-2/40 bg-chart-2/15 text-chart-2',
  en_espera: 'border-chart-5/40 bg-chart-5/15 text-chart-5',
  atendido: 'border-chart-4/40 bg-chart-4/15 text-chart-4',
  cerrado: 'border-chart-2/40 bg-chart-2/15 text-chart-2',
  anulado: 'border-destructive/40 bg-destructive/15 text-destructive',
};

export function etiquetaEstado(estado: string): string {
  return estado in ETIQUETA ? ETIQUETA[estado as EstadoCaso] : estado;
}

export function EstadoBadge({ estado }: { estado: string }) {
  const clave = estado as EstadoCaso;
  return (
    <Badge variant="outline" className={`whitespace-nowrap ${TONO[clave] || TONO.programado}`}>
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
