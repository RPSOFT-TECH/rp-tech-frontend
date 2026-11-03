import { ahoraLimaISO, horasEntre } from '../fecha';
import { db, nuevoId } from '../store';
import type { Resultado, ResultadoPosventa } from '../types';
import { exigirRol, fallo, ok, registrarHistorial } from './comun';
import { obtenerUsuarioActual } from './sesion';
import { validarCasoEditable } from './guardar-caso';

export async function poner_en_espera(
  p_caso: string,
  p_motivo: string,
  p_comentario?: string | null,
): Promise<Resultado<true>> {
  const permiso = exigirRol(['superadmin', 'coordinador']);
  if (permiso) return fallo(permiso);
  const encontrado = await validarCasoEditable(p_caso);
  if (!encontrado.ok) return encontrado;
  const caso = encontrado.datos;
  if (!['por_programar', 'programado', 'en_atencion'].includes(caso.estado)) {
    return fallo('El caso no está en un estado que permita ponerlo en espera.');
  }
  const motivo = db.motivos_espera.find((item) => item.id === p_motivo && item.activo);
  if (!motivo) return fallo('El motivo de espera no existe.');
  if (motivo.nombre === 'Otro' && !p_comentario?.trim()) {
    return fallo('El motivo Otro requiere un comentario.');
  }
  const anterior = caso.estado;
  caso.estado = 'en_espera';
  caso.motivo_espera_id = motivo.id;
  registrarHistorial(caso.id, anterior, 'en_espera', p_comentario?.trim() || motivo.nombre);
  return ok(true);
}

export async function registrar_posventa(
  p_caso: string,
  p_resultado: ResultadoPosventa,
  p_comentario?: string | null,
): Promise<Resultado<true>> {
  const permiso = exigirRol(['superadmin', 'gerente', 'coordinador']);
  if (permiso) return fallo(permiso);
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  const encontrado = await validarCasoEditable(p_caso);
  if (!encontrado.ok) return encontrado;
  const caso = encontrado.datos;
  if (caso.estado !== 'atendido') return fallo('La posventa solo aplica a un caso atendido.');
  if (await fue_tecnico_del_caso(caso.id, sesion.usuario.id)) {
    return fallo('Quien atendió el caso no puede registrar la posventa.');
  }
  db.posventas.push({
    id: nuevoId(20),
    caso_id: caso.id,
    realizado_por: sesion.usuario.id,
    fecha: ahoraLimaISO(),
    resultado: p_resultado,
    comentario: p_comentario?.trim() || null,
  });
  const anterior = caso.estado;
  if (p_resultado === 'conforme') {
    caso.estado = 'cerrado';
    caso.cerrado_por = sesion.usuario.id;
    caso.cerrado_en = ahoraLimaISO();
  } else {
    caso.estado = 'por_programar';
  }
  registrarHistorial(caso.id, anterior, caso.estado, p_comentario?.trim() || null);
  return ok(true);
}

export async function anular_caso(p_caso: string, p_motivo: string): Promise<Resultado<true>> {
  const permiso = exigirRol(['superadmin', 'gerente', 'coordinador']);
  if (permiso) return fallo(permiso);
  const sesion = obtenerUsuarioActual();
  if (!sesion) return fallo('Inicia sesión para continuar.');
  if (!p_motivo.trim()) return fallo('Indica el motivo de la anulación.');
  const encontrado = await validarCasoEditable(p_caso);
  if (!encontrado.ok) return encontrado;
  const caso = encontrado.datos;
  if (caso.estado === 'anulado') return fallo('El caso ya está anulado.');
  if (caso.estado === 'cerrado') return fallo('Un caso cerrado no se anula. Reábrelo si sigue dentro del plazo.');
  const anterior = caso.estado;
  caso.estado = 'anulado';
  caso.anulado_por = sesion.usuario.id;
  caso.anulado_en = ahoraLimaISO();
  caso.motivo_anulacion = p_motivo.trim();
  registrarHistorial(caso.id, anterior, 'anulado', p_motivo.trim());
  return ok(true);
}

export async function reabrir_caso(p_caso: string, p_motivo: string): Promise<Resultado<true>> {
  const permiso = exigirRol(['superadmin', 'coordinador']);
  if (permiso) return fallo(permiso);
  if (!p_motivo.trim()) return fallo('Indica el motivo de la reapertura.');
  const encontrado = await validarCasoEditable(p_caso);
  if (!encontrado.ok) return encontrado;
  const caso = encontrado.datos;
  if (caso.estado !== 'cerrado') return fallo('Solo se puede reabrir un caso cerrado.');
  if (!(await dentro_plazo_misma_falla(caso.id))) {
    return fallo('El plazo de la misma falla ya venció. Registra un caso nuevo vinculado.');
  }
  const anterior = caso.estado;
  caso.estado = 'por_programar';
  caso.reaperturas += 1;
  caso.cerrado_por = null;
  caso.cerrado_en = null;
  registrarHistorial(caso.id, anterior, 'por_programar', p_motivo.trim());
  return ok(true);
}

export async function dentro_plazo_misma_falla(p_caso: string): Promise<boolean> {
  const caso = db.casos.find((item) => item.id === p_caso);
  const sesion = obtenerUsuarioActual();
  if (!caso || !sesion || !caso.cerrado_en) return false;
  if (!sesion.rolesVigentes.includes('superadmin') && caso.empresa_id !== sesion.empresa.id) return false;
  const empresa = db.empresas.find((item) => item.id === caso.empresa_id);
  if (!empresa) return false;
  const horas = horasEntre(caso.cerrado_en, ahoraLimaISO());
  return horas >= 0 && horas <= empresa.parametros.plazo_misma_falla_horas;
}

export async function fue_tecnico_del_caso(p_caso: string, p_perfil: string): Promise<boolean> {
  return db.reportes.some(
    (reporte) =>
      reporte.caso_id === p_caso &&
      (reporte.tecnico_id === p_perfil || reporte.tecnico_adjunto_id === p_perfil),
  );
}

