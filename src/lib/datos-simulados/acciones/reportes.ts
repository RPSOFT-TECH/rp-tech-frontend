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
  if (reporte.cerrado) return fallo('El reporte está cerrado y no se puede modificar.');
  if (!reporte.hora_llegada) return fallo('Registra la llegada antes de cerrar el reporte.');
  if (!reporte.firma_operador || !reporte.firma_cliente) return fallo('Para cerrar el reporte faltan las firmas.');
  const ingresos = db.adjuntos.filter((item) => item.reporte_id === reporte.id && item.tipo === 'foto_ingreso');
  const salidas = db.adjuntos.filter((item) => item.reporte_id === reporte.id && item.tipo === 'foto_salida');
  if (ingresos.length === 0 || salidas.length === 0) {
    return fallo('Para cerrar el reporte falta al menos una foto de ingreso y una de salida.');
  }
  if (p_resultado !== 'resuelto' && p_resultado !== 'pendiente') return fallo('El resultado del reporte no es válido.');
  if (p_resultado === 'pendiente' && !p_requerimiento?.trim()) {
    return fallo('Indica el requerimiento para dejar el reporte pendiente.');
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
