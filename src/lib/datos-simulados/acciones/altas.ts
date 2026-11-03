import { ahoraLimaISO } from '../fecha';
import { db, nuevoId } from '../store';
import type { CabezalCantidad, Cliente, Contacto, EquipoVista, Resultado, Sede } from '../types';
import { exigirRol, fallo, nombreDe, ok } from './comun';
import { obtenerUsuarioActual } from './sesion';

const CANTIDADES: readonly CabezalCantidad[] = [1, 2, 3, 4, 6, 8];

export interface AltaCliente {
  razon_social: string;
  ruc?: string | null;
  telefono?: string | null;
  email?: string | null;
  soporte_vigente: boolean;
}

export interface AltaSede {
  cliente_id: string;
  nombre: string;
  direccion: string;
  distrito: string;
  referencia?: string | null;
  principal: boolean;
}

export interface AltaEquipo {
  cliente_id: string;
  sede_id: string;
  numero_serie: string;
  linea_id: string;
  modelo: string;
  cabezal_modelo_id: string;
  cabezal_cantidad: number;
  fecha_instalacion: string;
}

export interface AltaContacto {
  cliente_id: string;
  nombre: string;
  cargo?: string | null;
  telefono?: string | null;
  email?: string | null;
}

function vacio(valor: string | null | undefined): string | null {
  const limpio = valor?.trim() ?? '';
  return limpio ? limpio : null;
}

function leerRuc(valor: string | null | undefined): { ruc: string | null; error: string | null } {
  const limpio = valor?.trim() ?? '';
  if (!limpio) return { ruc: null, error: null };
  if (!/^\d{11}$/.test(limpio)) return { ruc: null, error: 'El RUC debe tener 11 dígitos.' };
  return { ruc: limpio, error: null };
}

function clientePermitido(clienteId: string): { cliente: Cliente | null; error: string | null } {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return { cliente: null, error: 'Inicia sesión para continuar.' };
  const cliente = db.clientes.find((item) => item.id === clienteId && item.activo);
  if (!cliente) return { cliente: null, error: 'El cliente no existe.' };
  if (!sesion.rolesVigentes.includes('superadmin') && cliente.empresa_id !== sesion.empresa.id) {
    return { cliente: null, error: 'No puedes modificar un cliente de otra empresa.' };
  }
  return { cliente, error: null };
}

export async function crear_cliente(datos: AltaCliente): Promise<Resultado<Cliente>> {
  const permiso = exigirRol(['superadmin', 'gerente', 'coordinador']);
  if (permiso) return fallo(permiso);
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const razon = datos.razon_social.trim();
  if (!razon) return fallo('Ingresa la razón social.');
  const leido = leerRuc(datos.ruc);
  if (leido.error) return fallo(leido.error);
  if (leido.ruc && db.clientes.some((item) => item.activo && item.empresa_id === sesion.empresa.id && item.ruc === leido.ruc)) {
    return fallo('Ya existe un cliente con ese RUC.');
  }
  const cliente: Cliente = {
    id: nuevoId(5),
    empresa_id: sesion.empresa.id,
    razon_social: razon,
    ruc: leido.ruc,
    telefono: vacio(datos.telefono),
    email: vacio(datos.email),
    soporte_vigente: datos.soporte_vigente,
    soporte_verificado_en: datos.soporte_vigente ? ahoraLimaISO() : null,
    soporte_verificado_por: datos.soporte_vigente ? sesion.usuario.id : null,
    activo: true,
  };
  db.clientes.push(cliente);
  return ok(cliente);
}

