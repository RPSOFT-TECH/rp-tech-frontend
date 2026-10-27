// src/lib/datos-simulados/actions.ts

import { empresas, type Empresa } from './empresas';
import { usuarios, asignacionesRoles, type Usuario, type Rol } from './usuarios';
import { clientes, type Cliente } from './clientes';
import { contactos, type Contacto } from './contactos';
import { sedes, type Sede } from './sedes';
import { equipos, type Equipo } from './equipos';
import { catalogos } from './catalogos';
import { casosSimulados, type Caso } from './casos';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function normalizar(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const CONTRASENA_COMUN = 'rptech123';

export interface SesionUsuario {
  usuario: Usuario;
  empresa: Empresa;
  rolesVigentes: Rol[];
}

/**
 * Obtiene los roles vigentes hoy para un usuario.
 * Ignora vencidos, futuros y el rol 'ventas' (inactivo).
 */
export function obtenerRolesVigentes(usuarioId: number): Rol[] {
  const hoyStr = new Date().toISOString().split('T')[0];
  return asignacionesRoles
    .filter((asig) => {
      if (asig.usuario_id !== usuarioId) return false;
      if (asig.rol === 'ventas') return false; // Rol ventas inactivo
      if (asig.desde > hoyStr) return false; // Futuro
      if (asig.hasta && asig.hasta < hoyStr) return false; // Vencido
      return true;
    })
    .map((asig) => asig.rol);
}

/** Inicia sesión validando credenciales y extrayendo roles vigentes */
export async function login(
  email: string,
  password: string,
): Promise<SesionUsuario | null> {
  await delay(null);
  if (password !== CONTRASENA_COMUN) return null;

  const usuario = usuarios.find((u) => u.email === email.toLowerCase().trim());
  if (!usuario || !usuario.activo) return null;

  const empresa = empresas.find((e) => e.id === usuario.empresa_id) || empresas[0];
  const rolesVigentes = obtenerRolesVigentes(usuario.id);

  return {
    usuario,
    empresa,
    rolesVigentes,
  };
}

export async function logout(): Promise<void> {
  await delay(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rptech_session_user');
    document.cookie =
      'rptech_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }
}

export function obtenerUsuarioActual(): SesionUsuario | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('rptech_session_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SesionUsuario;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion: SesionUsuario): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rptech_session_user', JSON.stringify(sesion));
    document.cookie = `rptech_session=${encodeURIComponent(
      JSON.stringify(sesion)
    )}; path=/; SameSite=Lax`;
  }
}

// ── Clientes (filtrados por empresa) ──────────────────────────────────────

export async function buscarClientes(query: string): Promise<Cliente[]> {
  await delay(null);
  const sesion = obtenerUsuarioActual();
  const empresaId = sesion?.empresa.id || 1;
  const esSuperadmin = sesion?.rolesVigentes.includes('superadmin');

  const q = normalizar(query.trim());
  if (q.length < 2) return [];

  return clientes
    .filter((c) => {
      if (!c.activo) return false;
      if (!esSuperadmin && c.empresa_id !== empresaId) return false;
      return normalizar(c.razon_social).includes(q) || c.ruc.startsWith(q);
    })
    .slice(0, 10);
}

export async function obtenerContactos(clienteId: number): Promise<Contacto[]> {
  return delay(contactos.filter((c) => c.cliente_id === clienteId && c.activo));
}

export async function obtenerSedes(clienteId: number): Promise<Sede[]> {
  return delay(sedes.filter((s) => s.cliente_id === clienteId && s.activo));
}

// Compatibilidad con direcciones
export const obtenerDirecciones = obtenerSedes;

export async function obtenerEquipos(clienteId: number): Promise<Equipo[]> {
  return delay(equipos.filter((e) => e.cliente_id === clienteId && e.activo));
}

export async function obtenerCatalogos(): Promise<typeof catalogos> {
  await delay(null);
  return catalogos;
}

// ── Sugerencia de modo de servicio ─────────────────────────────────────────

export interface SugerenciaModo {
  modo: string;
  motivo: string;
  enGarantia: boolean;
  antiguedadTexto: string;
}

