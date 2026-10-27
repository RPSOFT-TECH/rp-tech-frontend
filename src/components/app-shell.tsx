'use client';

// src/components/app-shell.tsx

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { obtenerUsuarioActual, logout, SesionUsuario } from '@/lib/datos-simulados/actions';
import { menuDeRoles } from '@/lib/permisos';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);

  useEffect(() => {
    const s = obtenerUsuarioActual();
    if (!s || !s.usuario.activo || s.rolesVigentes.length === 0) {
      router.replace('/login');
      return;
    }
    setSesion(s);
  }, [router]);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  if (!sesion) return null;

  const menu = menuDeRoles(sesion.rolesVigentes);

  function esActivo(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* ── Sidebar — solo PC ──────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 bg-sidebar border-r border-sidebar-border z-40">
        {/* Encabezado: RP-TECH + Empresa */}
        <div className="px-5 py-4 border-b border-sidebar-border/60">
          <span className="text-xl font-bold text-sidebar-primary tracking-tight block">
            RP-TECH
          </span>
          <span className="text-xs font-medium text-muted-foreground truncate block mt-0.5">
            {sesion.empresa.nombre}
          </span>
        </div>

        {/* Menú según la suma de roles vigentes */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
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

        {/* Usuario, roles y logout */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {sesion.usuario.nombre_completo}
          </p>
          <p className="text-xs text-muted-foreground truncate capitalize mb-2">
            {sesion.rolesVigentes.join(', ')}
          </p>
          <button
            onClick={handleLogout}
            className="text-xs text-destructive hover:underline transition-colors font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ───────────────────────────────────── */}
      <main className="flex-1 lg:ml-60 pb-14 lg:pb-0 min-w-0 overflow-x-hidden">
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
                ? 'text-primary font-semibold'
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
