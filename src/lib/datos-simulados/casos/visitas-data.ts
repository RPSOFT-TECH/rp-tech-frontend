import { Visita } from './types';

const calcularFecha = (dias: number): string => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().split('T')[0];
};

export const visitasSimuladas: Visita[] = [
  { id: "v1", caso_id: "c1", numero_visita: 1, tecnico_id: "tecnico1@rptech.test", fecha_programada: calcularFecha(0), hora_programada: "10:00", resultado: "" },
  { id: "v2", caso_id: "c3", numero_visita: 1, tecnico_id: "tecnico1@rptech.test", fecha_programada: calcularFecha(0), hora_programada: "14:30", resultado: "" },
  { id: "v3", caso_id: "c4", numero_visita: 1, tecnico_id: "tecnico1@rptech.test", fecha_programada: calcularFecha(0), hora_programada: "16:00", resultado: "" },
  { id: "v4", caso_id: "c5", numero_visita: 1, tecnico_id: "tecnico2@rptech.test", fecha_programada: calcularFecha(1), hora_programada: "09:00", resultado: "" },
  { id: "v5", caso_id: "c6", numero_visita: 1, tecnico_id: "tecnico2@rptech.test", fecha_programada: calcularFecha(2), hora_programada: "11:00", resultado: "" },
  { id: "v6", caso_id: "c7", numero_visita: 1, tecnico_id: "tecnico2@rptech.test", fecha_programada: calcularFecha(3), hora_programada: "15:00", resultado: "" },
  { id: "v7", caso_id: "c9", numero_visita: 1, tecnico_id: "tecnico1@rptech.test", fecha_programada: calcularFecha(0), hora_programada: "08:30", resultado: "pendiente" },
  { id: "v8", caso_id: "c15", numero_visita: 1, tecnico_id: "tecnico1@rptech.test", fecha_programada: calcularFecha(4), hora_programada: "10:00", resultado: "" },
];
