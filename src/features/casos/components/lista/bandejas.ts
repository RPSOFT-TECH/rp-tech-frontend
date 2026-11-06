import type { CasoLista } from '@/lib/datos-simulados/actions';
import { etiquetaEstado } from '../EstadoCaso';

export const BANDEJAS: { clave: string; etiqueta: string }[] = [
  { clave: 'todos', etiqueta: 'Todos' },
  { clave: 'entrega_turno', etiqueta: 'Entrega de turno' },
  { clave: 'por_programar', etiqueta: 'Por programar' },
  { clave: 'programado', etiqueta: 'Programado' },
  { clave: 'en_atencion', etiqueta: 'En atención' },
  { clave: 'en_espera', etiqueta: 'En espera' },
  { clave: 'pendientes_posventa', etiqueta: 'Pendientes de posventa' },
  { clave: 'cerrado', etiqueta: 'Cerrado' },
  { clave: 'anulado', etiqueta: 'Anulado' },
];

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

  const lineas = [cabeceras.join(';'), ...filas.map((fila) => fila.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(';'))];
  const contenido = '\uFEFF' + lineas.join('\r\n');
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `casos_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
