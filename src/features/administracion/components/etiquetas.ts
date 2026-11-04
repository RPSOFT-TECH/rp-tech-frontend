import type { EstadoRol, RolCodigo } from '@/lib/datos/actions';

export const NOMBRE_ROL: Record<RolCodigo, string> = {
  superadmin: 'Superadmin',
  gerente: 'Gerente',
  coordinador: 'Coordinador',
  tecnico: 'Técnico',
  consulta: 'Consulta',
  ventas: 'Ventas',
};

export const NOMBRE_ESTADO: Record<EstadoRol, string> = {
  vigente: 'Vigente',
  futuro: 'Futuro',
  vencido: 'Vencido',
  inactivo: 'Rol inactivo',
};
