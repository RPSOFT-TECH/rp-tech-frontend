import { uid } from '../ids';
import { hoyLima, inicioDeMes, sumarDias, sumarMeses } from '../fecha';
import type { Empresa, Perfil, RolRegistro, UsuarioRol } from '../types';
import { CLAVE_PRUEBA, ID, parametrosIniciales } from './referencias';

export function sembrarOrganizacion() {
  const hoy = hoyLima();
  const inicioMes = inicioDeMes(hoy);
  const ayer = sumarDias(hoy, -1);
  const inicioAnterior = inicioDeMes(sumarMeses(inicioMes, -1));

  const empresas: Empresa[] = [
    {
      id: ID.empRp,
      nombre: 'RP Tech Demo',
      ruc: '20601001001',
      activo: true,
      parametros: parametrosIniciales('Lima'),
      permisos_consulta: { casos: true, reportes: true, clientes: false },
    },
    {
      id: ID.empOtra,
      nombre: 'Otra Empresa Demo',
      ruc: '20602002002',
      activo: true,
      parametros: parametrosIniciales('Arequipa'),
      permisos_consulta: { casos: true, reportes: false, clientes: false },
    },
  ];

  const roles: RolRegistro[] = [
    { id: ID.rolSuper, codigo: 'superadmin', activo: true },
    { id: ID.rolGerente, codigo: 'gerente', activo: true },
    { id: ID.rolCoord, codigo: 'coordinador', activo: true },
    { id: ID.rolTec, codigo: 'tecnico', activo: true },
    { id: ID.rolConsulta, codigo: 'consulta', activo: true },
    { id: ID.rolVentas, codigo: 'ventas', activo: false },
  ];

  const perfiles: Perfil[] = [
    perfil(ID.pSuper, ID.empRp, 'Superadmin', 'superadmin@rptech.test', '999000001'),
    perfil(ID.pGerente, ID.empRp, 'Gerente General', 'gerente@rptech.test', '999000002'),
    perfil(ID.pCoord, ID.empRp, 'Coordinador del mes', 'coordinador@rptech.test', '999000003'),
    perfil(ID.pCoordAnt, ID.empRp, 'Coordinador anterior', 'coordinador.anterior@rptech.test', '999000004'),
    perfil(ID.pTec1, ID.empRp, 'Técnico 1', 'tecnico1@rptech.test', '999000005'),
    perfil(ID.pTec2, ID.empRp, 'Técnico 2', 'tecnico2@rptech.test', '999000006'),
    perfil(ID.pConsulta, ID.empRp, 'Usuario Consulta', 'consulta@rptech.test', '999000007'),
    perfil(ID.pVentas, ID.empRp, 'Usuario Ventas', 'ventas@rptech.test', '999000008'),
    perfil(ID.pCoordOtra, ID.empOtra, 'Coordinador Otra Empresa', 'coordinador@otra.test', '999000009'),
  ];

  const usuario_roles: UsuarioRol[] = [
    asignacion(1, ID.empRp, ID.pSuper, ID.rolSuper, '2025-01-01', null),
    asignacion(2, ID.empRp, ID.pGerente, ID.rolGerente, '2025-01-01', null),
    asignacion(3, ID.empRp, ID.pCoord, ID.rolCoord, inicioMes, null),
    asignacion(4, ID.empRp, ID.pCoordAnt, ID.rolCoord, inicioAnterior, ayer),
    asignacion(5, ID.empRp, ID.pTec1, ID.rolTec, '2025-01-01', null),
    asignacion(6, ID.empRp, ID.pTec2, ID.rolTec, '2025-01-01', null),
    asignacion(7, ID.empRp, ID.pConsulta, ID.rolConsulta, '2025-01-01', null),
    asignacion(8, ID.empRp, ID.pVentas, ID.rolVentas, '2025-01-01', null),
    asignacion(9, ID.empOtra, ID.pCoordOtra, ID.rolCoord, '2025-01-01', null),
  ];

  const claves = new Map<string, string>(perfiles.map((p) => [p.id, CLAVE_PRUEBA]));

  return { empresas, roles, perfiles, usuario_roles, claves };
}

function perfil(
  id: string,
  empresa_id: string,
  nombre_completo: string,
  email: string,
  telefono: string,
): Perfil {
  return { id, empresa_id, nombre_completo, email, telefono, activo: true };
}

function asignacion(
  n: number,
  empresa_id: string,
  perfil_id: string,
  rol_id: string,
  desde: string,
  hasta: string | null,
): UsuarioRol {
  return {
    id: uid(4, n),
    empresa_id,
    perfil_id,
    rol_id,
    desde,
    hasta,
    asignado_por: ID.pSuper,
    modificado_por: null,
  };
}
