// src/lib/datos-simulados/casos.ts

export interface Caso {
  id: string;
  empresa_id: number;
  numero: string; // OS-2026-0001
  canal: 'Llamada' | 'WhatsApp';
  creado_por: string;
  cliente_id: string;
  sede_id: string;
  contacto_id: string;
  telefono: string;
  equipo_id: string;
  incidencia: string;
  tipo_servicio: string;
  modalidad: string;
  modo_sugerido: string;
  modo_servicio: string;
  motivo_cambio_modo?: string;
  estado: 'por_programar' | 'programado' | 'en_atencion' | 'en_espera' | 'atendido' | 'cerrado';
  tecnico_id: string | null;
  fecha_programada: string | null;
  hora_programada: string | null;
  creado_en: string;
}

export const casosSimulados: Caso[] = [
  {
    id: 'c1',
    empresa_id: 1,
    numero: 'OS-2026-0001',
    canal: 'Llamada',
    creado_por: 'coordinador@rptech.test',
    cliente_id: '1',
    sede_id: '1',
    contacto_id: '1',
    telefono: '987654321',
    equipo_id: '1',
    incidencia: 'Impresora de sublimación imprime con líneas blancas constantes.',
    tipo_servicio: 'Mantenimiento',
    modalidad: 'Presencial',
    modo_sugerido: 'Garantía del equipo',
    modo_servicio: 'Garantía del equipo',
    estado: 'programado',
    tecnico_id: 'tecnico1@rptech.test',
    fecha_programada: new Date().toISOString().split('T')[0],
    hora_programada: '10:00',
    creado_en: new Date().toISOString(),
  },
];
