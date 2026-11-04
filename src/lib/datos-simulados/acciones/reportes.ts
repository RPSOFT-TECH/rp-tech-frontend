import { ahoraLimaISO, horaLima } from '../fecha';
import { db, nuevoId } from '../store';
import type { Adjunto, EnvioReporte, Nota, Reporte, ReporteRepuesto, Resultado, ResultadoReporte } from '../types';
import { aplicarFormato, casoDeEmpresa, fallo, ok, registrarHistorial, siguienteCorrelativo } from './comun';
import { obtenerUsuarioActual } from './sesion';

export async function registrar_llegada(p_reporte: string, p_hora?: string | null): Promise<Resultado<Reporte>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const reporte = db.reportes.find((item) => item.id === p_reporte);
  if (!reporte) return fallo('La visita no existe.');
  if (reporte.tecnico_id !== sesion.usuario.id) {
    return fallo('Solo el técnico asignado puede registrar la llegada.');
  }
  if (reporte.cerrado) return fallo('El reporte está cerrado y no se puede modificar.');
  if (reporte.hora_llegada) return fallo('La llegada ya fue registrada.');
  const caso = db.casos.find((item) => item.id === reporte.caso_id);
  if (!caso) return fallo('El caso no existe.');
  const empresa = casoDeEmpresa(caso);
  if (empresa) return fallo(empresa);

  const empresaDatos = db.empresas.find((item) => item.id === caso.empresa_id);
  if (!empresaDatos) return fallo('La empresa no existe.');
  if (!reporte.numero) {
    const numeros = db.reportes
      .filter((item) => db.casos.find((c) => c.id === item.caso_id)?.empresa_id === caso.empresa_id)
      .map((item) => item.numero);
    reporte.numero = aplicarFormato(
      empresaDatos.parametros.formato_reporte,
      siguienteCorrelativo(empresaDatos.parametros.formato_reporte, numeros),
    );
  }
  reporte.hora_llegada = p_hora?.trim() || horaLima();
  const anterior = caso.estado;
  if (caso.estado !== 'en_atencion') {
    caso.estado = 'en_atencion';
    registrarHistorial(caso.id, anterior, 'en_atencion', null);
  }
  return ok(reporte);
}

/** Igual que modalidades.remota en la base: la visita remota no exige fotos, firmas, voltajes, limpieza ni protección. */
export function es_visita_remota(p_reporte: string): boolean {
  const reporte = db.reportes.find((item) => item.id === p_reporte);
  const caso = reporte ? db.casos.find((item) => item.id === reporte.caso_id) : undefined;
  const modalidad = caso ? db.modalidades.find((item) => item.id === caso.modalidad_id) : undefined;
  return modalidad?.remota === true;
}

/** Lo que falta para cerrar, con las mismas reglas y textos que cerrar_reporte en la base. */
export function faltantes_cierre(
  reporte: Reporte,
  adjuntos: Pick<Adjunto, 'tipo'>[],
  remota: boolean,
): { revision: string[]; general: string[] } {
  const revision: string[] = [];
  const general: string[] = [];
  if (!reporte.hora_llegada) general.push('Llegada');
  if (!reporte.procedimiento?.trim()) general.push('Procedimiento');
  else if (reporte.procedimiento.trim().length < 20) general.push('Procedimiento (mínimo 20 caracteres)');
  if (!reporte.conclusion?.trim()) general.push('Conclusión');
  if (!reporte.estado_equipo) revision.push('estado del equipo');
  if (!reporte.estado_cabezales) revision.push('estado de los cabezales');
  if (!reporte.tinta?.trim()) revision.push('tinta');
  if (!remota) {
    if (!reporte.limpieza) revision.push('limpieza del equipo');
    if (!reporte.sistema_proteccion) revision.push('sistema de protección');
    else if (reporte.sistema_proteccion === 'otro' && !reporte.sistema_proteccion_otro?.trim()) {
      revision.push('cuál sistema de protección');
    }
    if (reporte.voltaje_ln === null || reporte.voltaje_lt === null || reporte.voltaje_nt === null) {
      revision.push('voltajes L+N, L+T y N+T');
    }
    if (!adjuntos.some((a) => a.tipo === 'foto_ingreso')) general.push('Foto de ingreso');
    if (!adjuntos.some((a) => a.tipo === 'foto_salida')) general.push('Foto de salida');
    if (!reporte.firma_operador || !reporte.nombre_operador_firma?.trim() || !reporte.firma_cliente || !reporte.nombre_cliente_firma?.trim()) {
      general.push('Las dos firmas con su nombre');
    }
  }
  return { revision, general };
}

