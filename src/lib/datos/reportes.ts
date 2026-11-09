

import type { Adjunto, EnvioReporte, Nota, Reporte, ReporteRepuesto, Resultado, ResultadoReporte } from '../datos-simulados/types';
import { supabase } from './cliente';
import { blobDe, fallo, hora, horaDe, isoLima, marcaDeHoy, mensaje, nombreSeguro, numero, ok } from './base';
import { obtenerUsuarioActual } from './sesion';
import { aAdjunto, aEnvio, aNota, aRepuesto } from './vistas';

const BUCKET = 'reportes';


export function aReporte(r: Record<string, unknown>): Reporte {
  return {
    id: String(r.id),
    caso_id: String(r.caso_id),
    numero_visita: Number(r.numero_visita),
    numero: (r.numero as string | null) ?? null,
    numero_fisico: (r.numero_fisico as string | null) ?? null,
    tecnico_id: String(r.tecnico_id),
    tecnico_adjunto_id: (r.tecnico_adjunto_id as string | null) ?? null,
    fecha_programada: (r.fecha_programada as string | null) ?? null,
    hora_programada: hora(r.hora_programada as string | null),
    hora_llegada: horaDe(r.hora_llegada as string | null),
    hora_salida: horaDe(r.hora_salida as string | null),
    horas: numero(r.horas),
    estado_equipo: (r.estado_equipo as Reporte['estado_equipo']) ?? null,
    ultimo_mantenimiento: (r.ultimo_mantenimiento as string | null) ?? null,
    limpieza: (r.limpieza as Reporte['limpieza']) ?? null,
    estado_cabezales: (r.estado_cabezales as Reporte['estado_cabezales']) ?? null,
    sistema_proteccion: (r.sistema_proteccion as Reporte['sistema_proteccion']) ?? null,
    sistema_proteccion_otro: (r.sistema_proteccion_otro as string | null) ?? null,
    tinta: (r.tinta as string | null) ?? null,
    voltaje_ln: numero(r.voltaje_ln),
    voltaje_lt: numero(r.voltaje_lt),
    voltaje_nt: numero(r.voltaje_nt),
    operador: (r.operador as string | null) ?? null,
    procedimiento: (r.procedimiento as string | null) ?? null,
    conclusion: (r.conclusion as string | null) ?? null,
    recomendaciones: (r.recomendaciones as string | null) ?? null,
    resultado: (r.resultado as ResultadoReporte | null) ?? null,
    requerimiento: (r.requerimiento as string | null) ?? null,
    firma_operador: (r.firma_operador as string | null) ?? null,
    nombre_operador_firma: (r.nombre_operador_firma as string | null) ?? null,
    firma_cliente: (r.firma_cliente as string | null) ?? null,
    nombre_cliente_firma: (r.nombre_cliente_firma as string | null) ?? null,
    cerrado: !!r.cerrado,
    cerrado_en: isoLima(r.cerrado_en as string | null),
    pdf: (r.pdf as string | null) ?? null,
  };
}

export async function leerReporte(id: string): Promise<Reporte | null> {
  const { data } = await supabase().from('reportes').select('*').eq('id', id).maybeSingle();
  return data ? aReporte(data) : null;
}


async function enlace(ruta: string | null): Promise<string | null> {
  if (!ruta || /^(https?:|data:|blob:)/.test(ruta)) return ruta;
  const { data } = await supabase().storage.from(BUCKET).createSignedUrl(ruta, 3600);
  return data?.signedUrl ?? null;
}

async function subir(reporteId: string, nombreArchivo: string, origen: string | Blob, tipo?: string): Promise<string> {
  const archivo = typeof origen === 'string' ? await blobDe(origen) : origen;
  const ruta = `${reporteId}/${Date.now()}-${nombreSeguro(nombreArchivo)}`;
  const { error } = await supabase()
    .storage.from(BUCKET)
    .upload(ruta, archivo, { contentType: tipo || archivo.type || 'application/octet-stream', upsert: false });
  if (error) throw new Error(`No se pudo subir el archivo: ${error.message}`);
  return ruta;
}


export async function obtener_reporte(p_reporte: string): Promise<
  Resultado<{ reporte: Reporte; repuestos: ReporteRepuesto[]; adjuntos: (Adjunto & { url: string | null })[]; remota: boolean }>
