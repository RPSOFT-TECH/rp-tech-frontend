
import type {
  Adjunto,
  Caso,
  CasoLista,
  Catalogo,
  CatalogosActivos,
  Cliente,
  Contacto,
  EnvioReporte,
  EquipoVista,
  HistorialEstado,
  MiServicio,
  Nota,
  Posventa,
  Repuesto,
  ReporteLista,
  ReporteRepuesto,
  Sede,
  TecnicoLista,
} from '../datos-simulados/types';
import type { CasoDetalle, VisitaDetalle } from '../datos-simulados/tipos-vista';
import type { FiltrosCasosLista } from '../datos-simulados/acciones/vistas';
import { supabase } from './cliente';
import { hora, isoLima, nombre, nombreCompleto, numero, tieneRol } from './base';
import { obtenerUsuarioActual } from './sesion';

export type { FiltrosCasosLista };

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}


const SELECT_CASO = `*,
  canal:canales!casos_canal_id_fkey(nombre),
  cliente:clientes!casos_cliente_id_fkey(razon_social, ruc, telefono),
  sede:sedes!casos_sede_id_fkey(nombre, direccion, distrito, referencia),
  contacto:contactos!casos_contacto_id_fkey(nombre, cargo, telefono),
  equipo:equipos!casos_equipo_id_fkey(numero_serie, modelo, cabezal_cantidad, linea:lineas_maquina(nombre), cabezal:modelos_cabezal(nombre)),
  tipo:tipos_servicio!casos_tipo_servicio_id_fkey(nombre),
  modalidad:modalidades!casos_modalidad_id_fkey(nombre),
  modo:modos_servicio!casos_modo_servicio_id_fkey(nombre),
  sugerido:modos_servicio!casos_modo_sugerido_id_fkey(nombre)`;

const SELECT_VISITA_CORTA = `id, numero, numero_visita, tecnico_id, tecnico_adjunto_id, fecha_programada, hora_programada,
  tecnico:perfiles!reportes_tecnico_id_fkey(nombre_completo),
  adjunto:perfiles!reportes_tecnico_adjunto_id_fkey(nombre_completo)`;

interface FilaCaso extends Omit<Caso, 'creado_en' | 'cerrado_en' | 'anulado_en'> {
  creado_en: string;
  cerrado_en: string | null;
  anulado_en: string | null;
  canal: { nombre: string } | null;
  cliente: { razon_social: string; ruc: string | null; telefono: string | null } | null;
  sede: { nombre: string; direccion: string; distrito: string; referencia: string | null } | null;
  contacto: { nombre: string; cargo: string | null; telefono: string | null } | null;
  equipo: {
    numero_serie: string;
    modelo: string;
    cabezal_cantidad: number | null;
    linea: { nombre: string } | null;
    cabezal: { nombre: string } | null;
  } | null;
  tipo: { nombre: string } | null;
  modalidad: { nombre: string } | null;
  modo: { nombre: string } | null;
  sugerido: { nombre: string } | null;
}

interface FilaVisitaCorta {
  id: string;
  numero: string | null;
  numero_visita: number;
  tecnico_id: string;
  tecnico_adjunto_id: string | null;
  fecha_programada: string | null;
  hora_programada: string | null;
  tecnico: { nombre_completo: string } | null;
  adjunto: { nombre_completo: string } | null;
}

function aCaso(f: FilaCaso): Caso {
  return {
    id: f.id,
    empresa_id: f.empresa_id,
    numero: f.numero,
    canal_id: f.canal_id,
    cliente_id: f.cliente_id,
    sede_id: f.sede_id,
    contacto_id: f.contacto_id,
    telefono: f.telefono,
    equipo_id: f.equipo_id,
    incidencia: f.incidencia,
    tipo_servicio_id: f.tipo_servicio_id,
    modalidad_id: f.modalidad_id,
    modo_sugerido_id: f.modo_sugerido_id,
    modo_servicio_id: f.modo_servicio_id,
    motivo_cambio_modo: f.motivo_cambio_modo,
    estado: f.estado,
    motivo_espera_id: f.motivo_espera_id,
    caso_origen_id: f.caso_origen_id,
    reaperturas: f.reaperturas ?? 0,
    creado_por: f.creado_por,
    cerrado_por: f.cerrado_por,
    cerrado_en: isoLima(f.cerrado_en),
    anulado_por: f.anulado_por,
    anulado_en: isoLima(f.anulado_en),
    motivo_anulacion: f.motivo_anulacion,
    creado_en: isoLima(f.creado_en) ?? f.creado_en,
  };
}

