

import type { CabezalCantidad, Cliente, Contacto, Equipo, EquipoVista, Resultado, Sede } from '../datos-simulados/types';
import type { AltaCliente, AltaContacto, AltaEquipo, AltaSede } from '../datos-simulados/acciones/altas';
import type { ClienteAdmin, ClienteLista, FichaCliente } from '../datos-simulados/acciones/admin-clientes';
import { supabase } from './cliente';
import { fallo, mensaje, ok } from './base';
import { obtenerUsuarioActual } from './sesion';
import { aEquipoVista, SELECT_EQUIPO } from './vistas';

export type { AltaCliente, AltaContacto, AltaEquipo, AltaSede, ClienteAdmin, ClienteLista, FichaCliente };

const CANTIDADES: readonly CabezalCantidad[] = [1, 2, 3, 4, 6, 8];

function vacio(valor: string | null | undefined): string | null {
  const limpio = valor?.trim() ?? '';
  return limpio || null;
}

function leerRuc(valor: string | null | undefined): { ruc: string | null; error: string | null } {
  const limpio = valor?.trim() ?? '';
  if (!limpio) return { ruc: null, error: null };
  if (!/^\d{11}$/.test(limpio)) return { ruc: null, error: 'El RUC debe tener 11 dígitos.' };
  return { ruc: limpio, error: null };
}


async function soltarPrincipal(clienteId: string, exceptoId?: string): Promise<string | null> {
  let consulta = supabase().from('sedes').update({ principal: false }).eq('cliente_id', clienteId).eq('principal', true);
  if (exceptoId) consulta = consulta.neq('id', exceptoId);
  const { error } = await consulta;
  return error ? mensaje(error) : null;
}


export async function crear_cliente(datos: AltaCliente): Promise<Resultado<Cliente>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const razon = datos.razon_social.trim();
  if (!razon) return fallo('Ingresa la razón social.');
  const leido = leerRuc(datos.ruc);
  if (leido.error) return fallo(leido.error);
  const { data, error } = await supabase()
    .from('clientes')
    .insert({
      empresa_id: sesion.empresa.id,
      razon_social: razon,
      ruc: leido.ruc,
      telefono: vacio(datos.telefono),
      email: vacio(datos.email),
      soporte_vigente: datos.soporte_vigente,
    })
    .select('*')
    .single();
  if (error || !data) return fallo(mensaje(error));
  return ok(data as Cliente);
}

export async function crear_sede(datos: AltaSede): Promise<Resultado<Sede>> {
  const nombre = datos.nombre.trim();
  const direccion = datos.direccion.trim();
  const distrito = datos.distrito.trim();
  if (!nombre || !direccion || !distrito) return fallo('Completa nombre, dirección y distrito de la sede.');
  if (datos.principal) {
    const error = await soltarPrincipal(datos.cliente_id);
    if (error) return fallo(error);
  }
  const { data, error } = await supabase()
    .from('sedes')
    .insert({ cliente_id: datos.cliente_id, nombre, direccion, distrito, referencia: vacio(datos.referencia), principal: datos.principal })
    .select('*')
    .single();
  if (error || !data) return fallo(mensaje(error));
  return ok(data as Sede);
}

