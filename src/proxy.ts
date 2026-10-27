// src/proxy.ts
//
// Proxy de routing — se ejecuta antes de cada request.
// Tarea 2: protección de rutas por sesión y rol.
// La cookie "rptech_session" contiene el JSON del usuario logueado.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Tipos mínimos (no importamos datos-simulados en el proxy) ─────────────

type Rol = 'administrador' | 'coordinadora' | 'jefe_tecnico' | 'tecnico' | 'ventas';

interface UsuarioSesion {
  rol: Rol;
  activo: boolean;
}

// ── Lógica de permisos (duplicada aquí para que el proxy sea autónomo) ────

const PERMISOS: { prefijo: string; roles: Rol[] }[] = [
  { prefijo: '/casos/nuevo',   roles: ['administrador', 'coordinadora'] },
  { prefijo: '/casos',         roles: ['administrador', 'coordinadora', 'jefe_tecnico'] },
  { prefijo: '/mis-servicios', roles: ['tecnico'] },
  { prefijo: '/administracion',roles: ['administrador', 'coordinadora'] },
];

function puedeAcceder(rol: Rol, pathname: string): boolean {
  for (const { prefijo, roles } of PERMISOS) {
    if (pathname === prefijo || pathname.startsWith(prefijo + '/')) {
      return roles.includes(rol);
    }
  }
  return false;
}

function pantallaInicio(rol: Rol): string {
  return rol === 'tecnico' ? '/mis-servicios' : '/casos';
}

const RUTAS_PRIVADAS = ['/casos', '/mis-servicios', '/administracion'];

function esRutaPrivada(pathname: string): boolean {
  return RUTAS_PRIVADAS.some(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  );
}

// ── Proxy ─────────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Raíz → login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Leer sesión desde cookie
  let usuario: UsuarioSesion | null = null;
  const cookie = request.cookies.get('rptech_session');
  if (cookie?.value) {
    try {
      usuario = JSON.parse(cookie.value) as UsuarioSesion;
    } catch {
      usuario = null;
    }
  }

  // Si ya tiene sesión y va al login → su pantalla de inicio
  if (pathname === '/login' && usuario?.activo) {
    return NextResponse.redirect(
      new URL(pantallaInicio(usuario.rol), request.url),
    );
  }

  // Rutas privadas
  if (esRutaPrivada(pathname)) {
    // Sin sesión → login
    if (!usuario) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Sin permiso → pantalla de inicio del rol
    if (!puedeAcceder(usuario.rol, pathname)) {
      return NextResponse.redirect(
        new URL(pantallaInicio(usuario.rol), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