function datosComunes(f: FilaCaso) {
  return {
    canal_nombre: nombre(f.canal),
    cliente_razon_social: f.cliente?.razon_social ?? '',
    cliente_ruc: f.cliente?.ruc ?? null,
    sede_nombre: f.sede?.nombre ?? '',
    sede_direccion: f.sede?.direccion ?? '',
    sede_distrito: f.sede?.distrito ?? '',
    sede_referencia: f.sede?.referencia ?? null,
    contacto_nombre: f.contacto?.nombre ?? '',
    contacto_cargo: f.contacto?.cargo ?? null,
    equipo_serie: f.equipo?.numero_serie ?? '',
    equipo_modelo: f.equipo?.modelo ?? '',
    equipo_linea: nombre(f.equipo?.linea),
    equipo_cabezal: nombre(f.equipo?.cabezal),
    equipo_cabezal_cantidad: f.equipo?.cabezal_cantidad ?? null,
    tipo_servicio_nombre: nombre(f.tipo),
    modalidad_nombre: nombre(f.modalidad),
    modo_servicio_nombre: nombre(f.modo),
    modo_sugerido_nombre: f.sugerido ? nombre(f.sugerido) : null,
  };
}

function aLista(f: FilaCaso & { reportes: FilaVisitaCorta[] | null }): CasoLista {
  const visitas = [...(f.reportes ?? [])].sort((a, b) => a.numero_visita - b.numero_visita);
  const ultima = visitas[visitas.length - 1];
  return {
    ...aCaso(f),
    ...datosComunes(f),
    tecnico_id: ultima?.tecnico_id ?? null,
    tecnico_nombre: nombreCompleto(ultima?.tecnico),
    tecnico_adjunto_id: ultima?.tecnico_adjunto_id ?? null,
    tecnico_adjunto_nombre: nombreCompleto(ultima?.adjunto),
    fecha_programada: ultima?.fecha_programada ?? null,
    hora_programada: hora(ultima?.hora_programada),
    reportes_numeros: visitas.map((v) => v.numero).filter((n): n is string => !!n),
    pendiente_posventa: f.estado === 'atendido',
  };
}

export async function casos_lista(filtros: FiltrosCasosLista = {}): Promise<CasoLista[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return [];
  let consulta = supabase()
    .from('casos')
    .select(`${SELECT_CASO}, reportes!reportes_caso_id_fkey(${SELECT_VISITA_CORTA})`)
    .order('creado_en', { ascending: false });
  if (!sesion.rolesVigentes.includes('superadmin')) consulta = consulta.eq('empresa_id', sesion.empresa.id);
  if (filtros.cliente_id) consulta = consulta.eq('cliente_id', filtros.cliente_id);
  if (filtros.equipo_id) consulta = consulta.eq('equipo_id', filtros.equipo_id);
  if (filtros.estado && filtros.estado !== 'todos') consulta = consulta.eq('estado', filtros.estado);
  if (filtros.tipo_servicio_id && filtros.tipo_servicio_id !== 'todos') {
    consulta = consulta.eq('tipo_servicio_id', filtros.tipo_servicio_id);
  }
  if (filtros.fecha_desde) consulta = consulta.gte('creado_en', `${filtros.fecha_desde}T00:00:00-05:00`);
  if (filtros.fecha_hasta) consulta = consulta.lte('creado_en', `${filtros.fecha_hasta}T23:59:59.999-05:00`);
  const { data, error } = await consulta;
  if (error || !data) return [];
  let filas = (data as unknown as (FilaCaso & { reportes: FilaVisitaCorta[] })[]).map(aLista);
  if (filtros.tecnico_id && filtros.tecnico_id !== 'todos') {
    filas = filas.filter((f) => f.tecnico_id === filtros.tecnico_id || f.tecnico_adjunto_id === filtros.tecnico_id);
  }
  if (filtros.q && filtros.q.trim()) {
    const q = normalizar(filtros.q);
    filas = filas.filter((f) =>
      [f.numero, f.incidencia, f.cliente_razon_social, f.cliente_ruc ?? '', f.equipo_serie, ...f.reportes_numeros].some((v) =>
        normalizar(v).includes(q),
      ),
    );
  }
  return filas;
}


