// src/proxy.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Rol = 'superadmin' | 'gerente' | 'coordinador' | 'tecnico' | 'consulta' | 'ventas';

interface SesionPayload {
  usuario: { id: number; email: string; activo: boolean };
  empresa: { id: number; nombre: string };
  rolesVigentes: Rol[];
}

const PERMISOS: { prefijo: string; roles: Rol[] }[] = [
  { prefijo: '/casos/nuevo',    roles: ['superadmin', 'coordinador'] },
  { prefijo: '/casos',          roles: ['superadmin', 'gerente', 'coordinador', 'consulta'] },
  { prefijo: '/mis-servicios',  roles: ['tecnico'] },
  { prefijo: '/administracion', roles: ['superadmin', 'gerente'] },
];

function puedeAcceder(roles: Rol[], pathname: string): boolean {
  for (const { prefijo, roles: permitidos } of PERMISOS) {
    if (pathname === prefijo || pathname.startsWith(prefijo + '/')) {
      return roles.some((r) => permitidos.includes(r));
    }
  }
  return false;
}

function pantallaInicio(roles: Rol[]): string {
  if (roles.length === 1 && roles[0] === 'tecnico') {
    return '/mis-servicios';
  }
  return '/casos';
}

const RUTAS_PRIVADAS = ['/casos', '/mis-servicios', '/administracion'];

function esRutaPrivada(pathname: string): boolean {
  return RUTAS_PRIVADAS.some((r) => pathname === r || pathname.startsWith(r + '/'));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Raíz → login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let sesion: SesionPayload | null = null;
  const cookie = request.cookies.get('rptech_session');
  if (cookie?.value) {
    try {
      sesion = JSON.parse(decodeURIComponent(cookie.value)) as SesionPayload;
    } catch {
      sesion = null;
    }
  }

  // Redireccionar si ya tiene sesión con roles vigentes
  if (pathname === '/login' && sesion && sesion.rolesVigentes.length > 0) {
    return NextResponse.redirect(new URL(pantallaInicio(sesion.rolesVigentes), request.url));
  }

  // Protección de rutas privadas
  if (esRutaPrivada(pathname)) {
    if (!sesion || !sesion.usuario.activo || sesion.rolesVigentes.length === 0) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!puedeAcceder(sesion.rolesVigentes, pathname)) {
      return NextResponse.redirect(new URL(pantallaInicio(sesion.rolesVigentes), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
