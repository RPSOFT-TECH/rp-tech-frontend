// src/lib/datos-simulados/equipos.ts

/**
 * Simulated equipment per client.
 * Fields: id, cliente_id, linea, modelo, numero_serie, cabezal_modelo, cabezal_cantidad, fecha_inicio_garantia, activo.
 */
export type Equipo = {
  id: number;
  cliente_id: number;
  linea: string;
  modelo: string;
  numero_serie: string;
  cabezal_modelo: string;
  cabezal_cantidad: number;
  fecha_inicio_garantia: string; // ISO date string
  activo: boolean;
};

export const equipos: Equipo[] = [
  // Equipos para TEXTILES ANDINOS (cliente 1)
  {
    id: 1,
    cliente_id: 1,
    linea: 'Sublimación',
    modelo: 'Epson i3200',
    numero_serie: 'SN-AND-001',
    cabezal_modelo: 'Epson i3200',
    cabezal_cantidad: 4,
    fecha_inicio_garantia: '2025-01-01',
    activo: true,
  },
  {
    id: 2,
    cliente_id: 1,
    linea: 'Sublimación',
    modelo: 'Epson i3200',
    numero_serie: 'SN-AND-002',
    cabezal_modelo: 'Epson i3200',
    cabezal_cantidad: 4,
    fecha_inicio_garantia: '2025-02-01',
    activo: true,
  },
  // Equipos para ESTAMPADOS PERÚ (cliente 2)
  {
    id: 3,
    cliente_id: 2,
    linea: 'DTF',
    modelo: 'Epson i1600',
    numero_serie: 'SN-EST-001',
    cabezal_modelo: 'Epson i1600',
    cabezal_cantidad: 2,
    fecha_inicio_garantia: '2025-03-15',
    activo: true,
  },
  // Add more equipment to reach 15 total (simplified)
  {
    id: 4,
    cliente_id: 3,
    linea: 'Calandra',
    modelo: 'Modelo A',
    numero_serie: 'SN-C3-001',
    cabezal_modelo: 'Modelo A',
    cabezal_cantidad: 1,
    fecha_inicio_garantia: '2025-04-01',
    activo: true,
  },
  {
    id: 5,
    cliente_id: 4,
    linea: 'UV cama plana',
    modelo: 'Modelo B',
    numero_serie: 'SN-C4-001',
    cabezal_modelo: 'Modelo B',
    cabezal_cantidad: 2,
    fecha_inicio_garantia: '2025-05-01',
    activo: true,
  },
  {
    id: 6,
    cliente_id: 5,
    linea: 'Láser',
    modelo: 'Modelo C',
    numero_serie: 'SN-C5-001',
    cabezal_modelo: 'Modelo C',
    cabezal_cantidad: 3,
    fecha_inicio_garantia: '2025-06-01',
    activo: true,
  },
  // Fill up to 15 entries (dummy data)
  {
    id: 7,
    cliente_id: 6,
    linea: 'Sublimación',
    modelo: 'Modelo D',
    numero_serie: 'SN-C6-001',
    cabezal_modelo: 'Modelo D',
    cabezal_cantidad: 1,
    fecha_inicio_garantia: '2025-07-01',
    activo: true,
  },
  {
    id: 8,
    cliente_id: 7,
    linea: 'DTF',
    modelo: 'Modelo E',
    numero_serie: 'SN-C7-001',
    cabezal_modelo: 'Modelo E',
    cabezal_cantidad: 2,
    fecha_inicio_garantia: '2025-08-01',
    activo: true,
  },
  {
    id: 9,
    cliente_id: 8,
    linea: 'Calandra',
    modelo: 'Modelo F',
    numero_serie: 'SN-C8-001',
    cabezal_modelo: 'Modelo F',
    cabezal_cantidad: 1,
    fecha_inicio_garantia: '2025-09-01',
    activo: true,
  },
  {
    id: 10,
    cliente_id: 9,
    linea: 'UV cama plana',
    modelo: 'Modelo G',
    numero_serie: 'SN-C9-001',
    cabezal_modelo: 'Modelo G',
    cabezal_cantidad: 2,
    fecha_inicio_garantia: '2025-10-01',
    activo: true,
  },
  {
    id: 11,
    cliente_id: 10,
    linea: 'Láser',
    modelo: 'Modelo H',
    numero_serie: 'SN-C10-001',
    cabezal_modelo: 'Modelo H',
    cabezal_cantidad: 3,
    fecha_inicio_garantia: '2025-11-01',
    activo: true,
  },
  // Additional dummy rows to reach 15
  {
    id: 12,
    cliente_id: 1,
    linea: 'Sublimación',
    modelo: 'Epson i3200',
    numero_serie: 'SN-AND-003',
    cabezal_modelo: 'Epson i3200',
    cabezal_cantidad: 4,
    fecha_inicio_garantia: '2025-12-01',
    activo: true,
  },
  {
    id: 13,
    cliente_id: 2,
    linea: 'DTF',
    modelo: 'Epson i1600',
    numero_serie: 'SN-EST-002',
    cabezal_modelo: 'Epson i1600',
    cabezal_cantidad: 2,
    fecha_inicio_garantia: '2025-12-15',
    activo: true,
  },
  {
    id: 14,
    cliente_id: 3,
    linea: 'Calandra',
    modelo: 'Modelo A',
    numero_serie: 'SN-C3-002',
    cabezal_modelo: 'Modelo A',
    cabezal_cantidad: 1,
    fecha_inicio_garantia: '2025-12-20',
    activo: true,
  },
  {
    id: 15,
    cliente_id: 4,
    linea: 'UV cama plana',
    modelo: 'Modelo B',
    numero_serie: 'SN-C4-002',
    cabezal_modelo: 'Modelo B',
    cabezal_cantidad: 2,
    fecha_inicio_garantia: '2025-12-25',
    activo: true,
  },
];
