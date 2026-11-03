import { ahoraLimaISO, partesLima } from '../fecha';
import { db, nuevoId } from '../store';
import type { Caso, EstadoCaso, Reporte, Resultado, RolCodigo } from '../types';
import { obtenerUsuarioActual } from './sesion';

export function delay<T>(datos: T, ms = 40): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(datos), ms));
}

export function ok<T>(datos: T): Resultado<T> {
  return { ok: true, datos };
}

export function fallo<T>(error: string): Resultado<T> {
  return { ok: false, error };
}

export function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function nombreDe(items: { id: string; nombre: string }[], id: string | null | undefined): string {
  if (!id) return '';
  return items.find((item) => item.id === id)?.nombre ?? '';
}

export function perfilDe(id: string | null | undefined) {
  if (!id) return null;
  return db.perfiles.find((perfil) => perfil.id === id) ?? null;
}

export function exigirRol(codigos: RolCodigo[]): string | null {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return 'Inicia sesión para continuar.';
  if (sesion.rolesVigentes.some((rol) => codigos.includes(rol))) return null;
  return 'No tienes permiso para esta acción.';
}

export function casoDeEmpresa(caso: Caso): string | null {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return 'Inicia sesión para continuar.';
  if (sesion.rolesVigentes.includes('superadmin')) return null;
  if (caso.empresa_id !== sesion.empresa.id) return 'No puedes modificar un caso de otra empresa.';
  return null;
}

export function registrarHistorial(
  casoId: string,
  anterior: EstadoCaso | null,
  nuevo: EstadoCaso,
  motivo: string | null,
) {
  const sesion = obtenerUsuarioActual();
  db.historial_estados.push({
    id: nuevoId(19),
    caso_id: casoId,
    estado_anterior: anterior,
    estado_nuevo: nuevo,
    usuario_id: sesion?.usuario.id ?? '',
    motivo,
    fecha: ahoraLimaISO(),
  });
}

export function ultimaVisita(casoId: string): Reporte | null {
  const visitas = db.reportes.filter((reporte) => reporte.caso_id === casoId);
  if (visitas.length === 0) return null;
  return visitas.reduce((mejor, actual) =>
    actual.numero_visita >= mejor.numero_visita ? actual : mejor,
  );
}

export function aplicarFormato(formato: string, correlativo: number): string {
  const anio = String(partesLima().anio);
  return formato.replace('{AAAA}', anio).replace('{NNNNN}', String(correlativo).padStart(5, '0'));
}

export function siguienteCorrelativo(formato: string, numeros: (string | null)[]): number {
  const muestra = aplicarFormato(formato, 0);
  const prefijo = muestra.slice(0, muestra.length - 5);
  let maximo = 0;
  for (const numero of numeros) {
    if (!numero || !numero.startsWith(prefijo)) continue;
    const valor = Number(numero.slice(prefijo.length));
    if (!Number.isNaN(valor) && valor > maximo) maximo = valor;
  }
  return maximo + 1;
}

export function empresaDeSesion() {
  return obtenerUsuarioActual()?.empresa ?? null;
}
