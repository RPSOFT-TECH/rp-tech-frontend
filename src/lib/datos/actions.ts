// Capa de datos real (Supabase). Mismos nombres y formas que lib/datos-simulados/actions,
// para que las pantallas no cambien. Las reglas las vuelve a validar la base.
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
} from '../datos-simulados/types';
export type { CasoDetalle } from '../datos-simulados/tipos-vista';

export { hoyLima, sumarDias } from '../datos-simulados/fecha';
export type { SesionUsuario } from './sesion';
export { guardarSesion, leerSesionEstable, login, logout, obtenerUsuarioActual, refrescarSesion, limpiarSesion, suscribirSesion } from './sesion';
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
} from './vistas';
export type { FiltrosCasosLista } from './vistas';
export {
  crear_caso,
  sugerir_modo_servicio,
  agenda_tecnico,
  programar_visita,
  reprogramar_visita,
  anular_caso,
  dentro_plazo_misma_falla,
  fue_tecnico_del_caso,
  poner_en_espera,
  reabrir_caso,
  registrar_posventa,
} from './casos';
export type { NuevoCasoInput } from './casos';
export {
  crear_cliente,
  crear_contacto,
  crear_equipo,
  crear_sede,
  clientes_admin,
  clientes_lista,
  ficha_cliente,
  guardar_cliente,
  guardar_contacto,
  guardar_equipo,
  guardar_sede,
} from './clientes';
export type { AltaCliente, AltaContacto, AltaEquipo, AltaSede, ClienteAdmin, ClienteLista, FichaCliente } from './clientes';
export {
  actualizar_desarrollo,
  actualizar_revision_inicial,
  agregar_adjunto,
  agregar_nota,
  agregar_repuesto,
  cerrar_reporte,
  enlace_pdf,
  faltantes_cierre,
  guardar_firmas,
  obtener_reporte,
  quitar_adjunto,
  quitar_repuesto,
  registrar_llegada,
  reportePdf,
} from './reportes';
export {
  actualizar_parametros,
  asignar_rol,
  cambiar_activo_catalogo,
  CODIGOS_CATALOGO,
  crear_valor_catalogo,
  definir_permisos_consulta,
  empresa_actual,
  empresas_permisos,
  es_coordinador_de,
  es_superadmin,
  listar_catalogo,
  mover_catalogo,
  parametros_actuales,
  quitar_rol,
  renombrar_catalogo,
  roles_asignables,
  tiene_rol,
  usuarios,
  usuarios_admin,
} from './admin';
export type { AltaUsuario, CodigoCatalogo, EmpresaPermisos, EstadoRol, ItemCatalogo, RolUsuario, UsuarioAdmin } from './admin';

import { reportePdf } from './reportes';
import { usuarios } from './admin';

export const funcionesServidor = {
  'reporte-pdf': reportePdf,
  usuarios,
};
