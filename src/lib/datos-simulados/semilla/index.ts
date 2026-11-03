import type {
  Adjunto,
  Caso,
  Catalogo,
  Cliente,
  Contacto,
  Empresa,
  EnvioReporte,
  Equipo,
  HistorialEstado,
  Nota,
  Perfil,
  Posventa,
  Reporte,
  ReporteRepuesto,
  Repuesto,
  RolRegistro,
  Sede,
  UsuarioRol,
} from '../types';
import { sembrarCatalogos } from './catalogos';
import { sembrarClientes } from './clientes';
import { sembrarOperacion } from './operacion';
import { sembrarOrganizacion } from './organizacion';
import { ID } from './referencias';

export interface Db {
  empresas: Empresa[];
  roles: RolRegistro[];
  perfiles: Perfil[];
  usuario_roles: UsuarioRol[];
  clientes: Cliente[];
  contactos: Contacto[];
  sedes: Sede[];
  equipos: Equipo[];
  casos: Caso[];
  reportes: Reporte[];
  reporte_repuestos: ReporteRepuesto[];
  adjuntos: Adjunto[];
  notas: Nota[];
  posventas: Posventa[];
  historial_estados: HistorialEstado[];
  envios_reporte: EnvioReporte[];
  tipos_servicio: Catalogo[];
  modos_servicio: Catalogo[];
  modalidades: Catalogo[];
  canales: Catalogo[];
  lineas_maquina: Catalogo[];
  modelos_cabezal: Catalogo[];
  motivos_espera: Catalogo[];
  repuestos: Repuesto[];
}

export function crearDb(): { db: Db; claves: Map<string, string> } {
  const org = sembrarOrganizacion();
  const catRp = sembrarCatalogos(ID.empRp, 1);
  const catOtra = sembrarCatalogos(ID.empOtra, 2);
  const maestro = sembrarClientes();
  const operacion = sembrarOperacion();
  const unir = <T>(a: T[], b: T[]) => [...a, ...b];

  return {
    claves: org.claves,
    db: {
      empresas: org.empresas,
      roles: org.roles,
      perfiles: org.perfiles,
      usuario_roles: org.usuario_roles,
      clientes: maestro.clientes,
      contactos: maestro.contactos,
      sedes: maestro.sedes,
      equipos: maestro.equipos,
      casos: operacion.casos,
      reportes: operacion.reportes,
      reporte_repuestos: operacion.reporte_repuestos,
      adjuntos: operacion.adjuntos,
      notas: operacion.notas,
      posventas: operacion.posventas,
      historial_estados: operacion.historial_estados,
      envios_reporte: operacion.envios_reporte,
      tipos_servicio: unir(catRp.tipos_servicio, catOtra.tipos_servicio),
      modos_servicio: unir(catRp.modos_servicio, catOtra.modos_servicio),
      modalidades: unir(catRp.modalidades, catOtra.modalidades),
      canales: unir(catRp.canales, catOtra.canales),
      lineas_maquina: unir(catRp.lineas_maquina, catOtra.lineas_maquina),
      modelos_cabezal: unir(catRp.modelos_cabezal, catOtra.modelos_cabezal),
      motivos_espera: unir(catRp.motivos_espera, catOtra.motivos_espera),
      repuestos: unir(catRp.repuestos, catOtra.repuestos),
    },
  };
}
