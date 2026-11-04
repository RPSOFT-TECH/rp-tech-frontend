import type {
  Adjunto,
  Caso,
  Catalogo,
  EnvioReporte,
  EstadoCaso,
  HistorialEstado,
  Nota,
  Posventa,
  Repuesto,
  ReporteRepuesto,
  ResultadoReporte,
} from './types';

export interface CasoLista extends Caso {
  canal_nombre: string;
  cliente_razon_social: string;
  cliente_ruc: string | null;
  sede_nombre: string;
  sede_direccion: string;
  sede_distrito: string;
  sede_referencia: string | null;
  contacto_nombre: string;
  contacto_cargo: string | null;
  equipo_serie: string;
  equipo_modelo: string;
  equipo_linea: string;
  equipo_cabezal: string;
  equipo_cabezal_cantidad: number | null;
  tipo_servicio_nombre: string;
  modalidad_nombre: string;
  modo_servicio_nombre: string;
  modo_sugerido_nombre: string | null;
  tecnico_id: string | null;
  tecnico_nombre: string | null;
  tecnico_adjunto_id: string | null;
  tecnico_adjunto_nombre: string | null;
  fecha_programada: string | null;
  hora_programada: string | null;
  reportes_numeros: string[];
  pendiente_posventa: boolean;
}

export interface ReporteLista {
  id: string;
  caso_id: string;
  cliente_id: string;
  equipo_id: string;
  numero: string | null;
  numero_caso: string;
  numero_visita: number;
  cliente_razon_social: string;
  numero_serie: string;
  tecnico_nombre: string | null;
  fecha_programada: string | null;
  resultado: ResultadoReporte | null;
  cerrado: boolean;
}

export interface MiServicio {
  id: string;
  caso_id: string;
  numero: string | null;
  numero_caso: string;
  numero_visita: number;
  soy_adjunto: boolean;
  fecha_programada: string | null;
  hora_programada: string | null;
  cliente_razon_social: string;
  sede_nombre: string;
  sede_direccion: string;
  sede_distrito: string;
  sede_referencia: string | null;
  tipo_servicio_nombre: string;
  modalidad_nombre: string;
  modo_servicio_nombre: string;
  numero_serie: string;
  estado: EstadoCaso;
  cerrado: boolean;
}

export interface VisitaAgenda {
  id: string;
  caso_id: string;
  numero_caso: string;
  cliente_razon_social: string;
  hora_programada: string | null;
  como: 'tecnico' | 'adjunto';
}

export interface TecnicoLista {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string | null;
}

export interface VisitaDetalle {
  id: string;
  caso_id: string;
  numero_visita: number;
  numero: string | null;
  numero_fisico: string | null;
  tecnico_id: string;
  tecnico_nombre: string | null;
  tecnico_adjunto_id: string | null;
  tecnico_adjunto_nombre: string | null;
  fecha_programada: string | null;
  hora_programada: string | null;
  hora_llegada: string | null;
  hora_salida: string | null;
  horas: number | null;
  estado_equipo: 'operativo' | 'inoperativo' | null;
  ultimo_mantenimiento: string | null;
  limpieza: 'limpio' | 'sucio' | null;
  estado_cabezales: 'bueno' | 'regular' | 'malo' | null;
  sistema_proteccion: 'estabilizador' | 'ups' | 'otro' | null;
  sistema_proteccion_otro: string | null;
  tinta: string | null;
  voltaje_ln: number | null;
  voltaje_lt: number | null;
  voltaje_nt: number | null;
  operador: string | null;
  procedimiento: string | null;
  conclusion: string | null;
  recomendaciones: string | null;
  resultado: ResultadoReporte | null;
  requerimiento: string | null;
  firma_operador: string | null;
  nombre_operador_firma: string | null;
  firma_cliente: string | null;
  nombre_cliente_firma: string | null;
  cerrado: boolean;
  cerrado_en: string | null;
  pdf: string | null;
  repuestos: ReporteRepuesto[];
  adjuntos: Adjunto[];
  notas: Nota[];
}

export interface CasoDetalle extends Caso {
  cliente_razon_social: string;
  cliente_ruc: string | null;
  cliente_telefono: string | null;
  sede_nombre: string;
  sede_direccion: string;
  sede_distrito: string;
  sede_referencia: string | null;
  contacto_nombre: string;
  contacto_cargo: string | null;
  contacto_telefono: string | null;
  equipo_serie: string;
  equipo_modelo: string;
  equipo_linea: string;
  equipo_cabezal: string;
  equipo_cabezal_cantidad: number | null;
  canal_nombre: string;
  tipo_servicio_nombre: string;
  modalidad_nombre: string;
  modo_servicio_nombre: string;
  modo_sugerido_nombre: string | null;
  caso_origen_numero: string | null;
  visitas: VisitaDetalle[];
  historial_estados: HistorialEstado[];
  posventas: Posventa[];
  envios: EnvioReporte[];
}

export interface SugerenciaModo {
  modo_id: string;
  modo_nombre: string;
  motivo: string;
  en_garantia: boolean;
  antiguedad_texto: string;
}

export interface CatalogosActivos {
  tipos_servicio: Catalogo[];
  modos_servicio: Catalogo[];
  modalidades: Catalogo[];
  canales: Catalogo[];
  lineas_maquina: Catalogo[];
  modelos_cabezal: Catalogo[];
  motivos_espera: Catalogo[];
  repuestos: Repuesto[];
}

export type Resultado<T> = { ok: true; datos: T } | { ok: false; error: string };
