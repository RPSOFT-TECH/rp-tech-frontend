'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  leerSesionEstable,
  logout,
} from '@/lib/datos-simulados/actions';
import { menuDeRoles } from '@/lib/permisos';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

function suscribirSesion() {
  return () => {};
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sesion = useSyncExternalStore(suscribirSesion, leerSesionEstable, () => null);
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!sesion || !sesion.usuario.activo || sesion.rolesVigentes.length === 0) {
      router.replace('/login');
    }
  }, [sesion, router]);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  function handleToggleSidebar() {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      setExpanded((prev) => !prev);
    }
  }

  if (!sesion) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    );
  }

  const menu = menuDeRoles(sesion.rolesVigentes, sesion.empresa.permisos_consulta);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Sidebar
        expanded={expanded}
        mobileOpen={mobileOpen}
        sesion={sesion}
        menu={menu}
        onNavigate={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          expanded ? 'lg:pl-60' : 'lg:pl-18'
        }`}
      >
        <Header
          expanded={expanded}
          onToggleSidebar={handleToggleSidebar}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
