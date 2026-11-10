import { db } from '../store';
import type {
  Caso,
  CasoLista,
  CatalogosActivos,
  Catalogo,
  Cliente,
  Contacto,
  EquipoVista,
  MiServicio,
  ReporteLista,
  RolCodigo,
  Sede,
  TecnicoLista,
} from '../types';
import type { CasoDetalle } from '../tipos-vista';
import { delay, nombreDe, normalizar, perfilDe, ultimaVisita } from './comun';
import { obtenerUsuarioActual, rolesVigentesDe } from './sesion';

export interface FiltrosCasosLista {
  cliente_id?: string;
  equipo_id?: string;
  estado?: string;
  q?: string;
  tecnico_id?: string;
  tipo_servicio_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

const OFICINA: RolCodigo[] = ['superadmin', 'gerente', 'coordinador', 'consulta'];

export async function casos_lista(filtros: FiltrosCasosLista = {}): Promise<CasoLista[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return delay([]);
  if (!puedeVerCasos(sesion.rolesVigentes, sesion.empresa.permisos_consulta.casos)) return delay([]);

  let casos = db.casos.filter((caso) =>
    sesion.rolesVigentes.includes('superadmin') ? true : caso.empresa_id === sesion.empresa.id,
  );
  if (filtros.cliente_id) casos = casos.filter((caso) => caso.cliente_id === filtros.cliente_id);
  if (filtros.equipo_id) casos = casos.filter((caso) => caso.equipo_id === filtros.equipo_id);
  if (filtros.estado && filtros.estado !== 'todos') casos = casos.filter((caso) => caso.estado === filtros.estado);
  if (filtros.tipo_servicio_id && filtros.tipo_servicio_id !== 'todos') {
    casos = casos.filter((caso) => caso.tipo_servicio_id === filtros.tipo_servicio_id);
  }
  if (filtros.fecha_desde) casos = casos.filter((caso) => caso.creado_en.slice(0, 10) >= filtros.fecha_desde!);
  if (filtros.fecha_hasta) casos = casos.filter((caso) => caso.creado_en.slice(0, 10) <= filtros.fecha_hasta!);

  let filas = casos.map(aLista);
  if (filtros.tecnico_id && filtros.tecnico_id !== 'todos') {
    filas = filas.filter(
      (fila) => fila.tecnico_id === filtros.tecnico_id || fila.tecnico_adjunto_id === filtros.tecnico_id,
    );
  }
  if (filtros.q && filtros.q.trim()) {
    const q = normalizar(filtros.q);
    filas = filas.filter((fila) =>
      [fila.numero, fila.incidencia, fila.cliente_razon_social, fila.equipo_serie, ...fila.reportes_numeros]
        .some((valor) => normalizar(valor).includes(q)),
    );
  }
  filas.sort((a, b) => b.creado_en.localeCompare(a.creado_en));
  return delay(filas);
}

export async function reportes_lista(filtros: { cliente_id?: string; equipo_id?: string } = {}): Promise<ReporteLista[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return delay([]);
  const puede = sesion.rolesVigentes.some((rol) => rol === 'superadmin' || rol === 'gerente' || rol === 'coordinador')
    || (sesion.rolesVigentes.includes('consulta') && sesion.empresa.permisos_consulta.reportes);
  if (!puede) return delay([]);

  const filas = db.reportes
    .map((reporte) => {
      const caso = db.casos.find((item) => item.id === reporte.caso_id);
      if (!caso) return null;
      if (!sesion.rolesVigentes.includes('superadmin') && caso.empresa_id !== sesion.empresa.id) return null;
      if (filtros.cliente_id && caso.cliente_id !== filtros.cliente_id) return null;
      if (filtros.equipo_id && caso.equipo_id !== filtros.equipo_id) return null;
      const cliente = db.clientes.find((item) => item.id === caso.cliente_id);
      const equipo = db.equipos.find((item) => item.id === caso.equipo_id);
      const tecnico = perfilDe(reporte.tecnico_id);
      const fila: ReporteLista = {
        id: reporte.id,
        caso_id: caso.id,
        cliente_id: caso.cliente_id,
        equipo_id: caso.equipo_id,
        numero: reporte.numero,
        numero_caso: caso.numero,
        numero_visita: reporte.numero_visita,
        cliente_razon_social: cliente?.razon_social ?? '',
        numero_serie: equipo?.numero_serie ?? '',
        tecnico_nombre: tecnico?.nombre_completo ?? null,
        fecha_programada: reporte.fecha_programada,
        resultado: reporte.resultado,
        cerrado: reporte.cerrado,
      };
      return fila;
    })
    .filter((fila): fila is ReporteLista => fila !== null);

  return delay(filas);
}

export async function mis_servicios(): Promise<MiServicio[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion || !sesion.rolesVigentes.includes('tecnico')) return delay([]);
  const yo = sesion.usuario.id;
  const filas = db.reportes
    .filter((reporte) => reporte.tecnico_id === yo || reporte.tecnico_adjunto_id === yo)
    .map((reporte) => {
      const caso = db.casos.find((item) => item.id === reporte.caso_id);
      const cliente = caso ? db.clientes.find((item) => item.id === caso.cliente_id) : undefined;
      const sede = caso ? db.sedes.find((item) => item.id === caso.sede_id) : undefined;
      const perfilTecnico = db.perfiles.find((p) => p.id === reporte.tecnico_id);
      const perfilAdjunto = reporte.tecnico_adjunto_id ? db.perfiles.find((p) => p.id === reporte.tecnico_adjunto_id) : undefined;
      const equipo = caso ? db.equipos.find((item) => item.id === caso.equipo_id) : undefined;
      const fila: MiServicio = {
        id: reporte.id,
        caso_id: reporte.caso_id,
        numero: reporte.numero,
        numero_caso: caso?.numero ?? '',
        numero_visita: reporte.numero_visita,
        soy_adjunto: reporte.tecnico_id !== yo,
        fecha_programada: reporte.fecha_programada,
        hora_programada: reporte.hora_programada,
        cliente_razon_social: cliente?.razon_social ?? '',
        sede_nombre: sede?.nombre ?? '',
        sede_direccion: sede?.direccion ?? '',
        sede_distrito: sede?.distrito ?? '',
        sede_referencia: sede?.referencia ?? null,
        tipo_servicio_nombre: caso ? nombreDe(db.tipos_servicio, caso.tipo_servicio_id) : '',
        modalidad_nombre: caso ? nombreDe(db.modalidades, caso.modalidad_id) : '',
        modo_servicio_nombre: caso ? nombreDe(db.modos_servicio, caso.modo_servicio_id) : '',
        numero_serie: equipo?.numero_serie ?? '',
        estado: caso?.estado ?? 'programado',
        cerrado: reporte.cerrado,
        tecnico_nombre: perfilTecnico?.nombre_completo ?? '',
        tecnico_adjunto_nombre: perfilAdjunto?.nombre_completo ?? null,
      };
      return fila;
    })
    .sort((a, b) => `${a.fecha_programada ?? ''}${a.hora_programada ?? ''}`.localeCompare(`${b.fecha_programada ?? ''}${b.hora_programada ?? ''}`));
  return delay(filas);
}

