import { Caso, Visita } from '@/lib/datos-simulados/casos';

export interface VisitaConDetalles extends Visita {
  caso?: Caso;
  clienteRazonSocial?: string;
  sedeNombre?: string;
  sedeDireccion?: string;
  sedeDistrito?: string;
  equipoSerie?: string;
}

export interface RepuestoItem {
  id: string;
  descripcion: string;
  cantidad: number;
}
