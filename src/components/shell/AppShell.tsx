'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  obtenerUsuarioActual,
  logout,
  SesionUsuario,
} from '@/lib/datos-simulados/actions';
import { menuDeRoles } from '@/lib/permisos';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  function handleToggleSidebar() {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      setExpanded((prev) => !prev);
    }
  }

  if (!sesion) return null;

  const menu = menuDeRoles(sesion.rolesVigentes);

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
