'use client';

// src/components/app-shell.tsx
// Layout privado — sidebar en PC, barra inferior en mobile.

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { obtenerUsuarioActual, logout } from '@/lib/datos-simulados/actions';
import { menuDeRol } from '@/lib/permisos';
import type { Usuario } from '@/lib/datos-simulados/usuarios';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const u = obtenerUsuarioActual();
    if (!u || !u.activo) {
      router.replace('/login');
      return;
    }
    setUsuario(u);
  }, [router]);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  // Mientras no hay usuario no renderizamos nada (el proxy ya protegió la ruta)
  if (!usuario) return null;

  const menu = menuDeRol(usuario.rol);

  function esActivo(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* ── Sidebar — solo PC ──────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-56 bg-sidebar border-r border-sidebar-border z-40">
        {/* Logo */}
        <div className="px-5 py-4">
          <span className="text-xl font-bold text-sidebar-primary tracking-tight">
            RP-TECH
          </span>
        </div>

        {/* Menú */}
        <nav className="flex-1 px-3 space-y-0.5">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                esActivo(item.href)
                  ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Usuario y logout */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <p className="text-sm text-sidebar-foreground truncate mb-2">
            {usuario.nombre_completo}
          </p>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ───────────────────────────────────── */}
      <main className="flex-1 lg:ml-56 pb-14 lg:pb-0 min-w-0 overflow-x-hidden">
        {children}
      </main>

      {/* ── Barra inferior — solo celular ─────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-14 bg-background border-t border-border flex z-40">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center text-xs font-medium transition-colors ${
              esActivo(item.href)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
