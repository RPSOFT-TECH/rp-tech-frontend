
import { hoyLima, sumarDias } from '../datos-simulados/fecha';
import type { ParametrosEmpresa, PermisosConsulta, Resultado, RolCodigo } from '../datos-simulados/types';
import type { AltaUsuario, EmpresaPermisos } from '../datos-simulados/acciones/admin';
import type { EstadoRol, RolUsuario, UsuarioAdmin } from '../datos-simulados/acciones/admin-usuarios';
import type { ItemCatalogo } from '../datos-simulados/acciones/admin-catalogos';
import { supabase } from './cliente';
import { blobDe, fallo, mensaje, ok } from './base';
import { guardarSesion, obtenerUsuarioActual } from './sesion';

export type { AltaUsuario, EmpresaPermisos, EstadoRol, ItemCatalogo, RolUsuario, UsuarioAdmin };

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


export function es_superadmin(): boolean {
  return obtenerUsuarioActual()?.rolesVigentes.includes('superadmin') ?? false;
}

export function empresa_actual(): string | null {
  return obtenerUsuarioActual()?.empresa.id ?? null;
}

export function tiene_rol(codigo: RolCodigo): boolean {
  return obtenerUsuarioActual()?.rolesVigentes.includes(codigo) ?? false;
}

export function es_coordinador_de(p_empresa?: string): boolean {
  const sesion = obtenerUsuarioActual();
  if (!sesion || !tiene_rol('coordinador')) return false;
  return (p_empresa ?? sesion.empresa.id) === sesion.empresa.id;
}



export async function usuarios(
  entrada: AltaUsuario,
): Promise<Resultado<{ id: string; email: string; password_temporal: string | null }>> {
  if (!entrada.email.trim() || !entrada.nombre_completo.trim()) return fallo('El nombre y el correo son obligatorios.');
  if (entrada.roles.length === 0) return fallo('Asigna al menos un rol.');
  const { data, error } = await supabase().functions.invoke('usuarios', {
    body: {
      email: entrada.email.trim().toLowerCase(),
      nombre_completo: entrada.nombre_completo.trim(),
      telefono: entrada.telefono?.trim() || undefined,
      password: entrada.password?.trim() || undefined,
      roles: entrada.roles.map((r) => ({ codigo: r.codigo, desde: r.desde, hasta: r.hasta || null })),
    },
  });
  if (error) {
    let texto = error.message;
    try {
      const cuerpo = await (error as { context?: Response }).context?.json();
      if (cuerpo?.error) texto = cuerpo.error;
    } catch {
      
    }
    return fallo(mensaje({ message: texto }));
  }
  return ok({ id: data.id, email: data.email, password_temporal: data.password_temporal ?? null });
}

function estadoDe(activo: boolean, desde: string, hasta: string | null, hoy: string): EstadoRol {
  if (!activo) return 'inactivo';
  if (desde > hoy) return 'futuro';
  if (hasta && hasta < hoy) return 'vencido';
  return 'vigente';
}

export async function usuarios_admin(): Promise<UsuarioAdmin[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return [];
  const { data } = await supabase()
    .from('perfiles')
    .select('id, nombre_completo, email, telefono, activo, usuario_roles!usuario_roles_perfil_id_fkey(id, desde, hasta, roles(codigo, activo))')
    .eq('empresa_id', sesion.empresa.id)
    .order('nombre_completo');
  const hoy = hoyLima();
  return ((data ?? []) as Record<string, unknown>[]).map((p) => ({
    id: String(p.id),
    nombre_completo: String(p.nombre_completo ?? ''),
    email: String(p.email ?? ''),
    telefono: (p.telefono as string | null) ?? null,
    activo: !!p.activo,
    roles: ((p.usuario_roles as Record<string, unknown>[] | null) ?? []).map((a) => {
      const rol = a.roles as { codigo: RolCodigo; activo: boolean } | null;
      return {
        id: String(a.id),
        codigo: rol?.codigo ?? 'consulta',
        desde: String(a.desde),
        hasta: (a.hasta as string | null) ?? null,
        estado: estadoDe(!!rol?.activo, String(a.desde), (a.hasta as string | null) ?? null, hoy),
      };
    }),
  }));
}

