
import type { PostgrestError } from '@supabase/supabase-js';
import { ahoraLimaISO, horaLima, hoyLima } from '../datos-simulados/fecha';
import type { Resultado, RolCodigo } from '../datos-simulados/types';
import { obtenerUsuarioActual } from './sesion';

export function ok<T>(datos: T): Resultado<T> {
  return { ok: true, datos };
}

export function fallo<T>(error: string): Resultado<T> {
  return { ok: false, error };
}


export function mensaje(error: Pick<PostgrestError, 'message' | 'code'> | { message: string; code?: string } | null): string {
  if (!error) return 'No se pudo completar la acción.';
  const texto = error.message ?? '';
  const codigo = 'code' in error ? error.code : undefined;
  if (/row-level security|permission denied/i.test(texto)) return 'No tienes permiso para hacer esto con tu rol actual.';
  if (codigo === '23505') {
    if (/ruc/i.test(texto)) return 'Ya existe un cliente con ese RUC.';
    if (/serie/i.test(texto)) return 'Ya existe un equipo con esa serie.';
    if (/principal/i.test(texto)) return 'El cliente ya tiene una sede principal.';
    return 'Ya existe un registro con esos datos.';
  }
  if (codigo === '23503') return 'El registro está en uso o hace referencia a algo que no existe.';
  if (/JWT|session/i.test(texto)) return 'Tu sesión venció. Vuelve a iniciar sesión.';
  if (/Failed to fetch|NetworkError/i.test(texto)) return 'No hay conexión con el servidor. Revisa tu internet.';

  return /[.!?]$/.test(texto) ? texto : `${texto}.`;
}

export function tieneRol(...codigos: RolCodigo[]): boolean {
  const sesion = obtenerUsuarioActual();
  return !!sesion && sesion.rolesVigentes.some((rol) => codigos.includes(rol));
}


export function hora(valor: string | null | undefined): string | null {
  return valor ? valor.slice(0, 5) : null;
}


export function isoLima(valor: string | null | undefined): string | null {
  return valor ? ahoraLimaISO(new Date(valor)) : null;
}


export function horaDe(valor: string | null | undefined): string | null {
  return valor ? horaLima(new Date(valor)) : null;
}


export function marcaDeHoy(horaTexto: string | null | undefined): string | null {
  const limpio = horaTexto?.trim();
  if (!limpio) return null;
  if (!/^\d{2}:\d{2}/.test(limpio)) return limpio;
  return `${hoyLima()}T${limpio.slice(0, 5)}:00-05:00`;
}

export function nombre(rel: unknown): string {
  if (rel && typeof rel === 'object' && 'nombre' in rel) return String((rel as { nombre: unknown }).nombre ?? '');
  return '';
}

export function nombreCompleto(rel: unknown): string | null {
  if (rel && typeof rel === 'object' && 'nombre_completo' in rel) {
    return String((rel as { nombre_completo: unknown }).nombre_completo ?? '') || null;
  }
  return null;
}

export function numero(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isNaN(n) ? null : n;
}


export async function blobDe(dataUrl: string): Promise<Blob> {
  const respuesta = await fetch(dataUrl);
  return respuesta.blob();
}

export function nombreSeguro(nombreArchivo: string): string {
  return nombreArchivo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w.-]+/g, '_')
    .slice(-80);
}
