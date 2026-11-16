// =========================================================
// Histórico de reportes en papel (los digitaliza SIREP).
// Tablas: reportes_historicos y repuestos_historicos; vista historial_unificado.
// Entran cerrados: desde la app solo se lee y se confirma el vínculo con
// cliente, equipo, técnico y sede (vincular_historico).
// Contrato con SIREP: docs/contrato-historico.md del backend.
// =========================================================
import { supabase } from './cliente';
import type { Resultado } from '../datos-simulados/types';
import { fallo, mensaje, ok } from './base';

export type Confianza = 'alta' | 'media' | 'baja';

export interface HistoricoLista {
  id: string;
  numero_talonario: string | null;
  fecha: string | null;
  cliente: string;
  equipo: string;
  tecnico: string;
  motivo: string | null;
  resultado: string | null;
  requerimiento: string | null;
  cliente_id: string | null;
  equipo_id: string | null;
  tecnico_id: string | null;
  sede_id: string | null;
  // Lo leído del papel, para mostrar junto al vínculo
  cliente_texto: string | null;
  equipo_texto: string | null;
  tecnico_texto: string | null;
  vinculado: boolean;
}

export interface RepuestoHistorico {
  orden: number;
  codigo: string | null;
  descripcion: string;
  cantidad: number;
  tipo: 'venta' | 'descarte' | 'garantia';
}

export interface HistoricoDetalle extends HistoricoLista {
  sirep_id: string;
  direccion_texto: string | null;
  contacto_texto: string | null;
  telefono_texto: string | null;
  estado_equipo: string | null;
  ultimo_mantenimiento: string | null;
  limpieza: string | null;
  estado_cabezales: string | null;
  sistema_proteccion: string | null;
  sistema_proteccion_otro: string | null;
  tinta: string | null;
  voltaje_ln: number | null;
  voltaje_lt: number | null;
  voltaje_nt: number | null;
  operador: string | null;
  procedimiento: string | null;
  conclusion: string | null;
  recomendaciones: string | null;
  hora_llegada: string | null;
  hora_salida: string | null;
  horas: number | null;
  garantia: 'si' | 'no' | 'sin_dato';
  facturado: 'si' | 'no' | 'sin_dato';
  firma_operador_presente: boolean | null;
  firma_cliente_presente: boolean | null;
  revision_campos: Record<string, { confianza: Confianza | null; estado: string }>;
  datos_originales: Record<string, unknown>;
  revisado_por: string | null;
  revisado_en: string | null;
  importado_en: string;
  vinculado_en: string | null;
  vinculado_por_nombre: string | null;
  sede: string | null;
  escaneo_tipo: string;
  escaneo_url: string | null;
  repuestos: RepuestoHistorico[];
}

