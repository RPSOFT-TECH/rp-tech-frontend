import { hoyLima, sumarDias } from '../fecha';
import { db, nuevoId } from '../store';
import type { Resultado, RolCodigo } from '../types';
import { exigirRol, fallo, ok } from './comun';
import { obtenerUsuarioActual } from './sesion';

export type EstadoRol = 'vigente' | 'futuro' | 'vencido' | 'inactivo';

export interface RolUsuario {
  id: string;
  codigo: RolCodigo;
  desde: string;
  hasta: string | null;
  estado: EstadoRol;
}

export interface UsuarioAdmin {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  roles: RolUsuario[];
}

function estadoDe(activo: boolean, desde: string, hasta: string | null, hoy: string): EstadoRol {
  if (!activo) return 'inactivo';
  if (desde > hoy) return 'futuro';
  if (hasta && hasta < hoy) return 'vencido';
  return 'vigente';
}

export async function usuarios_admin(): Promise<UsuarioAdmin[]> {
  const permiso = exigirRol(['superadmin', 'gerente']);
  if (permiso) return [];
  const sesion = obtenerUsuarioActual();
  if (!sesion) return [];
  const hoy = hoyLima();
  return db.perfiles
    .filter((perfil) => sesion.rolesVigentes.includes('superadmin') || perfil.empresa_id === sesion.empresa.id)
    .filter((perfil) => perfil.empresa_id === sesion.empresa.id)
    .map((perfil) => ({
      id: perfil.id,
      nombre_completo: perfil.nombre_completo,
      email: perfil.email,
      telefono: perfil.telefono,
      activo: perfil.activo,
      roles: db.usuario_roles
        .filter((asignacion) => asignacion.perfil_id === perfil.id)
        .map((asignacion) => {
          const rol = db.roles.find((item) => item.id === asignacion.rol_id);
          const codigo = rol?.codigo ?? 'consulta';
          return {
            id: asignacion.id,
            codigo,
            desde: asignacion.desde,
            hasta: asignacion.hasta,
            estado: estadoDe(!!rol?.activo, asignacion.desde, asignacion.hasta, hoy),
          };
        }),
    }))
    .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, 'es'));
}

export function roles_asignables(): RolCodigo[] {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return [];
  const codigos = db.roles.map((rol) => rol.codigo);
  if (sesion.rolesVigentes.includes('superadmin')) return codigos;
  return codigos.filter((codigo) => codigo !== 'superadmin');
}

export async function asignar_rol(
  perfilId: string,
  codigo: RolCodigo,
  desde: string,
  hasta?: string | null,
): Promise<Resultado<true>> {
  const permiso = exigirRol(['superadmin', 'gerente']);
  if (permiso) return fallo(permiso);
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  if (!sesion.rolesVigentes.includes('superadmin') && codigo === 'superadmin') {
    return fallo('No puedes asignar el rol superadmin.');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde)) return fallo('Indica desde qué fecha aplica el rol.');
  const perfil = db.perfiles.find((item) => item.id === perfilId && item.empresa_id === sesion.empresa.id);
  if (!perfil) return fallo('El usuario no existe.');
  const rol = db.roles.find((item) => item.codigo === codigo);
  if (!rol) return fallo('El rol no existe.');
  db.usuario_roles.push({
    id: nuevoId(4),
    empresa_id: sesion.empresa.id,
    perfil_id: perfil.id,
    rol_id: rol.id,
    desde,
    hasta: hasta?.trim() || null,
    asignado_por: sesion.usuario.id,
    modificado_por: null,
  });
  return ok(true);
}

export async function quitar_rol(asignacionId: string): Promise<Resultado<true>> {
  const permiso = exigirRol(['superadmin', 'gerente']);
  if (permiso) return fallo(permiso);
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const indice = db.usuario_roles.findIndex((item) => item.id === asignacionId);
  if (indice < 0) return fallo('La asignación no existe.');
  const asignacion = db.usuario_roles[indice];
  if (asignacion.empresa_id !== sesion.empresa.id) return fallo('No puedes modificar un usuario de otra empresa.');
  const rol = db.roles.find((item) => item.id === asignacion.rol_id);
  if (rol?.codigo === 'superadmin' && !sesion.rolesVigentes.includes('superadmin')) {
    return fallo('No puedes quitar el rol superadmin.');
  }
  const hoy = hoyLima();
  if (asignacion.desde === hoy) {
    db.usuario_roles.splice(indice, 1);
    return ok(true);
  }
  asignacion.hasta = sumarDias(hoy, -1);
  asignacion.modificado_por = sesion.usuario.id;
  return ok(true);
}
