import { ahoraLimaISO } from '../fecha';
import { db } from '../store';
import type { CabezalCantidad, Cliente, Contacto, Equipo, EquipoVista, Resultado, Sede } from '../types';
import { exigirRol, fallo, nombreDe, normalizar, ok } from './comun';
import { obtenerUsuarioActual } from './sesion';

const CANTIDADES: readonly CabezalCantidad[] = [1, 2, 3, 4, 6, 8];

export interface ClienteAdmin {
  id: string;
  empresa_id: string;
  razon_social: string;
  ruc: string | null;
  telefono: string | null;
  email: string | null;
  soporte_vigente: boolean;
  soporte_verificado_en: string | null;
  soporte_verificado_por: string | null;
  soporte_verificado_nombre: string | null;
  activo: boolean;
  sedes: number;
  equipos: number;
}

export interface FichaCliente {
  cliente: ClienteAdmin;
  sedes: Sede[];
  contactos: Contacto[];
  equipos: EquipoVista[];
}

function oficina(): string | null {
  return exigirRol(['superadmin', 'gerente', 'coordinador']);
}

function leerRuc(valor: string | null | undefined): { ruc: string | null; error: string | null } {
  const limpio = valor?.trim() ?? '';
  if (!limpio) return { ruc: null, error: null };
  if (!/^\d{11}$/.test(limpio)) return { ruc: null, error: 'El RUC debe tener 11 dígitos.' };
  return { ruc: limpio, error: null };
}

function clienteDe(id: string): { cliente: Cliente | null; error: string | null } {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return { cliente: null, error: 'Inicia sesión para continuar.' };
  const cliente = db.clientes.find((item) => item.id === id);
  if (!cliente) return { cliente: null, error: 'El cliente no existe.' };
  if (!sesion.rolesVigentes.includes('superadmin') && cliente.empresa_id !== sesion.empresa.id) {
    return { cliente: null, error: 'No puedes modificar un cliente de otra empresa.' };
  }
  return { cliente, error: null };
}

function resumir(cliente: Cliente): ClienteAdmin {
  return {
    id: cliente.id,
    empresa_id: cliente.empresa_id,
    razon_social: cliente.razon_social,
    ruc: cliente.ruc,
    telefono: cliente.telefono,
    email: cliente.email,
    soporte_vigente: cliente.soporte_vigente,
    soporte_verificado_en: cliente.soporte_verificado_en,
    soporte_verificado_por: cliente.soporte_verificado_por,
    soporte_verificado_nombre: db.perfiles.find((perfil) => perfil.id === cliente.soporte_verificado_por)?.nombre_completo ?? null,
    activo: cliente.activo,
    sedes: db.sedes.filter((sede) => sede.cliente_id === cliente.id && sede.activo).length,
    equipos: db.equipos.filter((equipo) => equipo.cliente_id === cliente.id && equipo.activo).length,
  };
}

export async function clientes_admin(p_texto = ''): Promise<ClienteAdmin[]> {
  if (oficina()) return [];
  const sesion = obtenerUsuarioActual();
  if (!sesion) return [];
  const q = normalizar(p_texto.trim());
  const lista = db.clientes
    .filter((cliente) => {
      if (!sesion.rolesVigentes.includes('superadmin') && cliente.empresa_id !== sesion.empresa.id) return false;
      if (!q) return true;
      return normalizar(cliente.razon_social).includes(q) || (cliente.ruc ?? '').includes(q);
    })
    .map(resumir)
    .sort((a, b) => a.razon_social.localeCompare(b.razon_social, 'es'));
  return lista;
}

