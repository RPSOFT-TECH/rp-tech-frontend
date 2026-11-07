'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageTitleState {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
}

interface PageTitleContextValue extends PageTitleState {
  setPageTitle: (state: PageTitleState) => void;
}

let tituloActual: PageTitleState = {};
const oyentes = new Set<() => void>();

function publicar(next: PageTitleState) {
  tituloActual = next;
  oyentes.forEach((oyente) => oyente());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function usePageTitle(): PageTitleContextValue {
  const state = React.useSyncExternalStore(suscribir, () => tituloActual, () => tituloActual);
  return { ...state, setPageTitle: publicar };
}

export function useRegistrarTitulo(title: string, subtitle?: string, icon?: LucideIcon) {
  const { setPageTitle } = usePageTitle();

  React.useEffect(() => {
    setPageTitle({ title, subtitle, icon });
    return () => setPageTitle({});
  }, [icon, setPageTitle, subtitle, title]);
}
