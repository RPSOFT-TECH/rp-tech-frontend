import type { RolCodigo } from '@/lib/datos-simulados/actions';

export const PESTANAS: { id: string; label: string; roles: RolCodigo[] }[] = [
  { id: 'clientes', label: 'Clientes', roles: ['superadmin', 'gerente', 'coordinador'] },
  { id: 'catalogos', label: 'Catálogos', roles: ['superadmin', 'gerente'] },
  { id: 'parametros', label: 'Parámetros', roles: ['superadmin', 'gerente'] },
  { id: 'usuarios', label: 'Usuarios y roles', roles: ['superadmin', 'gerente'] },
  { id: 'permisos', label: 'Permisos de consulta', roles: ['superadmin'] },
];

export function pestanasVisibles(roles: readonly RolCodigo[]) {
  return PESTANAS.filter((pestana) => pestana.roles.some((rol) => roles.includes(rol)));
}