export function sugerirModoServicio(equipo: Equipo, cliente: Cliente): SugerenciaModo {
  const instalacion = new Date(equipo.fecha_instalacion);
  const hoy = new Date();

  // Calcular diferencia en meses
  let meses = (hoy.getFullYear() - instalacion.getFullYear()) * 12 + (hoy.getMonth() - instalacion.getMonth());
  if (meses < 0) meses = 0;

  const antiguedadTexto = meses === 1 ? '1 mes de uso' : `${meses} meses de uso`;
  const enGarantia = meses < 12;

  if (enGarantia) {
    return {
      modo: 'Garantía del equipo',
      motivo: `Sugerido: Garantía del equipo (instalado hace ${antiguedadTexto})`,
      enGarantia: true,
      antiguedadTexto,
    };
  }

  if (cliente.soporte_vigente) {
    return {
      modo: 'Garantía de soporte técnico',
      motivo: 'Sugerido: Garantía de soporte técnico (cliente con soporte vigente)',
      enGarantia: false,
      antiguedadTexto,
    };
  }

  return {
    modo: 'Facturado',
    motivo: 'Sugerido: Facturado (instalación > 12 meses y sin soporte vigente)',
    enGarantia: false,
    antiguedadTexto,
  };
}

// ── Casos ─────────────────────────────────────────────────────────────────

export async function crearCaso(
  datos: Omit<Caso, 'id' | 'empresa_id' | 'numero' | 'estado' | 'creado_en'>,
): Promise<Caso> {
  await delay(null);
  const sesion = obtenerUsuarioActual();
  const empresaId = sesion?.empresa.id || 1;

  if (String(datos.cliente_id) === '99') {
    throw new Error('Error simulado al guardar el caso. Intenta de nuevo.');
  }

  const casosEmpresa = casosSimulados.filter((c) => c.empresa_id === empresaId);
  const correlativo = casosEmpresa.length + 1;

  const nuevoCaso: Caso = {
    ...datos,
    id: `c-${Date.now()}`,
    empresa_id: empresaId,
    numero: `OS-2026-${String(correlativo).padStart(4, '0')}`,
    estado: 'por_programar',
    creado_en: new Date().toISOString(),
  };

  casosSimulados.push(nuevoCaso);
  return nuevoCaso;
}

export async function obtenerCasoPorId(id: string): Promise<Caso | null> {
  const caso = casosSimulados.find((c) => c.id === id);
  return delay(caso || null, 200);
}

export async function listarCasos(): Promise<Caso[]> {
  const sesion = obtenerUsuarioActual();
  const empresaId = sesion?.empresa.id || 1;
  const esSuper = sesion?.rolesVigentes.includes('superadmin');

  const filtrados = esSuper
    ? casosSimulados
    : casosSimulados.filter((c) => c.empresa_id === empresaId);

  return delay([...filtrados]);
}


// ==========================================
// FILTROS Y ACCIONES PARA VISTAS DE CASOS
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
  const sesion = obtenerUsuarioActual();
  const empresaId = sesion?.empresa.id || 1;
  const esSuper = sesion?.rolesVigentes.includes('superadmin');

  let resultado = esSuper
    ? [...casosSimulados]
    : casosSimulados.filter((c) => c.empresa_id === empresaId);

  if (filtros.estado && filtros.estado !== 'todos') {
    resultado = resultado.filter((c) => c.estado === filtros.estado);
  }

  if (filtros.tecnico_id && filtros.tecnico_id !== 'todos') {
    resultado = resultado.filter((c) => c.tecnico_id === filtros.tecnico_id);
  }

  if (filtros.tipo_servicio && filtros.tipo_servicio !== 'todos') {
    resultado = resultado.filter((c) => c.tipo_servicio === filtros.tipo_servicio);
  }

  if (filtros.fecha_desde) {
    resultado = resultado.filter((c) => c.creado_en >= filtros.fecha_desde!);
  }

  if (filtros.fecha_hasta) {
    resultado = resultado.filter((c) => c.creado_en <= filtros.fecha_hasta!);
  }

  if (filtros.q && filtros.q.trim() !== '') {
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
  const sesion = obtenerUsuarioActual();
  const empresaId = sesion?.empresa.id || 1;
  const esSuper = sesion?.rolesVigentes.includes('superadmin');

  const tecnicos = usuarios.filter((u) => {
    if (!u.activo) return false;
    if (!esSuper && u.empresa_id !== empresaId) return false;
    const roles = obtenerRolesVigentes(u.id);
    return roles.includes('tecnico');
  });

  return delay(tecnicos, 200);
}
