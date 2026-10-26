// src/lib/datos-simulados/clientes.ts

/**
 * Simulated client entities.
 * Fields follow the spec (id, razon_social, ruc, telefono, email, activo).
 */
export type Cliente = {
  id: number;
  razon_social: string;
  ruc: string;
  telefono: string;
  email: string;
  activo: boolean;
};

export const clientes: Cliente[] = [
  {
    id: 1,
    razon_social: 'TEXTILES ANDINOS S.A.C.',
    ruc: '20123456789',
    telefono: '987654321',
    email: 'contacto@andinos.com',
    activo: true,
  },
  {
    id: 2,
    razon_social: 'ESTAMPADOS PERÚ S.R.L.',
    ruc: '20123456790',
    telefono: '987654322',
    email: 'info@estampadosperu.com',
    activo: true,
  },
  {
    id: 3,
    razon_social: 'Cliente 3 S.A.',
    ruc: '20123456791',
    telefono: '987654323',
    email: 'c3@example.com',
    activo: true,
  },
  {
    id: 4,
    razon_social: 'Cliente 4 S.A.',
    ruc: '20123456792',
    telefono: '987654324',
    email: 'c4@example.com',
    activo: true,
  },
  {
    id: 5,
    razon_social: 'Cliente 5 S.A.',
    ruc: '20123456793',
    telefono: '987654325',
    email: 'c5@example.com',
    activo: true,
  },
  {
    id: 6,
    razon_social: 'Cliente 6 S.A.',
    ruc: '20123456794',
    telefono: '987654326',
    email: 'c6@example.com',
    activo: true,
  },
  {
    id: 7,
    razon_social: 'Cliente 7 S.A.',
    ruc: '20123456795',
    telefono: '987654327',
    email: 'c7@example.com',
    activo: true,
  },
  {
    id: 8,
    razon_social: 'Cliente 8 S.A.',
    ruc: '20123456796',
    telefono: '987654328',
    email: 'c8@example.com',
    activo: true,
  },
  {
    id: 9,
    razon_social: 'Cliente 9 S.A.',
    ruc: '20123456797',
    telefono: '987654329',
    email: 'c9@example.com',
    activo: true,
  },
  {
    id: 10,
    razon_social: 'Cliente 10 S.A.',
    ruc: '20123456798',
    telefono: '987654330',
    email: 'c10@example.com',
    activo: true,
  },
];