export interface FiltrosHistorico {
  q?: string;
  talonario?: string;
  cliente_id?: string;
  equipo_id?: string;
  tecnico_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface SugerenciaVinculo {
  id: string;
  etiqueta: string;
  puntaje: number;
}

export type TipoVinculo = 'cliente' | 'equipo' | 'tecnico' | 'sede';

// Nombres de las FK: perfiles tiene dos (técnico y quien vinculó), por eso se indican.
const SELECT_LISTA = `
  id, numero_talonario, fecha, motivo, resultado, requerimiento,
  cliente_id, equipo_id, tecnico_id, sede_id, cliente_texto, equipo_texto, tecnico_texto,
  cliente:clientes!reportes_historicos_cliente_id_fkey(razon_social),
  equipo:equipos!reportes_historicos_equipo_id_fkey(modelo, numero_serie),
  tecnico:perfiles!reportes_historicos_tecnico_id_fkey(nombre_completo)`;

type Fila = Record<string, unknown> & {
  cliente?: { razon_social?: string } | null;
  equipo?: { modelo?: string; numero_serie?: string } | null;
  tecnico?: { nombre_completo?: string } | null;
};

const equipoTexto = (e: Fila['equipo']) => (e ? [e.modelo, e.numero_serie ? `S/N ${e.numero_serie}` : null].filter(Boolean).join(' · ') : '');

function aLista(f: Fila): HistoricoLista {
  return {
    id: String(f.id),
    numero_talonario: (f.numero_talonario as string) ?? null,
    fecha: (f.fecha as string) ?? null,
    // El vínculo confirmado manda; si no hay, lo leído del papel.
    cliente: f.cliente?.razon_social || (f.cliente_texto as string) || '',
    equipo: equipoTexto(f.equipo) || (f.equipo_texto as string) || '',
    tecnico: f.tecnico?.nombre_completo || (f.tecnico_texto as string) || '',
    motivo: (f.motivo as string) ?? null,
    resultado: (f.resultado as string) ?? null,
    requerimiento: (f.requerimiento as string) ?? null,
    cliente_id: (f.cliente_id as string) ?? null,
    equipo_id: (f.equipo_id as string) ?? null,
    tecnico_id: (f.tecnico_id as string) ?? null,
    sede_id: (f.sede_id as string) ?? null,
    cliente_texto: (f.cliente_texto as string) ?? null,
    equipo_texto: (f.equipo_texto as string) ?? null,
    tecnico_texto: (f.tecnico_texto as string) ?? null,
    vinculado: Boolean(f.cliente_id || f.equipo_id),
  };
}

const normal = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export async function historico_lista(filtros: FiltrosHistorico = {}): Promise<HistoricoLista[]> {
  let q = supabase().from('reportes_historicos').select(SELECT_LISTA).order('fecha', { ascending: false, nullsFirst: false }).limit(2000);
  if (filtros.fecha_desde) q = q.gte('fecha', filtros.fecha_desde);
  if (filtros.fecha_hasta) q = q.lte('fecha', filtros.fecha_hasta);
  if (filtros.cliente_id) q = q.eq('cliente_id', filtros.cliente_id);
  if (filtros.equipo_id) q = q.eq('equipo_id', filtros.equipo_id);
  if (filtros.tecnico_id) q = q.eq('tecnico_id', filtros.tecnico_id);
  if (filtros.talonario?.trim()) q = q.ilike('numero_talonario', `%${filtros.talonario.trim().replace(/[%_]/g, '')}%`);
  const { data, error } = await q;
  if (error || !data) return [];
  let lista = (data as unknown as Fila[]).map(aLista);
  // Cliente, equipo y técnico se buscan también en lo leído del papel, que no siempre está vinculado.
  if (filtros.q?.trim()) {
    const b = normal(filtros.q.trim());
    lista = lista.filter((h) =>
      [h.cliente, h.equipo, h.tecnico, h.numero_talonario, h.motivo, h.cliente_texto, h.equipo_texto, h.tecnico_texto]
        .some((t) => t && normal(t).includes(b)),
    );
  }
  return lista;
}

export async function historico_detalle(id: string): Promise<HistoricoDetalle | null> {
  const sb = supabase();
  const { data, error } = await sb
    .from('reportes_historicos')
    .select(`*,
      cliente:clientes!reportes_historicos_cliente_id_fkey(razon_social),
      equipo:equipos!reportes_historicos_equipo_id_fkey(modelo, numero_serie),
      tecnico:perfiles!reportes_historicos_tecnico_id_fkey(nombre_completo),
      vinculador:perfiles!reportes_historicos_vinculado_por_fkey(nombre_completo),
      sede:sedes!reportes_historicos_sede_id_fkey(nombre, direccion),
      repuestos:repuestos_historicos(orden, codigo, descripcion, cantidad, tipo)`)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  // Columnas planas de la tabla + los objetos de los embeds.
  type FilaDetalle = Fila &
    Omit<HistoricoDetalle, keyof HistoricoLista | 'sede' | 'vinculado_por_nombre' | 'escaneo_url' | 'repuestos'> & {
      escaneo_ruta: string;
      sede?: { nombre?: string; direccion?: string } | null;
      vinculador?: { nombre_completo?: string } | null;
      repuestos?: RepuestoHistorico[] | null;
    };
  const f = data as unknown as FilaDetalle;
  const { data: firmada } = await sb.storage.from('historicos').createSignedUrl(String(f.escaneo_ruta), 3600);
  const { cliente: _c, equipo: _e, tecnico: _t, sede: _s, vinculador: _v, repuestos: _r, ...planas } = f;
  void [_c, _e, _t, _s, _v, _r];
  return {
    ...planas,
    ...aLista(f),
    sede: f.sede ? [f.sede.nombre, f.sede.direccion].filter(Boolean).join(' · ') : null,
    vinculado_por_nombre: f.vinculador?.nombre_completo ?? null,
    revision_campos: f.revision_campos ?? {},
    datos_originales: f.datos_originales ?? {},
    voltaje_ln: f.voltaje_ln === null ? null : Number(f.voltaje_ln),
    voltaje_lt: f.voltaje_lt === null ? null : Number(f.voltaje_lt),
    voltaje_nt: f.voltaje_nt === null ? null : Number(f.voltaje_nt),
    horas: f.horas === null ? null : Number(f.horas),
    hora_llegada: f.hora_llegada ? String(f.hora_llegada).slice(0, 5) : null,
    hora_salida: f.hora_salida ? String(f.hora_salida).slice(0, 5) : null,
    escaneo_url: firmada?.signedUrl ?? null,
    repuestos: (f.repuestos ?? [])
      .map((r) => ({ ...r, cantidad: Number(r.cantidad) }))
      .sort((a, b) => a.orden - b.orden),
  };
}

export async function sugerir_vinculo(tipo: TipoVinculo, texto: string): Promise<SugerenciaVinculo[]> {
  if (!texto.trim()) return [];
  const { data, error } = await supabase().rpc('sugerir_vinculo', { p_tipo: tipo, p_texto: texto, p_limite: 8 });
  if (error || !data) return [];
  return (data as SugerenciaVinculo[]).map((s) => ({ ...s, puntaje: Number(s.puntaje) }));
}

export async function vincular_historico(
  id: string,
  vinculo: { cliente_id: string | null; equipo_id: string | null; tecnico_id: string | null; sede_id: string | null },
): Promise<Resultado<true>> {
  const { error } = await supabase().rpc('vincular_historico', {
    p_reporte: id,
    p_cliente: vinculo.cliente_id,
    p_equipo: vinculo.equipo_id,
    p_tecnico: vinculo.tecnico_id,
    p_sede: vinculo.sede_id,
  });
  return error ? fallo(mensaje(error)) : ok(true as const);
}

export interface HistorialFila {
  origen: 'sistema' | 'historico';
  id: string;
  numero: string | null;
  fecha: string | null;
  cliente: string | null;
  equipo: string | null;
  tecnico: string | null;
  motivo: string | null;
  resultado: string | null;
}

/** Reportes del sistema y en papel juntos, de un cliente o de un equipo. */
export async function historial_unificado(filtro: { cliente_id?: string; equipo_id?: string }): Promise<HistorialFila[]> {
  let q = supabase()
    .from('historial_unificado')
    .select('origen, id, numero, fecha, cliente, equipo, tecnico, motivo, resultado')
    .order('fecha', { ascending: false, nullsFirst: false })
    .limit(500);
  if (filtro.cliente_id) q = q.eq('cliente_id', filtro.cliente_id);
  if (filtro.equipo_id) q = q.eq('equipo_id', filtro.equipo_id);
  const { data, error } = await q;
  return error || !data ? [] : (data as HistorialFila[]);
}
