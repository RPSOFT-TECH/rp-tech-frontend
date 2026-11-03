export type {
  Caso,
  CasoLista,
  Catalogo,
  CatalogosActivos,
  Cliente,
  Contacto,
  Empresa,
  Equipo,
  EquipoVista,
  EstadoCaso,
  MiServicio,
  Perfil,
  PermisosConsulta,
  ReporteLista,
  Resultado,
  RolCodigo,
  Sede,
  SugerenciaModo,
  TecnicoLista,
  VisitaAgenda,
} from './types';

export { hoyLima } from './fecha';
export type { SesionUsuario } from './acciones/sesion';
export { guardarSesion, leerSesionEstable, login, logout, obtenerUsuarioActual } from './acciones/sesion';
export {
  buscar_clientes,
  casos_lista,
  mis_servicios,
  obtener_catalogos,
  obtener_contactos,
  obtener_equipos,
  obtener_sedes,
  reportes_lista,
  tecnicos,
} from './acciones/vistas';
export type { FiltrosCasosLista } from './acciones/vistas';
export { crear_caso, sugerir_modo_servicio } from './acciones/guardar-caso';
export type { NuevoCasoInput } from './acciones/guardar-caso';
export { agenda_tecnico, programar_visita, reprogramar_visita } from './acciones/visitas';
export { crear_cliente, crear_contacto, crear_equipo, crear_sede } from './acciones/altas';
export type { AltaCliente, AltaContacto, AltaEquipo, AltaSede } from './acciones/altas';
export {
  anular_caso,
  dentro_plazo_misma_falla,
  fue_tecnico_del_caso,
  poner_en_espera,
  reabrir_caso,
  registrar_posventa,
} from './acciones/estados';
export { cerrar_reporte, registrar_llegada, reportePdf } from './acciones/reportes';
export {
  actualizar_parametros,
  definir_permisos_consulta,
  empresa_actual,
  es_coordinador_de,
  es_superadmin,
  tiene_rol,
  usuarios,
} from './acciones/admin';
export type { AltaUsuario } from './acciones/admin';

import { reportePdf } from './acciones/reportes';
import { usuarios } from './acciones/admin';

export const funcionesServidor = {
  'reporte-pdf': reportePdf,
  usuarios,
};
