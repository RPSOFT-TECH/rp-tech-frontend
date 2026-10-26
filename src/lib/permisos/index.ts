// src/lib/permisos/index.ts
//
// Define en un solo lugar: rutas, roles, menús y pantalla de inicio.
// Cualquier cambio de acceso se hace aquí y se propaga a toda la app.

import type { Usuario } from '@/lib/datos-simulados/usuarios';

export type Rol = Usuario['rol'];

export type MenuItem = {
  label: string;
  href: string;
};

// ── Tabla de permisos ─────────────────────────────────────────────────────
// Lo que no aparece aquí queda cerrado.

const PERMISOS: { prefijo: string; roles: Rol[] }[] = [
  { prefijo: '/casos/nuevo',           roles: ['administrador', 'coordinadora'] },
  { prefijo: '/casos',                 roles: ['administrador', 'coordinadora', 'jefe_tecnico'] },
  { prefijo: '/mis-servicios',         roles: ['tecnico'] },
  { prefijo: '/administracion',        roles: ['administrador', 'coordinadora'] },
];

/** Retorna true si el rol puede entrar a la ruta dada. */
export function puedeAcceder(rol: Rol, pathname: string): boolean {
  for (const { prefijo, roles } of PERMISOS) {
    if (pathname === prefijo || pathname.startsWith(prefijo + '/')) {
      return roles.includes(rol);
    }
  }
  return false;
}

/** Ruta de inicio según el rol. */
export function pantallaInicio(rol: Rol): string {
  return rol === 'tecnico' ? '/mis-servicios' : '/casos';
}

/** Menú de navegación según el rol. */
export function menuDeRol(rol: Rol): MenuItem[] {
  switch (rol) {
    case 'administrador':
      return [
        { label: 'Casos',          href: '/casos' },
        { label: 'Nuevo caso',     href: '/casos/nuevo' },
        { label: 'Administración', href: '/administracion' },
      ];
    case 'coordinadora':
      return [
        { label: 'Casos',          href: '/casos' },
        { label: 'Nuevo caso',     href: '/casos/nuevo' },
        { label: 'Administración', href: '/administracion' },
      ];
    case 'jefe_tecnico':
      return [{ label: 'Casos', href: '/casos' }];
    case 'tecnico':
      return [{ label: 'Mis servicios', href: '/mis-servicios' }];
    default:
      return [];
  }
}

/** Rutas que requieren sesión activa. */
const RUTAS_PRIVADAS = ['/casos', '/mis-servicios', '/administracion'];

export function esRutaPrivada(pathname: string): boolean {
  return RUTAS_PRIVADAS.some(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  );
}
