

import { hoyLima, mesesEntre } from '../datos-simulados/fecha';
import type { Caso, Reporte, Resultado, ResultadoPosventa, SugerenciaModo, VisitaAgenda } from '../datos-simulados/types';
import type { NuevoCasoInput } from '../datos-simulados/acciones/guardar-caso';
import { supabase } from './cliente';
import { fallo, hora, isoLima, mensaje, nombre, ok, tieneRol } from './base';
import { obtenerUsuarioActual } from './sesion';
import { aReporte, leerReporte } from './reportes';

export type { NuevoCasoInput };

export async function crear_caso(datos: NuevoCasoInput): Promise<Resultado<Caso>> {
  if (!obtenerUsuarioActual()) return fallo('Inicia sesión para continuar.');
  if (datos.telefono.trim().length < 6) return fallo('Ingresa un teléfono de al menos 6 caracteres.');
  if (datos.incidencia.trim().length < 5) return fallo('Describe la incidencia.');
  if (datos.modo_sugerido_id && datos.modo_servicio_id !== datos.modo_sugerido_id && !datos.motivo_cambio_modo?.trim()) {
    return fallo('Explica por qué cambias el modo.');
  }

  const { data, error } = await supabase()
    .from('casos')
    .insert({
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
      caso_origen_id: datos.caso_origen_id ?? null,
    })
    .select('*')
    .single();
  if (error || !data) return fallo(mensaje(error));
  return ok({
    ...(data as Caso),
    creado_en: isoLima(data.creado_en) ?? data.creado_en,
    cerrado_en: isoLima(data.cerrado_en),
    anulado_en: isoLima(data.anulado_en),
  });
}

export async function sugerir_modo_servicio(p_equipo: string): Promise<Resultado<SugerenciaModo>> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const sb = supabase();
  const [{ data: modoId, error }, { data: equipo }] = await Promise.all([
    sb.rpc('sugerir_modo_servicio', { p_equipo }),
    sb.from('equipos').select('fecha_instalacion, cliente:clientes!equipos_cliente_fk(soporte_vigente)').eq('id', p_equipo).maybeSingle(),
  ]);
  if (error || !modoId) return fallo(error ? mensaje(error) : 'No hay un modo de servicio activo para esta sugerencia.');
  const { data: modo } = await sb.from('modos_servicio').select('nombre').eq('id', modoId).maybeSingle();
  const garantia = Number(sesion.empresa.parametros?.garantia_meses ?? 12);
  const meses = equipo?.fecha_instalacion ? mesesEntre(equipo.fecha_instalacion, hoyLima()) : 0;
  const antiguedad = meses === 1 ? 'instalado hace 1 mes' : `instalado hace ${meses} meses`;
  const enGarantia = !!equipo?.fecha_instalacion && meses < garantia;
  const soporte = !!(equipo?.cliente as { soporte_vigente?: boolean } | null)?.soporte_vigente;
  const motivo = enGarantia
    ? `${antiguedad} (garantía de ${garantia} meses)`
    : soporte
      ? 'cliente con soporte vigente'
      : `${antiguedad} y sin soporte vigente`;
  return ok({
    modo_id: String(modoId),
    modo_nombre: nombre(modo),
    motivo: `Sugerido: ${motivo}`,
    en_garantia: enGarantia,
    antiguedad_texto: antiguedad,
  });
}


export async function programar_visita(
  p_caso: string,
  p_tecnico: string,
  p_fecha: string,
  p_hora: string,
  p_tecnico_adjunto?: string | null,
): Promise<Resultado<Reporte>> {
  const { data, error } = await supabase().rpc('programar_visita', {
    p_caso,
    p_tecnico,
    p_fecha,
    p_hora,
    p_tecnico_adjunto: p_tecnico_adjunto || null,
  });
  if (error) return fallo(mensaje(error));
  const reporte = await leerReporte(String(data));
  return reporte ? ok(reporte) : fallo('La visita se programó, pero no se pudo leer. Recarga la página.');
}