> {
  if (!obtenerUsuarioActual()) return fallo('Inicia sesión para continuar.');
  const { data, error } = await supabase()
    .from('reportes')
    .select('*, reporte_repuestos(*), adjuntos(*), caso:casos!reportes_caso_id_fkey(modalidad:modalidades!casos_modalidad_id_fkey(remota))')
    .eq('id', p_reporte)
    .maybeSingle();
  if (error || !data) return fallo(error ? mensaje(error) : 'La visita no existe.');
  const reporte = aReporte(data);

  const [firmaOperador, firmaCliente] = await Promise.all([enlace(reporte.firma_operador), enlace(reporte.firma_cliente)]);
  const adjuntos = await Promise.all(
    ((data.adjuntos ?? []) as Record<string, unknown>[]).map(async (a) => {
      const adjunto = aAdjunto(a);
      return { ...adjunto, url: await enlace(adjunto.ruta) };
    }),
  );
  const caso = data.caso as { modalidad?: { remota?: boolean } | null } | null;
  return ok({
    reporte: { ...reporte, firma_operador: firmaOperador, firma_cliente: firmaCliente },
    repuestos: ((data.reporte_repuestos ?? []) as Record<string, unknown>[]).map(aRepuesto),
    adjuntos,
    remota: caso?.modalidad?.remota === true,
  });
}


export async function registrar_llegada(p_reporte: string, p_hora?: string | null): Promise<Resultado<Reporte>> {
  const { error } = await supabase().rpc('registrar_llegada', { p_reporte, p_hora: marcaDeHoy(p_hora) });
  if (error) return fallo(mensaje(error));
  const reporte = await leerReporte(p_reporte);
  return reporte ? ok(reporte) : fallo('La llegada se registró, pero no se pudo leer el reporte.');
}

export async function cerrar_reporte(
  p_reporte: string,
  p_resultado: ResultadoReporte,
  p_requerimiento?: string | null,
  p_hora_salida?: string | null,
): Promise<Resultado<Reporte>> {
  const { error } = await supabase().rpc('cerrar_reporte', {
    p_reporte,
    p_resultado,
    p_requerimiento: p_requerimiento?.trim() || null,
    p_hora_salida: marcaDeHoy(p_hora_salida),
  });
  if (error) return fallo(mensaje(error));
  const reporte = await leerReporte(p_reporte);
  return reporte ? ok(reporte) : fallo('El reporte se cerró, pero no se pudo leer.');
}