export async function ficha_cliente(clienteId: string): Promise<Resultado<FichaCliente>> {
  const permiso = oficina();
  if (permiso) return fallo(permiso);
  const hallado = clienteDe(clienteId);
  if (!hallado.cliente || hallado.error) return fallo(hallado.error ?? 'El cliente no existe.');
  const equipos: EquipoVista[] = db.equipos
    .filter((equipo) => equipo.cliente_id === clienteId)
    .map((equipo) => ({
      ...equipo,
      linea_nombre: nombreDe(db.lineas_maquina, equipo.linea_id),
      cabezal_nombre: nombreDe(db.modelos_cabezal, equipo.cabezal_modelo_id),
    }));
  return ok({
    cliente: resumir(hallado.cliente),
    sedes: db.sedes.filter((sede) => sede.cliente_id === clienteId),
    contactos: db.contactos.filter((contacto) => contacto.cliente_id === clienteId),
    equipos,
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
  const permiso = oficina();
  if (permiso) return fallo(permiso);
  const sesion = obtenerUsuarioActual();
  const hallado = clienteDe(datos.id);
  if (!hallado.cliente || hallado.error || !sesion) return fallo(hallado.error ?? 'El cliente no existe.');
  const razon = datos.razon_social.trim();
  if (!razon) return fallo('Ingresa la razón social.');
  const leido = leerRuc(datos.ruc);
  if (leido.error) return fallo(leido.error);
  const duplicado = db.clientes.some(
    (item) => item.id !== datos.id && item.activo && item.empresa_id === hallado.cliente?.empresa_id && item.ruc && item.ruc === leido.ruc,
  );
  if (duplicado) return fallo('Ya existe un cliente con ese RUC.');
  const cliente = hallado.cliente;
  if (datos.soporte_vigente && !cliente.soporte_vigente) {
    cliente.soporte_verificado_en = ahoraLimaISO();
    cliente.soporte_verificado_por = sesion.usuario.id;
  }
  if (!datos.soporte_vigente) {
    cliente.soporte_verificado_en = null;
    cliente.soporte_verificado_por = null;
  }
  cliente.razon_social = razon;
  cliente.ruc = leido.ruc;
  cliente.telefono = datos.telefono?.trim() || null;
  cliente.email = datos.email?.trim() || null;
  cliente.soporte_vigente = datos.soporte_vigente;
  cliente.activo = datos.activo;
  return ok(resumir(cliente));
}

export async function guardar_sede(datos: Sede): Promise<Resultado<Sede>> {
  const permiso = oficina();
  if (permiso) return fallo(permiso);
  const hallado = clienteDe(datos.cliente_id);
  if (!hallado.cliente || hallado.error) return fallo(hallado.error ?? 'El cliente no existe.');
  const sede = db.sedes.find((item) => item.id === datos.id && item.cliente_id === datos.cliente_id);
  if (!sede) return fallo('La sede no existe.');
  if (!datos.nombre.trim() || !datos.direccion.trim() || !datos.distrito.trim()) {
    return fallo('Completa nombre, dirección y distrito de la sede.');
  }
  if (datos.principal) {
    for (const otra of db.sedes) {
      if (otra.cliente_id === datos.cliente_id && otra.id !== sede.id) otra.principal = false;
    }
  }
  sede.nombre = datos.nombre.trim();
  sede.direccion = datos.direccion.trim();
  sede.distrito = datos.distrito.trim();
  sede.referencia = datos.referencia?.trim() || null;
  sede.principal = datos.principal;
  sede.activo = datos.activo;
  return ok(sede);
}

export async function guardar_contacto(datos: Contacto): Promise<Resultado<Contacto>> {
  const permiso = oficina();
  if (permiso) return fallo(permiso);
  const hallado = clienteDe(datos.cliente_id);
  if (!hallado.cliente || hallado.error) return fallo(hallado.error ?? 'El cliente no existe.');
  const contacto = db.contactos.find((item) => item.id === datos.id && item.cliente_id === datos.cliente_id);
  if (!contacto) return fallo('El contacto no existe.');
  if (!datos.nombre.trim()) return fallo('Ingresa el nombre del contacto.');
  contacto.nombre = datos.nombre.trim();
  contacto.cargo = datos.cargo?.trim() || null;
  contacto.telefono = datos.telefono?.trim() || null;
  contacto.email = datos.email?.trim() || null;
  contacto.activo = datos.activo;
  return ok(contacto);
}

export async function guardar_equipo(datos: Equipo): Promise<Resultado<EquipoVista>> {
  const permiso = oficina();
  if (permiso) return fallo(permiso);
  const hallado = clienteDe(datos.cliente_id);
  if (!hallado.cliente || hallado.error) return fallo(hallado.error ?? 'El cliente no existe.');
  const equipo = db.equipos.find((item) => item.id === datos.id && item.cliente_id === datos.cliente_id);
  if (!equipo) return fallo('El equipo no existe.');
  const sede = db.sedes.find((item) => item.id === datos.sede_id && item.cliente_id === datos.cliente_id);
  if (!sede) return fallo('Elige una sede del cliente.');
  if (!datos.numero_serie.trim() || !datos.modelo.trim()) return fallo('Ingresa la serie y el modelo del equipo.');
  if (!CANTIDADES.includes(datos.cabezal_cantidad)) return fallo('La cantidad de cabezales debe ser 1, 2, 3, 4, 6 u 8.');
  const empresaId = hallado.cliente.empresa_id;
  const serie = datos.numero_serie.trim().toLowerCase();
  const duplicada = db.equipos.some((item) => {
    if (item.id === equipo.id || !item.activo || item.numero_serie.toLowerCase() !== serie) return false;
    return db.clientes.some((cliente) => cliente.id === item.cliente_id && cliente.empresa_id === empresaId);
  });
  if (duplicada) return fallo('Ya existe un equipo con esa serie.');
  equipo.sede_id = sede.id;
  equipo.linea_id = datos.linea_id;
  equipo.modelo = datos.modelo.trim();
  equipo.numero_serie = datos.numero_serie.trim();
  equipo.cabezal_modelo_id = datos.cabezal_modelo_id;
  equipo.cabezal_cantidad = datos.cabezal_cantidad;
  equipo.fecha_instalacion = datos.fecha_instalacion;
  equipo.activo = datos.activo;
  return ok({
    ...equipo,
    linea_nombre: nombreDe(db.lineas_maquina, equipo.linea_id),
    cabezal_nombre: nombreDe(db.modelos_cabezal, equipo.cabezal_modelo_id),
  });
}

export interface ClienteLista {
  id: string;
  razon_social: string;
  ruc: string | null;
}

export async function clientes_lista(): Promise<ClienteLista[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return [];
  const lista = db.clientes
    .filter((cliente) => {
      if (!cliente.activo) return false;
      if (!sesion.rolesVigentes.includes('superadmin') && cliente.empresa_id !== sesion.empresa.id) return false;
      return true;
    })
    .map((cliente) => ({
      id: cliente.id,
      razon_social: cliente.razon_social,
      ruc: cliente.ruc,
    }))
    .sort((a, b) => a.razon_social.localeCompare(b.razon_social, 'es'));
  return lista;
}
