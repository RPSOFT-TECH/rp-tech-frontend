import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { puedeAcceder, pantallaInicio } from '@/lib/permisos';
import type { PermisosConsulta, RolCodigo } from '@/lib/datos-simulados/types';

interface SesionPayload {
  usuario: { id: string; email: string; activo: boolean };
  empresa: { id: string; nombre: string; permisos_consulta?: PermisosConsulta };
  rolesVigentes: RolCodigo[];
}

const RUTAS_PRIVADAS = ['/casos', '/mis-servicios', '/administracion', '/agenda'];

function esRutaPrivada(pathname: string): boolean {
  return RUTAS_PRIVADAS.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}

function permisosDe(sesion: SesionPayload): PermisosConsulta {
  return sesion.empresa.permisos_consulta ?? { casos: false, reportes: false, clientes: false };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/') return NextResponse.redirect(new URL('/login', request.url));

  let sesion: SesionPayload | null = null;
  const cookie = request.cookies.get('rptech_session');
  if (cookie?.value) {
    try {
      sesion = JSON.parse(decodeURIComponent(cookie.value)) as SesionPayload;
    } catch {
      sesion = null;
    }
  }

  if (pathname === '/login' && sesion && sesion.rolesVigentes.length > 0) {
    return NextResponse.redirect(new URL(pantallaInicio(sesion.rolesVigentes, permisosDe(sesion)), request.url));
  }

  if (esRutaPrivada(pathname)) {
    if (!sesion || !sesion.usuario.activo) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (sesion.rolesVigentes.length === 0) {
      return NextResponse.redirect(new URL('/sin-acceso', request.url));
    }
    if (!puedeAcceder(sesion.rolesVigentes, pathname, permisosDe(sesion))) {
      return NextResponse.redirect(new URL(pantallaInicio(sesion.rolesVigentes, permisosDe(sesion)), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