/** Datos de una visita para la pantalla del reporte. Lo ven el técnico, el adjunto y la oficina de la empresa. */
export async function obtener_reporte(p_reporte: string): Promise<
  Resultado<{ reporte: Reporte; repuestos: ReporteRepuesto[]; adjuntos: Adjunto[]; remota: boolean }>
> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const reporte = db.reportes.find((item) => item.id === p_reporte);
  if (!reporte) return fallo('La visita no existe.');
  const caso = db.casos.find((item) => item.id === reporte.caso_id);
  if (!caso) return fallo('El caso no existe.');
  const empresa = casoDeEmpresa(caso);
  if (empresa) return fallo(empresa);
  const esSuyo = reporte.tecnico_id === sesion.usuario.id || reporte.tecnico_adjunto_id === sesion.usuario.id;
  const esOficina = sesion.rolesVigentes.some((rol) => rol !== 'tecnico');
  if (!esSuyo && !esOficina) return fallo('No tienes permiso para ver este reporte.');
  return ok({
    reporte,
    repuestos: db.reporte_repuestos.filter((item) => item.reporte_id === reporte.id),
    adjuntos: db.adjuntos.filter((item) => item.reporte_id === reporte.id),
    remota: es_visita_remota(reporte.id),
  });
}

export async function cerrar_reporte(
  p_reporte: string,
  p_resultado: ResultadoReporte,
  p_requerimiento?: string | null,
  p_hora_salida?: string | null,
): Promise<Resultado<Reporte>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const reporte = db.reportes.find((item) => item.id === p_reporte);
  if (!reporte) return fallo('La visita no existe.');
  if (reporte.tecnico_id !== sesion.usuario.id) return fallo('Solo el técnico asignado puede cerrar el reporte.');
  if (reporte.cerrado) return fallo('El reporte ya está cerrado.');
  if (!reporte.hora_llegada) return fallo('Registra tu llegada antes de cerrar el reporte.');
  if (!reporte.procedimiento?.trim() || !reporte.conclusion?.trim()) {
    return fallo('Completa el procedimiento y la conclusión.');
  }
  if (reporte.procedimiento.trim().length < 20) {
    return fallo('Describe el procedimiento con más detalle (mínimo 20 caracteres).');
  }
  if (p_resultado !== 'resuelto' && p_resultado !== 'pendiente') return fallo('El resultado debe ser Resuelto o Pendiente.');
  if (p_resultado === 'pendiente' && !p_requerimiento?.trim()) {
    return fallo('Indica qué se requiere para continuar.');
  }
  const remota = es_visita_remota(reporte.id);
  const adjuntos = db.adjuntos.filter((item) => item.reporte_id === reporte.id);
  const { revision } = faltantes_cierre(reporte, adjuntos, remota);
  if (revision.length) return fallo(`Completa la revisión inicial: ${revision.join(', ')}.`);
  if (!remota) {
    if (!adjuntos.some((a) => a.tipo === 'foto_ingreso') || !adjuntos.some((a) => a.tipo === 'foto_salida')) {
      return fallo('Falta al menos una foto de ingreso y una de salida.');
    }
    if (!reporte.firma_operador || !reporte.nombre_operador_firma?.trim() || !reporte.firma_cliente || !reporte.nombre_cliente_firma?.trim()) {
      return fallo('Faltan las firmas del operador y del cliente.');
    }
  }
  const caso = db.casos.find((item) => item.id === reporte.caso_id);
  if (!caso) return fallo('El caso no existe.');
  reporte.resultado = p_resultado;
  reporte.requerimiento = p_requerimiento?.trim() || null;
  reporte.hora_salida = p_hora_salida?.trim() || horaLima();
  reporte.cerrado = true;
  reporte.cerrado_en = ahoraLimaISO();
  const anterior = caso.estado;
  caso.estado = p_resultado === 'resuelto' ? 'atendido' : 'por_programar';
  registrarHistorial(caso.id, anterior, caso.estado, p_requerimiento?.trim() || null);
  return ok(reporte);
}

