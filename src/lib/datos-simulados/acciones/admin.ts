import { db, claves, nuevoId } from '../store';
import type { ParametrosEmpresa, Perfil, PermisosConsulta, Resultado, RolCodigo } from '../types';
import { exigirRol, fallo, ok } from './comun';
import { obtenerUsuarioActual } from './sesion';

export interface AltaUsuario {
  email: string;
  nombre_completo: string;
  telefono?: string | null;
  password?: string | null;
  roles: { codigo: RolCodigo; desde: string; hasta?: string | null }[];
}

export async function usuarios(
  entrada: AltaUsuario,
): Promise<Resultado<{ id: string; email: string; password_temporal: string | null }>> {
  const permiso = exigirRol(['superadmin', 'gerente']);
  if (permiso) return fallo(permiso);
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const email = entrada.email.toLowerCase().trim();
  if (!email || !entrada.nombre_completo.trim()) return fallo('El nombre y el correo son obligatorios.');
  if (db.perfiles.some((perfil) => perfil.email === email)) return fallo('Ya existe un usuario con ese correo.');
  if (entrada.roles.length === 0) return fallo('Asigna al menos un rol.');
  const esSuper = sesion.rolesVigentes.includes('superadmin');
  if (!esSuper && entrada.roles.some((rol) => rol.codigo === 'superadmin')) {
    return fallo('No puedes asignar el rol superadmin.');
  }
  const registros = entrada.roles.map((rol) => db.roles.find((item) => item.codigo === rol.codigo));
  if (registros.some((registro) => !registro)) return fallo('Uno de los roles no existe.');

  const perfil: Perfil = {
    id: nuevoId(2),
    empresa_id: sesion.empresa.id,
    nombre_completo: entrada.nombre_completo.trim(),
    email,
    telefono: entrada.telefono?.trim() || null,
    activo: true,
  };
  const temporal = entrada.password?.trim() ? null : `Tmp-${perfil.id.slice(-6)}`;
  claves.set(perfil.id, entrada.password?.trim() || temporal || '');
  db.perfiles.push(perfil);
  entrada.roles.forEach((rol, indice) => {
    const registro = registros[indice];
    if (!registro) return;
    db.usuario_roles.push({
      id: nuevoId(4),
      empresa_id: sesion.empresa.id,
      perfil_id: perfil.id,
      rol_id: registro.id,
      desde: rol.desde,
      hasta: rol.hasta ?? null,
      asignado_por: sesion.usuario.id,
      modificado_por: null,
    });
  });
  return ok({ id: perfil.id, email, password_temporal: temporal });
}

export async function actualizar_parametros(
  p_empresa: string,
  p_cambios: Partial<ParametrosEmpresa>,
): Promise<Resultado<ParametrosEmpresa>> {
  const permiso = exigirRol(['superadmin', 'gerente']);
  if (permiso) return fallo(permiso);
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  if (!sesion.rolesVigentes.includes('superadmin') && sesion.empresa.id !== p_empresa) {
    return fallo('No puedes cambiar los parámetros de otra empresa.');
  }
  const empresa = db.empresas.find((item) => item.id === p_empresa);
  if (!empresa) return fallo('La empresa no existe.');
  empresa.parametros = {
    ...empresa.parametros,
    ...p_cambios,
    pdf: { ...empresa.parametros.pdf, ...(p_cambios.pdf ?? {}) },
  };
  if (sesion.empresa.id === empresa.id) sesion.empresa.parametros = empresa.parametros;
  return ok(empresa.parametros);
}

export async function definir_permisos_consulta(
  p_empresa: string,
  p_permisos: PermisosConsulta,
): Promise<Resultado<PermisosConsulta>> {
  const permiso = exigirRol(['superadmin']);
  if (permiso) return fallo(permiso);
  const empresa = db.empresas.find((item) => item.id === p_empresa);
  if (!empresa) return fallo('La empresa no existe.');
  empresa.permisos_consulta = { ...p_permisos };
  return ok(empresa.permisos_consulta);
}

export function es_superadmin(): boolean {
  return obtenerUsuarioActual()?.rolesVigentes.includes('superadmin') ?? false;
}

export function empresa_actual(): string | null {
  return obtenerUsuarioActual()?.empresa.id ?? null;
}

export function tiene_rol(codigo: RolCodigo): boolean {
  return obtenerUsuarioActual()?.rolesVigentes.includes(codigo) ?? false;
}

export function es_coordinador_de(p_empresa?: string): boolean {
  const sesion = obtenerUsuarioActual();
  if (!sesion || !tiene_rol('coordinador')) return false;
  return (p_empresa ?? sesion.empresa.id) === sesion.empresa.id;
}

