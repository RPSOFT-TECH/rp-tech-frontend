export type RolCodigo =
  | 'superadmin'
  | 'gerente'
  | 'coordinador'
  | 'tecnico'
  | 'consulta'
  | 'ventas';

export type EstadoCaso =
  | 'por_programar'
  | 'programado'
  | 'en_atencion'
  | 'en_espera'
  | 'atendido'
  | 'cerrado'
  | 'anulado';

export type ResultadoReporte = 'resuelto' | 'pendiente';
export type TipoRepuesto = 'venta' | 'descarte' | 'garantia';
export type TipoAdjunto = 'foto_ingreso' | 'foto_salida' | 'otro';
export type ResultadoPosventa = 'conforme' | 'no_conforme';
export type CabezalCantidad = 1 | 2 | 3 | 4 | 6 | 8;

export interface PdfEmpresa {
  logo: string | null;
  direccion: string;
  telefonos: string[];
  correos: string[];
  redes: string[];
  // Logos de marcas para el encabezado del PDF: [izquierda, derecha].
  marcas?: (string | null)[];
  // Color de acento del PDF en hexadecimal (#8a3d8f).
  color?: string | null;
}

export interface ParametrosEmpresa {
  formato_caso: string;
  formato_reporte: string;
  garantia_meses: number;
  plazo_misma_falla_horas: number;
  tarifa_no_cubierta: string;
  texto_conformidad: string;
  texto_legal: string;
  envio_correo: boolean;
  envio_whatsapp: boolean;
  pdf: PdfEmpresa;
}

export interface PermisosConsulta {
  casos: boolean;
  reportes: boolean;
  clientes: boolean;
}

export interface Empresa {
  id: string;
  nombre: string;
  ruc: string;
  activo: boolean;
  parametros: ParametrosEmpresa;
  permisos_consulta: PermisosConsulta;
}

export interface RolRegistro {
  id: string;
  codigo: RolCodigo;
  activo: boolean;
}

export interface Perfil {
  id: string;
  empresa_id: string;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  activo: boolean;
}

export interface UsuarioRol {
  id: string;
  empresa_id: string;
  perfil_id: string;
  rol_id: string;
  desde: string;
  hasta: string | null;
  asignado_por: string | null;
  modificado_por: string | null;
}

export interface Cliente {
  id: string;
  empresa_id: string;
  razon_social: string;
  ruc: string | null;
  telefono: string | null;
  email: string | null;
  soporte_vigente: boolean;
  soporte_verificado_en: string | null;
  soporte_verificado_por: string | null;
  activo: boolean;
}

export interface Contacto {
  id: string;
  cliente_id: string;
  nombre: string;
  cargo: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
}

export interface Sede {
  id: string;
  cliente_id: string;
  nombre: string;
  direccion: string;
  distrito: string;
  referencia: string | null;
  principal: boolean;
  activo: boolean;
}

export interface Equipo {
  id: string;
  cliente_id: string;
  sede_id: string;
  linea_id: string;
  modelo: string;
  numero_serie: string;
  cabezal_modelo_id: string;
  cabezal_cantidad: CabezalCantidad;
  fecha_instalacion: string;
  activo: boolean;
}

export interface EquipoVista extends Equipo {
  linea_nombre: string;
  cabezal_nombre: string;
}

export interface Caso {
  id: string;
  empresa_id: string;
  numero: string;
  canal_id: string;
  cliente_id: string;
  sede_id: string;
  contacto_id: string;
  telefono: string;
  equipo_id: string;
  incidencia: string;
  tipo_servicio_id: string;
  modalidad_id: string;
  modo_sugerido_id: string | null;
  modo_servicio_id: string;
  motivo_cambio_modo: string | null;
  estado: EstadoCaso;
  motivo_espera_id: string | null;
  caso_origen_id: string | null;
  reaperturas: number;
  creado_por: string;
  cerrado_por: string | null;
  cerrado_en: string | null;
  anulado_por: string | null;
  anulado_en: string | null;
  motivo_anulacion: string | null;
  creado_en: string;
}

export interface Reporte {
  id: string;
  caso_id: string;
  numero_visita: number;
  numero: string | null;
  numero_fisico: string | null;
  tecnico_id: string;
  tecnico_adjunto_id: string | null;
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
}

export interface ReporteRepuesto {
  id: string;
  reporte_id: string;
  repuesto_id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  tipo: TipoRepuesto;
}

export interface Adjunto {
  id: string;
  reporte_id: string;
  tipo: TipoAdjunto;
  ruta: string;
  nombre_archivo: string;
  tipo_mime: string;
  subido_por: string;
}

export interface Nota {
  id: string;
  reporte_id: string;
  autor_id: string;
  texto: string;
  creado_en: string;
}

export interface Posventa {
  id: string;
  caso_id: string;
  realizado_por: string;
  fecha: string;
  resultado: ResultadoPosventa;
  comentario: string | null;
}

export interface HistorialEstado {
  id: string;
  caso_id: string;
  estado_anterior: EstadoCaso | null;
  estado_nuevo: EstadoCaso;
  usuario_id: string;
  motivo: string | null;
  fecha: string;
}

export interface EnvioReporte {
  id: string;
  reporte_id: string;
  canal: 'correo' | 'whatsapp';
  destino: string;
  estado: 'enviado' | 'omitido';
  detalle: string | null;
  enviado_por: string;
}

export interface Catalogo {
  id: string;
  empresa_id: string;
  nombre: string;
  orden: number;
  activo: boolean;
  
  remota?: boolean;
}

export interface Repuesto {
  id: string;
  empresa_id: string;
  codigo: string;
  descripcion: string;
  consumible: boolean;
  orden: number;
  activo: boolean;
}

export type {
  CasoLista,
  CatalogosActivos,
  MiServicio,
  ReporteLista,
  Resultado,
  SugerenciaModo,
  TecnicoLista,
  VisitaAgenda,
} from './tipos-vista';