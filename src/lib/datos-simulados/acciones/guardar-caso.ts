import { ahoraLimaISO, hoyLima, mesesEntre } from '../fecha';
import { db, nuevoId } from '../store';
import type { Caso, Resultado, SugerenciaModo } from '../types';
import {
  aplicarFormato,
  casoDeEmpresa,
  exigirRol,
  fallo,
  nombreDe,
  ok,
  registrarHistorial,
  siguienteCorrelativo,
} from './comun';
import { obtenerUsuarioActual } from './sesion';

export interface NuevoCasoInput {
  canal_id: string;
  cliente_id: string;
  sede_id: string;
  contacto_id: string;
  telefono: string;
  equipo_id: string;
  incidencia: string;
  tipo_servicio_id: string;
  modalidad_id: string;
  modo_sugerido_id: string | null;
  modo_servicio_id: string;
  motivo_cambio_modo: string | null;
  caso_origen_id?: string | null;
}

export async function crear_caso(datos: NuevoCasoInput): Promise<Resultado<Caso>> {
  const permiso = exigirRol(['superadmin', 'coordinador']);
  if (permiso) return fallo(permiso);
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  if (datos.telefono.trim().length < 6) return fallo('Ingresa un teléfono de al menos 6 caracteres.');
  if (datos.incidencia.trim().length < 5) return fallo('Describe la incidencia.');
  if (datos.modo_sugerido_id && datos.modo_servicio_id !== datos.modo_sugerido_id && !datos.motivo_cambio_modo?.trim()) {
    return fallo('Explica por qué cambias el modo.');
  }
  const cliente = db.clientes.find((item) => item.id === datos.cliente_id && item.activo);
  if (!cliente) return fallo('El cliente no existe.');
  if (!sesion.rolesVigentes.includes('superadmin') && cliente.empresa_id !== sesion.empresa.id) {
    return fallo('No puedes registrar un caso de otra empresa.');
  }

  const empresa = db.empresas.find((item) => item.id === sesion.empresa.id);
  if (!empresa) return fallo('La empresa no existe.');
  const numeros = db.casos.filter((caso) => caso.empresa_id === empresa.id).map((caso) => caso.numero);
  const numero = aplicarFormato(
    empresa.parametros.formato_caso,
    siguienteCorrelativo(empresa.parametros.formato_caso, numeros),
  );
  const caso: Caso = {
    id: nuevoId(9),
    empresa_id: sesion.empresa.id,
    numero,
    canal_id: datos.canal_id,
    cliente_id: datos.cliente_id,
    sede_id: datos.sede_id,
    contacto_id: datos.contacto_id,
    telefono: datos.telefono.trim(),
    equipo_id: datos.equipo_id,
    incidencia: datos.incidencia.trim(),
    tipo_servicio_id: datos.tipo_servicio_id,
    modalidad_id: datos.modalidad_id,
    modo_sugerido_id: datos.modo_sugerido_id,
    modo_servicio_id: datos.modo_servicio_id,
    motivo_cambio_modo: datos.motivo_cambio_modo?.trim() || null,
    estado: 'por_programar',
    motivo_espera_id: null,
    caso_origen_id: datos.caso_origen_id ?? null,
    reaperturas: 0,
    creado_por: sesion.usuario.id,
    cerrado_por: null,
    cerrado_en: null,
    anulado_por: null,
    anulado_en: null,
    motivo_anulacion: null,
    creado_en: ahoraLimaISO(),
  };
  db.casos.push(caso);
  registrarHistorial(caso.id, null, 'por_programar', null);
  return ok(caso);
}

export async function sugerir_modo_servicio(p_equipo: string): Promise<Resultado<SugerenciaModo>> {
  const permiso = exigirRol(['superadmin', 'gerente', 'coordinador']);
  if (permiso) return fallo(permiso);
  const sesion = obtenerUsuarioActual();
  const equipo = db.equipos.find((item) => item.id === p_equipo);
  if (!equipo || !sesion) return fallo('El equipo no existe.');
  const ajeno = !sesion.rolesVigentes.includes('superadmin')
    && db.clientes.find((item) => item.id === equipo.cliente_id)?.empresa_id !== sesion.empresa.id;
  if (ajeno) return fallo('El equipo no pertenece a tu empresa.');
  const cliente = db.clientes.find((item) => item.id === equipo.cliente_id);
  const empresa = db.empresas.find((item) => item.id === sesion.empresa.id);
  if (!empresa) return fallo('La empresa no existe.');
  const meses = mesesEntre(equipo.fecha_instalacion, hoyLima());
  const garantia = empresa.parametros.garantia_meses;
  const antiguedad = meses === 1 ? 'instalado hace 1 mes' : `instalado hace ${meses} meses`;
  const enGarantia = meses < garantia;
  const modoNombre = enGarantia
    ? 'Garantía del equipo'
    : cliente?.soporte_vigente
      ? 'Garantía de soporte técnico'
      : 'Facturado';
  const modo = db.modos_servicio.find((item) => item.empresa_id === empresa.id && item.nombre === modoNombre && item.activo);
  if (!modo) return fallo('No hay un modo de servicio activo para esta sugerencia.');
  const motivo = enGarantia
    ? `${antiguedad} (garantía de ${garantia} meses)`
    : cliente?.soporte_vigente
      ? 'cliente con soporte vigente'
      : `${antiguedad} y sin soporte vigente`;
  return ok({
    modo_id: modo.id,
    modo_nombre: nombreDe(db.modos_servicio, modo.id),
    motivo: `Sugerido: ${motivo}`,
    en_garantia: enGarantia,
    antiguedad_texto: antiguedad,
  });
}

export async function validarCasoEditable(casoId: string): Promise<Resultado<Caso>> {
  const caso = db.casos.find((item) => item.id === casoId);
  if (!caso) return fallo('El caso no existe.');
  const empresa = casoDeEmpresa(caso);
  if (empresa) return fallo(empresa);
  return ok(caso);
}
