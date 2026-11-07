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

export { hoyLima, sumarDias } from './fecha';
export type { SesionUsuario } from './acciones/sesion';
export { guardarSesion, leerSesionEstable, limpiarSesion, login, logout, obtenerUsuarioActual, suscribirSesion } from './acciones/sesion';
export {
  buscar_clientes,
  casos_lista,
  obtener_caso_detalle,
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
export {
  actualizar_desarrollo,
  actualizar_revision_inicial,
  agregar_adjunto,
  agregar_nota,
  agregar_repuesto,
  cerrar_reporte,
  guardar_firmas,
  obtener_reporte,
  faltantes_cierre,
  es_visita_remota,
  quitar_adjunto,
  quitar_repuesto,
  registrar_llegada,
  reportePdf,
} from './acciones/reportes';
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
export { empresas_permisos, parametros_actuales } from './acciones/admin';
export type { EmpresaPermisos } from './acciones/admin';
export {
  clientes_admin,
  clientes_lista,
  ficha_cliente,
  guardar_cliente,
  guardar_contacto,
  guardar_equipo,
  guardar_sede,
} from './acciones/admin-clientes';
export type { ClienteAdmin, ClienteLista, FichaCliente } from './acciones/admin-clientes';
export type { CasoDetalle } from './tipos-vista';
export { asignar_rol, quitar_rol, roles_asignables, usuarios_admin } from './acciones/admin-usuarios';
export type { EstadoRol, RolUsuario, UsuarioAdmin } from './acciones/admin-usuarios';
export {
  cambiar_activo_catalogo,
  CODIGOS_CATALOGO,
  crear_valor_catalogo,
  listar_catalogo,
  mover_catalogo,
  renombrar_catalogo,
} from './acciones/admin-catalogos';
export type { CodigoCatalogo, ItemCatalogo } from './acciones/admin-catalogos';

import { reportePdf } from './acciones/reportes';
import { usuarios } from './acciones/admin';

export const funcionesServidor = {
  'reporte-pdf': reportePdf,
  usuarios,
};
