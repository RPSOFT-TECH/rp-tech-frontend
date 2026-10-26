// src/lib/datos-simulados/actions.ts
//
// Acciones simuladas — todas devuelven una Promise con ~300 ms de espera
// para imitar una llamada real al backend.

import { usuarios, type Usuario } from './usuarios';
import { clientes, type Cliente } from './clientes';
import { contactos, type Contacto } from './contactos';
import { direcciones, type Direccion } from './direcciones';
import { equipos, type Equipo } from './equipos';
import { catalogos } from './catalogos';
import { casosSimulados, type Caso } from './casos';

// ── Utilidad ─────────────────────────────────────────────────────────────

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

export async function login(
  email: string,
  password: string,
): Promise<Usuario | null> {
  await delay(null);
  if (password !== CONTRASENA_COMUN) return null;
  const usuario = usuarios.find((u) => u.email === email.toLowerCase().trim());
  return usuario ?? null;
}

export async function logout(): Promise<void> {
  await delay(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rptech_user');
  }
}

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

export function guardarSesion(usuario: Usuario): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rptech_user', JSON.stringify(usuario));
  }
}

// ── Clientes ──────────────────────────────────────────────────────────────

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

export async function obtenerContactos(clienteId: number): Promise<Contacto[]> {
  return delay(contactos.filter((c) => c.cliente_id === clienteId && c.activo));
}

export async function obtenerDirecciones(
  clienteId: number,
): Promise<Direccion[]> {
  return delay(
    direcciones.filter((d) => d.cliente_id === clienteId && d.activo),
  );
}

export async function obtenerEquipos(clienteId: number): Promise<Equipo[]> {
  return delay(equipos.filter((e) => e.cliente_id === clienteId && e.activo));
}

// ── Catálogos ─────────────────────────────────────────────────────────────

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

// ── Casos ────────────────────────────────────────────────────────────────_

let contadorCasos = casosSimulados.length;

export async function crearCaso(
  datos: Omit<Caso, 'id' | 'numero' | 'estado' | 'creado_en'>,
): Promise<Caso> {
  await delay(null);

  if (String(datos.cliente_id) === '99') {
    throw new Error('Error simulado al guardar el caso. Intenta de nuevo.');
  }

  contadorCasos += 1;
  const nuevoCaso: Caso = {
    ...datos,
    id: String(contadorCasos),
    numero: `OS-2026-${String(contadorCasos).padStart(4, '0')}`,
    estado: 'por_programar',
    creado_en: new Date().toISOString(),
  };
  casosSimulados.push(nuevoCaso);
  return nuevoCaso;
}

/**
 * Devuelve un caso por su ID.
 */
export async function obtenerCasoPorId(id: string): Promise<Caso | null> {
  const caso = casosSimulados.find((c) => c.id === id);
  return delay(caso || null, 200);
}

// ==========================================
// ACCIONES PARA LISTA DE CASOS (Frontend 2)
// ==========================================

export interface FiltrosCasos {
  estado?: string;
  tecnico_id?: string;
  tipo_servicio?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  q?: string;
}

export async function obtenerCasos(filtros: FiltrosCasos = {}): Promise<Caso[]> {
  let resultado = [...casosSimulados];

  if (filtros.estado && filtros.estado !== "todos") {
    resultado = resultado.filter((c) => c.estado === filtros.estado);
  }

  if (filtros.tecnico_id && filtros.tecnico_id !== "todos") {
    resultado = resultado.filter((c) => c.tecnico_id === filtros.tecnico_id);
  }

  if (filtros.tipo_servicio && filtros.tipo_servicio !== "todos") {
    resultado = resultado.filter((c) => c.tipo_servicio === filtros.tipo_servicio);
  }

  if (filtros.fecha_desde) {
    resultado = resultado.filter((c) => c.creado_en >= filtros.fecha_desde!);
  }

  if (filtros.fecha_hasta) {
    resultado = resultado.filter((c) => c.creado_en <= filtros.fecha_hasta!);
  }

  if (filtros.q && filtros.q.trim() !== "") {
    const query = normalizar(filtros.q);
    resultado = resultado.filter(
      (c) =>
        normalizar(c.numero).includes(query) ||
        normalizar(c.incidencia).includes(query)
    );
  }

  resultado.sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());

  return delay(resultado, 300);
}

export async function obtenerTecnicosActivos() {
  const tecnicosActivos = usuarios.filter((u) => u.rol === "tecnico" && u.activo);
  return delay(tecnicosActivos, 200);
}