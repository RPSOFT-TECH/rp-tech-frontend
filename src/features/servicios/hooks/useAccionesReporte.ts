'use client';

import type { Dispatch, SetStateAction } from 'react';
import {
  actualizar_desarrollo,
  actualizar_revision_inicial,
  agregar_adjunto,
  agregar_repuesto,
  cerrar_reporte,
  guardar_firmas,
  quitar_adjunto,
  quitar_repuesto,
  registrar_llegada,
  reportePdf,
} from '@/lib/datos/actions';
import type { Reporte } from '@/lib/datos-simulados/types';
import { faltasEnPantalla } from '../reporte/faltantes';
import { horaLimaStr, type AdjuntoFila, type RepuestoFila } from '../reporte/pasos';

interface EstadoReporte {
  reporte: Reporte | null;
  setReporte: (reporte: Reporte | null) => void;
  horaLlegada: string;
  setHoraLlegada: (valor: string) => void;
  setGuardando: (valor: boolean) => void;
  guardarAviso: (texto: string) => void;
  avanzarPaso: () => void;
  estadoEquipo: Reporte['estado_equipo'];
  limpieza: Reporte['limpieza'];
  estadoCabezales: Reporte['estado_cabezales'];
  sistemaProteccion: Reporte['sistema_proteccion'];
  sistemaProteccionOtro: string;
  tinta: string;
  voltajeLn: string;
  voltajeLt: string;
  voltajeNt: string;
  operador: string;
  ultimoMantenimiento: string;
  numeroFisico: string;
  procedimiento: string;
  conclusion: string;
  recomendaciones: string;
  repuestoDescripcion: string;
  repuestoCodigo: string;
  repuestoCantidad: number;
  repuestoTipo: RepuestoFila['tipo'];
  repuestos: RepuestoFila[];
  setRepuestos: Dispatch<SetStateAction<RepuestoFila[]>>;
  setRepuestoCodigo: (valor: string) => void;
  setRepuestoDescripcion: (valor: string) => void;
  setRepuestoCantidad: (valor: number) => void;
  setRepuestoTipo: (valor: RepuestoFila['tipo']) => void;
  adjuntos: AdjuntoFila[];
  setAdjuntos: Dispatch<SetStateAction<AdjuntoFila[]>>;
  setMensaje: (valor: string | null) => void;
  firmaOperador: string | null;
  firmaCliente: string | null;
  nombreOperadorFirma: string;
  nombreClienteFirma: string;
  resultado: 'resuelto' | 'pendiente' | null;
  requerimiento: string;
  horaSalida: string;
  remota: boolean;
}

