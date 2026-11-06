import type { CasoDetalle } from '@/lib/datos-simulados/actions';

export type EjecutarAccion = (fn: () => Promise<{ ok: boolean; error?: string }>) => void;

export interface FormAccionProps {
  caso: CasoDetalle;
  onEjecutar: EjecutarAccion;
  onCerrar: () => void;
}