export async function reportePdf(entrada: {
  reporte_id: string;
  enviar: boolean;
  para?: string | null;
}): Promise<Resultado<{ pdf: null; url: null; envios: EnvioReporte[]; mensaje: string }>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const reporte = db.reportes.find((item) => item.id === entrada.reporte_id);
  if (!reporte) return fallo('La visita no existe.');
  if (!reporte.cerrado) return fallo('El reporte todavía no está cerrado.');
  const caso = db.casos.find((item) => item.id === reporte.caso_id);
  if (!caso) return fallo('El caso no existe.');
  const empresaError = casoDeEmpresa(caso);
  if (empresaError) return fallo(empresaError);
  const empresa = db.empresas.find((item) => item.id === caso.empresa_id);
  if (!empresa) return fallo('La empresa no existe.');
  if (!entrada.enviar) return ok({ pdf: null, url: null, envios: [], mensaje: 'El envío no fue solicitado.' });
  const destino = entrada.para?.trim() || '';
  if (!destino) return fallo('Indica el correo de destino.');
  if (!empresa.parametros.envio_correo) return fallo('El envío por correo está desactivado.');
  const envio: EnvioReporte = {
    id: nuevoId(23),
    reporte_id: reporte.id,
    canal: 'correo',
    destino,
    estado: 'enviado',
    detalle: `enviado a ${destino}`,
    enviado_por: sesion.usuario.id,
  };
  db.envios_reporte.push(envio);
  reporte.pdf = null;
  return ok({ pdf: null, url: null, envios: [envio], mensaje: `enviado a ${destino}` });
}

async function reporteTecnicoAbierto(reporteId: string, sesionId: string): Promise<{ reporte: Reporte; error: string | null }> {
  const reporte = db.reportes.find((item) => item.id === reporteId);
  if (!reporte) return { reporte: null as unknown as Reporte, error: 'La visita no existe.' };
  if (reporte.tecnico_id !== sesionId) return { reporte: null as unknown as Reporte, error: 'Solo el técnico asignado puede modificar este reporte.' };
  if (reporte.cerrado) return { reporte: null as unknown as Reporte, error: 'El reporte está cerrado y no se puede modificar.' };
  return { reporte, error: null };
}

export async function actualizar_revision_inicial(
  p_reporte: string,
  datos: {
    estado_equipo?: 'operativo' | 'inoperativo' | null;
    limpieza?: 'limpio' | 'sucio' | null;
    estado_cabezales?: 'bueno' | 'regular' | 'malo' | null;
    sistema_proteccion?: 'estabilizador' | 'ups' | 'otro' | null;
    sistema_proteccion_otro?: string | null;
    tinta?: string | null;
    voltaje_ln?: number | null;
    voltaje_lt?: number | null;
    voltaje_nt?: number | null;
    operador?: string | null;
    ultimo_mantenimiento?: string | null;
    numero_fisico?: string | null;
  },
): Promise<Resultado<Reporte>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const validacion = await reporteTecnicoAbierto(p_reporte, sesion.usuario.id);
  if (validacion.error) return fallo(validacion.error);
  const reporte = validacion.reporte;
  if (datos.estado_equipo !== undefined) reporte.estado_equipo = datos.estado_equipo;
  if (datos.limpieza !== undefined) reporte.limpieza = datos.limpieza;
  if (datos.estado_cabezales !== undefined) reporte.estado_cabezales = datos.estado_cabezales;
  if (datos.sistema_proteccion !== undefined) reporte.sistema_proteccion = datos.sistema_proteccion;
  if (datos.sistema_proteccion_otro !== undefined) reporte.sistema_proteccion_otro = datos.sistema_proteccion_otro;
  if (datos.tinta !== undefined) reporte.tinta = datos.tinta;
  if (datos.voltaje_ln !== undefined) reporte.voltaje_ln = datos.voltaje_ln;
  if (datos.voltaje_lt !== undefined) reporte.voltaje_lt = datos.voltaje_lt;
  if (datos.voltaje_nt !== undefined) reporte.voltaje_nt = datos.voltaje_nt;
  if (datos.operador !== undefined) reporte.operador = datos.operador;
  if (datos.ultimo_mantenimiento !== undefined) reporte.ultimo_mantenimiento = datos.ultimo_mantenimiento;
  if (datos.numero_fisico !== undefined) reporte.numero_fisico = datos.numero_fisico;
  return ok(reporte);
}

export async function actualizar_desarrollo(
  p_reporte: string,
  datos: {
    procedimiento?: string | null;
    conclusion?: string | null;
    recomendaciones?: string | null;
  },
): Promise<Resultado<Reporte>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const validacion = await reporteTecnicoAbierto(p_reporte, sesion.usuario.id);
  if (validacion.error) return fallo(validacion.error);
  const reporte = validacion.reporte;
  if (datos.procedimiento !== undefined) reporte.procedimiento = datos.procedimiento;
  if (datos.conclusion !== undefined) reporte.conclusion = datos.conclusion;
  if (datos.recomendaciones !== undefined) reporte.recomendaciones = datos.recomendaciones;
  return ok(reporte);
}

