// src/lib/datos-simulados/usuarios.ts

export type Rol = 'superadmin' | 'gerente' | 'coordinador' | 'tecnico' | 'consulta' | 'ventas';

export interface AsignacionRol {
  id: number;
  usuario_id: number;
  rol: Rol;
  desde: string; // YYYY-MM-DD
  hasta?: string; // YYYY-MM-DD (opcional)
}

export interface Usuario {
  id: number;
  empresa_id: number;
  nombre_completo: string;
  email: string;
  activo: boolean;
}

// Fechas relativas a hoy para pruebas dinámicas
const hoy = new Date();
const formatFecha = (d: Date) => d.toISOString().split('T')[0];

const fechaInicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
const fechaAyer = new Date(hoy);
fechaAyer.setDate(hoy.getDate() - 1);
const fechaHaceUnMes = new Date(hoy);
fechaHaceUnMes.setMonth(hoy.getMonth() - 1);

export const usuarios: Usuario[] = [
  { id: 1, empresa_id: 1, nombre_completo: 'Superadmin', email: 'superadmin@rptech.test', activo: true },
  { id: 2, empresa_id: 1, nombre_completo: 'Gerente General', email: 'gerente@rptech.test', activo: true },
  { id: 3, empresa_id: 1, nombre_completo: 'Coordinador Actual', email: 'coordinador@rptech.test', activo: true },
  { id: 4, empresa_id: 1, nombre_completo: 'Coordinador Anterior', email: 'coordinador.anterior@rptech.test', activo: true },
  { id: 5, empresa_id: 1, nombre_completo: 'Técnico 1', email: 'tecnico1@rptech.test', activo: true },
  { id: 6, empresa_id: 1, nombre_completo: 'Técnico 2', email: 'tecnico2@rptech.test', activo: true },
  { id: 7, empresa_id: 1, nombre_completo: 'Usuario Consulta', email: 'consulta@rptech.test', activo: true },
  { id: 8, empresa_id: 1, nombre_completo: 'Ventas (Inactivo)', email: 'ventas@rptech.test', activo: false },
  { id: 9, empresa_id: 2, nombre_completo: 'Coordinador Otra Empresa', email: 'coordinador@otra.test', activo: true },
];

export const asignacionesRoles: AsignacionRol[] = [
  { id: 1, usuario_id: 1, rol: 'superadmin', desde: '2025-01-01' },
  { id: 2, usuario_id: 2, rol: 'gerente', desde: '2025-01-01' },
  { id: 3, usuario_id: 3, rol: 'coordinador', desde: formatFecha(fechaInicioMes) }, // Vigente este mes
  { id: 4, usuario_id: 4, rol: 'coordinador', desde: formatFecha(fechaHaceUnMes), hasta: formatFecha(fechaAyer) }, // Vencido ayer
  { id: 5, usuario_id: 5, rol: 'tecnico', desde: '2025-01-01' },
  { id: 6, usuario_id: 6, rol: 'tecnico', desde: '2025-01-01' },
  { id: 7, usuario_id: 7, rol: 'consulta', desde: '2025-01-01' },
  { id: 8, usuario_id: 8, rol: 'ventas', desde: '2025-01-01' }, // Ventas
  { id: 9, usuario_id: 9, rol: 'coordinador', desde: '2025-01-01' }, // Empresa 2
];
