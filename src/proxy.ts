import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy de routing básico.
 *
 * Por ahora solo redirige la raíz "/" a "/login".
 * En Tarea 2 se amplía con protección de rutas y verificación de sesión.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirigir la raíz al login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Aplica a todas las rutas excepto assets estáticos y rutas internas de Next.js
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