export async function reprogramar_visita(
  p_reporte: string,
  p_tecnico: string,
  p_fecha: string,
  p_hora: string,
  p_tecnico_adjunto?: string | null,
): Promise<Resultado<Reporte>> {
  const { error } = await supabase().rpc('reprogramar_visita', {
    p_reporte,
    p_tecnico,
    p_fecha,
    p_hora,
    p_tecnico_adjunto: p_tecnico_adjunto || null,
  });
  if (error) return fallo(mensaje(error));
  const reporte = await leerReporte(p_reporte);
  return reporte ? ok(reporte) : fallo('La visita se reprogramó, pero no se pudo leer. Recarga la página.');
}

export async function agenda_tecnico(p_tecnico: string, p_fecha: string): Promise<VisitaAgenda[]> {
  if (!p_tecnico || !p_fecha || !tieneRol('superadmin', 'gerente', 'coordinador')) return [];
  const { data } = await supabase()
    .from('reportes')
    .select('id, caso_id, tecnico_id, hora_programada, caso:casos!reportes_caso_id_fkey(numero, cliente:clientes!casos_cliente_id_fkey(razon_social))')
    .eq('fecha_programada', p_fecha)
    .or(`tecnico_id.eq.${p_tecnico},tecnico_adjunto_id.eq.${p_tecnico}`)
    .order('hora_programada');
  return ((data ?? []) as Record<string, unknown>[]).map((r) => {
    const caso = (r.caso ?? {}) as { numero?: string; cliente?: { razon_social?: string } | null };
    return {
      id: String(r.id),
      caso_id: String(r.caso_id),
      numero_caso: caso.numero ?? '',
      cliente_razon_social: caso.cliente?.razon_social ?? '',
      hora_programada: hora(r.hora_programada as string | null),
      como: r.tecnico_id === p_tecnico ? 'tecnico' : 'adjunto',
    };
  });
}


async function llamar(funcion: string, parametros: Record<string, unknown>): Promise<Resultado<true>> {
  const { error } = await supabase().rpc(funcion, parametros);
  return error ? fallo(mensaje(error)) : ok(true);
}

export async function poner_en_espera(p_caso: string, p_motivo: string, p_comentario?: string | null): Promise<Resultado<true>> {
  return llamar('poner_en_espera', { p_caso, p_motivo, p_comentario: p_comentario?.trim() || null });
}

export async function registrar_posventa(
  p_caso: string,
  p_resultado: ResultadoPosventa,
  p_comentario?: string | null,
): Promise<Resultado<true>> {
  return llamar('registrar_posventa', { p_caso, p_resultado, p_comentario: p_comentario?.trim() || null });
}

export async function anular_caso(p_caso: string, p_motivo: string): Promise<Resultado<true>> {
  if (!p_motivo.trim()) return fallo('Indica el motivo de la anulación.');
  return llamar('anular_caso', { p_caso, p_motivo: p_motivo.trim() });
}

export async function reabrir_caso(p_caso: string, p_motivo: string): Promise<Resultado<true>> {
  if (!p_motivo.trim()) return fallo('Indica el motivo de la reapertura.');
  return llamar('reabrir_caso', { p_caso, p_motivo: p_motivo.trim() });
}

export async function dentro_plazo_misma_falla(p_caso: string): Promise<boolean> {
  if (!p_caso) return false;
  const { data } = await supabase().rpc('dentro_plazo_misma_falla', { p_caso });
  return data === true;
}

export async function fue_tecnico_del_caso(p_caso: string, p_perfil: string): Promise<boolean> {
  if (!p_caso || !p_perfil) return false;
  const { data } = await supabase().rpc('fue_tecnico_del_caso', { p_caso, p_perfil });
  return data === true;
}

export { aReporte };
