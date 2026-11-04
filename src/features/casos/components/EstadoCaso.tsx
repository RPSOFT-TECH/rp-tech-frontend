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

const VARIANTE: Record<EstadoCaso, 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'> = {
  por_programar: 'secondary',
  programado: 'default',
  en_atencion: 'default',
  en_espera: 'outline',
  atendido: 'ghost',
  cerrado: 'ghost',
  anulado: 'destructive',
};

export function etiquetaEstado(estado: string): string {
  return estado in ETIQUETA ? ETIQUETA[estado as EstadoCaso] : estado;
}

export function EstadoBadge({ estado }: { estado: string }) {
  const clave = estado as EstadoCaso;
  return (
    <Badge variant={VARIANTE[clave] || 'secondary'} className="whitespace-nowrap">
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
