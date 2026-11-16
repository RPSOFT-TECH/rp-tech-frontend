import type { Reporte } from '@/lib/datos-simulados/types';

export const PASOS = [
  { clave: 'llegada', nombre: 'Llegada' },
  { clave: 'revision', nombre: 'Revisión inicial' },
  { clave: 'desarrollo', nombre: 'Desarrollo' },
  { clave: 'repuestos', nombre: 'Repuestos' },
  { clave: 'conformidad', nombre: 'Conformidad' },
  { clave: 'cierre', nombre: 'Cierre' },
];

// A qué paso lleva cada cosa que falta para cerrar (textos de faltantes_cierre).
export function pasoDeFalta(falta: string): number {
  const texto = falta.toLowerCase();
  if (texto.startsWith('llegada') || texto.includes('ingreso')) return 1;
  if (texto.startsWith('revisión')) return 2;
  if (texto.startsWith('procedimiento') || texto.startsWith('conclusión')) return 3;
  if (texto.includes('firma')) return 5;
  return 6;
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