export async function crear_sede(datos: AltaSede): Promise<Resultado<Sede>> {
  const permiso = exigirRol(['superadmin', 'gerente', 'coordinador']);
  if (permiso) return fallo(permiso);
  const permitido = clientePermitido(datos.cliente_id);
  if (!permitido.cliente || permitido.error) return fallo(permitido.error ?? 'El cliente no existe.');
  const nombre = datos.nombre.trim();
  const direccion = datos.direccion.trim();
  const distrito = datos.distrito.trim();
  if (!nombre || !direccion || !distrito) return fallo('Completa nombre, dirección y distrito de la sede.');
  if (datos.principal) {
    for (const sede of db.sedes) {
      if (sede.cliente_id === permitido.cliente.id && sede.principal) sede.principal = false;
    }
  }
  const sede: Sede = {
    id: nuevoId(7),
    cliente_id: permitido.cliente.id,
    nombre,
    direccion,
    distrito,
    referencia: vacio(datos.referencia),
    principal: datos.principal,
    activo: true,
  };
  db.sedes.push(sede);
  return ok(sede);
}

export async function crear_equipo(datos: AltaEquipo): Promise<Resultado<EquipoVista>> {
  const permiso = exigirRol(['superadmin', 'gerente', 'coordinador']);
  if (permiso) return fallo(permiso);
  const permitido = clientePermitido(datos.cliente_id);
  if (!permitido.cliente || permitido.error) return fallo(permitido.error ?? 'El cliente no existe.');
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const sede = db.sedes.find((item) => item.id === datos.sede_id && item.cliente_id === permitido.cliente?.id && item.activo);
  if (!sede) return fallo('Elige una sede del cliente.');
  const serie = datos.numero_serie.trim();
  const modelo = datos.modelo.trim();
  if (!serie || !modelo) return fallo('Ingresa la serie y el modelo del equipo.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha_instalacion)) return fallo('Ingresa la fecha de instalación.');
  if (!CANTIDADES.includes(datos.cabezal_cantidad as CabezalCantidad)) {
    return fallo('La cantidad de cabezales debe ser 1, 2, 3, 4, 6 u 8.');
  }
  const empresaId = permitido.cliente.empresa_id;
  const lineaOk = db.lineas_maquina.some((item) => item.id === datos.linea_id && item.activo && item.empresa_id === empresaId);
  const cabezalOk = db.modelos_cabezal.some((item) => item.id === datos.cabezal_modelo_id && item.activo && item.empresa_id === empresaId);
  if (!lineaOk || !cabezalOk) return fallo('Elige una línea y un cabezal activos.');
  const serieNormal = serie.toLowerCase();
  const duplicada = db.equipos.some((equipo) => {
    if (!equipo.activo || equipo.numero_serie.toLowerCase() !== serieNormal) return false;
    return db.clientes.some((cliente) => cliente.id === equipo.cliente_id && cliente.empresa_id === empresaId);
  });
  if (duplicada) return fallo('Ya existe un equipo con esa serie.');
  const cantidad = datos.cabezal_cantidad as CabezalCantidad;
  const equipo = {
    id: nuevoId(8),
    cliente_id: permitido.cliente.id,
    sede_id: sede.id,
    linea_id: datos.linea_id,
    modelo,
    numero_serie: serie,
    cabezal_modelo_id: datos.cabezal_modelo_id,
    cabezal_cantidad: cantidad,
    fecha_instalacion: datos.fecha_instalacion,
    activo: true,
  };
  db.equipos.push(equipo);
  const vista: EquipoVista = {
    ...equipo,
    linea_nombre: nombreDe(db.lineas_maquina, equipo.linea_id),
    cabezal_nombre: nombreDe(db.modelos_cabezal, equipo.cabezal_modelo_id),
  };
  return ok(vista);
}

export async function crear_contacto(datos: AltaContacto): Promise<Resultado<Contacto>> {
  const permiso = exigirRol(['superadmin', 'gerente', 'coordinador']);
  if (permiso) return fallo(permiso);
  const permitido = clientePermitido(datos.cliente_id);
  if (!permitido.cliente || permitido.error) return fallo(permitido.error ?? 'El cliente no existe.');
  const nombre = datos.nombre.trim();
  if (!nombre) return fallo('Ingresa el nombre del contacto.');
  const contacto: Contacto = {
    id: nuevoId(6),
    cliente_id: permitido.cliente.id,
    nombre,
    cargo: vacio(datos.cargo),
    telefono: vacio(datos.telefono),
    email: vacio(datos.email),
    activo: true,
  };
  db.contactos.push(contacto);
  return ok(contacto);
}
