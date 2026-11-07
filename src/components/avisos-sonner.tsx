'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { toast as sonnerToast } from 'sonner';

const CLAVE = 'rptech_aviso';
const DURACION = 3500;

type Variante = 'success' | 'info' | 'error' | 'warning';

interface Aviso {
  variant: Variante;
  title: string;
  description?: string;
}

function pintar(aviso: Aviso): void {
  sonnerToast[aviso.variant](aviso.title, {
    description: aviso.description,
    duration: DURACION,
  });
}

function leerAviso(raw: string): Aviso | null {
  if (raw === 'sesion-cerrada') return { variant: 'info', title: 'Sesión cerrada' };
  try {
    const aviso = JSON.parse(raw) as Aviso;
    if (!aviso.title || !aviso.variant) return null;
    return aviso;
  } catch {
    return null;
  }
}

export function guardarAviso(aviso: Aviso, mostrarYa = false): void {
  sessionStorage.setItem(CLAVE, JSON.stringify(aviso));
  if (mostrarYa) pintar(aviso);
}

export function ConsumirAvisos() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.pathname === '/login' && new URLSearchParams(window.location.search).get('salida') === '1') {
      document.cookie = 'rptech_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
      window.history.replaceState(null, '', '/login');
    }
    const raw = sessionStorage.getItem(CLAVE);
    if (!raw) return;
    const aviso = leerAviso(raw);
    sessionStorage.removeItem(CLAVE);
    if (!aviso) return;
    const visible = [...document.querySelectorAll('[data-sonner-toast]')].some((nodo) =>
      (nodo.textContent || '').includes(aviso.title),
    );
    if (visible) return;
    pintar(aviso);
  }, [pathname]);

  return null;
}