export async function obtener_caso_detalle(casoId: string): Promise<CasoDetalle | null> {
  if (!obtenerUsuarioActual()) return null;
  const sb = supabase();
  const { data: fila, error } = await sb.from('casos').select(SELECT_CASO).eq('id', casoId).maybeSingle();
  if (error || !fila) return null;
  const f = fila as unknown as FilaCaso;

  const [origen, visitas, historial, posventas] = await Promise.all([
    f.caso_origen_id
      ? sb.from('casos').select('numero').eq('id', f.caso_origen_id).maybeSingle()
      : Promise.resolve({ data: null }),
    sb
      .from('reportes')
      .select(
        `*, tecnico:perfiles!reportes_tecnico_id_fkey(nombre_completo), adjunto:perfiles!reportes_tecnico_adjunto_id_fkey(nombre_completo),
         reporte_repuestos(*), adjuntos(*), notas(*), envios_reporte(*)`,
      )
      .eq('caso_id', casoId)
      .order('numero_visita'),
    sb.from('historial_estados').select('*').eq('caso_id', casoId).order('fecha', { ascending: false }),
    sb.from('posventas').select('*').eq('caso_id', casoId).order('fecha', { ascending: false }),
  ]);

  const envios: EnvioReporte[] = [];
  const listaVisitas: VisitaDetalle[] = ((visitas.data ?? []) as Record<string, unknown>[]).map((r) => {
    for (const e of (r.envios_reporte as Record<string, unknown>[] | null) ?? []) envios.push(aEnvio(e));
    return {
      ...aVisitaBase(r),
      tecnico_nombre: nombreCompleto(r.tecnico),
      tecnico_adjunto_nombre: nombreCompleto(r.adjunto),
      repuestos: ((r.reporte_repuestos as Record<string, unknown>[] | null) ?? []).map(aRepuesto),
      adjuntos: ((r.adjuntos as Record<string, unknown>[] | null) ?? []).map(aAdjunto),
      notas: ((r.notas as Record<string, unknown>[] | null) ?? [])
        .map(aNota)
        .sort((a, b) => b.creado_en.localeCompare(a.creado_en)),
    };
  });

  return {
    ...aCaso(f),
    ...datosComunes(f),
    cliente_telefono: f.cliente?.telefono ?? null,
    contacto_telefono: f.contacto?.telefono ?? null,
    caso_origen_numero: (origen.data as { numero: string } | null)?.numero ?? null,
    visitas: listaVisitas,
    historial_estados: ((historial.data ?? []) as Record<string, unknown>[]).map(
      (h): HistorialEstado => ({
        id: String(h.id),
        caso_id: String(h.caso_id),
        estado_anterior: (h.estado_anterior as HistorialEstado['estado_anterior']) ?? null,
        estado_nuevo: h.estado_nuevo as HistorialEstado['estado_nuevo'],
        usuario_id: String(h.usuario_id ?? ''),
        motivo: (h.motivo as string | null) ?? null,
        fecha: isoLima(h.fecha as string) ?? '',
      }),
    ),
    posventas: ((posventas.data ?? []) as Record<string, unknown>[]).map(
      (p): Posventa => ({
        id: String(p.id),
        caso_id: String(p.caso_id),
        realizado_por: String(p.realizado_por ?? ''),
        fecha: isoLima(p.fecha as string) ?? '',
        resultado: p.resultado as Posventa['resultado'],
        comentario: (p.comentario as string | null) ?? null,
      }),
    ),
    envios,
  };
}


