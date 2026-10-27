// src/lib/permisos/index.ts

import type { Rol } from '@/lib/datos-simulados/usuarios';

export interface MenuItem {
  label: string;
  href: string;
}

const PERMISOS: { prefijo: string; roles: Rol[] }[] = [
  { prefijo: '/casos/nuevo',    roles: ['superadmin', 'coordinador'] },
  { prefijo: '/casos',          roles: ['superadmin', 'gerente', 'coordinador', 'consulta'] },
  { prefijo: '/mis-servicios',  roles: ['tecnico'] },
  { prefijo: '/administracion', roles: ['superadmin', 'gerente'] },
];

/**
 * Retorna true si al menos uno de los roles vigentes del usuario puede entrar a la ruta.
 */
export function puedeAcceder(rolesVigentes: Rol[], pathname: string): boolean {
  for (const { prefijo, roles } of PERMISOS) {
    if (pathname === prefijo || pathname.startsWith(prefijo + '/')) {
      return rolesVigentes.some((r) => roles.includes(r));
    }
  }
  return false;
}

/**
 * Pantalla de inicio: si solo tiene rol técnico → Mis servicios; en otro caso → Casos.
 */
export function pantallaInicio(rolesVigentes: Rol[]): string {
  if (rolesVigentes.length === 1 && rolesVigentes[0] === 'tecnico') {
    return '/mis-servicios';
  }
  return '/casos';
}

/**
 * Menú: la suma de las opciones de todos sus roles vigentes (sin duplicados).
 */
export function menuDeRoles(rolesVigentes: Rol[]): MenuItem[] {
  const itemsMap = new Map<string, MenuItem>();

  rolesVigentes.forEach((rol) => {
    switch (rol) {
      case 'superadmin':
        itemsMap.set('/casos', { label: 'Casos', href: '/casos' });
        itemsMap.set('/casos/nuevo', { label: 'Nuevo caso', href: '/casos/nuevo' });
        itemsMap.set('/administracion', { label: 'Administración', href: '/administracion' });
        break;
      case 'gerente':
        itemsMap.set('/casos', { label: 'Casos', href: '/casos' });
        itemsMap.set('/administracion', { label: 'Administración', href: '/administracion' });
        break;
      case 'coordinador':
        itemsMap.set('/casos', { label: 'Casos', href: '/casos' });
        itemsMap.set('/casos/nuevo', { label: 'Nuevo caso', href: '/casos/nuevo' });
        break;
      case 'consulta':
        itemsMap.set('/casos', { label: 'Casos', href: '/casos' });
        break;
      case 'tecnico':
        itemsMap.set('/mis-servicios', { label: 'Mis servicios', href: '/mis-servicios' });
        break;
    }
  });

  return Array.from(itemsMap.values());
}

const RUTAS_PRIVADAS = ['/casos', '/mis-servicios', '/administracion'];

export function esRutaPrivada(pathname: string): boolean {
  return RUTAS_PRIVADAS.some((r) => pathname === r || pathname.startsWith(r + '/'));
}
