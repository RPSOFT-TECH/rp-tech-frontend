import { db, nuevoId } from '../store';
import type { Catalogo, Repuesto, Resultado } from '../types';
import { exigirRol, fallo, ok } from './comun';
import { obtenerUsuarioActual } from './sesion';

export const CODIGOS_CATALOGO = [
  'tipos_servicio',
  'modos_servicio',
  'modalidades',
  'canales',
  'lineas_maquina',
  'modelos_cabezal',
  'motivos_espera',
  'repuestos',
] as const;

export type CodigoCatalogo = (typeof CODIGOS_CATALOGO)[number];

export interface ItemCatalogo {
  id: string;
  orden: number;
  activo: boolean;
  nombre: string;
  codigo: string | null;
  consumible: boolean | null;
}

const TABLAS: Record<Exclude<CodigoCatalogo, 'repuestos'>, keyof typeof db> = {
  tipos_servicio: 'tipos_servicio',
  modos_servicio: 'modos_servicio',
  modalidades: 'modalidades',
  canales: 'canales',
  lineas_maquina: 'lineas_maquina',
  modelos_cabezal: 'modelos_cabezal',
  motivos_espera: 'motivos_espera',
};

function gerencia(): string | null {
  return exigirRol(['superadmin', 'gerente']);
}

function empresaId(): string | null {
  return obtenerUsuarioActual()?.empresa.id ?? null;
}

function esCodigo(valor: string): valor is CodigoCatalogo {
  return (CODIGOS_CATALOGO as readonly string[]).includes(valor);
}

function itemsDe(codigo: CodigoCatalogo, empresa: string): ItemCatalogo[] {
  if (codigo === 'repuestos') {
    return db.repuestos
      .filter((item) => item.empresa_id === empresa)
      .map((item) => ({
        id: item.id,
        orden: item.orden,
        activo: item.activo,
        nombre: item.descripcion,
        codigo: item.codigo,
        consumible: item.consumible,
      }))
      .sort((a, b) => a.orden - b.orden);
  }
  const tabla = db[TABLAS[codigo]] as Catalogo[];
  return tabla
    .filter((item) => item.empresa_id === empresa)
    .map((item) => ({
      id: item.id,
      orden: item.orden,
      activo: item.activo,
      nombre: item.nombre,
      codigo: null,
      consumible: null,
    }))
    .sort((a, b) => a.orden - b.orden);
}

export async function listar_catalogo(codigo: string): Promise<ItemCatalogo[]> {
  if (gerencia() || !esCodigo(codigo)) return [];
  const empresa = empresaId();
  if (!empresa) return [];
  return itemsDe(codigo, empresa);
}

export async function crear_valor_catalogo(
  codigo: string,
  datos: { nombre: string; codigo?: string | null; consumible?: boolean },
): Promise<Resultado<ItemCatalogo>> {
  const permiso = gerencia();
  if (permiso) return fallo(permiso);
  if (!esCodigo(codigo)) return fallo('El catálogo no existe.');
  const empresa = empresaId();
  if (!empresa) return fallo('Inicia sesión para continuar.');
  const nombre = datos.nombre.trim();
  if (!nombre) return fallo('Ingresa el nombre.');
  const actuales = itemsDe(codigo, empresa);
  const orden = actuales.reduce((max, item) => Math.max(max, item.orden), 0) + 1;
  if (codigo === 'repuestos') {
    const codigoRepuesto = datos.codigo?.trim() ?? '';
    if (!codigoRepuesto) return fallo('Ingresa el código del repuesto.');
    const repuesto: Repuesto = {
      id: nuevoId(18),
      empresa_id: empresa,
      codigo: codigoRepuesto,
      descripcion: nombre,
      consumible: !!datos.consumible,
      orden,
      activo: true,
    };
    db.repuestos.push(repuesto);
    return ok({ id: repuesto.id, orden, activo: true, nombre, codigo: codigoRepuesto, consumible: repuesto.consumible });
  }
  const fila: Catalogo = { id: nuevoId(tablaId(codigo)), empresa_id: empresa, nombre, orden, activo: true };
  (db[TABLAS[codigo]] as Catalogo[]).push(fila);
  return ok({ id: fila.id, orden, activo: true, nombre, codigo: null, consumible: null });
}

export async function renombrar_catalogo(codigo: string, id: string, nombre: string): Promise<Resultado<true>> {
  const permiso = gerencia();
  if (permiso) return fallo(permiso);
  if (!esCodigo(codigo)) return fallo('El catálogo no existe.');
  const limpio = nombre.trim();
  if (!limpio) return fallo('Ingresa el nombre.');
  const item = buscar(codigo, id);
  if (!item) return fallo('El valor no existe.');
  if ('descripcion' in item) item.descripcion = limpio;
  else item.nombre = limpio;
  return ok(true);
}

export async function mover_catalogo(codigo: string, id: string, direccion: 'subir' | 'bajar'): Promise<Resultado<true>> {
  const permiso = gerencia();
  if (permiso) return fallo(permiso);
  if (!esCodigo(codigo)) return fallo('El catálogo no existe.');
  const empresa = empresaId();
  if (!empresa) return fallo('Inicia sesión para continuar.');
  const lista = itemsDe(codigo, empresa);
  const indice = lista.findIndex((item) => item.id === id);
  const vecino = lista[direccion === 'subir' ? indice - 1 : indice + 1];
  const actual = lista[indice];
  if (!actual || !vecino) return ok(true);
  const fila = buscar(codigo, actual.id);
  const otra = buscar(codigo, vecino.id);
  if (!fila || !otra) return fallo('El valor no existe.');
  const orden = fila.orden;
  fila.orden = otra.orden;
  otra.orden = orden;
  return ok(true);
}

export async function cambiar_activo_catalogo(codigo: string, id: string, activo: boolean): Promise<Resultado<true>> {
  const permiso = gerencia();
  if (permiso) return fallo(permiso);
  if (!esCodigo(codigo)) return fallo('El catálogo no existe.');
  const item = buscar(codigo, id);
  if (!item) return fallo('El valor no existe.');
  item.activo = activo;
  return ok(true);
}

function buscar(codigo: CodigoCatalogo, id: string): Catalogo | Repuesto | null {
  const empresa = empresaId();
  if (!empresa) return null;
  if (codigo === 'repuestos') {
    return db.repuestos.find((item) => item.id === id && item.empresa_id === empresa) ?? null;
  }
  return (db[TABLAS[codigo]] as Catalogo[]).find((item) => item.id === id && item.empresa_id === empresa) ?? null;
}

function tablaId(codigo: Exclude<CodigoCatalogo, 'repuestos'>): number {
  const ids: Record<Exclude<CodigoCatalogo, 'repuestos'>, number> = {
    tipos_servicio: 11,
    modos_servicio: 12,
    modalidades: 13,
    canales: 14,
    lineas_maquina: 15,
    modelos_cabezal: 16,
    motivos_espera: 17,
  };
  return ids[codigo];
}
