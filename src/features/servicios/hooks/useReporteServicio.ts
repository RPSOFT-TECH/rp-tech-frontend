'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mis_servicios, obtener_reporte, parametros_actuales, type MiServicio } from '@/lib/datos/actions';
import type { Reporte } from '@/lib/datos-simulados/types';
import { PASOS, puedeEditar, type AdjuntoFila, type RepuestoFila } from '../reporte/pasos';
import { useAccionesReporte } from './useAccionesReporte';

function sesionLocal() {
  const memoria = (globalThis as { localStorage?: Storage }).localStorage;
  if (!memoria) return null;
  const raw = memoria.getItem('rptech_session_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { usuario: { id: string; nombre_completo: string }; rolesVigentes: string[] };
  } catch {
    return null;
  }
}

export function useReporteServicio() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [caso, setCaso] = useState<MiServicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [paso, setPaso] = useState(1);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [horaLlegada, setHoraLlegada] = useState('');
  const [estadoEquipo, setEstadoEquipo] = useState<'operativo' | 'inoperativo' | null>(null);
  const [limpieza, setLimpieza] = useState<'limpio' | 'sucio' | null>(null);
  const [estadoCabezales, setEstadoCabezales] = useState<'bueno' | 'regular' | 'malo' | null>(null);
  const [sistemaProteccion, setSistemaProteccion] = useState<'estabilizador' | 'ups' | 'otro' | null>(null);
  const [sistemaProteccionOtro, setSistemaProteccionOtro] = useState('');
  const [tinta, setTinta] = useState('');
  const [voltajeLn, setVoltajeLn] = useState('');
  const [voltajeLt, setVoltajeLt] = useState('');
  const [voltajeNt, setVoltajeNt] = useState('');
  const [operador, setOperador] = useState('');
  const [ultimoMantenimiento, setUltimoMantenimiento] = useState('');
  const [numeroFisico, setNumeroFisico] = useState('');
  const [procedimiento, setProcedimiento] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [repuestos, setRepuestos] = useState<RepuestoFila[]>([]);
  const [repuestoCodigo, setRepuestoCodigo] = useState('');
  const [repuestoDescripcion, setRepuestoDescripcion] = useState('');
  const [repuestoCantidad, setRepuestoCantidad] = useState(1);
  const [repuestoTipo, setRepuestoTipo] = useState<'venta' | 'descarte' | 'garantia'>('venta');
  const [adjuntos, setAdjuntos] = useState<AdjuntoFila[]>([]);
  const [nombreOperadorFirma, setNombreOperadorFirma] = useState('');
  const [firmaOperador, setFirmaOperador] = useState<string | null>(null);
  const [nombreClienteFirma, setNombreClienteFirma] = useState('');
  const [firmaCliente, setFirmaCliente] = useState<string | null>(null);
  const [textoConformidad, setTextoConformidad] = useState('');
  const [resultado, setResultado] = useState<'resuelto' | 'pendiente' | null>(null);
  const [requerimiento, setRequerimiento] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [remota, setRemota] = useState(false);

  const perfilId = sesionLocal()?.usuario.id ?? '';
  const puedeEditarReporte = reporte ? puedeEditar(reporte, perfilId) : false;
  const reporteCerrado = reporte?.cerrado ?? false;

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      setLoading(true);
      const data = await mis_servicios();
      const encontrado = data.find((item) => item.caso_id === id);
      if (!activo) return;
      if (!encontrado) {
        setCaso(null);
        setLoading(false);
        return;
      }
      setCaso(encontrado);
      const [respuesta, params] = await Promise.all([
        obtener_reporte(encontrado.id),
        parametros_actuales(),
      ]);
      if (!activo) return;
      if (params?.texto_conformidad) {
        setTextoConformidad((actual) => actual || params.texto_conformidad);
      } else {
        setTextoConformidad((actual) => actual || 'Confirmo que el servicio se realizó y el equipo quedó en el estado descrito en este reporte.');
      }
      const reporteData = respuesta.ok ? respuesta.datos.reporte : null;
      setReporte(reporteData);
      setRemota(respuesta.ok ? respuesta.datos.remota : false);
      setLoading(false);
      if (!reporteData) return;
      setHoraLlegada(reporteData.hora_llegada || '');
      setEstadoEquipo(reporteData.estado_equipo);
      setLimpieza(reporteData.limpieza);
      setEstadoCabezales(reporteData.estado_cabezales);
      setSistemaProteccion(reporteData.sistema_proteccion);
      setSistemaProteccionOtro(reporteData.sistema_proteccion_otro || '');
      setTinta(reporteData.tinta || '');
      setVoltajeLn(String(reporteData.voltaje_ln ?? ''));
      setVoltajeLt(String(reporteData.voltaje_lt ?? ''));
      setVoltajeNt(String(reporteData.voltaje_nt ?? ''));
      setOperador(reporteData.operador || '');
      setUltimoMantenimiento(reporteData.ultimo_mantenimiento || '');
      setNumeroFisico(reporteData.numero_fisico || '');
      setProcedimiento(reporteData.procedimiento || '');
      setConclusion(reporteData.conclusion || '');
      setRecomendaciones(reporteData.recomendaciones || '');
      setResultado(reporteData.resultado);
      setRequerimiento(reporteData.requerimiento || '');
      setHoraSalida(reporteData.hora_salida || '');
      setNombreOperadorFirma(reporteData.nombre_operador_firma || '');
      setFirmaOperador(reporteData.firma_operador || null);
      setNombreClienteFirma(reporteData.nombre_cliente_firma || '');
      setFirmaCliente(reporteData.firma_cliente || null);
      setRepuestos(
        (respuesta.ok ? respuesta.datos.repuestos : []).map((item) => ({
          id: item.id,
          codigo: item.codigo,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          tipo: item.tipo,
        })),
      );
      setAdjuntos(
        (respuesta.ok ? respuesta.datos.adjuntos : []).map((item) => ({
          id: item.id,
          tipo: item.tipo,
          nombre: item.nombre_archivo,
          url: item.url || item.ruta,
        })),
      );
    };
    cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  const esPasoEditable = puedeEditarReporte && !reporteCerrado;
  const avanzarPaso = () => {
    if (paso < PASOS.length) setPaso(paso + 1);
  };
  const retrocederPaso = () => {
    if (paso > 1) setPaso(paso - 1);
  };
  const guardarAviso = useCallback((texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(null), 2000);
  }, []);

  const acciones = useAccionesReporte({
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
  });

  return {
    router,
    reporte,
    caso,
    loading,
    paso,
    mensaje,
    setMensaje,
    guardando,
    horaLlegada,
    estadoEquipo,
    setEstadoEquipo,
    limpieza,
    setLimpieza,
    estadoCabezales,
    setEstadoCabezales,
    sistemaProteccion,
    setSistemaProteccion,
    sistemaProteccionOtro,
    setSistemaProteccionOtro,
    tinta,
    setTinta,
    voltajeLn,
    setVoltajeLn,
    voltajeLt,
    setVoltajeLt,
    voltajeNt,
    setVoltajeNt,
    operador,
    setOperador,
    ultimoMantenimiento,
    setUltimoMantenimiento,
    numeroFisico,
    setNumeroFisico,
    procedimiento,
    setProcedimiento,
    conclusion,
    setConclusion,
    recomendaciones,
    setRecomendaciones,
    repuestos,
    repuestoCodigo,
    setRepuestoCodigo,
    repuestoDescripcion,
    setRepuestoDescripcion,
    repuestoCantidad,
    setRepuestoCantidad,
    repuestoTipo,
    setRepuestoTipo,
    adjuntos,
    nombreOperadorFirma,
    setNombreOperadorFirma,
    firmaOperador,
    setFirmaOperador,
    nombreClienteFirma,
    setNombreClienteFirma,
    firmaCliente,
    setFirmaCliente,
    textoConformidad,
    setTextoConformidad,
    resultado,
    setResultado,
    requerimiento,
    setRequerimiento,
    horaSalida,
    setHoraSalida,
    esPasoEditable,
    reporteCerrado,
    avanzarPaso,
    retrocederPaso,
    irAlPaso: (siguiente: number) => setPaso(siguiente),
    ...acciones,
  };
}