export async function reportePdf(entrada: {
  reporte_id: string;
  enviar: boolean;
  para?: string | null;
}): Promise<Resultado<{ pdf: string | null; url: string | null; envios: EnvioReporte[]; mensaje: string }>> {
  if (!obtenerUsuarioActual()) return fallo('Inicia sesión para continuar.');
  const { data, error } = await supabase().functions.invoke('reporte-pdf', {
    body: { reporte_id: entrada.reporte_id, enviar: entrada.enviar, para: entrada.para?.trim() || undefined },
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
  const envios = ((data?.envios ?? []) as Record<string, unknown>[]).map((e) => aEnvio({ ...e, reporte_id: entrada.reporte_id }));
  const enviados = envios.filter((e) => e.estado === 'enviado').map((e) => e.destino);
  return ok({
    pdf: data?.pdf ?? null,
    url: data?.url ?? null,
    envios,
    mensaje: enviados.length ? `enviado a ${enviados.join(', ')}` : envios[0]?.detalle ?? 'PDF generado.',
  });
}


export async function enlace_pdf(ruta: string | null): Promise<string | null> {
  return enlace(ruta);
}


async function actualizar(p_reporte: string, cambios: Record<string, unknown>): Promise<Resultado<Reporte>> {
  const limpios = Object.fromEntries(Object.entries(cambios).filter(([, v]) => v !== undefined));
  const { data, error } = await supabase().from('reportes').update(limpios).eq('id', p_reporte).select('*').maybeSingle();
  if (error) return fallo(mensaje(error));
  if (!data) return fallo('Solo el técnico asignado puede modificar este reporte abierto.');
  return ok(aReporte(data));
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
  return actualizar(p_reporte, datos);
}

export async function actualizar_desarrollo(
  p_reporte: string,
  datos: { procedimiento?: string | null; conclusion?: string | null; recomendaciones?: string | null },
): Promise<Resultado<Reporte>> {
  return actualizar(p_reporte, datos);
}

export async function agregar_repuesto(
  p_reporte: string,
  datos: { repuesto_id: string; codigo: string; descripcion: string; cantidad: number; tipo: 'venta' | 'descarte' | 'garantia' },
): Promise<Resultado<ReporteRepuesto>> {
  const { data, error } = await supabase()
    .from('reporte_repuestos')
    .insert({
      reporte_id: p_reporte,
      repuesto_id: datos.repuesto_id || null,
      codigo: datos.codigo?.trim() && datos.codigo !== 'MANUAL' ? datos.codigo.trim() : null,
      descripcion: datos.descripcion.trim(),
      cantidad: datos.cantidad,
      tipo: datos.tipo,
    })
    .select('*')
    .single();
  if (error || !data) return fallo(mensaje(error));
  return ok(aRepuesto(data));
}

export async function quitar_repuesto(p_reporteRepuestoId: string): Promise<Resultado<null>> {
  const { error } = await supabase().from('reporte_repuestos').delete().eq('id', p_reporteRepuestoId);
  return error ? fallo(mensaje(error)) : ok(null);
}


export async function agregar_adjunto(
  p_reporte: string,
  datos: { tipo: 'foto_ingreso' | 'foto_salida' | 'otro'; ruta: string; nombre_archivo: string; tipo_mime: string; archivo?: Blob },
): Promise<Resultado<Adjunto>> {
  try {
    const ruta = await subir(p_reporte, datos.nombre_archivo, datos.archivo ?? datos.ruta, datos.tipo_mime);
    const { data, error } = await supabase()
      .from('adjuntos')
      .insert({ reporte_id: p_reporte, tipo: datos.tipo, ruta, nombre_archivo: datos.nombre_archivo, tipo_mime: datos.tipo_mime })
      .select('*')
      .single();
    if (error || !data) {
      await supabase().storage.from(BUCKET).remove([ruta]);
      return fallo(mensaje(error));
    }
    return ok(aAdjunto(data));
  } catch (e) {
    return fallo(e instanceof Error ? e.message : 'No se pudo subir el archivo.');
  }
}

export async function quitar_adjunto(p_adjuntoId: string): Promise<Resultado<null>> {
  const sb = supabase();
  const { data, error } = await sb.from('adjuntos').delete().eq('id', p_adjuntoId).select('ruta').maybeSingle();
  if (error) return fallo(mensaje(error));
  if (data?.ruta) await sb.storage.from(BUCKET).remove([data.ruta]);
  return ok(null);
}

export async function agregar_nota(p_reporte: string, datos: { texto: string }): Promise<Resultado<Nota>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  if (!datos.texto.trim()) return fallo('Escribe la nota.');
  const { data, error } = await supabase()
    .from('notas')
    .insert({ reporte_id: p_reporte, autor_id: sesion.usuario.id, texto: datos.texto.trim() })
    .select('*')
    .single();
  if (error || !data) return fallo(mensaje(error));
  return ok(aNota(data));
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
  try {
    const cambios: Record<string, unknown> = {
      nombre_operador_firma: datos.nombre_operador_firma,
      nombre_cliente_firma: datos.nombre_cliente_firma,
    };
    for (const [campo, nombreArchivo] of [
      ['firma_operador', 'firma-operador.png'],
      ['firma_cliente', 'firma-cliente.png'],
    ] as const) {
      const valor = datos[campo];
      if (valor === undefined) continue;
      if (valor === null) cambios[campo] = null;
      else if (/^(blob:|data:)/.test(valor)) cambios[campo] = await subir(p_reporte, nombreArchivo, valor, 'image/png');
    }
    const r = await actualizar(p_reporte, cambios);
    if (!r.ok) return r;
    const [fo, fc] = await Promise.all([enlace(r.datos.firma_operador), enlace(r.datos.firma_cliente)]);
    return ok({ ...r.datos, firma_operador: fo, firma_cliente: fc });
  } catch (e) {
    return fallo(e instanceof Error ? e.message : 'No se pudieron guardar las firmas.');
  }
}


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
