import * as XLSX from 'xlsx';
import type { CasoLista } from '@/lib/datos/actions';
import { etiquetaEstado } from '../EstadoCaso';
import { hoyLima } from '@/lib/datos-simulados/fecha';

export const BANDEJAS: { clave: string; etiqueta: string; tono?: string }[] = [
  { clave: 'todos', etiqueta: 'Todos' },
  { clave: 'entrega_turno', etiqueta: 'Entrega de turno' },
  { clave: 'por_programar', etiqueta: 'Por programar', tono: 'bg-estado-por text-estado-por-fg' },
  { clave: 'programado', etiqueta: 'Programados', tono: 'bg-estado-prog text-estado-prog-fg' },
  { clave: 'en_atencion', etiqueta: 'En atención', tono: 'bg-estado-aten text-estado-aten-fg' },
  { clave: 'en_espera', etiqueta: 'En espera', tono: 'bg-estado-esp text-estado-esp-fg' },
  { clave: 'pendientes_posventa', etiqueta: 'Posventa', tono: 'bg-estado-ok text-estado-ok-fg' },
  { clave: 'cerrado', etiqueta: 'Cerrados' },
  { clave: 'anulado', etiqueta: 'Anulados' },
];

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

// "Hoy", "Mañana", "Ayer" o "Vie 13 nov" (fecha en formato AAAA-MM-DD).
export function diaLegible(fecha: string | null | undefined, hoy: string = hoyLima()): string {
  if (!fecha) return '—';
  const [a, m, d] = fecha.slice(0, 10).split('-').map(Number);
  const [ah, mh, dh] = hoy.split('-').map(Number);
  const dias = Math.round((Date.UTC(a, m - 1, d) - Date.UTC(ah, mh - 1, dh)) / 86400000);
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Mañana';
  if (dias === -1) return 'Ayer';
  const dia = DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()];
  return `${dia} ${d} ${MESES[m - 1]}${a !== ah ? ` ${a}` : ''}`;
}

export function registroCorto(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Casos que piden atención: sin técnico, o con la visita en un día ya pasado sin cerrar.
export function pendientesDeAtencion(casos: CasoLista[], hoy: string = hoyLima()) {
  const sinTecnico = casos.filter((c) => c.estado === 'por_programar').length;
  const atrasados = casos.filter(
    (c) => (c.estado === 'programado' || c.estado === 'en_atencion') && !!c.fecha_programada && c.fecha_programada < hoy,
  ).length;
  return { sinTecnico, atrasados };
}

export function fechaLima(iso: string | null | undefined): string {
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

export function puedeCrear(roles: string[]): boolean {
  return roles.some((rol) => rol === 'superadmin' || rol === 'coordinador');
}

export function listaFiltradaPorBandeja(casos: CasoLista[], bandeja: string): CasoLista[] {
  if (bandeja === 'todos') return casos;
  if (bandeja === 'entrega_turno') {
    return casos.filter((caso) => caso.estado !== 'cerrado' && caso.estado !== 'anulado');
  }
  if (bandeja === 'pendientes_posventa') {
    return casos.filter((caso) => caso.estado === 'atendido');
  }
  return casos.filter((caso) => caso.estado === bandeja);
}

export function contadorBandeja(casos: CasoLista[], clave: string): number {
  if (clave === 'todos') return casos.length;
  if (clave === 'entrega_turno') {
    return casos.filter((caso) => caso.estado !== 'cerrado' && caso.estado !== 'anulado').length;
  }
  if (clave === 'pendientes_posventa') {
    return casos.filter((caso) => caso.estado === 'atendido').length;
  }
  return casos.filter((caso) => caso.estado === clave).length;
}

export function descargarExcel(casos: CasoLista[]) {
  const filas = casos.map((caso) => [
    caso.numero,
    caso.creado_en.slice(0, 16).replace('T', ' '),
    caso.canal_nombre,
    caso.cliente_razon_social,
    caso.cliente_ruc || '—',
    caso.sede_nombre,
    caso.sede_direccion,
    caso.equipo_serie,
    caso.equipo_modelo,
    caso.tipo_servicio_nombre,
    caso.modalidad_nombre,
    caso.modo_servicio_nombre,
    caso.tecnico_nombre || 'Sin asignar',
    caso.tecnico_adjunto_nombre || '—',
    caso.fecha_programada || '—',
    caso.hora_programada || '—',
    etiquetaEstado(caso.estado),
    caso.reaperturas > 0 ? 'Reabierto' : '',
  ]);

  const cabeceras = [
    'Nº caso',
    'Registro',
    'Canal',
    'Cliente',
    'RUC',
    'Sede',
    'Dirección sede',
    'Serie equipo',
    'Modelo equipo',
    'Tipo servicio',
    'Modalidad',
    'Modo servicio',
    'Técnico',
    'Adjunto',
    'Fecha visita',
    'Hora visita',
    'Estado',
    'Reabierto',
  ];

  const hoja = XLSX.utils.aoa_to_sheet([cabeceras, ...filas]);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Casos');
  XLSX.writeFile(libro, `casos_${hoyLima()}.xlsx`);
}