export function aVisitaBase(r: Record<string, unknown>): Omit<VisitaDetalle, 'tecnico_nombre' | 'tecnico_adjunto_nombre' | 'repuestos' | 'adjuntos' | 'notas'> {
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
    hora_llegada: (r.hora_llegada as string | null) ?? null,
    hora_salida: (r.hora_salida as string | null) ?? null,
    horas: numero(r.horas),
    estado_equipo: (r.estado_equipo as VisitaDetalle['estado_equipo']) ?? null,
    ultimo_mantenimiento: (r.ultimo_mantenimiento as string | null) ?? null,
    limpieza: (r.limpieza as VisitaDetalle['limpieza']) ?? null,
    estado_cabezales: (r.estado_cabezales as VisitaDetalle['estado_cabezales']) ?? null,
    sistema_proteccion: (r.sistema_proteccion as VisitaDetalle['sistema_proteccion']) ?? null,
    sistema_proteccion_otro: (r.sistema_proteccion_otro as string | null) ?? null,
    tinta: (r.tinta as string | null) ?? null,
    voltaje_ln: numero(r.voltaje_ln),
    voltaje_lt: numero(r.voltaje_lt),
    voltaje_nt: numero(r.voltaje_nt),
    operador: (r.operador as string | null) ?? null,
    procedimiento: (r.procedimiento as string | null) ?? null,
    conclusion: (r.conclusion as string | null) ?? null,
    recomendaciones: (r.recomendaciones as string | null) ?? null,
    resultado: (r.resultado as VisitaDetalle['resultado']) ?? null,
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

export function aRepuesto(r: Record<string, unknown>): ReporteRepuesto {
  return {
    id: String(r.id),
    reporte_id: String(r.reporte_id),
    repuesto_id: (r.repuesto_id as string | null) ?? '',
    codigo: (r.codigo as string | null) ?? '',
    descripcion: String(r.descripcion ?? ''),
    cantidad: numero(r.cantidad) ?? 0,
    tipo: r.tipo as ReporteRepuesto['tipo'],
  };
}

export function aAdjunto(a: Record<string, unknown>): Adjunto {
  return {
    id: String(a.id),
    reporte_id: String(a.reporte_id),
    tipo: a.tipo as Adjunto['tipo'],
    ruta: String(a.ruta),
    nombre_archivo: (a.nombre_archivo as string | null) ?? String(a.ruta).split('/').pop() ?? '',
    tipo_mime: (a.tipo_mime as string | null) ?? '',
    subido_por: String(a.subido_por ?? ''),
  };
}

export function aNota(n: Record<string, unknown>): Nota {
  return {
    id: String(n.id),
    reporte_id: String(n.reporte_id),
    autor_id: String(n.autor_id),
    texto: String(n.texto),
    creado_en: isoLima(n.creado_en as string) ?? '',
  };
}

export function aEnvio(e: Record<string, unknown>): EnvioReporte {
  return {
    id: String(e.id ?? ''),
    reporte_id: String(e.reporte_id ?? ''),
    canal: e.canal as EnvioReporte['canal'],
    destino: String(e.destino ?? ''),
    estado: e.estado as EnvioReporte['estado'],
    detalle: (e.detalle as string | null) ?? null,
    enviado_por: String(e.enviado_por ?? ''),
  };
}


export async function reportes_lista(filtros: { cliente_id?: string; equipo_id?: string } = {}): Promise<ReporteLista[]> {
  if (!obtenerUsuarioActual()) return [];
  let consulta = supabase().from('reportes_lista').select('*').order('fecha_programada', { ascending: false });
  if (filtros.cliente_id) consulta = consulta.eq('cliente_id', filtros.cliente_id);
  if (filtros.equipo_id) consulta = consulta.eq('equipo_id', filtros.equipo_id);
  const { data } = await consulta;
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    caso_id: String(r.caso_id),
    cliente_id: String(r.cliente_id),
    equipo_id: String(r.equipo_id),
    numero: (r.numero as string | null) ?? null,
    numero_caso: String(r.caso ?? ''),
    numero_visita: Number(r.numero_visita),
    cliente_razon_social: String(r.cliente ?? ''),
    numero_serie: String(r.numero_serie ?? ''),
    tecnico_nombre: (r.tecnico as string | null) ?? null,
    fecha_programada: (r.fecha_programada as string | null) ?? null,
    resultado: (r.resultado as ReporteLista['resultado']) ?? null,
    cerrado: !!r.cerrado,
  }));
}

