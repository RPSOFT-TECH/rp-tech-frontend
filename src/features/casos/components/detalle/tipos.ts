import type { CasoDetalle } from '@/lib/datos/actions';

export type EjecutarAccion = (fn: () => Promise<{ ok: boolean; error?: string }>) => void;

export interface FormAccionProps {
  caso: CasoDetalle;
  onEjecutar: EjecutarAccion;
  onCerrar: () => void;
}
