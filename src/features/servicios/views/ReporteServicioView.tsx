'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  mis_servicios,
  registrar_llegada,
  actualizar_revision_inicial,
  actualizar_desarrollo,
  agregar_repuesto,
  quitar_repuesto,
  agregar_adjunto,
  quitar_adjunto,
  guardar_firmas,
  cerrar_reporte,
  reportePdf,
  type MiServicio,
} from '@/lib/datos-simulados/actions';
import type { Adjunto, Reporte, ReporteRepuesto } from '@/lib/datos-simulados/types';
import { Button, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';

const PASOS = [
  { clave: 'llegada', nombre: 'Llegada' },
  { clave: 'revision', nombre: 'Revisión inicial' },
  { clave: 'desarrollo', nombre: 'Desarrollo' },
  { clave: 'repuestos', nombre: 'Repuestos' },
  { clave: 'fotos', nombre: 'Fotos y adjuntos' },
  { clave: 'conformidad', nombre: 'Conformidad' },
  { clave: 'cierre', nombre: 'Cierre' },
];

function horaLimaStr(): string {
  return new Date().toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fechaHoraLima(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function puedeEditar(reporte: Reporte, perfilId: string): boolean {
  return !reporte.cerrado && reporte.tecnico_id === perfilId;
}

function ReporteServicioContenido() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [caso, setCaso] = useState<MiServicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [paso, setPaso] = useState(1);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Paso 1 - Llegada
  const [horaLlegada, setHoraLlegada] = useState<string>('');

  // Paso 2 - Revisión inicial
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

  // Paso 3 - Desarrollo
  const [procedimiento, setProcedimiento] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');

  // Paso 4 - Repuestos
  const [repuestos, setRepuestos] = useState<{ id: string; codigo: string; descripcion: string; cantidad: number; tipo: 'venta' | 'descarte' | 'garantia' }[]>([]);
  const [repuestoCodigo, setRepuestoCodigo] = useState('');
  const [repuestoDescripcion, setRepuestoDescripcion] = useState('');
  const [repuestoCantidad, setRepuestoCantidad] = useState(1);
  const [repuestoTipo, setRepuestoTipo] = useState<'venta' | 'descarte' | 'garantia'>('venta');

  // Paso 5 - Fotos y adjuntos
  const [adjuntos, setAdjuntos] = useState<{ id: string; tipo: 'foto_ingreso' | 'foto_salida' | 'otro'; nombre: string; url: string }[]>([]);

  // Paso 6 - Conformidad
  const [nombreOperadorFirma, setNombreOperadorFirma] = useState('');
  const [firmaOperador, setFirmaOperador] = useState<string | null>(null);
  const [nombreClienteFirma, setNombreClienteFirma] = useState('');
  const [firmaCliente, setFirmaCliente] = useState<string | null>(null);
  const [textoConformidad] = useState('');

  // Paso 7 - Cierre
  const [resultado, setResultado] = useState<'resuelto' | 'pendiente' | null>(null);
  const [requerimiento, setRequerimiento] = useState('');
  const [horaSalida, setHoraSalida] = useState('');

  const sesion = (() => {
    const m = (globalThis as { localStorage?: Storage }).localStorage;
    if (!m) return null;
    const raw = m.getItem('rptech_session_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as { usuario: { id: string; nombre_completo: string }; rolesVigentes: string[] };
    } catch {
      return null;
    }
  })();

  const perfilId = sesion?.usuario.id ?? '';
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

      const reporteData = dbReportePorId(encontrado.id);
      setReporte(reporteData);
      setLoading(false);

      if (reporteData) {
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
          (dbReportesRepuestosPorReporte(encontrado.id) || []).map((r) => ({
            id: r.id,
            codigo: r.codigo,
            descripcion: r.descripcion,
            cantidad: r.cantidad,
            tipo: r.tipo,
          })),
        );
        setAdjuntos(
          (dbAdjuntosPorReporte(encontrado.id) || []).map((a) => ({
            id: a.id,
            tipo: a.tipo,
            nombre: a.nombre_archivo,
            url: a.ruta,
          })),
        );
      }
    };
    cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  const esPasoEditable = puedeEditarReporte && !reporteCerrado;
  const pasoActual = PASOS[paso - 1];

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

  const registrarLlegada = async () => {
    if (!reporte) return;
    setGuardando(true);
    const r = await registrar_llegada(reporte.id, horaLlegada || undefined);
    setGuardando(false);
    if (r.ok) {
      setReporte(r.datos);
      setHoraLlegada(r.datos.hora_llegada || '');
      guardarAviso(`Guardado ${horaLimaStr()}`);
      avanzarPaso();
    } else {
      setMensaje(r.error || 'Error al registrar llegada.');
    }
  };

  const guardarRevision = async () => {
    if (!reporte) return;
    setGuardando(true);
    const r = await actualizar_revision_inicial(reporte.id, {
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
    if (r.ok) {
      setReporte(r.datos);
      guardarAviso(`Guardado ${horaLimaStr()}`);
    } else {
      setMensaje(r.error || 'Error al guardar revisión.');
    }
  };

  const guardarDesarrollo = async () => {
    if (!reporte) return;
    setGuardando(true);
    const r = await actualizar_desarrollo(reporte.id, {
      procedimiento: procedimiento || null,
      conclusion: conclusion || null,
      recomendaciones: recomendaciones || null,
    });
    setGuardando(false);
    if (r.ok) {
      setReporte(r.datos);
      guardarAviso(`Guardado ${horaLimaStr()}`);
    } else {
      setMensaje(r.error || 'Error al guardar desarrollo.');
    }
  };

  const agregarRepuestoItem = async () => {
    if (!reporte || !repuestoDescripcion) return;
    setGuardando(true);
    const r = await agregar_repuesto(reporte.id, {
      repuesto_id: '',
      codigo: repuestoCodigo || 'MANUAL',
      descripcion: repuestoDescripcion,
      cantidad: repuestoCantidad,
      tipo: repuestoTipo,
    });
    setGuardando(false);
    if (r.ok) {
      const lista = [...repuestos, { id: r.datos.id, codigo: r.datos.codigo, descripcion: r.datos.descripcion, cantidad: r.datos.cantidad, tipo: r.datos.tipo }];
      setRepuestos(lista);
      setRepuestoCodigo('');
      setRepuestoDescripcion('');
      setRepuestoCantidad(1);
      setRepuestoTipo('venta');
    } else {
      setMensaje(r.error || 'Error al agregar repuesto.');
    }
  };

  const quitarRepuestoItem = async (id: string) => {
    setGuardando(true);
    const r = await quitar_repuesto(id);
    setGuardando(false);
    if (r.ok) {
      setRepuestos(repuestos.filter((rp) => rp.id !== id));
    } else {
      setMensaje(r.error || 'Error al quitar repuesto.');
    }
  };

  const agregarAdjunto = async (tipo: 'foto_ingreso' | 'foto_salida' | 'otro', archivo: File) => {
    if (!reporte) return;
    const url = URL.createObjectURL(archivo);
    const idAdj = `temp-${Date.now()}`;
    setAdjuntos([...adjuntos, { id: idAdj, tipo, nombre: archivo.name, url }]);
    setGuardando(true);
    const r = await agregar_adjunto(reporte.id, { tipo, ruta: url, nombre_archivo: archivo.name, tipo_mime: archivo.type });
    setGuardando(false);
    if (r.ok) {
      setAdjuntos(adjuntos.map((a) => (a.id === idAdj ? { ...a, id: r.datos.id } : a)));
    } else {
      setAdjuntos(adjuntos.filter((a) => a.id !== idAdj));
      setMensaje(r.error || 'Error al subir adjunto.');
    }
  };

  const quitarAdjuntoItem = async (id: string) => {
    const existeEnDb = !id.startsWith('temp-');
    if (existeEnDb) {
      setGuardando(true);
      const r = await quitar_adjunto(id);
      setGuardando(false);
      if (!r.ok) {
        setMensaje(r.error || 'Error al quitar adjunto.');
        return;
      }
    }
    setAdjuntos(adjuntos.filter((a) => a.id !== id));
  };

  const guardarFirmas = async () => {
    if (!reporte) return;
    setGuardando(true);
    const r = await guardar_firmas(reporte.id, {
      firma_operador: firmaOperador,
      nombre_operador_firma: nombreOperadorFirma || null,
      firma_cliente: firmaCliente,
      nombre_cliente_firma: nombreClienteFirma || null,
    });
    setGuardando(false);
    if (r.ok) {
      setReporte(r.datos);
      guardarAviso(`Guardado ${horaLimaStr()}`);
    } else {
      setMensaje(r.error || 'Error al guardar firmas.');
    }
  };

  const cerrarReporte = async () => {
    if (!reporte || !resultado) return;
    if (resultado === 'pendiente' && !requerimiento.trim()) {
      setMensaje('Indica el requerimiento para dejar el reporte pendiente.');
      return;
    }
    const tieneFotoIngreso = adjuntos.some((a) => a.tipo === 'foto_ingreso');
    const tieneFotoSalida = adjuntos.some((a) => a.tipo === 'foto_salida');
    if (!tieneFotoIngreso || !tieneFotoSalida) {
      setMensaje('Falta al menos una foto de ingreso y una de salida.');
      return;
    }
    if (!firmaOperador || !firmaCliente) {
      setMensaje('Faltan las dos firmas (operador y cliente).');
      return;
    }
    setGuardando(true);
    const r = await cerrar_reporte(reporte.id, resultado, requerimiento || null, horaSalida || undefined);
    setGuardando(false);
    if (r.ok) {
      setReporte(r.datos);
      setMensaje('Reporte cerrado correctamente.');
      const envio = await reportePdf({ reporte_id: reporte.id, enviar: true, para: undefined });
      if (envio.ok) {
        setMensaje(`Reporte enviado a ${envio.datos.envios[0]?.destino || 'cliente'}.`);
      }
    } else {
      setMensaje(r.error || 'Error al cerrar reporte.');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando reporte de servicio...</div>;
  }

  if (!reporte || !caso) {
    return <div className="p-8 text-center text-destructive">Reporte no encontrado.</div>;
  }

  const hayFotoIngreso = adjuntos.some((a) => a.tipo === 'foto_ingreso');
  const hayFotoSalida = adjuntos.some((a) => a.tipo === 'foto_salida');
  const hayFirmaOperador = !!firmaOperador;
  const hayFirmaCliente = !!firmaCliente;

  const faltasCierre: string[] = [];
  if (!reporte.hora_llegada) faltasCierre.push('Llegada');
  if (!procedimiento) faltasCierre.push('Procedimiento');
  if (!conclusion) faltasCierre.push('Conclusión');
  if (!hayFotoIngreso) faltasCierre.push('Foto de ingreso');
  if (!hayFotoSalida) faltasCierre.push('Foto de salida');
  if (!hayFirmaOperador || !hayFirmaCliente) faltasCierre.push('Las dos firmas');

  return (
    <div className="p-4 max-w-md mx-auto md:max-w-2xl pb-24">
      <div className="mb-6">
        <Link href="/mis-servicios" className="text-sm text-primary hover:underline mb-2 inline-block">
          Volver a Mis Servicios
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Reporte de Servicio</h1>
        <p className="text-xs text-muted-foreground">
          Caso {caso.numero_caso} · Visita {reporte.numero_visita} · {reporte.numero ? `Reporte ${reporte.numero}` : 'Sin número'}
        </p>
      </div>

      {mensaje && (
        <div className={`mb-4 rounded-lg p-3 text-sm ${mensaje.includes('correctamente') || mensaje.includes('Guardado') || mensaje.includes('enviado') ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
          {mensaje}
        </div>
      )}

      {/* Barra de avance */}
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Paso {paso} de {PASOS.length}: {pasoActual.nombre}
        </div>
        <div className="flex gap-1">
          {PASOS.map((p, i) => (
            <div key={p.clave} className={`flex-1 h-1.5 rounded-full ${i + 1 < paso ? 'bg-primary' : i + 1 === paso ? 'bg-primary/30' : 'bg-muted'}`} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Paso 1: Llegada */}
        {paso === 1 && (
          <Card className="p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">1. Llegada</h3>
            <div className="text-sm text-card-foreground">
              {reporte.hora_llegada ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary">{reporte.hora_llegada}</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Registrado</span>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">Registra tu llegada para generar el número de reporte y habilitar los siguientes pasos.</p>
                  <Button
                    onClick={registrarLlegada}
                    disabled={!esPasoEditable || guardando}
                    className="w-full min-h-11"
                  >
                    {guardando ? 'Registrando...' : 'Registrar llegada'}
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}

        {/* Paso 2: Revisión inicial */}
        {paso === 2 && (
          <Card className="p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">2. Revisión inicial</h3>
            {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Estado del equipo</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 cursor-pointer {!esPasoEditable ? 'opacity-50' : ''}">
                    <input
                      type="radio"
                      name="estado_equipo"
                      value="operativo"
                      checked={estadoEquipo === 'operativo'}
                      onChange={() => setEstadoEquipo('operativo')}
                      disabled={!esPasoEditable}
                      className="w-4 h-4 text-primary"
                    />
                    Operativo
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer {!esPasoEditable ? 'opacity-50' : ''}">
                    <input
                      type="radio"
                      name="estado_equipo"
                      value="inoperativo"
                      checked={estadoEquipo === 'inoperativo'}
                      onChange={() => setEstadoEquipo('inoperativo')}
                      disabled={!esPasoEditable}
                      className="w-4 h-4 text-primary"
                    />
                    Inoperativo
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Limpieza</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 cursor-pointer {!esPasoEditable ? 'opacity-50' : ''}">
                    <input
                      type="radio"
                      name="limpieza"
                      value="limpio"
                      checked={limpieza === 'limpio'}
                      onChange={() => setLimpieza('limpio')}
                      disabled={!esPasoEditable}
                      className="w-4 h-4 text-primary"
                    />
                    Limpio
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer {!esPasoEditable ? 'opacity-50' : ''}">
                    <input
                      type="radio"
                      name="limpieza"
                      value="sucio"
                      checked={limpieza === 'sucio'}
                      onChange={() => setLimpieza('sucio')}
                      disabled={!esPasoEditable}
                      className="w-4 h-4 text-primary"
                    />
                    Sucio
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Cabezales</label>
                <select
                  value={estadoCabezales ?? ''}
                  onChange={(e) => {
                    const v = e.target.value as 'bueno' | 'regular' | 'malo' | '';
                    setEstadoCabezales(v || null);
                  }}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                >
                  <option value="">Selecciona</option>
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="malo">Malo</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Protección</label>
                <select
                  value={sistemaProteccion ?? ''}
                  onChange={(e) => {
                    const v = e.target.value as 'estabilizador' | 'ups' | 'otro' | '';
                    setSistemaProteccion(v || null);
                  }}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                >
                  <option value="">Selecciona</option>
                  <option value="estabilizador">Estabilizador</option>
                  <option value="ups">UPS</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            {sistemaProteccion === 'otro' && (
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-xs font-semibold text-muted-foreground">¿Cuál?</label>
                <input
                  value={sistemaProteccionOtro}
                  onChange={(e) => setSistemaProteccionOtro(e.target.value)}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Tinta</label>
                <input
                  value={tinta}
                  onChange={(e) => setTinta(e.target.value)}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Voltaje L+N</label>
                <input
                  type="number"
                  value={voltajeLn}
                  onChange={(e) => setVoltajeLn(e.target.value)}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Voltaje L+T</label>
                <input
                  type="number"
                  value={voltajeLt}
                  onChange={(e) => setVoltajeLt(e.target.value)}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Voltaje N+T</label>
                <input
                  type="number"
                  value={voltajeNt}
                  onChange={(e) => setVoltajeNt(e.target.value)}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Operador</label>
                <input
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Último mantenimiento</label>
                <input
                  type="date"
                  value={ultimoMantenimiento}
                  onChange={(e) => setUltimoMantenimiento(e.target.value)}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-xs font-semibold text-muted-foreground">N° de reporte físico</label>
              <input
                value={numeroFisico}
                onChange={(e) => setNumeroFisico(e.target.value)}
                disabled={!esPasoEditable}
                className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
              />
            </div>
            <Button
              onClick={guardarRevision}
              disabled={!esPasoEditable || guardando}
              className="w-full min-h-11"
            >
              {guardando ? 'Guardando...' : 'Guardar revisión inicial'}
            </Button>
          </Card>
        )}

        {/* Paso 3: Desarrollo */}
        {paso === 3 && (
          <Card className="p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">3. Desarrollo del servicio</h3>
            {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}
            <p className="text-xs text-muted-foreground mb-3">Puedes dictar con el micrófono del teclado.</p>
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs font-semibold text-muted-foreground">Procedimiento (obligatorio)</label>
              <textarea
                value={procedimiento}
                onChange={(e) => setProcedimiento(e.target.value)}
                rows={4}
                disabled={!esPasoEditable}
                className="min-h-[100px] border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs font-semibold text-muted-foreground">Conclusión (obligatorio)</label>
              <textarea
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                rows={3}
                disabled={!esPasoEditable}
                className="min-h-[80px] border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs font-semibold text-muted-foreground">Recomendaciones</label>
              <textarea
                value={recomendaciones}
                onChange={(e) => setRecomendaciones(e.target.value)}
                rows={3}
                disabled={!esPasoEditable}
                className="min-h-[80px] border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="min-h-11">
                Atrás
              </Button>
              <Button
                onClick={() => {
                  guardarDesarrollo();
                  avanzarPaso();
                }}
                disabled={!esPasoEditable || guardando}
                className="min-h-11"
              >
                {guardando ? 'Guardando...' : 'Siguiente'}
              </Button>
            </div>
          </Card>
        )}

        {/* Paso 4: Repuestos */}
        {paso === 4 && (
          <Card className="p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">4. Repuestos</h3>
            {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Código</label>
                <input
                  value={repuestoCodigo}
                  onChange={(e) => setRepuestoCodigo(e.target.value)}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Descripción</label>
                <input
                  value={repuestoDescripcion}
                  onChange={(e) => setRepuestoDescripcion(e.target.value)}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Cantidad</label>
                <input
                  type="number"
                  value={repuestoCantidad}
                  onChange={(e) => setRepuestoCantidad(Number(e.target.value) || 1)}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Tipo</label>
                <select
                  value={repuestoTipo}
                  onChange={(e) => setRepuestoTipo(e.target.value as 'venta' | 'descarte' | 'garantia')}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                >
                  <option value="venta">Venta</option>
                  <option value="descarte">Descarte</option>
                  <option value="garantia">Garantía</option>
                </select>
              </div>
            </div>
            <Button
              onClick={agregarRepuestoItem}
              disabled={!esPasoEditable || guardando || !repuestoDescripcion}
              className="w-full min-h-11 mb-4"
            >
              {guardando ? 'Agregando...' : 'Agregar repuesto'}
            </Button>
            {repuestos.length > 0 && (
              <div className="space-y-2">
                <Table className="text-left border-collapse w-full">
                  <TableHeader>
                    <TableRow className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground">
                      <TableHead className="p-2">Código</TableHead>
                      <TableHead className="p-2">Descripción</TableHead>
                      <TableHead className="p-2">Cant.</TableHead>
                      <TableHead className="p-2">Tipo</TableHead>
                      <TableHead className="p-2 text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border text-sm">
                    {repuestos.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="p-2 font-mono">{r.codigo}</TableCell>
                        <TableCell className="p-2">{r.descripcion}</TableCell>
                        <TableCell className="p-2">{r.cantidad}</TableCell>
                        <TableCell className="p-2">{r.tipo}</TableCell>
                        <TableCell className="p-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => quitarRepuestoItem(r.id)}
                            disabled={!esPasoEditable || guardando}
                            className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                          >
                            Quitar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="min-h-11">
                Atrás
              </Button>
              <Button
                onClick={avanzarPaso}
                disabled={guardando}
                className="min-h-11"
              >
                Siguiente
              </Button>
            </div>
          </Card>
        )}

        {/* Paso 5: Fotos y adjuntos */}
        {paso === 5 && (
          <Card className="p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">5. Fotos y adjuntos</h3>
            {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground">Foto de ingreso</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    onChange={(e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) agregarAdjunto('foto_ingreso', f);
                    }}
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    id="foto-ingreso"
                  />
                  <label htmlFor="foto-ingreso" className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg text-sm transition-colors min-h-11 text-center">
                    Tomar foto
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const fs = Array.from((e.target as HTMLInputElement).files || []);
                      fs.forEach((f) => agregarAdjunto('foto_ingreso', f));
                    }}
                    accept="image/*"
                    multiple
                    className="sr-only"
                    id="foto-ingreso-galeria"
                  />
                  <label htmlFor="foto-ingreso-galeria" className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg text-sm transition-colors min-h-11 text-center">
                    Elegir varias
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground">Foto de salida</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    onChange={(e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) agregarAdjunto('foto_salida', f);
                    }}
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    id="foto-salida"
                  />
                  <label htmlFor="foto-salida" className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg text-sm transition-colors min-h-11 text-center">
                    Tomar foto
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const fs = Array.from((e.target as HTMLInputElement).files || []);
                      fs.forEach((f) => agregarAdjunto('foto_salida', f));
                    }}
                    accept="image/*"
                    multiple
                    className="sr-only"
                    id="foto-salida-galeria"
                  />
                  <label htmlFor="foto-salida-galeria" className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg text-sm transition-colors min-h-11 text-center">
                    Elegir varias
                  </label>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs font-semibold text-muted-foreground">Otros archivos (videos, documentos)</label>
              <input
                type="file"
                onChange={(e) => {
                  const fs = Array.from((e.target as HTMLInputElement).files || []);
                  fs.forEach((f) => agregarAdjunto('otro', f));
                }}
                accept="*/*"
                multiple
                className="sr-only"
                id="otros-archivos"
              />
              <label htmlFor="otros-archivos" className="bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg text-sm transition-colors min-h-11 text-center">
                Subir archivo
              </label>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground">Adjuntos:</h4>
              {adjuntos.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin adjuntos.</p>
              ) : (
                <div className="space-y-1">
                  {adjuntos.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded p-2">
                      {a.tipo === 'foto_ingreso' && <span className="text-primary font-bold">INGRESO</span>}
                      {a.tipo === 'foto_salida' && <span className="text-blue-600 font-bold">SALIDA</span>}
                      {a.tipo === 'otro' && <span className="text-muted-foreground font-bold">OTRO</span>}
                      <span className="flex-1 truncate">{a.nombre}</span>
                      <button
                        onClick={() => quitarAdjuntoItem(a.id)}
                        disabled={!esPasoEditable || guardando}
                        className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="min-h-11">
                Atrás
              </Button>
              <Button onClick={avanzarPaso} disabled={guardando} className="min-h-11">
                Siguiente
              </Button>
            </div>
          </Card>
        )}

        {/* Paso 6: Conformidad */}
        {paso === 6 && (
          <Card className="p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">6. Conformidad</h3>
            {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Texto de conformidad</label>
              <textarea
                value={textoConformidad}
                readOnly
                rows={3}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground">Firma operador del equipo</label>
                <input
                  value={nombreOperadorFirma}
                  onChange={(e) => setNombreOperadorFirma(e.target.value)}
                  placeholder="Nombre"
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="file"
                    onChange={(e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) {
                        setFirmaOperador(URL.createObjectURL(f));
                        guardarFirmas();
                      }
                    }}
                    accept="image/*"
                    className="sr-only"
                    id="firma-operador"
                  />
                  <label htmlFor="firma-operador" className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg text-sm transition-colors min-h-11 text-center">
                    {firmaOperador ? 'Cambiar firma' : 'Guardar firma'}
                  </label>
                  {firmaOperador && (
                    <button
                      onClick={() => {
                        setFirmaOperador(null);
                        guardarFirmas();
                      }}
                      className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded"
                    >
                      Borrar
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground">Firma cliente</label>
                <input
                  value={nombreClienteFirma}
                  onChange={(e) => setNombreClienteFirma(e.target.value)}
                  placeholder="Nombre"
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="file"
                    onChange={(e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) {
                        setFirmaCliente(URL.createObjectURL(f));
                        guardarFirmas();
                      }
                    }}
                    accept="image/*"
                    className="sr-only"
                    id="firma-cliente"
                  />
                  <label htmlFor="firma-cliente" className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg text-sm transition-colors min-h-11 text-center">
                    {firmaCliente ? 'Cambiar firma' : 'Guardar firma'}
                  </label>
                  {firmaCliente && (
                    <button
                      onClick={() => {
                        setFirmaCliente(null);
                        guardarFirmas();
                      }}
                      className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded"
                    >
                      Borrar
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="min-h-11">
                Atrás
              </Button>
              <Button onClick={avanzarPaso} disabled={guardando} className="min-h-11">
                Siguiente
              </Button>
            </div>
          </Card>
        )}

        {/* Paso 7: Cierre */}
        {paso === 7 && (
          <Card className="p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">7. Cierre</h3>
            {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground">¿Qué falta?</h4>
              {faltasCierre.length === 0 ? (
                <p className="text-xs text-green-700 bg-green-50 rounded p-2">Todo listo para cerrar.</p>
              ) : (
                <ul className="text-xs text-amber-800 bg-amber-50 rounded p-2 space-y-1">
                  {faltasCierre.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs font-semibold text-muted-foreground">Resultado</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer {!esPasoEditable ? 'opacity-50' : ''}">
                  <input
                    type="radio"
                    name="resultado"
                    value="resuelto"
                    checked={resultado === 'resuelto'}
                    onChange={() => setResultado('resuelto')}
                    disabled={!esPasoEditable}
                    className="w-4 h-4 text-primary"
                  />
                  Resuelto
                </label>
                <label className="flex items-center gap-2 cursor-pointer {!esPasoEditable ? 'opacity-50' : ''}">
                  <input
                    type="radio"
                    name="resultado"
                    value="pendiente"
                    checked={resultado === 'pendiente'}
                    onChange={() => setResultado('pendiente')}
                    disabled={!esPasoEditable}
                    className="w-4 h-4 text-primary"
                  />
                  Pendiente
                </label>
              </div>
            </div>

            {resultado === 'pendiente' && (
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-xs font-semibold text-muted-foreground">¿Qué se requiere?</label>
                <input
                  value={requerimiento}
                  onChange={(e) => setRequerimiento(e.target.value)}
                  disabled={!esPasoEditable}
                  className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
                />
              </div>
            )}

            <div className="flex flex-col gap-1 mb-4">
              <label className="text-xs font-semibold text-muted-foreground">Hora de salida</label>
              <input
                type="time"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
                disabled={!esPasoEditable}
                className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
              />
            </div>

            <Button
              onClick={cerrarReporte}
              disabled={!esPasoEditable || guardando || faltasCierre.length > 0}
              className="w-full min-h-11"
            >
              {guardando ? 'Cerrando...' : 'Cerrar reporte'}
            </Button>
          </Card>
        )}

        {reporteCerrado && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-xs font-semibold text-green-900 mb-2">Reporte cerrado</h3>
            <p className="text-xs text-green-800">
              El reporte está bloqueado y solo se pueden agregar notas.
            </p>
            {reporte.cerrado_en && (
              <p className="text-xs text-green-600 mt-1">
                Cerrado el {fechaHoraLima(reporte.cerrado_en)}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => router.push('/mis-servicios')} className="min-h-11">
          Volver a Mis Servicios
        </Button>
        {reporte.numero && (
          <Button variant="outline" onClick={() => setMensaje('PDF disponible al conectar al backend.')} disabled className="min-h-11 opacity-50">
            Descargar PDF
          </Button>
        )}
      </div>
    </div>
  );
}

// Helpers simulados para leer datos del store (evitar importación directa de db en cliente)
function dbReportePorId(id: string): Reporte | null {
  void id;
  return null;
}
function dbReportesRepuestosPorReporte(id: string): ReporteRepuesto[] | null {
  void id;
  return null;
}
function dbAdjuntosPorReporte(id: string): Adjunto[] | null {
  void id;
  return null;
}

export function ReporteServicioView() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Cargando reporte...</div>}>
      <ReporteServicioContenido />
    </Suspense>
  );
}
