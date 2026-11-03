import { db, nuevoId } from '../store';
import type { Reporte, Resultado, VisitaAgenda } from '../types';
import { delay, exigirRol, fallo, ok, registrarHistorial } from './comun';
import { obtenerUsuarioActual, rolesVigentesDe } from './sesion';
import { validarCasoEditable } from './guardar-caso';

export async function programar_visita(
  p_caso: string,
  p_tecnico: string,
  p_fecha: string,
  p_hora: string,
  p_tecnico_adjunto?: string | null,
): Promise<Resultado<Reporte>> {
  const permiso = exigirRol(['superadmin', 'coordinador']);
  if (permiso) return fallo(permiso);
  const encontrado = await validarCasoEditable(p_caso);
  if (!encontrado.ok) return encontrado;
  const caso = encontrado.datos;
  if (caso.estado !== 'por_programar' && caso.estado !== 'en_espera') {
    return fallo('El caso no está en un estado que permita programar una visita.');
  }
  const tecnico = await validarTecnico(p_tecnico, caso.empresa_id);
  if (!tecnico.ok) return tecnico;
  if (p_tecnico_adjunto) {
    if (p_tecnico_adjunto === p_tecnico) return fallo('El técnico adjunto debe ser distinto del técnico asignado.');
    const adjunto = await validarTecnico(p_tecnico_adjunto, caso.empresa_id);
    if (!adjunto.ok) return adjunto;
  }
  const numeroVisita = db.reportes.filter((reporte) => reporte.caso_id === caso.id).length + 1;
  const reporte: Reporte = reporteVacio(caso.id, numeroVisita, p_tecnico, p_fecha, p_hora, p_tecnico_adjunto ?? null);
  db.reportes.push(reporte);
  const anterior = caso.estado;
  caso.estado = 'programado';
  caso.motivo_espera_id = null;
  registrarHistorial(caso.id, anterior, 'programado', null);
  return ok(reporte);
}

export async function reprogramar_visita(
  p_reporte: string,
  p_tecnico: string,
  p_fecha: string,
  p_hora: string,
  p_tecnico_adjunto?: string | null,
): Promise<Resultado<Reporte>> {
  const permiso = exigirRol(['superadmin', 'coordinador']);
  if (permiso) return fallo(permiso);
  const reporte = db.reportes.find((item) => item.id === p_reporte);
  if (!reporte) return fallo('La visita no existe.');
  if (reporte.cerrado) return fallo('El reporte está cerrado y no se puede modificar.');
  const encontrado = await validarCasoEditable(reporte.caso_id);
  if (!encontrado.ok) return encontrado;
  const caso = encontrado.datos;
  const tecnico = await validarTecnico(p_tecnico, caso.empresa_id);
  if (!tecnico.ok) return tecnico;
  if (p_tecnico_adjunto) {
    if (p_tecnico_adjunto === p_tecnico) return fallo('El técnico adjunto debe ser distinto del técnico asignado.');
    const adjunto = await validarTecnico(p_tecnico_adjunto, caso.empresa_id);
    if (!adjunto.ok) return adjunto;
  }
  reporte.tecnico_id = p_tecnico;
  reporte.tecnico_adjunto_id = p_tecnico_adjunto ?? null;
  reporte.fecha_programada = p_fecha;
  reporte.hora_programada = p_hora;
  if (caso.estado === 'en_espera' || caso.estado === 'por_programar') {
    const anterior = caso.estado;
    caso.estado = 'programado';
    caso.motivo_espera_id = null;
    registrarHistorial(caso.id, anterior, 'programado', null);
  }
  return ok(reporte);
}

export async function agenda_tecnico(p_tecnico: string, p_fecha: string): Promise<VisitaAgenda[]> {
  const sesion = obtenerUsuarioActual();
  if (!sesion || !p_tecnico || !p_fecha) return delay([]);
  if (!sesion.rolesVigentes.some((rol) => rol === 'superadmin' || rol === 'coordinador')) return delay([]);
  const visitas = db.reportes
    .filter((reporte) => {
      if (reporte.fecha_programada !== p_fecha) return false;
      if (reporte.tecnico_id !== p_tecnico && reporte.tecnico_adjunto_id !== p_tecnico) return false;
      const caso = db.casos.find((item) => item.id === reporte.caso_id);
      if (!caso) return false;
      if (!sesion.rolesVigentes.includes('superadmin') && caso.empresa_id !== sesion.empresa.id) return false;
      return true;
    })
    .map((reporte): VisitaAgenda => {
      const caso = db.casos.find((item) => item.id === reporte.caso_id);
      const cliente = db.clientes.find((item) => item.id === caso?.cliente_id);
      return {
        id: reporte.id,
        caso_id: reporte.caso_id,
        numero_caso: caso?.numero ?? '',
        cliente_razon_social: cliente?.razon_social ?? '',
        hora_programada: reporte.hora_programada,
        como: reporte.tecnico_id === p_tecnico ? 'tecnico' : 'adjunto',
      };
    })
    .sort((a, b) => (a.hora_programada ?? '').localeCompare(b.hora_programada ?? ''));
  return delay(visitas);
}

async function validarTecnico(perfilId: string, empresaId: string): Promise<Resultado<true>> {
  const perfil = db.perfiles.find((item) => item.id === perfilId && item.activo);
  if (!perfil || perfil.empresa_id !== empresaId) return fallo('El técnico no pertenece a la empresa.');
  if (!rolesVigentesDe(perfilId).includes('tecnico')) return fallo('La persona elegida no tiene el rol de técnico vigente.');
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  return ok(true);
}

function reporteVacio(
  casoId: string,
  numeroVisita: number,
  tecnicoId: string,
  fecha: string,
  hora: string,
  adjunto: string | null,
): Reporte {
  return {
    id: nuevoId(10),
    caso_id: casoId,
    numero_visita: numeroVisita,
    numero: null,
    numero_fisico: null,
    tecnico_id: tecnicoId,
    tecnico_adjunto_id: adjunto,
    fecha_programada: fecha,
    hora_programada: hora,
    hora_llegada: null,
    hora_salida: null,
    horas: null,
    estado_equipo: null,
    ultimo_mantenimiento: null,
    limpieza: null,
    estado_cabezales: null,
    sistema_proteccion: null,
    sistema_proteccion_otro: null,
    tinta: null,
    voltaje_ln: null,
    voltaje_lt: null,
    voltaje_nt: null,
    operador: null,
    procedimiento: null,
    conclusion: null,
    recomendaciones: null,
    resultado: null,
    requerimiento: null,
    firma_operador: null,
    nombre_operador_firma: null,
    firma_cliente: null,
    nombre_cliente_firma: null,
    cerrado: false,
    cerrado_en: null,
    pdf: null,
  };
}