const ROLES: RolCodigo[] = ['superadmin', 'gerente', 'coordinador', 'tecnico', 'consulta', 'ventas'];

export function roles_asignables(): RolCodigo[] {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return [];
  return sesion.rolesVigentes.includes('superadmin') ? ROLES : ROLES.filter((r) => r !== 'superadmin');
}

export async function asignar_rol(perfilId: string, codigo: RolCodigo, desde: string, hasta?: string | null): Promise<Resultado<true>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde)) return fallo('Indica desde qué fecha aplica el rol.');
  if (hasta && hasta < desde) return fallo('La fecha de fin no puede ser anterior a la de inicio.');
  const sb = supabase();
  const { data: rol } = await sb.from('roles').select('id').eq('codigo', codigo).maybeSingle();
  if (!rol) return fallo('El rol no existe.');
  const { error } = await sb.from('usuario_roles').insert({
    empresa_id: sesion.empresa.id,
    perfil_id: perfilId,
    rol_id: rol.id,
    desde,
    hasta: hasta?.trim() || null,
    asignado_por: sesion.usuario.id,
  });
  return error ? fallo(mensaje(error)) : ok(true);
}


export async function quitar_rol(asignacionId: string): Promise<Resultado<true>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const sb = supabase();
  const { data: asignacion, error: e1 } = await sb.from('usuario_roles').select('id, desde').eq('id', asignacionId).maybeSingle();
  if (e1) return fallo(mensaje(e1));
  if (!asignacion) return fallo('La asignación no existe.');
  const hoy = hoyLima();
  const { error } =
    asignacion.desde >= hoy
      ? await sb.from('usuario_roles').delete().eq('id', asignacionId)
      : await sb.from('usuario_roles').update({ hasta: sumarDias(hoy, -1), modificado_por: sesion.usuario.id }).eq('id', asignacionId);
  return error ? fallo(mensaje(error)) : ok(true);
}


async function logoComoDataUrl(ruta: string | null | undefined): Promise<string | null> {
  if (!ruta) return null;
  if (/^(data:|https?:)/.test(ruta)) return ruta;
  const { data } = await supabase().storage.from('empresas').download(ruta);
  if (!data) return null;
  return new Promise((resolver) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result));
    lector.onerror = () => resolver(null);
    lector.readAsDataURL(data);
  });
}

export async function parametros_actuales(): Promise<ParametrosEmpresa | null> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return null;
  const { data } = await supabase().from('empresas').select('parametros').eq('id', sesion.empresa.id).maybeSingle();
  if (!data) return null;
  const p = data.parametros as ParametrosEmpresa;
  const pdf = p.pdf ?? { logo: null, direccion: '', telefonos: [], correos: [], redes: [] };
  return {
    ...p,
    pdf: {
      logo: await logoComoDataUrl(pdf.logo),
      direccion: pdf.direccion ?? '',
      telefonos: [...(pdf.telefonos ?? [])],
      correos: [...(pdf.correos ?? [])],
      redes: [...(pdf.redes ?? [])],
      marcas: await Promise.all([0, 1].map((i) => logoComoDataUrl(pdf.marcas?.[i]))),
      color: pdf.color ?? null,
    },
  };
}