export async function tecnicos(): Promise<TecnicoLista[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return delay([]);
  const lista = db.perfiles
    .filter((perfil) => {
      if (!perfil.activo) return false;
      if (!sesion.rolesVigentes.includes('superadmin') && perfil.empresa_id !== sesion.empresa.id) return false;
      return rolesVigentesDe(perfil.id).includes('tecnico');
    })
    .map((perfil): TecnicoLista => ({
      id: perfil.id,
      nombre_completo: perfil.nombre_completo,
      email: perfil.email,
      telefono: perfil.telefono,
    }));
  return delay(lista);
}

export async function buscar_clientes(p_texto: string): Promise<Cliente[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion || !OFICINA.some((rol) => sesion.rolesVigentes.includes(rol))) return delay([]);
  const q = normalizar(p_texto.trim());
  if (q.length < 2) return delay([]);
  const lista = db.clientes
    .filter((cliente) => {
      if (!cliente.activo) return false;
      if (!sesion.rolesVigentes.includes('superadmin') && cliente.empresa_id !== sesion.empresa.id) return false;
      const ruc = cliente.ruc ?? '';
      return normalizar(cliente.razon_social).includes(q) || ruc.startsWith(q);
    })
    .slice(0, 10);
  return delay(lista);
}

export async function obtener_contactos(clienteId: string): Promise<Contacto[]> {
  return delay(db.contactos.filter((contacto) => contacto.cliente_id === clienteId && contacto.activo));
}

