export interface Caso {
  id: string;
  empresa_id: number;
  numero: string;
  canal: 'Llamada' | 'WhatsApp';
  creado_por: string;
  cliente_id: string | number;
  sede_id: string | number;
  contacto_id: string | number;
  telefono: string;
  equipo_id: string | number;
  incidencia: string;
  tipo_servicio: string;
  modalidad: string;
  prioridad: string;
  modo_sugerido: string;
  modo_servicio: string;
  motivo_cambio_modo?: string | null;
  estado: 'por_programar' | 'programado' | 'en_atencion' | 'en_espera' | 'atendido' | 'cerrado';
  tecnico_id?: string | null;
  fecha_programada?: string | null;
  hora_programada?: string | null;
  creado_en: string;
}

export interface Visita {
  id: string;
  caso_id: string;
  numero_visita: number;
  tecnico_id: string | null;
  fecha_programada: string | null;
  hora_programada: string | null;
  resultado: string;
}
