// src/lib/datos-simulados/direcciones.ts
// Re-exporta sedes para compatibilidad mientras se migra todo a sedes
export * from './sedes';
export { sedes as direcciones, type Sede as Direccion } from './sedes';
