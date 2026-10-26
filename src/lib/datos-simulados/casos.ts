// src/lib/datos-simulados/casos.ts

/**
 * Simulated cases.
 * Fields follow the spec (id, numero, creado_por, cliente_id, contacto_id, direccion_id, telefono, equipo_id, incidencia, tipo_servicio, modo_servicio, modalidad, prioridad, estado, tecnico_id, fecha_programada, hora_programada, creado_en).
 */
export type Caso = {
  id: number;
  numero: string; // e.g. OS-2026-0001
  creado_por: number; // usuario id
  cliente_id: number;
  contacto_id: number;
  direccion_id: number;
  telefono: string;
  equipo_id: number;
  incidencia: string;
  tipo_servicio: number; // catalog id
  modo_servicio: number; // catalog id
  modalidad: number; // catalog id
  prioridad: number; // catalog id
  estado: string; // e.g. "por_programar"
  tecnico_id?: number;
  fecha_programada?: string; // ISO date
  hora_programada?: string; // HH:mm
  creado_en: string; // ISO timestamp
};

export const casos: Caso[] = [];
