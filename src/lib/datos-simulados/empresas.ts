// src/lib/datos-simulados/empresas.ts

export interface Empresa {
  id: number;
  nombre: string;
}

export const empresas: Empresa[] = [
  { id: 1, nombre: 'RP Tech Demo' },
  { id: 2, nombre: 'Otra Empresa Demo' },
];