export async function mis_servicios(): Promise<MiServicio[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion || !sesion.rolesVigentes.includes('tecnico')) return [];
  const yo = sesion.usuario.id;
  const { data } = await supabase()
    .from('reportes')
    .select(
      `id, caso_id, numero, numero_visita, tecnico_id, fecha_programada, hora_programada, cerrado,
       caso:casos!reportes_caso_id_fkey(numero, estado,
         cliente:clientes!casos_cliente_id_fkey(razon_social),
         sede:sedes!casos_sede_id_fkey(nombre, direccion, distrito, referencia),
         equipo:equipos!casos_equipo_id_fkey(numero_serie),
         tipo:tipos_servicio!casos_tipo_servicio_id_fkey(nombre),
         modalidad:modalidades!casos_modalidad_id_fkey(nombre),
         modo:modos_servicio!casos_modo_servicio_id_fkey(nombre))`,
    )
    .or(`tecnico_id.eq.${yo},tecnico_adjunto_id.eq.${yo}`);
  const filas = ((data ?? []) as Record<string, unknown>[]).map((r): MiServicio => {
    const c = (r.caso ?? {}) as Record<string, unknown>;
    const sede = (c.sede ?? {}) as Record<string, string | null>;
    return {
      id: String(r.id),
      caso_id: String(r.caso_id),
      numero: (r.numero as string | null) ?? null,
      numero_caso: String(c.numero ?? ''),
      numero_visita: Number(r.numero_visita),
      soy_adjunto: r.tecnico_id !== yo,
      fecha_programada: (r.fecha_programada as string | null) ?? null,
      hora_programada: hora(r.hora_programada as string | null),
      cliente_razon_social: String((c.cliente as { razon_social?: string } | null)?.razon_social ?? ''),
      sede_nombre: sede.nombre ?? '',
      sede_direccion: sede.direccion ?? '',
      sede_distrito: sede.distrito ?? '',
      sede_referencia: sede.referencia ?? null,
      tipo_servicio_nombre: nombre(c.tipo),
      modalidad_nombre: nombre(c.modalidad),
      modo_servicio_nombre: nombre(c.modo),
      numero_serie: String((c.equipo as { numero_serie?: string } | null)?.numero_serie ?? ''),
      estado: (c.estado as MiServicio['estado']) ?? 'programado',
      cerrado: !!r.cerrado,
    };
  });
  return filas.sort((a, b) =>
    `${a.fecha_programada ?? ''}${a.hora_programada ?? ''}`.localeCompare(`${b.fecha_programada ?? ''}${b.hora_programada ?? ''}`),
  );
}

export async function tecnicos(): Promise<TecnicoLista[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return [];
  let consulta = supabase().from('tecnicos').select('id, empresa_id, nombre_completo').order('nombre_completo');
  if (!sesion.rolesVigentes.includes('superadmin')) consulta = consulta.eq('empresa_id', sesion.empresa.id);
  const { data } = await consulta;
  return ((data ?? []) as { id: string; nombre_completo: string }[]).map((t) => ({
    id: t.id,
    nombre_completo: t.nombre_completo,
    email: '',
    telefono: null,
  }));
}


