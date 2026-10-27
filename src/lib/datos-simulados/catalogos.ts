// src/lib/datos-simulados/catalogos.ts

export interface CatalogoItem {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
}

export const catalogos = {
  tipos_servicio: [
    { id: 1, nombre: 'Inspección y diagnóstico', orden: 1, activo: true },
    { id: 2, nombre: 'Instalación', orden: 2, activo: true },
    { id: 3, nombre: 'Mantenimiento', orden: 3, activo: true },
    { id: 4, nombre: 'Capacitación', orden: 4, activo: true },
    { id: 5, nombre: 'Perfilación de color', orden: 5, activo: true },
  ],
  modos_servicio: [
    { id: 1, nombre: 'Garantía del equipo', orden: 1, activo: true },
    { id: 2, nombre: 'Garantía de soporte técnico', orden: 2, activo: true },
    { id: 3, nombre: 'Facturado', orden: 3, activo: true },
  ],
  modalidades: [
    { id: 1, nombre: 'Presencial', orden: 1, activo: true },
    { id: 2, nombre: 'Remoto', orden: 2, activo: true },
    { id: 3, nombre: 'En taller', orden: 3, activo: true },
  ],
  canales: [
    { id: 1, nombre: 'Llamada', orden: 1, activo: true },
    { id: 2, nombre: 'WhatsApp', orden: 2, activo: true },
  ],
  lineas_maquina: [
    { id: 1, nombre: 'Sublimación', orden: 1, activo: true },
    { id: 2, nombre: 'DTF', orden: 2, activo: true },
    { id: 3, nombre: 'DTF UV', orden: 3, activo: true },
    { id: 4, nombre: 'Calandra', orden: 4, activo: true },
    { id: 5, nombre: 'UV cama plana', orden: 5, activo: true },
    { id: 6, nombre: 'Ecosolvente', orden: 6, activo: true },
    { id: 7, nombre: 'Láser', orden: 7, activo: true },
    { id: 8, nombre: 'Láser textil', orden: 8, activo: true },
  ],
  modelos_cabezal: [
    { id: 1, nombre: 'Epson i3200', orden: 1, activo: true },
    { id: 2, nombre: 'Epson i1600', orden: 2, activo: true },
    { id: 3, nombre: 'Epson 4720', orden: 3, activo: true },
    { id: 4, nombre: 'Epson DX5', orden: 4, activo: true },
    { id: 5, nombre: 'Epson DX7', orden: 5, activo: true },
    { id: 6, nombre: 'Epson XP600', orden: 6, activo: true },
    { id: 7, nombre: 'Epson TX800', orden: 7, activo: true },
    { id: 8, nombre: 'Konica 512i', orden: 8, activo: true },
    { id: 9, nombre: 'Otros', orden: 9, activo: true },
  ],
  motivos_espera: [
    { id: 1, nombre: 'Pieza o repuesto', orden: 1, activo: true },
    { id: 2, nombre: 'Aprobación de cotización', orden: 2, activo: true },
    { id: 3, nombre: 'Reprogramación del cliente', orden: 3, activo: true },
    { id: 4, nombre: 'Continúa otro día', orden: 4, activo: true },
    { id: 5, nombre: 'Otro', orden: 5, activo: true },
  ],
  cantidad_cabezal: [
    { id: 1, nombre: '1', orden: 1, activo: true },
    { id: 2, nombre: '2', orden: 2, activo: true },
    { id: 3, nombre: '3', orden: 3, activo: true },
    { id: 4, nombre: '4', orden: 4, activo: true },
    { id: 5, nombre: '6', orden: 5, activo: true },
    { id: 6, nombre: '8', orden: 6, activo: true },
  ],
};
