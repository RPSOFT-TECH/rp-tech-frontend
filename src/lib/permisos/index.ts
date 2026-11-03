import type { PermisosConsulta, RolCodigo } from '@/lib/datos-simulados/types';

export interface MenuItem {
  label: string;
  href: string;
}

const OFICINA: RolCodigo[] = ['superadmin', 'gerente', 'coordinador'];

const PERMISOS: { prefijo: string; roles: RolCodigo[] }[] = [
  { prefijo: '/casos/nuevo', roles: ['superadmin', 'coordinador'] },
  { prefijo: '/casos', roles: ['superadmin', 'gerente', 'coordinador', 'consulta'] },
  { prefijo: '/mis-servicios', roles: ['tecnico'] },
  { prefijo: '/administracion', roles: ['superadmin', 'gerente', 'coordinador'] },
  { prefijo: '/agenda', roles: [...OFICINA] },
];

export function puedeAcceder(
  rolesVigentes: RolCodigo[],
  pathname: string,
  permisos: PermisosConsulta = { casos: false, reportes: false, clientes: false },
): boolean {
  for (const { prefijo, roles } of PERMISOS) {
    if (pathname === prefijo || pathname.startsWith(`${prefijo}/`)) {
      const concedidos = rolesVigentes.filter((rol) => roles.includes(rol));
      if (concedidos.length === 0) return false;
      if (concedidos.every((rol) => rol === 'consulta')) {
        if (prefijo === '/casos') return permisos.casos;
        return false;
      }
      return true;
    }
  }
  return false;
}

export function pantallaInicio(
  rolesVigentes: RolCodigo[],
  permisos: PermisosConsulta = { casos: false, reportes: false, clientes: false },
): string {
  if (rolesVigentes.length === 1 && rolesVigentes[0] === 'tecnico') return '/mis-servicios';
  if (puedeAcceder(rolesVigentes, '/casos', permisos)) return '/casos';
  if (puedeAcceder(rolesVigentes, '/administracion', permisos)) return '/administracion';
  if (puedeAcceder(rolesVigentes, '/agenda', permisos)) return '/agenda';
  return '/sin-acceso';
}

export function menuDeRoles(
  rolesVigentes: RolCodigo[],
  permisos: PermisosConsulta = { casos: false, reportes: false, clientes: false },
): MenuItem[] {
  const items: MenuItem[] = [];
  const agregar = (href: string, label: string) => {
    if (!items.some((item) => item.href === href) && puedeAcceder(rolesVigentes, href, permisos)) {
      items.push({ href, label });
    }
  };
  agregar('/casos', 'Casos');
  agregar('/casos/nuevo', 'Nuevo caso');
  agregar('/agenda', 'Agenda');
  agregar('/mis-servicios', 'Mis servicios');
  agregar('/administracion', 'Administración');
  return items;
}