export async function buscar_clientes(p_texto: string): Promise<Cliente[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion || !tieneRol('superadmin', 'gerente', 'coordinador', 'consulta')) return [];
  if (p_texto.trim().length < 2) return [];
  const { data } = await supabase().rpc('buscar_clientes', { p_texto: p_texto.trim() });
  return ((data ?? []) as Record<string, unknown>[]).slice(0, 10).map((c) => ({
    id: String(c.id),
    empresa_id: sesion.empresa.id,
    razon_social: String(c.razon_social),
    ruc: (c.ruc as string | null) ?? null,
    telefono: (c.telefono as string | null) ?? null,
    email: (c.email as string | null) ?? null,
    soporte_vigente: !!c.soporte_vigente,
    soporte_verificado_en: null,
    soporte_verificado_por: null,
    activo: true,
  }));
}

export async function obtener_contactos(clienteId: string): Promise<Contacto[]> {
  const { data } = await supabase().from('contactos').select('*').eq('cliente_id', clienteId).eq('activo', true).order('nombre');
  return (data ?? []) as Contacto[];
}

export async function obtener_sedes(clienteId: string): Promise<Sede[]> {
  const { data } = await supabase()
    .from('sedes')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('activo', true)
    .order('principal', { ascending: false })
    .order('nombre');
  return (data ?? []) as Sede[];
}

export const SELECT_EQUIPO = '*, linea:lineas_maquina(nombre), cabezal:modelos_cabezal(nombre)';

export function aEquipoVista(e: Record<string, unknown>): EquipoVista {
  return {
    id: String(e.id),
    cliente_id: String(e.cliente_id),
    sede_id: String(e.sede_id),
    linea_id: String(e.linea_id),
    modelo: String(e.modelo ?? ''),
    numero_serie: String(e.numero_serie ?? ''),
    cabezal_modelo_id: (e.cabezal_modelo_id as string | null) ?? '',
    cabezal_cantidad: (numero(e.cabezal_cantidad) ?? 1) as EquipoVista['cabezal_cantidad'],
    fecha_instalacion: (e.fecha_instalacion as string | null) ?? '',
    activo: !!e.activo,
    linea_nombre: nombre(e.linea),
    cabezal_nombre: nombre(e.cabezal),
  };
}

export async function obtener_equipos(clienteId: string): Promise<EquipoVista[]> {
  const { data } = await supabase()
    .from('equipos')
    .select(SELECT_EQUIPO)
    .eq('cliente_id', clienteId)
    .eq('activo', true)
    .order('numero_serie');
  return ((data ?? []) as Record<string, unknown>[]).map(aEquipoVista);
}


async function catalogo(tabla: string, empresaId: string, columnas = 'id, empresa_id, nombre, orden, activo'): Promise<Catalogo[]> {
  const { data } = await supabase().from(tabla).select(columnas).eq('empresa_id', empresaId).eq('activo', true).order('orden');
  return (data ?? []) as unknown as Catalogo[];
}

export async function obtener_catalogos(): Promise<CatalogosActivos> {
  const empresaId = obtenerUsuarioActual()?.empresa.id;
  const vacio: CatalogosActivos = {
    tipos_servicio: [],
    modos_servicio: [],
    modalidades: [],
    canales: [],
    lineas_maquina: [],
    modelos_cabezal: [],
    motivos_espera: [],
    repuestos: [],
  };
  if (!empresaId) return vacio;
  const [tipos, modos, modalidades, canales, lineas, cabezales, espera, repuestos] = await Promise.all([
    catalogo('tipos_servicio', empresaId),
    catalogo('modos_servicio', empresaId),
    catalogo('modalidades', empresaId, 'id, empresa_id, nombre, orden, activo, remota'),
    catalogo('canales', empresaId),
    catalogo('lineas_maquina', empresaId),
    catalogo('modelos_cabezal', empresaId),
    catalogo('motivos_espera', empresaId),
    supabase()
      .from('repuestos')
      .select('id, empresa_id, codigo, descripcion, consumible, activo')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .order('codigo'),
  ]);
  return {
    tipos_servicio: tipos,
    modos_servicio: modos,
    modalidades,
    canales,
    lineas_maquina: lineas,
    modelos_cabezal: cabezales,
    motivos_espera: espera,

    repuestos: ((repuestos.data ?? []) as Omit<Repuesto, 'orden'>[]).map((r, i) => ({ ...r, codigo: r.codigo ?? '', orden: i + 1 })),
  };
}
