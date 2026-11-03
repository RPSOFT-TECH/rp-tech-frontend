import { hoyLima } from '../fecha';
import { claves, db } from '../store';
import type { Empresa, Perfil, RolCodigo } from '../types';

export interface SesionUsuario {
  usuario: Perfil;
  empresa: Empresa;
  rolesVigentes: RolCodigo[];
}

export function rolesVigentesDe(perfilId: string, dia: string = hoyLima()): RolCodigo[] {
  return db.usuario_roles
    .filter((asignacion) => {
      if (asignacion.perfil_id !== perfilId) return false;
      if (asignacion.desde > dia) return false;
      if (asignacion.hasta && asignacion.hasta < dia) return false;
      const rol = db.roles.find((item) => item.id === asignacion.rol_id);
      return !!rol && rol.activo;
    })
    .map((asignacion) => db.roles.find((item) => item.id === asignacion.rol_id)!.codigo);
}

export async function login(email: string, password: string): Promise<SesionUsuario | null> {
  await esperar();
  const perfil = db.perfiles.find((item) => item.email === email.toLowerCase().trim());
  if (!perfil || !perfil.activo) return null;
  if (claves.get(perfil.id) !== password) return null;
  const empresa = db.empresas.find((item) => item.id === perfil.empresa_id);
  if (!empresa || !empresa.activo) return null;
  return {
    usuario: perfil,
    empresa,
    rolesVigentes: rolesVigentesDe(perfil.id),
  };
}

let sesionCacheClave: string | null | undefined;
let sesionCache: SesionUsuario | null = null;

function almacenamiento(): Storage | null {
  return (globalThis as { localStorage?: Storage }).localStorage ?? null;
}

function documento(): { cookie: string } | null {
  return (globalThis as { document?: { cookie: string } }).document ?? null;
}

export function leerSesionEstable(): SesionUsuario | null {
  const memoria = almacenamiento();
  if (!memoria) return null;
  const raw = memoria.getItem('rptech_session_user');
  if (raw === sesionCacheClave) return sesionCache;
  sesionCacheClave = raw;
  if (!raw) {
    sesionCache = null;
    return null;
  }
  try {
    sesionCache = JSON.parse(raw) as SesionUsuario;
  } catch {
    sesionCache = null;
  }
  return sesionCache;
}

export function obtenerUsuarioActual(): SesionUsuario | null {
  return leerSesionEstable();
}

export function guardarSesion(sesion: SesionUsuario): void {
  const memoria = almacenamiento();
  const doc = documento();
  if (!memoria || !doc) return;
  const payload = JSON.stringify(sesion);
  sesionCacheClave = payload;
  sesionCache = sesion;
  memoria.setItem('rptech_session_user', payload);
  doc.cookie = `rptech_session=${encodeURIComponent(payload)}; path=/; SameSite=Lax`;
}

export async function logout(): Promise<void> {
  await esperar();
  sesionCacheClave = null;
  sesionCache = null;
  const memoria = almacenamiento();
  const doc = documento();
  if (!memoria || !doc) return;
  memoria.removeItem('rptech_session_user');
  doc.cookie = 'rptech_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}

function esperar(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 40));
}