export async function agregar_repuesto(
  p_reporte: string,
  datos: { repuesto_id: string; codigo: string; descripcion: string; cantidad: number; tipo: 'venta' | 'descarte' | 'garantia' },
): Promise<Resultado<ReporteRepuesto>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const validacion = await reporteTecnicoAbierto(p_reporte, sesion.usuario.id);
  if (validacion.error) return fallo(validacion.error);
  const repuesto: ReporteRepuesto = {
    id: nuevoId(21),
    reporte_id: p_reporte,
    repuesto_id: datos.repuesto_id,
    codigo: datos.codigo,
    descripcion: datos.descripcion,
    cantidad: datos.cantidad,
    tipo: datos.tipo,
  };
  db.reporte_repuestos.push(repuesto);
  return ok(repuesto);
}

export async function quitar_repuesto(p_reporteRepuestoId: string): Promise<Resultado<null>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const index = db.reporte_repuestos.findIndex((item) => item.id === p_reporteRepuestoId);
  if (index === -1) return fallo('El repuesto no existe.');
  const repuesto = db.reporte_repuestos[index];
  const reporte = db.reportes.find((item) => item.id === repuesto.reporte_id);
  if (!reporte) return fallo('La visita no existe.');
  if (reporte.tecnico_id !== sesion.usuario.id) return fallo('Solo el técnico asignado puede modificar este reporte.');
  if (reporte.cerrado) return fallo('El reporte está cerrado y no se puede modificar.');
  db.reporte_repuestos.splice(index, 1);
  return ok(null);
}

export async function agregar_adjunto(
  p_reporte: string,
  datos: { tipo: 'foto_ingreso' | 'foto_salida' | 'otro'; ruta: string; nombre_archivo: string; tipo_mime: string },
): Promise<Resultado<Adjunto>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const validacion = await reporteTecnicoAbierto(p_reporte, sesion.usuario.id);
  if (validacion.error) return fallo(validacion.error);
  const adjunto: Adjunto = {
    id: nuevoId(22),
    reporte_id: p_reporte,
    tipo: datos.tipo,
    ruta: datos.ruta,
    nombre_archivo: datos.nombre_archivo,
    tipo_mime: datos.tipo_mime,
    subido_por: sesion.usuario.id,
  };
  db.adjuntos.push(adjunto);
  return ok(adjunto);
}

export async function quitar_adjunto(p_adjuntoId: string): Promise<Resultado<null>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const index = db.adjuntos.findIndex((item) => item.id === p_adjuntoId);
  if (index === -1) return fallo('El archivo no existe.');
  const adjunto = db.adjuntos[index];
  const reporte = db.reportes.find((item) => item.id === adjunto.reporte_id);
  if (!reporte) return fallo('La visita no existe.');
  if (reporte.tecnico_id !== sesion.usuario.id) return fallo('Solo el técnico asignado puede modificar este reporte.');
  if (reporte.cerrado) return fallo('El reporte está cerrado y no se puede modificar.');
  db.adjuntos.splice(index, 1);
  return ok(null);
}

export async function agregar_nota(
  p_reporte: string,
  datos: { texto: string },
): Promise<Resultado<Nota>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const validacion = await reporteTecnicoAbierto(p_reporte, sesion.usuario.id);
  if (validacion.error) return fallo(validacion.error);
  const nota: Nota = {
    id: nuevoId(24),
    reporte_id: p_reporte,
    autor_id: sesion.usuario.id,
    texto: datos.texto.trim(),
    creado_en: ahoraLimaISO(),
  };
  db.notas.push(nota);
  return ok(nota);
}

export async function guardar_firmas(
  p_reporte: string,
  datos: {
    firma_operador?: string | null;
    nombre_operador_firma?: string | null;
    firma_cliente?: string | null;
    nombre_cliente_firma?: string | null;
  },
): Promise<Resultado<Reporte>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const validacion = await reporteTecnicoAbierto(p_reporte, sesion.usuario.id);
  if (validacion.error) return fallo(validacion.error);
  const reporte = validacion.reporte;
  if (datos.firma_operador !== undefined) reporte.firma_operador = datos.firma_operador;
  if (datos.nombre_operador_firma !== undefined) reporte.nombre_operador_firma = datos.nombre_operador_firma;
  if (datos.firma_cliente !== undefined) reporte.firma_cliente = datos.firma_cliente;
  if (datos.nombre_cliente_firma !== undefined) reporte.nombre_cliente_firma = datos.nombre_cliente_firma;
  return ok(reporte);
}
