// src/lib/datos-simulados/usuarios.ts

/**
 * Simulated users for the frontend.
 * Fields follow the specification (id, nombre_completo, email, rol, activo).
 */
export type Usuario = {
  id: number;
  nombre_completo: string;
  email: string;
  rol: 'administrador' | 'coordinadora' | 'jefe_tecnico' | 'tecnico' | 'ventas';
  activo: boolean;
};

export const usuarios: Usuario[] = [
  {
    id: 1,
    nombre_completo: 'Administrador',
    email: 'admin@rptech.test',
    rol: 'administrador',
    activo: true,
  },
  {
    id: 2,
    nombre_completo: 'Coordinadora',
    email: 'coordinadora@rptech.test',
    rol: 'coordinadora',
    activo: true,
  },
  {
    id: 3,
    nombre_completo: 'Jefe Técnico',
    email: 'jefe@rptech.test',
    rol: 'jefe_tecnico',
    activo: true,
  },
  {
    id: 4,
    nombre_completo: 'Técnico 1',
    email: 'tecnico1@rptech.test',
    rol: 'tecnico',
    activo: true,
  },
  {
    id: 5,
    nombre_completo: 'Técnico 2',
    email: 'tecnico2@rptech.test',
    rol: 'tecnico',
    activo: true,
  },
  {
    id: 6,
    nombre_completo: 'Ventas (inactivo)',
    email: 'ventas@rptech.test',
    rol: 'ventas',
    activo: false,
  },
];