export async function obtener_sedes(clienteId: string): Promise<Sede[]> {
  return delay(db.sedes.filter((sede) => sede.cliente_id === clienteId && sede.activo));
}

export async function obtener_equipos(clienteId: string): Promise<EquipoVista[]> {
  const equipos = db.equipos
    .filter((equipo) => equipo.cliente_id === clienteId && equipo.activo)
    .map((equipo): EquipoVista => ({
      ...equipo,
      linea_nombre: nombreDe(db.lineas_maquina, equipo.linea_id),
      cabezal_nombre: nombreDe(db.modelos_cabezal, equipo.cabezal_modelo_id),
    }));
  return delay(equipos);
}

export async function obtener_catalogos(): Promise<CatalogosActivos> {
  const sesion = obtenerUsuarioActual();
  const empresaId = sesion?.empresa.id;
  const activos = (items: Catalogo[]) =>
    items
      .filter((item) => item.activo && (!empresaId || item.empresa_id === empresaId || sesion?.rolesVigentes.includes('superadmin') && item.empresa_id === empresaId))
      .filter((item) => !empresaId || item.empresa_id === empresaId)
      .sort((a, b) => a.orden - b.orden);
  return delay({
    tipos_servicio: activos(db.tipos_servicio),
    modos_servicio: activos(db.modos_servicio),
    modalidades: activos(db.modalidades),
    canales: activos(db.canales),
    lineas_maquina: activos(db.lineas_maquina),
    modelos_cabezal: activos(db.modelos_cabezal),
    motivos_espera: activos(db.motivos_espera),
    repuestos: db.repuestos
      .filter((item) => item.activo && (!empresaId || item.empresa_id === empresaId))
      .sort((a, b) => a.orden - b.orden),
  });
}

function puedeVerCasos(roles: RolCodigo[], consultaCasos: boolean): boolean {
  if (roles.some((rol) => rol === 'superadmin' || rol === 'gerente' || rol === 'coordinador')) return true;
  return roles.includes('consulta') && consultaCasos;
}

function aLista(caso: Caso): CasoLista {
  const cliente = db.clientes.find((item) => item.id === caso.cliente_id);
  const sede = db.sedes.find((item) => item.id === caso.sede_id);
  const contacto = db.contactos.find((item) => item.id === caso.contacto_id);
  const equipo = db.equipos.find((item) => item.id === caso.equipo_id);
  const visita = ultimaVisita(caso.id);
  const tecnico = perfilDe(visita?.tecnico_id);
  const adjunto = perfilDe(visita?.tecnico_adjunto_id);
  const numeros = db.reportes
    .filter((reporte) => reporte.caso_id === caso.id && reporte.numero)
    .map((reporte) => reporte.numero as string);
  return {
    ...caso,
    canal_nombre: nombreDe(db.canales, caso.canal_id),
    cliente_razon_social: cliente?.razon_social ?? '',
    cliente_ruc: cliente?.ruc ?? null,
    sede_nombre: sede?.nombre ?? '',
    sede_direccion: sede?.direccion ?? '',
    sede_distrito: sede?.distrito ?? '',
    sede_referencia: sede?.referencia ?? null,
    contacto_nombre: contacto?.nombre ?? '',
    contacto_cargo: contacto?.cargo ?? null,
    equipo_serie: equipo?.numero_serie ?? '',
    equipo_modelo: equipo?.modelo ?? '',
    equipo_linea: equipo ? nombreDe(db.lineas_maquina, equipo.linea_id) : '',
    equipo_cabezal: equipo ? nombreDe(db.modelos_cabezal, equipo.cabezal_modelo_id) : '',
    equipo_cabezal_cantidad: equipo?.cabezal_cantidad ?? null,
    tipo_servicio_nombre: nombreDe(db.tipos_servicio, caso.tipo_servicio_id),
    modalidad_nombre: nombreDe(db.modalidades, caso.modalidad_id),
    modo_servicio_nombre: nombreDe(db.modos_servicio, caso.modo_servicio_id),
    modo_sugerido_nombre: caso.modo_sugerido_id ? nombreDe(db.modos_servicio, caso.modo_sugerido_id) : null,
    tecnico_id: visita?.tecnico_id ?? null,
    tecnico_nombre: tecnico?.nombre_completo ?? null,
    tecnico_adjunto_id: visita?.tecnico_adjunto_id ?? null,
    tecnico_adjunto_nombre: adjunto?.nombre_completo ?? null,
    fecha_programada: visita?.fecha_programada ?? null,
    hora_programada: visita?.hora_programada ?? null,
    reportes_numeros: numeros,
    pendiente_posventa: caso.estado === 'atendido',
  };
}

