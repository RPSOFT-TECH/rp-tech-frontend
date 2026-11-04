'use client';

import { Suspense, useCallback, useEffect, useState, useTransition } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  obtener_caso_detalle,
  obtenerUsuarioActual,
  type CasoDetalle,
  programar_visita,
  reprogramar_visita,
  poner_en_espera,
  registrar_posventa,
  anular_caso,
  reabrir_caso,
  dentro_plazo_misma_falla,
  fue_tecnico_del_caso,
} from '@/lib/datos-simulados/actions';
import { Button, Badge, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { EstadoBadge, etiquetaEstado } from '../components/EstadoCaso';

function leerPerfilId(): string {
  const m = (globalThis as { localStorage?: Storage }).localStorage;
  if (!m) return '';
  const raw = m.getItem('rptech_session_user');
  if (!raw) return '';
  try {
    const s = JSON.parse(raw) as { usuario: { id: string } };
    return s.usuario.id;
  } catch {
    return '';
  }
}

function valor(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
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

function horaLima(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function puedeCoordinador(roles: string[]): boolean {
  return roles.some((rol) => rol === 'superadmin' || rol === 'coordinador');
}

function puedeGerente(roles: string[]): boolean {
  return roles.some((rol) => rol === 'superadmin' || rol === 'gerente');
}

function DetalleCasoContenido() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [, startTransition] = useTransition();

  const [caso, setCaso] = useState<CasoDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  const [accionAbierta, setAccionAbierta] = useState<string | null>(null);
  const [accionMensaje, setAccionMensaje] = useState<string | null>(null);
  const [plazoVigente, setPlazoVigente] = useState<boolean | null>(null);
  const [esTecnicoDelCasoValor, setEsTecnicoDelCasoValor] = useState<boolean | null>(null);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      setLoading(true);
      const sesion = obtenerUsuarioActual();
      if (!sesion?.rolesVigentes) {
        setLoading(false);
        return;
      }
      const datos = await obtener_caso_detalle(id);
      if (!activo) return;
      if (!datos) {
        setCaso(null);
      } else {
        setCaso(datos);
      }
      setLoading(false);
    };
    cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  const ejecutarAccion = useCallback(
    async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
      setAccionMensaje(null);
      const resultado = await fn();
      if (resultado.ok) {
        setAccionMensaje('Acción realizada correctamente.');
        setAccionAbierta(null);
        startTransition(() => router.refresh());
      } else {
        setAccionMensaje(resultado.error || 'Error al ejecutar la acción.');
      }
    },
    [router, startTransition],
  );

  useEffect(() => {
    if (caso?.estado === 'cerrado') {
      dentro_plazo_misma_falla(caso.id).then((v) => setPlazoVigente(v));
    } else {
      const establecer = (valor: boolean | null) => setPlazoVigente(valor);
      establecer(null);
    }
  }, [caso?.estado, caso?.id]);

  useEffect(() => {
    fue_tecnico_del_caso(caso?.id ?? '', leerPerfilId()).then((v) => setEsTecnicoDelCasoValor(v));
  }, [caso?.id]);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando detalle del caso...</div>;
  }

  if (!caso) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-bold text-destructive mb-4">Caso no encontrado</h1>
        <Link href={`/casos?${searchParams.toString()}`} className="text-primary hover:underline">
          Volver a la lista de casos
        </Link>
      </div>
    );
  }

  const sesion = (() => {
    const m = (globalThis as { localStorage?: Storage }).localStorage;
    if (!m) return null;
    const raw = m.getItem('rptech_session_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as { usuario: { id: string }; rolesVigentes: string[] };
    } catch {
      return null;
    }
  })();

  const roles = sesion?.rolesVigentes ?? [];
  const puedeProgramar = puedeCoordinador(roles);
  const puedePosventa = puedeGerente(roles) || puedeCoordinador(roles);
  const puedeAnular = puedeGerente(roles) || puedeCoordinador(roles);
  const puedeReabrir = puedeCoordinador(roles);
  const esTecnicoDelCaso = esTecnicoDelCasoValor === true;

  const visitaAbierta = caso.visitas.some((v) => !v.cerrado && v.hora_llegada === null);
  const ultimaVisita = caso.visitas.length > 0 ? caso.visitas[caso.visitas.length - 1] : null;
  const reporteAbierto = ultimaVisita && !ultimaVisita.cerrado;

  const volverUrl = `/casos?${searchParams.toString()}`;

  const contacto = caso.contacto_cargo
    ? `${caso.contacto_nombre} (${caso.contacto_cargo})`
    : caso.contacto_nombre;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href={volverUrl} className="text-sm text-primary hover:underline mb-2 inline-block">
          ← Volver a la lista
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Caso {caso.numero}
              {caso.reaperturas > 0 && (
                <span className="ml-2 text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  Reabierto {caso.reaperturas} vez{caso.reaperturas > 1 ? 'es' : ''}
                </span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">
              Registrado el {fechaHoraLima(caso.creado_en)} · Canal: {caso.canal_nombre}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                caso.estado === 'anulado'
                  ? 'destructive'
                  : caso.estado === 'cerrado' || caso.estado === 'atendido'
                    ? 'ghost'
                    : 'default'
              }
              className="whitespace-nowrap"
            >
              {etiquetaEstado(caso.estado)}
            </Badge>
            {caso.motivo_espera_id && (
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                En espera
              </Badge>
            )}
            {caso.caso_origen_id && (
              <Link
                href={`/casos/${caso.caso_origen_id}?${searchParams.toString()}`}
                className="text-xs text-primary hover:underline"
              >
                Vinculado al caso {caso.caso_origen_numero}
              </Link>
            )}
          </div>
        </div>
        {caso.motivo_anulacion && (
          <div className="mt-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <strong className="font-semibold">Motivo de anulación:</strong> {caso.motivo_anulacion}
          </div>
        )}
      </div>

      {/* Mensajes guía */}
      <div className="mb-6">
        {caso.estado === 'programado' && visitaAbierta && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm">
            Visita en curso: espera a que el técnico registre su llegada.
          </div>
        )}
        {caso.estado === 'por_programar' && ultimaVisita && ultimaVisita.resultado === 'pendiente' && ultimaVisita.requerimiento && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm">
            Pendiente: se requiere {ultimaVisita.requerimiento}.
          </div>
        )}
        {caso.estado === 'atendido' && esTecnicoDelCaso && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900 text-sm">
            La posventa la registra otro Coordinador o el Gerente (tú fuiste técnico de este caso).
          </div>
        )}
        {accionMensaje && (
          <div className={`mt-3 rounded-lg p-3 text-sm ${
            accionMensaje.includes('correctamente') ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-red-50 text-red-900 border border-red-200'
          }`}>{accionMensaje}</div>
        )}
      </div>

      {/* Acciones disponibles */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Acciones disponibles
        </h2>
        <div className="flex flex-wrap gap-3">
          {puedeProgramar && (caso.estado === 'por_programar' || caso.estado === 'en_espera') && !visitaAbierta && (
            <Button onClick={() => setAccionAbierta('programar')} className="min-h-11">
              Programar visita
            </Button>
          )}
          {puedeProgramar && reporteAbierto && ultimaVisita && !ultimaVisita.cerrado && (
            <Button
              onClick={() => setAccionAbierta('reprogramar')}
              className="min-h-11"
            >
              Reprogramar visita
            </Button>
          )}
          {puedeCoordinador(roles) &&
            ['por_programar', 'programado', 'en_atencion'].includes(caso.estado) &&
            !visitaAbierta && (
              <Button onClick={() => setAccionAbierta('espera')} variant="outline" className="min-h-11">
                Poner en espera
              </Button>
            )}
          {puedePosventa && caso.estado === 'atendido' && !esTecnicoDelCaso && (
            <Button onClick={() => setAccionAbierta('posventa')} className="min-h-11">
              Registrar posventa
            </Button>
          )}
          {puedeReabrir && caso.estado === 'cerrado' && plazoVigente === true && (
            <Button onClick={() => setAccionAbierta('reabrir')} className="min-h-11">
              Reabrir por misma falla
            </Button>
          )}
          {puedeAnular && caso.estado !== 'cerrado' && caso.estado !== 'anulado' && !visitaAbierta && (
            <Button variant="destructive" onClick={() => setAccionAbierta('anular')} className="min-h-11">
              Anular caso
            </Button>
          )}
          {puedeCoordinador(roles) && caso.estado === 'cerrado' && (
            <Link href={`/casos/nuevo?origen=${caso.id}`} className="min-h-11 inline-flex items-center justify-center bg-primary text-primary-foreground px-3 rounded-md text-sm font-medium">
              Nuevo caso vinculado
            </Link>
          )}
          {accionAbierta === null && accionMensaje && (
            <Button variant="outline" onClick={() => setAccionMensaje(null)} className="min-h-11">
              Cerrar mensaje
            </Button>
          )}
        </div>
      </div>

      {/* Tarjetas de información */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cliente</h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li>
              <strong className="text-foreground">Empresa:</strong> {valor(caso.cliente_razon_social)}
            </li>
            <li>
              <strong className="text-foreground">RUC:</strong> {caso.cliente_ruc || '—'}
            </li>
            <li>
              <strong className="text-foreground">Contacto:</strong> {valor(contacto)}
            </li>
            <li>
              <strong className="text-foreground">Teléfono:</strong> {valor(caso.telefono)}
            </li>
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sede</h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li>
              <strong className="text-foreground">Nombre:</strong> {valor(caso.sede_nombre)}
            </li>
            <li>
              <strong className="text-foreground">Dirección:</strong> {valor(caso.sede_direccion)}
            </li>
            <li>
              <strong className="text-foreground">Distrito:</strong> {valor(caso.sede_distrito)}
            </li>
            <li>
              <strong className="text-foreground">Referencia:</strong> {valor(caso.sede_referencia)}
            </li>
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Equipo</h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li>
              <strong className="text-foreground">Serie:</strong>{' '}
              <span className="font-mono">{valor(caso.equipo_serie)}</span>
            </li>
            <li>
              <strong className="text-foreground">Línea y modelo:</strong> {caso.equipo_linea} - {valor(caso.equipo_modelo)}
            </li>
            <li>
              <strong className="text-foreground">Cabezal:</strong> {valor(caso.equipo_cabezal)}
            </li>
            <li>
              <strong className="text-foreground">Cant. cabezales:</strong> {valor(caso.equipo_cabezal_cantidad)}
            </li>
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Servicio</h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li>
              <strong className="text-foreground">Tipo:</strong> {valor(caso.tipo_servicio_nombre)}
            </li>
            <li>
              <strong className="text-foreground">Modalidad:</strong> {valor(caso.modalidad_nombre)}
            </li>
            <li>
              <strong className="text-foreground">Modo:</strong> {valor(caso.modo_servicio_nombre)}
            </li>
            {caso.modo_sugerido_nombre && (
              <li>
                <strong className="text-foreground">Modo sugerido:</strong> {valor(caso.modo_sugerido_nombre)}
              </li>
            )}
            {caso.motivo_cambio_modo && (
              <li>
                <strong className="text-foreground">Motivo del cambio:</strong> {valor(caso.motivo_cambio_modo)}
              </li>
            )}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Incidencia</h3>
          <p className="text-sm text-card-foreground bg-muted p-4 rounded-lg border border-border whitespace-pre-line">
            {caso.incidencia || '—'}
          </p>
        </Card>
      </div>

      {/* Visitas / Reportes */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Visitas y reportes
        </h2>
        {caso.visitas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Este caso aún no tiene visitas registradas.</p>
        ) : (
          <div className="space-y-4">
            {caso.visitas.map((visita) => (
              <Card key={visita.id} className="p-4 cursor-pointer hover:border-primary/50 transition-all border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-primary">Visita {visita.numero_visita}</div>
                    {visita.numero && (
                      <div className="text-xs font-mono text-muted-foreground">Reporte {visita.numero}</div>
                    )}
                    {visita.numero_fisico && (
                      <div className="text-xs text-muted-foreground">N° físico: {visita.numero_fisico}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-card-foreground">
                      {fechaHoraLima(visita.fecha_programada ? `${visita.fecha_programada}T${visita.hora_programada}` : null)}
                    </div>
                    <EstadoBadge estado={visita.cerrado ? 'atendido' : 'programado'} />
                  </div>
                </div>
                <div className="space-y-2 text-sm text-card-foreground">
                  <div>
                    <span className="font-semibold text-muted-foreground">Técnico:</span>{' '}
                    {visita.tecnico_nombre || 'Sin asignar'}
                    {visita.tecnico_adjunto_nombre && (
                      <span className="ml-2 text-xs text-muted-foreground">(adjunto: {visita.tecnico_adjunto_nombre})</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Estado:</span> {etiquetaEstado(caso.estado)}
                  </div>
                  {visita.hora_llegada && (
                    <div>
                      <span className="font-semibold text-muted-foreground">Llegada:</span> {horaLima(visita.hora_llegada)}
                    </div>
                  )}
                  {visita.hora_salida && (
                    <div>
                      <span className="font-semibold text-muted-foreground">Salida:</span> {horaLima(visita.hora_salida)}
                    </div>
                  )}
                  {visita.resultado && (
                    <div>
                      <span className="font-semibold text-muted-foreground">Resultado:</span>
                      {visita.resultado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                      {visita.requerimiento && ` - Se requiere: ${visita.requerimiento}`}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => setAccionAbierta(`ver-${visita.id}`)}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    Ver reporte
                  </Button>
                  {!visita.cerrado && visita.hora_llegada && puedeCoordinador(roles) && (
                    <Button onClick={() => setAccionAbierta(`cerrar-${visita.id}`)} variant="outline" size="sm" className="px-3">
                      Cerrar reporte
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Ver reporte (lectura) */}
      {accionAbierta?.startsWith('ver-') && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setAccionAbierta(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold text-foreground mb-4">Reporte de visita</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Revisión inicial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-muted-foreground">Estado equipo:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).estado_equipo)}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Limpieza:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).limpieza)}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Cabezales:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).estado_cabezales)}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Protección:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).sistema_proteccion)}
                    {visitaDetalle(accionAbierta, caso).sistema_proteccion_otro && ` (${visitaDetalle(accionAbierta, caso).sistema_proteccion_otro})`}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Tinta:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).tinta)}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Voltaje L+N:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).voltaje_ln)}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Voltaje L+T:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).voltaje_lt)}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Voltaje N+T:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).voltaje_nt)}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Último mantenimiento:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).ultimo_mantenimiento)}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Operador:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).operador)}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">N° reporte físico:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).numero_fisico)}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Procedimiento
                </h3>
                <p className="text-sm text-card-foreground whitespace-pre-line bg-muted p-4 rounded-lg border border-border">
                  {valor(visitaDetalle(accionAbierta, caso).procedimiento)}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Conclusión
                </h3>
                <p className="text-sm text-card-foreground whitespace-pre-line bg-muted p-4 rounded-lg border border-border">
                  {valor(visitaDetalle(accionAbierta, caso).conclusion)}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Recomendaciones
                </h3>
                <p className="text-sm text-card-foreground whitespace-pre-line bg-muted p-4 rounded-lg border border-border">
                  {valor(visitaDetalle(accionAbierta, caso).recomendaciones)}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Repuestos
                </h3>
                {visitaDetalle(accionAbierta, caso).repuestos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin repuestos registrados.</p>
                ) : (
                  <Table className="text-left border-collapse w-full">
                    <TableHeader>
                      <TableRow className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground">
                        <TableHead className="p-2">Código</TableHead>
                        <TableHead className="p-2">Descripción</TableHead>
                        <TableHead className="p-2">Cantidad</TableHead>
                        <TableHead className="p-2">Tipo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border text-sm">
                      {visitaDetalle(accionAbierta, caso).repuestos.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="p-2 font-mono">{r.codigo}</TableCell>
                          <TableCell className="p-2">{r.descripcion}</TableCell>
                          <TableCell className="p-2">{r.cantidad}</TableCell>
                          <TableCell className="p-2">{r.tipo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Adjuntos
                </h3>
                {visitaDetalle(accionAbierta, caso).adjuntos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin archivos adjuntos.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {visitaDetalle(accionAbierta, caso).adjuntos.map((a) => (
                      <li key={a.id} className="text-muted-foreground">
                        {a.tipo} - {a.nombre_archivo}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Firmas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-muted-foreground">Operador:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).nombre_operador_firma)}
                    {visitaDetalle(accionAbierta, caso).firma_operador ? (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Firmado</span>
                    ) : (
                      <span className="ml-2 text-xs text-muted-foreground">Pendiente</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">Cliente:</span>{' '}
                    {valor(visitaDetalle(accionAbierta, caso).nombre_cliente_firma)}
                    {visitaDetalle(accionAbierta, caso).firma_cliente ? (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Firmado</span>
                    ) : (
                      <span className="ml-2 text-xs text-muted-foreground">Pendiente</span>
                    )}
                  </div>
                </div>
              </div>
              {visitaDetalle(accionAbierta, caso).notas.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Notas
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {visitaDetalle(accionAbierta, caso).notas.map((n) => (
                      <li key={n.id} className="text-card-foreground">
                        <span className="font-semibold">{valor(n.autor_id)}</span> - {fechaHoraLima(n.creado_en)}
                        <p className="text-sm text-muted-foreground mt-1">{n.texto}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setAccionAbierta(null)}>Cerrar</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Formularios de acciones */}
      {accionAbierta === 'programar' && (
        <FormProgramarVisita caso={caso} onEjecutar={ejecutarAccion} onCerrar={() => setAccionAbierta(null)} />
      )}
      {accionAbierta === 'reprogramar' && (
        <FormReprogramarVisita caso={caso} onEjecutar={ejecutarAccion} onCerrar={() => setAccionAbierta(null)} />
      )}
      {accionAbierta === 'espera' && (
        <FormPonerEnEspera caso={caso} onEjecutar={ejecutarAccion} onCerrar={() => setAccionAbierta(null)} />
      )}
      {accionAbierta === 'posventa' && (
        <FormRegistrarPosventa caso={caso} onEjecutar={ejecutarAccion} onCerrar={() => setAccionAbierta(null)} />
      )}
      {accionAbierta === 'reabrir' && (
        <FormReabrirCaso caso={caso} onEjecutar={ejecutarAccion} onCerrar={() => setAccionAbierta(null)} />
      )}
      {accionAbierta === 'anular' && (
        <FormAnularCaso caso={caso} onEjecutar={ejecutarAccion} onCerrar={() => setAccionAbierta(null)} />
      )}
    </div>
  );
}

function visitaDetalle(clave: string, caso: CasoDetalle) {
  const id = clave.replace(/^(ver|cerrar)-/, '');
  return caso.visitas.find((v) => v.id === id) || caso.visitas[0];
}

export function DetalleCasoView() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <DetalleCasoContenido />
    </Suspense>
  );
}

// Formularios de acciones (placeholders funcionales con las acciones simuladas)
function FormProgramarVisita({
  caso,
  onEjecutar,
  onCerrar,
}: {
  caso: CasoDetalle;
  onEjecutar: (fn: () => Promise<{ ok: boolean; error?: string }>) => void;
  onCerrar: () => void;
}) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [adjunto, setAdjunto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <Card className="p-6 mb-6 border border-primary/50 bg-primary/5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Programar visita</h3>
      {mensaje && (
        <div className="mb-3 text-xs text-red-900 bg-red-50 border border-red-200 rounded p-2">{mensaje}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Hora</label>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
        </div>
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Técnico</label>
        <input
          value={tecnico}
          onChange={(e) => setTecnico(e.target.value)}
          placeholder="ID del técnico"
          className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Técnico adjunto (opcional)</label>
        <input
          value={adjunto}
          onChange={(e) => setAdjunto(e.target.value)}
          placeholder="ID del adjunto"
          className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setCargando(true);
            setMensaje(null);
            programar_visita(caso.id, tecnico, fecha, hora, adjunto || null).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al programar.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Programar'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </Card>
  );
}

function FormReprogramarVisita({
  caso,
  onEjecutar,
  onCerrar,
}: {
  caso: CasoDetalle;
  onEjecutar: (fn: () => Promise<{ ok: boolean; error?: string }>) => void;
  onCerrar: () => void;
}) {
  const ultima = caso.visitas[caso.visitas.length - 1];
  const [fecha, setFecha] = useState(ultima?.fecha_programada || '');
  const [hora, setHora] = useState(ultima?.hora_programada || '');
  const [tecnico, setTecnico] = useState(ultima?.tecnico_id || '');
  const [adjunto, setAdjunto] = useState(ultima?.tecnico_adjunto_id || '');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <Card className="p-6 mb-6 border border-primary/50 bg-primary/5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Reprogramar visita</h3>
      {mensaje && (
        <div className="mb-3 text-xs text-red-900 bg-red-50 border border-red-200 rounded p-2">{mensaje}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Hora</label>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
        </div>
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Técnico</label>
        <input value={tecnico} onChange={(e) => setTecnico(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Técnico adjunto (opcional)</label>
        <input value={adjunto} onChange={(e) => setAdjunto(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setCargando(true);
            setMensaje(null);
            reprogramar_visita(ultima!.id, tecnico, fecha, hora, adjunto || null).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al reprogramar.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Reprogramar'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </Card>
  );
}

function FormPonerEnEspera({
  caso,
  onEjecutar,
  onCerrar,
}: {
  caso: CasoDetalle;
  onEjecutar: (fn: () => Promise<{ ok: boolean; error?: string }>) => void;
  onCerrar: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <Card className="p-6 mb-6 border border-amber/50 bg-amber/5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-900 mb-3">Poner en espera</h3>
      {mensaje && (
        <div className="mb-3 text-xs text-red-900 bg-red-50 border border-red-200 rounded p-2">{mensaje}</div>
      )}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Motivo de espera</label>
        <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm">
          <option value="">Selecciona un motivo</option>
          <option>Pieza o repuesto</option>
          <option>Aprobación de cotización</option>
          <option>Reprogramación del cliente</option>
          <option>Continúa otro día</option>
          <option>Otro</option>
        </select>
      </div>
      {motivo === 'Otro' && (
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-xs font-semibold text-muted-foreground">Comentario (obligatorio para Otro)</label>
          <input value={comentario} onChange={(e) => setComentario(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
        </div>
      )}
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setCargando(true);
            setMensaje(null);
            poner_en_espera(caso.id, motivo, motivo === 'Otro' ? comentario : null).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al poner en espera.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Poner en espera'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </Card>
  );
}

function FormRegistrarPosventa({
  caso,
  onEjecutar,
  onCerrar,
}: {
  caso: CasoDetalle;
  onEjecutar: (fn: () => Promise<{ ok: boolean; error?: string }>) => void;
  onCerrar: () => void;
}) {
  const [resultado, setResultado] = useState<'conforme' | 'no_conforme' | ''>('');
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <Card className="p-6 mb-6 border border-blue/50 bg-blue/5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-900 mb-3">Registrar posventa</h3>
      {mensaje && (
        <div className="mb-3 text-xs text-red-900 bg-red-50 border border-red-200 rounded p-2">{mensaje}</div>
      )}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Resultado</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="resultado"
              value="conforme"
              checked={resultado === 'conforme'}
              onChange={() => setResultado('conforme')}
            />
            Conforme
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="resultado"
              value="no_conforme"
              checked={resultado === 'no_conforme'}
              onChange={() => setResultado('no_conforme')}
            />
            No conforme
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Comentario</label>
        <input value={comentario} onChange={(e) => setComentario(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => {
            if (!resultado) {
              setMensaje('Selecciona un resultado.');
              return;
            }
            setCargando(true);
            setMensaje(null);
            registrar_posventa(caso.id, resultado, comentario || null).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al registrar posventa.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Registrar'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </Card>
  );
}

function FormReabrirCaso({
  caso,
  onEjecutar,
  onCerrar,
}: {
  caso: CasoDetalle;
  onEjecutar: (fn: () => Promise<{ ok: boolean; error?: string }>) => void;
  onCerrar: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <Card className="p-6 mb-6 border border-amber/50 bg-amber/5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-900 mb-3">Reabrir caso</h3>
      {mensaje && (
        <div className="mb-3 text-xs text-red-900 bg-red-50 border border-red-200 rounded p-2">{mensaje}</div>
      )}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Motivo de reapertura</label>
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setCargando(true);
            setMensaje(null);
            reabrir_caso(caso.id, motivo).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al reabrir.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Reabrir'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </Card>
  );
}

function FormAnularCaso({
  caso,
  onEjecutar,
  onCerrar,
}: {
  caso: CasoDetalle;
  onEjecutar: (fn: () => Promise<{ ok: boolean; error?: string }>) => void;
  onCerrar: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <Card className="p-6 mb-6 border border-destructive/50 bg-destructive/5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive mb-3">Anular caso</h3>
      {mensaje && (
        <div className="mb-3 text-xs text-red-900 bg-red-50 border border-red-200 rounded p-2">{mensaje}</div>
      )}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Motivo de anulación</label>
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
      </div>
      <div className="flex gap-3">
        <Button
          variant="destructive"
          onClick={() => {
            setCargando(true);
            setMensaje(null);
            anular_caso(caso.id, motivo).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al anular.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Anular'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
