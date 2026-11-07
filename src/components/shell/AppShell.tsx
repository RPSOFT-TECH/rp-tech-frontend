'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { guardarAviso } from '@/components/avisos-sonner';
import { leerSesionEstable, limpiarSesion, suscribirSesion, type SesionUsuario } from '@/lib/datos-simulados/actions';
import { menuDeRoles } from '@/lib/permisos';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/header/AppHeader';
import { PageTitleProvider } from '@/components/layout/header/PageTitleContext';
import { AppSidebar } from '@/components/layout/sidebar/AppSidebar';

function sesionVigente(sesion: SesionUsuario | null): sesion is SesionUsuario {
  return !!sesion && sesion.usuario.activo && sesion.rolesVigentes.length > 0;
}

function salirALogin(): void {
  if (sesionVigente(leerSesionEstable())) return;
  if (window.location.pathname === '/login') return;
  limpiarSesion();
  window.location.replace('/login?salida=1');
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const sesion = useSyncExternalStore(suscribirSesion, leerSesionEstable, () => null);
  const listo = useRef(false);

  useEffect(() => {
    listo.current = true;
    salirALogin();
  }, []);

  useEffect(() => {
    if (!listo.current) return;
    salirALogin();
  }, [sesion]);

  function handleLogout() {
    guardarAviso({ variant: 'info', title: 'Sesión cerrada' });
    limpiarSesion();
    window.location.replace('/login?salida=1');
  }

  if (!sesionVigente(sesion)) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="w-full flex-1 px-4 py-4 sm:px-6 sm:py-5">{children}</main>
      </div>
    );
  }

  const menu = menuDeRoles(sesion.rolesVigentes, sesion.empresa.permisos_consulta);

  return (
    <SidebarProvider>
      <PageTitleProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background text-sm lg:text-base">
          <AppSidebar sesion={sesion} menu={menu} onLogout={handleLogout} />
          <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <AppHeader />
            <main className="min-h-0 flex-1 overflow-auto">
              <div className="w-full px-4 py-4 sm:px-6 sm:py-5">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </PageTitleProvider>
    </SidebarProvider>
  );
}