export async function obtener_caso_detalle(casoId: string): Promise<CasoDetalle | null> {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return null;
  const caso = db.casos.find((item) => item.id === casoId);
  if (!caso) return null;
  if (!sesion.rolesVigentes.includes('superadmin') && caso.empresa_id !== sesion.empresa.id) return null;

  const cliente = db.clientes.find((item) => item.id === caso.cliente_id);
  const sede = db.sedes.find((item) => item.id === caso.sede_id);
  const contacto = db.contactos.find((item) => item.id === caso.contacto_id);
  const equipo = db.equipos.find((item) => item.id === caso.equipo_id);
  const casoOrigen = db.casos.find((item) => item.id === caso.caso_origen_id);

  const visitas = db.reportes
    .filter((reporte) => reporte.caso_id === casoId)
    .sort((a, b) => a.numero_visita - b.numero_visita)
    .map((reporte) => {
      const tecnico = perfilDe(reporte.tecnico_id);
      const adjunto = perfilDe(reporte.tecnico_adjunto_id);
      const repuestos = db.reporte_repuestos.filter((item) => item.reporte_id === reporte.id);
      const adjuntos = db.adjuntos.filter((item) => item.reporte_id === reporte.id);
      const notas = db.notas.filter((item) => item.reporte_id === reporte.id).sort(
        (a, b) => b.creado_en.localeCompare(a.creado_en),
      );
      return {
        ...reporte,
        tecnico_nombre: tecnico?.nombre_completo ?? null,
        tecnico_adjunto_nombre: adjunto?.nombre_completo ?? null,
        repuestos,
        adjuntos,
        notas,
      };
    });

  const historial = db.historial_estados
    .filter((item) => item.caso_id === casoId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  const posventas = db.posventas
    .filter((item) => item.caso_id === casoId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  const envios = db.envios_reporte
    .filter((item) => {
      const reporte = db.reportes.find((r) => r.id === item.reporte_id);
      return reporte && reporte.caso_id === casoId;
    })
    .sort((a, b) => b.id.localeCompare(a.id));

  return {
    ...caso,
    cliente_razon_social: cliente?.razon_social ?? '',
    cliente_ruc: cliente?.ruc ?? null,
    cliente_telefono: cliente?.telefono ?? null,
    sede_nombre: sede?.nombre ?? '',
    sede_direccion: sede?.direccion ?? '',
    sede_distrito: sede?.distrito ?? '',
    sede_referencia: sede?.referencia ?? null,
    contacto_nombre: contacto?.nombre ?? '',
    contacto_cargo: contacto?.cargo ?? null,
    contacto_telefono: contacto?.telefono ?? null,
    equipo_serie: equipo?.numero_serie ?? '',
    equipo_modelo: equipo?.modelo ?? '',
    equipo_linea: equipo ? nombreDe(db.lineas_maquina, equipo.linea_id) : '',
    equipo_cabezal: equipo ? nombreDe(db.modelos_cabezal, equipo.cabezal_modelo_id) : '',
    equipo_cabezal_cantidad: equipo?.cabezal_cantidad ?? null,
    canal_nombre: nombreDe(db.canales, caso.canal_id),
    tipo_servicio_nombre: nombreDe(db.tipos_servicio, caso.tipo_servicio_id),
    modalidad_nombre: nombreDe(db.modalidades, caso.modalidad_id),
    modo_servicio_nombre: nombreDe(db.modos_servicio, caso.modo_servicio_id),
    modo_sugerido_nombre: caso.modo_sugerido_id ? nombreDe(db.modos_servicio, caso.modo_sugerido_id) : null,
    caso_origen_numero: casoOrigen?.numero ?? null,
    visitas,
    historial_estados: historial,
    posventas,
    envios,
  };
}
