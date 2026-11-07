'use client';

import * as React from 'react';
import { toast as sonnerToast } from 'sonner';

const DEFAULT_DURATION = 3500;

interface ShowOptions {
  description?: string;
  duration?: number;
}

interface ToastContextType {
  success: (title: string, description?: string, opts?: ShowOptions) => void;
  error: (title: string, description?: string, opts?: ShowOptions) => void;
  info: (title: string, description?: string, opts?: ShowOptions) => void;
  warning: (title: string, description?: string, opts?: ShowOptions) => void;
  loading: (title: string, description?: string, opts?: ShowOptions) => string | number;
  history: (title: string, description?: string, opts?: ShowOptions) => void;
  dismiss: (id?: string | number) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

type Variante = 'success' | 'error' | 'info' | 'warning';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const show = React.useCallback((variant: Variante, title: string, description?: string, opts?: ShowOptions) => {
    const dur = opts?.duration ?? DEFAULT_DURATION;
    const desc = opts?.description ?? description;
    sonnerToast[variant](title, { description: desc, duration: dur });
  }, []);

  const value = React.useMemo<ToastContextType>(
    () => ({
      success: (titulo, descripcion, opts) => show('success', titulo, descripcion, opts),
      error: (titulo, descripcion, opts) => show('error', titulo, descripcion, opts),
      info: (titulo, descripcion, opts) => show('info', titulo, descripcion, opts),
      warning: (titulo, descripcion, opts) => show('warning', titulo, descripcion, opts),
      history: (titulo, descripcion, opts) => {
        sonnerToast.message(titulo, {
          description: opts?.description ?? descripcion,
          duration: opts?.duration ?? DEFAULT_DURATION,
        });
      },
      loading: (titulo, descripcion, opts) => {
        const dur = opts?.duration ?? 30000;
        const desc = opts?.description ?? descripcion;
        return sonnerToast.loading(titulo, { description: desc, duration: dur });
      },
      dismiss: (id) => sonnerToast.dismiss(id),
    }),
    [show],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextType {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
