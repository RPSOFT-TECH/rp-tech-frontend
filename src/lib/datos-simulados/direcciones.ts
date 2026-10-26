// src/lib/datos-simulados/direcciones.ts

/**
 * Simulated addresses per client.
 * Fields: id, cliente_id, direccion, distrito, referencia?, principal (boolean), activo.
 */
export type Direccion = {
  id: number;
  cliente_id: number;
  direccion: string;
  distrito: string;
  referencia?: string;
  principal: boolean;
  activo: boolean;
};

export const direcciones: Direccion[] = [
  // Cliente 1 addresses
  { id: 1, cliente_id: 1, direccion: 'Av. Los Andes 123', distrito: 'Miraflores', principal: true, activo: true },
  { id: 2, cliente_id: 1, direccion: 'Calle Lomas 456', distrito: 'San Isidro', principal: false, activo: true },
  // Cliente 2 addresses
  { id: 3, cliente_id: 2, direccion: 'Jr. Principal 78', distrito: 'Barranco', principal: true, activo: true },
  // Additional clients (one each)
  { id: 4, cliente_id: 3, direccion: 'Av. Central 101', distrito: 'Surco', principal: true, activo: true },
  { id: 5, cliente_id: 4, direccion: 'Calle 5 de Mayo 202', distrito: 'Lima', principal: true, activo: true },
  { id: 6, cliente_id: 5, direccion: 'Jr. La Marina 303', distrito: 'Callao', principal: true, activo: true },
  { id: 7, cliente_id: 6, direccion: 'Av. La Marina 404', distrito: 'Jesús María', principal: true, activo: true },
  { id: 8, cliente_id: 7, direccion: 'Calle La Aurora 505', distrito: 'Pueblo Libre', principal: true, activo: true },
  { id: 9, cliente_id: 8, direccion: 'Av. El Sol 606', distrito: 'San Borja', principal: true, activo: true },
  { id: 10, cliente_id: 9, direccion: 'Calle Los Pinos 707', distrito: 'San Miguel', principal: true, activo: true },
  { id: 11, cliente_id: 10, direccion: 'Jr. La Paz 808', distrito: 'San Juan de Lurigancho', principal: true, activo: true },
];
