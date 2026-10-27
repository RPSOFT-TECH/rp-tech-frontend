// src/lib/datos-simulados/sedes.ts

export interface Sede {
  id: number;
  cliente_id: number;
  nombre: string;
  direccion: string;
  distrito: string;
  referencia?: string;
  principal: boolean;
  activo: boolean;
}

export const sedes: Sede[] = [
  // Sedes de Cliente 1: TEXTILES ANDINOS
  {
    id: 1,
    cliente_id: 1,
    nombre: 'Planta Principal Ate',
    direccion: 'Av. Los Frutales 450',
    distrito: 'Ate',
    referencia: 'Frente al óvalo',
    principal: true,
    activo: true,
  },
  {
    id: 2,
    cliente_id: 1,
    nombre: 'Taller de Acabados La Victoria',
    direccion: 'Jr. Gamarra 1240',
    distrito: 'La Victoria',
    referencia: 'Galería Central Piso 2',
    principal: false,
    activo: true,
  },

  // Sedes de Cliente 2: ESTAMPADOS PERÚ
  {
    id: 3,
    cliente_id: 2,
    nombre: 'Sede San Juan de Lurigancho',
    direccion: 'Av. Próceres de la Independencia 2100',
    distrito: 'San Juan de Lurigancho',
    principal: true,
    activo: true,
  },
  {
    id: 4,
    cliente_id: 2,
    nombre: 'Local Breña',
    direccion: 'Jr. Huaraz 850',
    distrito: 'Breña',
    principal: false,
    activo: true,
  },

  // Sedes de Clientes 3 al 10 (RP Tech Demo)
  { id: 5, cliente_id: 3, nombre: 'Planta Surco', direccion: 'Av. Santiago de Surco 301', distrito: 'Surco', principal: true, activo: true },
  { id: 6, cliente_id: 4, nombre: 'Sede Central Lima', direccion: 'Calle 5 de Mayo 202', distrito: 'Lima', principal: true, activo: true },
  { id: 7, cliente_id: 5, nombre: 'Taller Callao', direccion: 'Jr. La Marina 303', distrito: 'Callao', principal: true, activo: true },
  { id: 8, cliente_id: 6, nombre: 'Planta Jesús María', direccion: 'Av. La Marina 404', distrito: 'Jesús María', principal: true, activo: true },
  { id: 9, cliente_id: 7, nombre: 'Local Pueblo Libre', direccion: 'Calle La Aurora 505', distrito: 'Pueblo Libre', principal: true, activo: true },
  { id: 10, cliente_id: 8, nombre: 'Sede San Borja', direccion: 'Av. El Sol 606', distrito: 'San Borja', principal: true, activo: true },
  { id: 11, cliente_id: 9, nombre: 'Taller San Miguel', direccion: 'Calle Los Pinos 707', distrito: 'San Miguel', principal: true, activo: true },
  { id: 12, cliente_id: 10, nombre: 'Planta Los Olivos', direccion: 'Av. Carlos Izaguirre 110', distrito: 'Los Olivos', principal: true, activo: true },

  // Sedes de Clientes 11 y 12 (Otra Empresa Demo)
  { id: 13, cliente_id: 11, nombre: 'Almacén Huancayo', direccion: 'Av. Ferrocarril 890', distrito: 'Huancayo', principal: true, activo: true },
  { id: 14, cliente_id: 12, nombre: 'Sede Tarma', direccion: 'Jr. Lima 234', distrito: 'Tarma', principal: true, activo: true },
];