// Sube una imagen elegida en pantalla (data:) al bucket "empresas" y devuelve su ruta.
async function rutaImagen(
  valor: string | null | undefined,
  actual: string | null | undefined,
  empresa: string,
  nombre: string,
): Promise<{ ruta: string | null } | { error: string }> {
  if (!valor) return { ruta: null };
  if (/^https?:/.test(valor)) return { ruta: actual ?? null };
  if (!/^(data:|blob:)/.test(valor)) return { ruta: valor };
  const archivo = await blobDe(valor);
  const extension = archivo.type === 'image/jpeg' ? 'jpg' : 'png';
  const ruta = `${empresa}/${nombre}-${Date.now()}.${extension}`;
  const { error } = await supabase().storage.from('empresas').upload(ruta, archivo, { contentType: archivo.type || 'image/png' });
  if (error) return { error: error.message };
  return { ruta };
}

export async function actualizar_parametros(
  p_empresa: string,
  p_cambios: Partial<ParametrosEmpresa>,
): Promise<Resultado<ParametrosEmpresa>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const sb = supabase();
  const cambios: Record<string, unknown> = { ...p_cambios };
  if (p_cambios.pdf) {

    const { data: actual } = await sb.from('empresas').select('parametros').eq('id', p_empresa).maybeSingle();
    const pdfActual = ((actual?.parametros as ParametrosEmpresa | undefined)?.pdf ?? {}) as Partial<ParametrosEmpresa['pdf']>;
    const pdf: Record<string, unknown> = { ...pdfActual, ...p_cambios.pdf };
    const logo = await rutaImagen(p_cambios.pdf.logo, pdfActual.logo, p_empresa, 'logo');
    if ('error' in logo) return fallo(`No se pudo subir el logo: ${logo.error}`);
    pdf.logo = logo.ruta;
    if (p_cambios.pdf.marcas) {
      const marcas: (string | null)[] = [];
      for (const [i, valor] of p_cambios.pdf.marcas.slice(0, 2).entries()) {
        const subida = await rutaImagen(valor, pdfActual.marcas?.[i], p_empresa, `marcas-${i + 1}`);
        if ('error' in subida) return fallo(`No se pudo subir la imagen de marcas: ${subida.error}`);
        marcas.push(subida.ruta);
      }
      pdf.marcas = marcas;
    }
    cambios.pdf = pdf;
  }
  const { data, error } = await sb.rpc('actualizar_parametros', { p_empresa, p_cambios: cambios });
  if (error) return fallo(mensaje(error));
  const parametros = data as ParametrosEmpresa;
  if (sesion.empresa.id === p_empresa) guardarSesion({ ...sesion, empresa: { ...sesion.empresa, parametros } });
  return ok(parametros);
}


export async function empresas_permisos(): Promise<EmpresaPermisos[]> {
  if (!es_superadmin()) return [];
  const { data } = await supabase().from('empresas').select('id, nombre, permisos_consulta').order('nombre');
  return ((data ?? []) as Record<string, unknown>[]).map((e) => ({
    id: String(e.id),
    nombre: String(e.nombre),
    permisos_consulta: (e.permisos_consulta ?? { casos: false, reportes: false, clientes: false }) as PermisosConsulta,
  }));
}

export async function definir_permisos_consulta(p_empresa: string, p_permisos: PermisosConsulta): Promise<Resultado<PermisosConsulta>> {
  const { data, error } = await supabase().rpc('definir_permisos_consulta', { p_empresa, p_permisos });
  return error ? fallo(mensaje(error)) : ok(data as PermisosConsulta);
}


function esCodigo(valor: string): valor is CodigoCatalogo {
  return (CODIGOS_CATALOGO as readonly string[]).includes(valor);
}

export async function listar_catalogo(codigo: string): Promise<ItemCatalogo[]> {
  const empresa = empresa_actual();
  if (!empresa || !esCodigo(codigo)) return [];
  if (codigo === 'repuestos') {
    const { data } = await supabase().from('repuestos').select('id, codigo, descripcion, consumible, activo').eq('empresa_id', empresa).order('codigo');
    return ((data ?? []) as Record<string, unknown>[]).map((r, i) => ({
      id: String(r.id),
      orden: i + 1,
      activo: !!r.activo,
      nombre: String(r.descripcion),
      codigo: (r.codigo as string | null) ?? null,
      consumible: !!r.consumible,
    }));
  }
  const { data } = await supabase().from(codigo).select('id, nombre, orden, activo').eq('empresa_id', empresa).order('orden');
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    orden: Number(r.orden),
    activo: !!r.activo,
    nombre: String(r.nombre),
    codigo: null,
    consumible: null,
  }));
}

