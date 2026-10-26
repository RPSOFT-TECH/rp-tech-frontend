// src/lib/datos-simulados/catalogos.ts

/**
 * Simulated catalog values.
 * Cada catálogo es un array de objetos con id, nombre, orden y activo.
 */
export type CatalogoItem = {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
};

export const catalogos = {
  tipos_servicio: [
    { id: 1, nombre: 'Inspección y diagnóstico', orden: 1, activo: true },
    { id: 2, nombre: 'Mantenimiento general', orden: 2, activo: true },
    { id: 3, nombre: 'Entrenamiento técnico', orden: 3, activo: true },
    { id: 4, nombre: 'Perfilación de color', orden: 4, activo: true },
    { id: 5, nombre: 'Otros', orden: 5, activo: true },
  ],
  modos_servicio: [
    { id: 1, nombre: 'Garantía de la máquina', orden: 1, activo: true },
    { id: 2, nombre: 'Garantía de soporte técnico', orden: 2, activo: true },
    { id: 3, nombre: 'Facturado', orden: 3, activo: true },
  ],
  lineas_maquina: [
    { id: 1, nombre: 'Sublimación', orden: 1, activo: true },
    { id: 2, nombre: 'DTF', orden: 2, activo: true },
    { id: 3, nombre: 'Calandra', orden: 3, activo: true },
    { id: 4, nombre: 'UV cama plana', orden: 4, activo: true },
    { id: 5, nombre: 'Láser', orden: 5, activo: true },
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
  modalidades: [
    { id: 1, nombre: 'Presencial', orden: 1, activo: true },
    { id: 2, nombre: 'Remoto', orden: 2, activo: true },
    { id: 3, nombre: 'En taller', orden: 3, activo: true },
  ],
  prioridades: [
    { id: 1, nombre: 'Máquina detenida', orden: 1, activo: true },
    { id: 2, nombre: 'Producción afectada', orden: 2, activo: true },
    { id: 3, nombre: 'Consulta', orden: 3, activo: true },
  ],
  motivos_espera: [
    { id: 1, nombre: 'Repuesto', orden: 1, activo: true },
    { id: 2, nombre: 'Respuesta del cliente', orden: 2, activo: true },
    { id: 3, nombre: 'Aprobación de cotización', orden: 3, activo: true },
    { id: 4, nombre: 'Garantía del fabricante', orden: 4, activo: true },
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
