import { uid } from './ids';
import { crearDb, type Db } from './semilla';

const creado = crearDb();

export const db: Db = creado.db;
export const claves: Map<string, string> = creado.claves;

let secuencia = 1000;

export function nuevoId(tabla: number): string {
  secuencia += 1;
  return uid(tabla, secuencia);
}