export async function crear_valor_catalogo(
  codigo: string,
  datos: { nombre: string; codigo?: string | null; consumible?: boolean },
): Promise<Resultado<ItemCatalogo>> {
  const empresa = empresa_actual();
  if (!empresa) return fallo('Inicia sesión para continuar.');
  if (!esCodigo(codigo)) return fallo('El catálogo no existe.');
  const nombre = datos.nombre.trim();
  if (!nombre) return fallo('Ingresa el nombre.');
  const sb = supabase();
  if (codigo === 'repuestos') {
    const codigoRepuesto = datos.codigo?.trim() ?? '';
    if (!codigoRepuesto) return fallo('Ingresa el código del repuesto.');
    const { data, error } = await sb
      .from('repuestos')
      .insert({ empresa_id: empresa, codigo: codigoRepuesto, descripcion: nombre, consumible: !!datos.consumible })
      .select('id')
      .single();
    if (error || !data) return fallo(mensaje(error));
    return ok({ id: data.id, orden: 0, activo: true, nombre, codigo: codigoRepuesto, consumible: !!datos.consumible });
  }
  const actuales = await listar_catalogo(codigo);
  const orden = actuales.reduce((max, item) => Math.max(max, item.orden), 0) + 1;
  const { data, error } = await sb.from(codigo).insert({ empresa_id: empresa, nombre, orden }).select('id').single();
  if (error || !data) return fallo(mensaje(error));
  return ok({ id: data.id, orden, activo: true, nombre, codigo: null, consumible: null });
}

export async function renombrar_catalogo(codigo: string, id: string, nombre: string): Promise<Resultado<true>> {
  if (!esCodigo(codigo)) return fallo('El catálogo no existe.');
  const limpio = nombre.trim();
  if (!limpio) return fallo('Ingresa el nombre.');
  const cambio = codigo === 'repuestos' ? { descripcion: limpio } : { nombre: limpio };
  const { data, error } = await supabase().from(codigo).update(cambio).eq('id', id).select('id').maybeSingle();
  if (error) return fallo(mensaje(error));
  return data ? ok(true) : fallo('No tienes permiso para hacer esto con tu rol actual.');
}

export async function mover_catalogo(codigo: string, id: string, direccion: 'subir' | 'bajar'): Promise<Resultado<true>> {
  if (!esCodigo(codigo)) return fallo('El catálogo no existe.');
  if (codigo === 'repuestos') return fallo('Los repuestos se ordenan por código.');
  const lista = await listar_catalogo(codigo);
  const indice = lista.findIndex((item) => item.id === id);
  const actual = lista[indice];
  const vecino = lista[direccion === 'subir' ? indice - 1 : indice + 1];
  if (!actual || !vecino) return ok(true);
  const sb = supabase();
  const a = await sb.from(codigo).update({ orden: vecino.orden }).eq('id', actual.id);
  if (a.error) return fallo(mensaje(a.error));
  const b = await sb.from(codigo).update({ orden: actual.orden }).eq('id', vecino.id);
  return b.error ? fallo(mensaje(b.error)) : ok(true);
}

export async function cambiar_activo_catalogo(codigo: string, id: string, activo: boolean): Promise<Resultado<true>> {
  if (!esCodigo(codigo)) return fallo('El catálogo no existe.');
  const { data, error } = await supabase().from(codigo).update({ activo }).eq('id', id).select('id').maybeSingle();
  if (error) return fallo(mensaje(error));
  return data ? ok(true) : fallo('No tienes permiso para hacer esto con tu rol actual.');
}
