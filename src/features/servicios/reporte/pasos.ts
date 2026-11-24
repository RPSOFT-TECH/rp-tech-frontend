import type { Reporte } from '@/lib/datos-simulados/types';

export const PASOS = [
  { clave: 'llegada_revision', nombre: 'Llegada y revisión' },
  { clave: 'trabajo', nombre: 'Trabajo realizado' },
  { clave: 'cierre', nombre: 'Cierre y firmas' },
];

// A qué paso lleva cada cosa que falta para cerrar (textos de faltantes_cierre).
export function pasoDeFalta(falta: string): number {
  const texto = falta.toLowerCase();
  if (texto.includes('llegada') || texto.includes('ingreso') || texto.includes('revisión')) return 1;
  if (texto.includes('procedimiento') || texto.includes('conclusión')) return 2;
  return 3;
}

export function horaLimaStr(): string {
  return new Date().toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fechaHoraLima(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function puedeEditar(reporte: Reporte, perfilId: string): boolean {
  return !reporte.cerrado && reporte.tecnico_id === perfilId;
}

export type RepuestoFila = {
  id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  tipo: 'venta' | 'descarte' | 'garantia';
};

export type AdjuntoFila = {
  id: string;
  tipo: 'foto_ingreso' | 'foto_salida' | 'otro';
  nombre: string;
  url: string;
};
