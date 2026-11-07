// Sesión real con Supabase Auth.
// El token (JWT) lo guarda y renueva supabase-js. Aparte se guarda un resumen
// del usuario (perfil, empresa y roles vigentes) para que las pantallas lo lean
// sin esperar, igual que con los datos simulados. La cookie solo sirve para que
// proxy.ts decida a qué pantalla mandar: los datos los protege la base (RLS).
import { hoyLima } from '../datos-simulados/fecha';
import type { Empresa, ParametrosEmpresa, Perfil, PermisosConsulta, RolCodigo } from '../datos-simulados/types';
import { supabase } from './cliente';

export interface SesionUsuario {
  usuario: Perfil;
  empresa: Empresa;
  rolesVigentes: RolCodigo[];
}

const CLAVE = 'rptech_session_user';
const COOKIE = 'rptech_session';

let sesionCacheClave: string | null | undefined;
let sesionCache: SesionUsuario | null = null;
let vigilando = false;
const oyentesSesion = new Set<() => void>();

export function suscribirSesion(oyente: () => void): () => void {
  oyentesSesion.add(oyente);
  return () => {
    oyentesSesion.delete(oyente);
  };
}

function publicarSesion(): void {
  oyentesSesion.forEach((oyente) => oyente());
}

function almacenamiento(): Storage | null {
  return (globalThis as { localStorage?: Storage }).localStorage ?? null;
}

function documento(): { cookie: string } | null {
  return (globalThis as { document?: { cookie: string } }).document ?? null;
}

interface FilaRol {
  desde: string;
  hasta: string | null;
  roles: { codigo: RolCodigo; activo: boolean } | null;
}

export function rolesVigentesDe(filas: FilaRol[], dia: string = hoyLima()): RolCodigo[] {
  const codigos = filas
    .filter((f) => f.roles?.activo && f.desde <= dia && (!f.hasta || f.hasta >= dia))
    .map((f) => f.roles!.codigo);
  return [...new Set(codigos)];
}

/** Lee perfil, empresa y roles del usuario con sesión. */
async function cargarResumen(userId: string, email: string): Promise<SesionUsuario | null> {
  const sb = supabase();
  const [{ data: perfil }, { data: filas }] = await Promise.all([
    sb.from('perfiles').select('id, empresa_id, nombre_completo, email, telefono, activo').eq('id', userId).maybeSingle(),
    sb.from('usuario_roles').select('desde, hasta, roles(codigo, activo)').eq('perfil_id', userId),
  ]);
  const roles = rolesVigentesDe((filas ?? []) as unknown as FilaRol[]);
  if (!perfil) {
    // Sin roles vigentes la base no deja leer ni el propio perfil: queda "sin acceso".
    return {
      usuario: { id: userId, empresa_id: '', nombre_completo: email, email, telefono: null, activo: true },
      empresa: {
        id: '',
        nombre: '',
        ruc: '',
        activo: true,
        parametros: {} as ParametrosEmpresa,
        permisos_consulta: { casos: false, reportes: false, clientes: false },
      },
      rolesVigentes: [],
    };
  }
  const { data: empresa } = await sb
    .from('empresas')
    .select('id, nombre, ruc, activo, parametros, permisos_consulta')
    .eq('id', perfil.empresa_id)
    .maybeSingle();
  if (!empresa) return null;
  return {
    usuario: perfil as Perfil,
    empresa: {
      ...(empresa as Empresa),
      ruc: empresa.ruc ?? '',
      permisos_consulta: (empresa.permisos_consulta ?? { casos: false, reportes: false, clientes: false }) as PermisosConsulta,
    },
    rolesVigentes: perfil.activo ? roles : [],
  };
}

export async function login(email: string, password: string): Promise<SesionUsuario | null> {
  const sb = supabase();
  const { data, error } = await sb.auth.signInWithPassword({ email: email.toLowerCase().trim(), password });
  if (error || !data.user) return null;
  const resumen = await cargarResumen(data.user.id, data.user.email ?? email);
  if (!resumen) {
    await sb.auth.signOut();
    return null;
  }
  return resumen;
}

/** Vuelve a leer perfil, empresa y roles (por ejemplo, después de cambiar parámetros). */
export async function refrescarSesion(): Promise<SesionUsuario | null> {
  const { data } = await supabase().auth.getUser();
  if (!data.user) return null;
  const resumen = await cargarResumen(data.user.id, data.user.email ?? '');
  if (resumen) guardarSesion(resumen);
  return resumen;
}

export function leerSesionEstable(): SesionUsuario | null {
  vigilarToken();
  const memoria = almacenamiento();
  if (!memoria) return null;
  const raw = memoria.getItem(CLAVE);
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
  memoria.setItem(CLAVE, payload);
  // La cookie lleva solo lo que proxy.ts necesita (los parámetros pueden ser largos).
  const resumen = {
    usuario: { id: sesion.usuario.id, email: sesion.usuario.email, activo: sesion.usuario.activo },
    empresa: { id: sesion.empresa.id, nombre: sesion.empresa.nombre, permisos_consulta: sesion.empresa.permisos_consulta },
    rolesVigentes: sesion.rolesVigentes,
  };
  doc.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(resumen))}; path=/; SameSite=Lax`;
}

export function limpiarSesion(): void {
  borrarSesionLocal();
  publicarSesion();
}

function borrarSesionLocal(): void {
  sesionCacheClave = null;
  sesionCache = null;
  const memoria = almacenamiento();
  const doc = documento();
  if (!memoria || !doc) return;
  memoria.removeItem(CLAVE);
  doc.cookie = `${COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export async function logout(): Promise<void> {
  try {
    await supabase().auth.signOut();
  } finally {
    borrarSesionLocal();
  }
}

/** Si el token vence o se cierra la sesión en otra pestaña, se limpia el resumen y se vuelve al login. */
function vigilarToken(): void {
  if (vigilando || typeof window === 'undefined') return;
  vigilando = true;
  const sb = supabase();
  const salir = () => {
    if (!almacenamiento()?.getItem(CLAVE)) return;
    borrarSesionLocal();
    // Fuera de React (evento de Supabase): se recarga en el login para limpiar todo el estado.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (!window.location.pathname.startsWith('/login')) window.location.assign('/login');
  };
  sb.auth.getSession().then(({ data }) => {
    if (!data.session) salir();
  });
  sb.auth.onAuthStateChange((evento, sesion) => {
    if (evento === 'SIGNED_OUT' || (!sesion && evento !== 'INITIAL_SESSION')) salir();
  });
}
