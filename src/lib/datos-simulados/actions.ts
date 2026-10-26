// src/lib/datos-simulados/actions.ts
//
// Acciones simuladas — todas devuelven una Promise con ~300 ms de espera
// para imitar una llamada real al backend.
// Las pantallas NUNCA leen los archivos de datos directamente;
// siempre usan estas funciones.

import { usuarios, type Usuario } from './usuarios';
import { clientes, type Cliente } from './clientes';
import { contactos, type Contacto } from './contactos';
import { direcciones, type Direccion } from './direcciones';
import { equipos, type Equipo } from './equipos';
import { catalogos } from './catalogos';
import { casos, type Caso } from './casos';

// ── Utilidad ──────────────────────────────────────────────────────────────

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/** Normaliza texto: minúsculas, sin tildes ni diacríticos. */
function normalizar(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ── Autenticación ─────────────────────────────────────────────────────────

const CONTRASENA_COMUN = 'rptech123';

/** Inicia sesión con correo y contraseña.
 *  Devuelve el usuario si las credenciales son correctas, o null si no.
 */
export async function login(
  email: string,
  password: string,
): Promise<Usuario | null> {
  await delay(null);
  if (password !== CONTRASENA_COMUN) return null;
  const usuario = usuarios.find((u) => u.email === email.toLowerCase().trim());
  return usuario ?? null;
}

/** Cierra la sesión: limpia localStorage y expira la cookie. */
export async function logout(): Promise<void> {
  await delay(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rptech_user');
    // Expirar la cookie de sesión
    document.cookie =
      'rptech_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }
}

/** Retorna el usuario guardado en localStorage, o null si no hay sesión. */
export function obtenerUsuarioActual(): Usuario | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('rptech_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

/** Guarda el usuario en localStorage y en la cookie de sesión. */
export function guardarSesion(usuario: Usuario): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rptech_user', JSON.stringify(usuario));
    // Cookie que lee el proxy para proteger rutas
    document.cookie = `rptech_session=${encodeURIComponent(JSON.stringify(usuario))}; path=/; SameSite=Lax`;
  }
}

// ── Clientes ──────────────────────────────────────────────────────────────

/**
 * Busca clientes activos por razón social o inicio de RUC.
 * Sin distinguir mayúsculas ni tildes. Devuelve máximo 10 resultados.
 */
export async function buscarClientes(query: string): Promise<Cliente[]> {
  await delay(null);
  const q = normalizar(query.trim());
  if (q.length < 2) return [];
  return clientes
    .filter(
      (c) =>
        c.activo &&
        (normalizar(c.razon_social).includes(q) || c.ruc.startsWith(q)),
    )
    .slice(0, 10);
}

// ── Contactos, direcciones y equipos ─────────────────────────────────────

/** Obtiene los contactos activos de un cliente. */
export async function obtenerContactos(clienteId: number): Promise<Contacto[]> {
  return delay(contactos.filter((c) => c.cliente_id === clienteId && c.activo));
}

/** Obtiene las direcciones activas de un cliente. */
export async function obtenerDirecciones(
  clienteId: number,
): Promise<Direccion[]> {
  return delay(
    direcciones.filter((d) => d.cliente_id === clienteId && d.activo),
  );
}

/** Obtiene los equipos activos de un cliente. */
export async function obtenerEquipos(clienteId: number): Promise<Equipo[]> {
  return delay(equipos.filter((e) => e.cliente_id === clienteId && e.activo));
}

// ── Catálogos ─────────────────────────────────────────────────────────────

/** Devuelve todos los catálogos activos, ordenados por el campo `orden`. */
export async function obtenerCatalogos(): Promise<typeof catalogos> {
  await delay(null);
  return {
    tipos_servicio: catalogos.tipos_servicio.filter((x) => x.activo),
    modos_servicio: catalogos.modos_servicio.filter((x) => x.activo),
    lineas_maquina: catalogos.lineas_maquina.filter((x) => x.activo),
    modelos_cabezal: catalogos.modelos_cabezal.filter((x) => x.activo),
    modalidades: catalogos.modalidades.filter((x) => x.activo),
    prioridades: catalogos.prioridades.filter((x) => x.activo),
    motivos_espera: catalogos.motivos_espera.filter((x) => x.activo),
    cantidad_cabezal: catalogos.cantidad_cabezal.filter((x) => x.activo),
  };
}

// ── Casos ─────────────────────────────────────────────────────────────────

let contadorCasos = 0;

/**
 * Crea un caso nuevo, lo guarda en memoria y devuelve el caso creado.
 * El número sigue el patrón OS-2026-0001, OS-2026-0002, …
 */
export async function crearCaso(
  datos: Omit<Caso, 'id' | 'numero' | 'estado' | 'creado_en'>,
): Promise<Caso> {
  await delay(null);

  // Simular error de guardado para un cliente especial (cliente_id = 99)
  if (datos.cliente_id === 99) {
    throw new Error('Error simulado al guardar el caso. Intenta de nuevo.');
  }

  contadorCasos += 1;
  const nuevoCaso: Caso = {
    ...datos,
    id: contadorCasos,
    numero: `OS-2026-${String(contadorCasos).padStart(4, '0')}`,
    estado: 'por_programar',
    creado_en: new Date().toISOString(),
  };
  casos.push(nuevoCaso);
  return nuevoCaso;
}

/**
 * Lista todos los casos en memoria.
 * Luis completará esta función con filtros en su tarea.
 */
export async function listarCasos(): Promise<Caso[]> {
  return delay([...casos]);
}
