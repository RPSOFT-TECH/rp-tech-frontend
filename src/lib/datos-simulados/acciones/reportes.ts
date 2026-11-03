import { ahoraLimaISO, horaLima } from '../fecha';
import { db, nuevoId } from '../store';
import type { EnvioReporte, Reporte, Resultado, ResultadoReporte } from '../types';
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