export async function crear_equipo(datos: AltaEquipo): Promise<Resultado<EquipoVista>> {
  const serie = datos.numero_serie.trim();
  const modelo = datos.modelo.trim();
  if (!serie || !modelo) return fallo('Ingresa la serie y el modelo del equipo.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha_instalacion)) return fallo('Ingresa la fecha de instalación.');
  if (!CANTIDADES.includes(datos.cabezal_cantidad as CabezalCantidad)) {
    return fallo('La cantidad de cabezales debe ser 1, 2, 3, 4, 6 u 8.');
  }
  const { data, error } = await supabase()
    .from('equipos')
    .insert({
      cliente_id: datos.cliente_id,
      sede_id: datos.sede_id,
      linea_id: datos.linea_id,
      modelo,
      numero_serie: serie,
      cabezal_modelo_id: datos.cabezal_modelo_id || null,
      cabezal_cantidad: datos.cabezal_cantidad,
      fecha_instalacion: datos.fecha_instalacion,
    })
    .select(SELECT_EQUIPO)
    .single();
  if (error || !data) return fallo(mensaje(error));
  return ok(aEquipoVista(data as Record<string, unknown>));
}

export async function crear_contacto(datos: AltaContacto): Promise<Resultado<Contacto>> {
  const nombre = datos.nombre.trim();
  if (!nombre) return fallo('Ingresa el nombre del contacto.');
  const { data, error } = await supabase()
    .from('contactos')
    .insert({ cliente_id: datos.cliente_id, nombre, cargo: vacio(datos.cargo), telefono: vacio(datos.telefono), email: vacio(datos.email) })
    .select('*')
    .single();
  if (error || !data) return fallo(mensaje(error));
  return ok(data as Contacto);
}


const SELECT_CLIENTE_ADMIN = `*, verificador:perfiles!clientes_soporte_verificado_por_fkey(nombre_completo),
  sedes(id, activo), equipos!equipos_cliente_fk(id, activo)`;

function resumir(c: Record<string, unknown>): ClienteAdmin {
  const activos = (lista: unknown) => ((lista as { activo: boolean }[] | null) ?? []).filter((x) => x.activo).length;
  return {
    id: String(c.id),
    empresa_id: String(c.empresa_id),
    razon_social: String(c.razon_social),
    ruc: (c.ruc as string | null) ?? null,
    telefono: (c.telefono as string | null) ?? null,
    email: (c.email as string | null) ?? null,
    soporte_vigente: !!c.soporte_vigente,
    soporte_verificado_en: (c.soporte_verificado_en as string | null) ?? null,
    soporte_verificado_por: (c.soporte_verificado_por as string | null) ?? null,
    soporte_verificado_nombre: (c.verificador as { nombre_completo?: string } | null)?.nombre_completo ?? null,
    activo: !!c.activo,
    sedes: activos(c.sedes),
    equipos: activos(c.equipos),
  };
}

export async function clientes_admin(p_texto = ''): Promise<ClienteAdmin[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return [];
  let consulta = supabase().from('clientes').select(SELECT_CLIENTE_ADMIN).order('razon_social');
  if (!sesion.rolesVigentes.includes('superadmin')) consulta = consulta.eq('empresa_id', sesion.empresa.id);
  const q = p_texto.trim();
  if (q) consulta = consulta.or(`razon_social.ilike.%${q.replace(/[,()%]/g, ' ')}%,ruc.ilike.%${q.replace(/[,()%]/g, ' ')}%`);
  const { data } = await consulta;
  return ((data ?? []) as Record<string, unknown>[]).map(resumir);
}

export async function ficha_cliente(clienteId: string): Promise<Resultado<FichaCliente>> {
  const sb = supabase();
  const [cliente, sedes, contactos, equipos] = await Promise.all([
    sb.from('clientes').select(SELECT_CLIENTE_ADMIN).eq('id', clienteId).maybeSingle(),
    sb.from('sedes').select('*').eq('cliente_id', clienteId).order('principal', { ascending: false }).order('nombre'),
    sb.from('contactos').select('*').eq('cliente_id', clienteId).order('nombre'),
    sb.from('equipos').select(SELECT_EQUIPO).eq('cliente_id', clienteId).order('numero_serie'),
  ]);
  if (cliente.error) return fallo(mensaje(cliente.error));
  if (!cliente.data) return fallo('El cliente no existe.');
  return ok({
    cliente: resumir(cliente.data as Record<string, unknown>),
    sedes: (sedes.data ?? []) as Sede[],
    contactos: (contactos.data ?? []) as Contacto[],
    equipos: ((equipos.data ?? []) as Record<string, unknown>[]).map(aEquipoVista),
  });
}

export async function guardar_cliente(datos: {
  id: string;
  razon_social: string;
  ruc?: string | null;
  telefono?: string | null;
  email?: string | null;
  soporte_vigente: boolean;
  activo: boolean;
}): Promise<Resultado<ClienteAdmin>> {
  const razon = datos.razon_social.trim();
  if (!razon) return fallo('Ingresa la razón social.');
  const leido = leerRuc(datos.ruc);
  if (leido.error) return fallo(leido.error);

  const { data, error } = await supabase()
    .from('clientes')
    .update({
      razon_social: razon,
      ruc: leido.ruc,
      telefono: vacio(datos.telefono),
      email: vacio(datos.email),
      soporte_vigente: datos.soporte_vigente,
      activo: datos.activo,
    })
    .eq('id', datos.id)
    .select(SELECT_CLIENTE_ADMIN)
    .maybeSingle();
  if (error) return fallo(mensaje(error));
  if (!data) return fallo('No tienes permiso para hacer esto con tu rol actual.');
  return ok(resumir(data as Record<string, unknown>));
}

export async function guardar_sede(datos: Sede): Promise<Resultado<Sede>> {
  if (!datos.nombre.trim() || !datos.direccion.trim() || !datos.distrito.trim()) {
    return fallo('Completa nombre, dirección y distrito de la sede.');
  }
  if (datos.principal) {
    const error = await soltarPrincipal(datos.cliente_id, datos.id);
    if (error) return fallo(error);
  }
  const { data, error } = await supabase()
    .from('sedes')
    .update({
      nombre: datos.nombre.trim(),
      direccion: datos.direccion.trim(),
      distrito: datos.distrito.trim(),
      referencia: vacio(datos.referencia),
      principal: datos.principal,
      activo: datos.activo,
    })
    .eq('id', datos.id)
    .select('*')
    .maybeSingle();
  if (error) return fallo(mensaje(error));
  if (!data) return fallo('No tienes permiso para hacer esto con tu rol actual.');
  return ok(data as Sede);
}

export async function guardar_contacto(datos: Contacto): Promise<Resultado<Contacto>> {
  if (!datos.nombre.trim()) return fallo('Ingresa el nombre del contacto.');
  const { data, error } = await supabase()
    .from('contactos')
    .update({
      nombre: datos.nombre.trim(),
      cargo: vacio(datos.cargo),
      telefono: vacio(datos.telefono),
      email: vacio(datos.email),
      activo: datos.activo,
    })
    .eq('id', datos.id)
    .select('*')
    .maybeSingle();
  if (error) return fallo(mensaje(error));
  if (!data) return fallo('No tienes permiso para hacer esto con tu rol actual.');
  return ok(data as Contacto);
}

export async function guardar_equipo(datos: Equipo): Promise<Resultado<EquipoVista>> {
  if (!datos.numero_serie.trim() || !datos.modelo.trim()) return fallo('Ingresa la serie y el modelo del equipo.');
  if (!CANTIDADES.includes(datos.cabezal_cantidad)) return fallo('La cantidad de cabezales debe ser 1, 2, 3, 4, 6 u 8.');
  const { data, error } = await supabase()
    .from('equipos')
    .update({
      sede_id: datos.sede_id,
      linea_id: datos.linea_id,
      modelo: datos.modelo.trim(),
      numero_serie: datos.numero_serie.trim(),
      cabezal_modelo_id: datos.cabezal_modelo_id || null,
      cabezal_cantidad: datos.cabezal_cantidad,
      fecha_instalacion: datos.fecha_instalacion || null,
      activo: datos.activo,
    })
    .eq('id', datos.id)
    .select(SELECT_EQUIPO)
    .maybeSingle();
  if (error) return fallo(mensaje(error));
  if (!data) return fallo('No tienes permiso para hacer esto con tu rol actual.');
  return ok(aEquipoVista(data as Record<string, unknown>));
}

export async function clientes_lista(): Promise<ClienteLista[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return [];
  let consulta = supabase().from('clientes').select('id, razon_social, ruc').eq('activo', true).order('razon_social');
  if (!sesion.rolesVigentes.includes('superadmin')) consulta = consulta.eq('empresa_id', sesion.empresa.id);
  const { data } = await consulta;
  return (data ?? []) as ClienteLista[];
}