export function useAccionesReporte(estado: EstadoReporte) {
  const {
    reporte,
    setReporte,
    horaLlegada,
    setHoraLlegada,
    setGuardando,
    guardarAviso,
    avanzarPaso,
    estadoEquipo,
    limpieza,
    estadoCabezales,
    sistemaProteccion,
    sistemaProteccionOtro,
    tinta,
    voltajeLn,
    voltajeLt,
    voltajeNt,
    operador,
    ultimoMantenimiento,
    numeroFisico,
    procedimiento,
    conclusion,
    recomendaciones,
    repuestoDescripcion,
    repuestoCodigo,
    repuestoCantidad,
    repuestoTipo,
    repuestos,
    setRepuestos,
    setRepuestoCodigo,
    setRepuestoDescripcion,
    setRepuestoCantidad,
    setRepuestoTipo,
    adjuntos,
    setAdjuntos,
    setMensaje,
    firmaOperador,
    firmaCliente,
    nombreOperadorFirma,
    nombreClienteFirma,
    resultado,
    requerimiento,
    horaSalida,
    remota,
  } = estado;

  const registrarLlegada = async () => {
    if (!reporte) return;
    setGuardando(true);
    const respuesta = await registrar_llegada(reporte.id, horaLlegada || undefined);
    setGuardando(false);
    if (respuesta.ok) {
      setReporte(respuesta.datos);
      setHoraLlegada(respuesta.datos.hora_llegada || '');
      guardarAviso(`Guardado ${horaLimaStr()}`);
      avanzarPaso();
    } else {
      setMensaje(respuesta.error || 'Error al registrar llegada.');
    }
  };

  const guardarRevision = async () => {
    if (!reporte) return;
    setGuardando(true);
    const respuesta = await actualizar_revision_inicial(reporte.id, {
      estado_equipo: estadoEquipo,
      limpieza,
      estado_cabezales: estadoCabezales,
      sistema_proteccion: sistemaProteccion,
      sistema_proteccion_otro: sistemaProteccionOtro || null,
      tinta: tinta || null,
      voltaje_ln: voltajeLn ? Number(voltajeLn) : null,
      voltaje_lt: voltajeLt ? Number(voltajeLt) : null,
      voltaje_nt: voltajeNt ? Number(voltajeNt) : null,
      operador: operador || null,
      ultimo_mantenimiento: ultimoMantenimiento || null,
      numero_fisico: numeroFisico || null,
    });
    setGuardando(false);
    if (respuesta.ok) {
      setReporte(respuesta.datos);
      guardarAviso(`Guardado ${horaLimaStr()}`);
    } else {
      setMensaje(respuesta.error || 'Error al guardar revisión.');
    }
  };

  const guardarDesarrollo = async () => {
    if (!reporte) return;
    setGuardando(true);
    const respuesta = await actualizar_desarrollo(reporte.id, {
      procedimiento: procedimiento || null,
      conclusion: conclusion || null,
      recomendaciones: recomendaciones || null,
    });
    setGuardando(false);
    if (respuesta.ok) {
      setReporte(respuesta.datos);
      guardarAviso(`Guardado ${horaLimaStr()}`);
    } else {
      setMensaje(respuesta.error || 'Error al guardar desarrollo.');
    }
  };

  const agregarRepuestoItem = async () => {
    if (!reporte || !repuestoDescripcion) return;
    setGuardando(true);
    const respuesta = await agregar_repuesto(reporte.id, {
      repuesto_id: '',
      codigo: repuestoCodigo || 'MANUAL',
      descripcion: repuestoDescripcion,
      cantidad: repuestoCantidad,
      tipo: repuestoTipo,
    });
    setGuardando(false);
    if (respuesta.ok) {
      setRepuestos((actual) => [
        ...actual,
        {
          id: respuesta.datos.id,
          codigo: respuesta.datos.codigo,
          descripcion: respuesta.datos.descripcion,
          cantidad: respuesta.datos.cantidad,
          tipo: respuesta.datos.tipo,
        },
      ]);
      setRepuestoCodigo('');
      setRepuestoDescripcion('');
      setRepuestoCantidad(1);
      setRepuestoTipo('venta');
    } else {
      setMensaje(respuesta.error || 'Error al agregar repuesto.');
    }
  };

  const quitarRepuestoItem = async (idRepuesto: string) => {
    setGuardando(true);
    const respuesta = await quitar_repuesto(idRepuesto);
    setGuardando(false);
    if (respuesta.ok) setRepuestos((actual) => actual.filter((item) => item.id !== idRepuesto));
    else setMensaje(respuesta.error || 'Error al quitar repuesto.');
  };

  const agregarAdjuntoItem = async (tipo: AdjuntoFila['tipo'], archivo: File) => {
    if (!reporte) return;
    const url = URL.createObjectURL(archivo);
    const idAdj = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setAdjuntos((actual) => [...actual, { id: idAdj, tipo, nombre: archivo.name, url }]);
    setGuardando(true);
    const respuesta = await agregar_adjunto(reporte.id, {
      tipo,
      ruta: url,
      nombre_archivo: archivo.name,
      tipo_mime: archivo.type,
      archivo,
    });
    setGuardando(false);
    if (respuesta.ok) {
      const urlFinal = (respuesta.datos as { url?: string | null }).url || url;
      setAdjuntos((actual) =>
        actual.map((item) => (item.id === idAdj ? { ...item, id: respuesta.datos.id, url: urlFinal } : item))
      );
    } else {
      setAdjuntos((actual) => actual.filter((item) => item.id !== idAdj));
      setMensaje(respuesta.error || 'Error al subir adjunto.');
    }
  };

  const quitarAdjuntoItem = async (idAdjunto: string) => {
    if (!idAdjunto.startsWith('temp-')) {
      setGuardando(true);
      const respuesta = await quitar_adjunto(idAdjunto);
      setGuardando(false);
      if (!respuesta.ok) {
        setMensaje(respuesta.error || 'Error al quitar adjunto.');
        return;
      }
    }
    setAdjuntos((actual) => actual.filter((item) => item.id !== idAdjunto));
  };

  const guardarFirmas = async (
    firmaOp = firmaOperador,
    firmaCli = firmaCliente,
    nomOp = nombreOperadorFirma,
    nomCli = nombreClienteFirma,
  ) => {
    if (!reporte) return;
    setGuardando(true);
    const respuesta = await guardar_firmas(reporte.id, {
      firma_operador: firmaOp,
      nombre_operador_firma: nomOp || null,
      firma_cliente: firmaCli,
      nombre_cliente_firma: nomCli || null,
    });
    setGuardando(false);
    if (respuesta.ok) {
      setReporte(respuesta.datos);
      guardarAviso(`Guardado ${horaLimaStr()}`);
    } else {
      setMensaje(respuesta.error || 'Error al guardar firmas.');
    }
  };

  const camposFaltas = {
    estadoEquipo,
    limpieza,
    estadoCabezales,
    sistemaProteccion,
    sistemaProteccionOtro,
    tinta,
    voltajeLn,
    voltajeLt,
    voltajeNt,
    procedimiento,
    conclusion,
    firmaOperador,
    nombreOperadorFirma,
    firmaCliente,
    nombreClienteFirma,
  };

  const calcularFaltas = () => (reporte ? faltasEnPantalla(reporte, camposFaltas, adjuntos, remota) : []);

  const cerrarReporte = async () => {
    if (!reporte || !resultado) return;
    if (resultado === 'pendiente' && !requerimiento.trim()) {
      setMensaje('Indica el requerimiento para dejar el reporte pendiente.');
      return;
    }
    const faltas = calcularFaltas();
    if (faltas.length) {
      setMensaje(`Para cerrar falta: ${faltas.join(', ')}.`);
      return;
    }
    setGuardando(true);
    const respuesta = await cerrar_reporte(reporte.id, resultado, requerimiento || null, horaSalida || undefined);
    setGuardando(false);
    if (respuesta.ok) {
      setReporte(respuesta.datos);
      setMensaje('Reporte cerrado correctamente.');
      const envio = await reportePdf({ reporte_id: reporte.id, enviar: true, para: undefined });
      if (envio.ok) setMensaje(`Reporte enviado a ${envio.datos.envios[0]?.destino || 'cliente'}.`);
    } else {
      setMensaje(respuesta.error || 'Error al cerrar reporte.');
    }
  };

  return {
    registrarLlegada,
    guardarRevision,
    guardarDesarrollo,
    agregarRepuestoItem,
    quitarRepuestoItem,
    agregarAdjuntoItem,
    quitarAdjuntoItem,
    guardarFirmas,
    calcularFaltas,
    cerrarReporte,
  };
}
