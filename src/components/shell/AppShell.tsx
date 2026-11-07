'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { leerSesionEstable, logout } from '@/lib/datos-simulados/actions';
import { menuDeRoles } from '@/lib/permisos';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppHeader } from '@/components/layout/header/AppHeader';
import { PageTitleProvider } from '@/components/layout/header/PageTitleContext';
import { AppSidebar } from '@/components/layout/sidebar/AppSidebar';

function suscribirSesion() {
  return () => {};
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sesion = useSyncExternalStore(suscribirSesion, leerSesionEstable, () => null);

  useEffect(() => {
    if (!sesion || !sesion.usuario.activo || sesion.rolesVigentes.length === 0) {
      router.replace('/login');
    }
  }, [sesion, router]);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  if (!sesion) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
      </div>
    );
  }

  const menu = menuDeRoles(sesion.rolesVigentes, sesion.empresa.permisos_consulta);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <PageTitleProvider>
          <div className="flex h-screen w-full overflow-hidden bg-background text-sm lg:text-base">
            <AppSidebar sesion={sesion} menu={menu} onLogout={handleLogout} />
            <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <AppHeader />
              <main className="min-h-0 flex-1 overflow-auto">
                <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">{children}</div>
              </main>
            </SidebarInset>
          </div>
        </PageTitleProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}
