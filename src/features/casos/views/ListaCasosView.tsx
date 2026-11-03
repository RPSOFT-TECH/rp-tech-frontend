'use client';

import { Suspense, useCallback, useEffect, useMemo, useState, useSyncExternalStore, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  casos_lista,
  clientes_lista,
  obtener_catalogos,
  tecnicos,
  leerSesionEstable,
  type CasoLista,
  type ClienteLista,
  type TecnicoLista,
  type Catalogo,
} from '@/lib/datos-simulados/actions';
import {
  SearchInput,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  Badge,
} from '@/components/ui';
import { EstadoBadge, ESTADOS_FILTRO, etiquetaEstado } from '../components/EstadoCaso';
import { FiltroSelect, FiltroFecha } from '../components/FiltrosListaCasos';

const BANDEJAS: { clave: string; etiqueta: string }[] = [
  { clave: 'todos', etiqueta: 'Todos' },
  { clave: 'entrega_turno', etiqueta: 'Entrega de turno' },
  { clave: 'por_programar', etiqueta: 'Por programar' },
  { clave: 'programado', etiqueta: 'Programado' },
  { clave: 'en_atencion', etiqueta: 'En atención' },
  { clave: 'en_espera', etiqueta: 'En espera' },
  { clave: 'pendientes_posventa', etiqueta: 'Pendientes de posventa' },
  { clave: 'cerrado', etiqueta: 'Cerrado' },
  { clave: 'anulado', etiqueta: 'Anulado' },
];

function fechaLima(iso: string | null | undefined): string {
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

function puedeCrear(roles: string[]): boolean {
  return roles.some((rol) => rol === 'superadmin' || rol === 'coordinador');
}

function listaFiltradaPorBandeja(casos: CasoLista[], bandeja: string): CasoLista[] {
  if (bandeja === 'todos') return casos;
  if (bandeja === 'entrega_turno') {
    return casos.filter((c) => c.estado !== 'cerrado' && c.estado !== 'anulado');
  }
  if (bandeja === 'pendientes_posventa') {
    return casos.filter((c) => c.estado === 'atendido');
  }
  return casos.filter((c) => c.estado === bandeja);
}

function descargarExcel(casos: CasoLista[]) {
  const filas = casos.map((c) => [
    c.numero,
    c.creado_en.slice(0, 16).replace('T', ' '),
    c.canal_nombre,
    c.cliente_razon_social,
    c.cliente_ruc || '—',
    c.sede_nombre,
    c.sede_direccion,
    c.equipo_serie,
    c.equipo_modelo,
    c.tipo_servicio_nombre,
    c.modalidad_nombre,
    c.modo_servicio_nombre,
    c.tecnico_nombre || 'Sin asignar',
    c.tecnico_adjunto_nombre || '—',
    c.fecha_programada || '—',
    c.hora_programada || '—',
    etiquetaEstado(c.estado),
    c.reaperturas > 0 ? 'Reabierto' : '',
  ]);

  const cabeceras = [
    'Nº caso',
    'Registro',
    'Canal',
    'Cliente',
    'RUC',
    'Sede',
    'Dirección sede',
    'Serie equipo',
    'Modelo equipo',
    'Tipo servicio',
    'Modalidad',
    'Modo servicio',
    'Técnico',
    'Adjunto',
    'Fecha visita',
    'Hora visita',
    'Estado',
    'Reabierto',
  ];

  const lineas = [cabeceras.join(';'), ...filas.map((f) => f.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';'))];
  const contenido = '\uFEFF' + lineas.join('\r\n');
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `casos_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ListaCasosContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [casos, setCasos] = useState<CasoLista[]>([]);
  const [tecnicosLista, setTecnicosLista] = useState<TecnicoLista[]>([]);
  const [clientesLista, setClientesLista] = useState<ClienteLista[]>([]);
  const [modalidades, setModalidades] = useState<Catalogo[]>([]);
  const [tiposServicio, setTiposServicio] = useState<Catalogo[]>([]);
  const [loading, setLoading] = useState(true);

  const sesion = useSyncExternalStore(() => () => {}, leerSesionEstable, () => null);
  const roles = sesion?.rolesVigentes ?? [];
  const puedeCrearCaso = puedeCrear(roles);

  const bandeja = searchParams.get('bandeja') || 'todos';
  const estadoFiltro = searchParams.get('estado') || 'todos';
  const tecnicoFiltro = searchParams.get('tecnico_id') || 'todos';
  const clienteFiltro = searchParams.get('cliente_id') || 'todos';
  const tipoFiltro = searchParams.get('tipo_servicio_id') || 'todos';
  const modalidadFiltro = searchParams.get('modalidad_id') || 'todos';
  const fechaDesde = searchParams.get('fecha_desde') || '';
  const fechaHasta = searchParams.get('fecha_hasta') || '';
  const [busqueda, setBusqueda] = useState(searchParams.get('q') || '');
  const [busquedaDebounce, setBusquedaDebounce] = useState(searchParams.get('q') || '');

  useEffect(() => {
    obtener_catalogos().then((data) => {
      setModalidades(data.modalidades);
      setTiposServicio(data.tipos_servicio);
    });
    tecnicos().then(setTecnicosLista);
    clientes_lista().then(setClientesLista);
  }, []);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      setLoading(true);
      const datos = await casos_lista({
        estado: estadoFiltro !== 'todos' ? estadoFiltro : undefined,
        tecnico_id: tecnicoFiltro !== 'todos' ? tecnicoFiltro : undefined,
        cliente_id: clienteFiltro !== 'todos' ? clienteFiltro : undefined,
        tipo_servicio_id: tipoFiltro !== 'todos' ? tipoFiltro : undefined,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
        q: busquedaDebounce || undefined,
      });
      if (!activo) return;
      let filtrados = datos;
      if (bandeja === 'entrega_turno') {
        filtrados = filtrados.filter((c) => c.estado !== 'cerrado' && c.estado !== 'anulado');
      } else if (bandeja === 'pendientes_posventa') {
        filtrados = filtrados.filter((c) => c.estado === 'atendido');
      } else if (bandeja !== 'todos' && bandeja !== estadoFiltro) {
        filtrados = filtrados.filter((c) => c.estado === bandeja);
      }
      if (modalidadFiltro !== 'todos') {
        filtrados = filtrados.filter((c) => c.modalidad_id === modalidadFiltro);
      }
      setCasos(filtrados);
      setLoading(false);
    };
    cargar();
    return () => {
      activo = false;
    };
  }, [bandeja, estadoFiltro, tecnicoFiltro, clienteFiltro, tipoFiltro, modalidadFiltro, fechaDesde, fechaHasta, busquedaDebounce]);

  useEffect(() => {
    const timer = setTimeout(() => setBusquedaDebounce(busqueda), 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const actualizarFiltro = useCallback(
    (nombre: string, valor: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (valor && valor !== 'todos') params.set(nombre, valor);
      else params.delete(nombre);
      startTransition(() => router.push(`/casos?${params.toString()}`));
    },
    [searchParams, router, startTransition],
  );

  const seleccionarBandeja = (clave: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('bandeja', clave);
    if (clave === 'pendientes_posventa') {
      params.set('estado', 'atendido');
    } else if (clave !== 'todos' && clave !== 'entrega_turno') {
      params.set('estado', clave);
    } else if (clave === 'todos') {
      params.delete('estado');
    }
    startTransition(() => router.push(`/casos?${params.toString()}`));
  };

  const hayFiltros =
    bandeja !== 'todos' ||
    estadoFiltro !== 'todos' ||
    tecnicoFiltro !== 'todos' ||
    clienteFiltro !== 'todos' ||
    tipoFiltro !== 'todos' ||
    modalidadFiltro !== 'todos' ||
    busquedaDebounce !== '' ||
    fechaDesde !== '' ||
    fechaHasta !== '';

  const casosBandeja = useMemo(() => listaFiltradaPorBandeja(casos, bandeja), [casos, bandeja]);

  const urlDetalle = (id: string) => `/casos/${id}?${searchParams.toString()}`;

  const contadorBandeja = (clave: string) => {
    if (clave === 'todos') return casos.length;
    if (clave === 'entrega_turno') {
      return casos.filter((c) => c.estado !== 'cerrado' && c.estado !== 'anulado').length;
    }
    if (clave === 'pendientes_posventa') {
      return casos.filter((c) => c.estado === 'atendido').length;
    }
    return casos.filter((c) => c.estado === clave).length;
  };

  const seleccionada = (clave: string) => clave === bandeja;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Casos</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de incidentes, visitas y atenciones técnicas
          </p>
        </div>
        {puedeCrearCaso && (
          <Link
            href="/casos/nuevo"
            className="w-full md:w-auto inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm min-h-11"
          >
            Nuevo caso
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {BANDEJAS.map((b) => (
          <button
            key={b.clave}
            onClick={() => seleccionarBandeja(b.clave)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors min-h-9 ${
              seleccionada(b.clave)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-muted'
            }`}
          >
            {b.etiqueta}
            <span className="bg-current/20 px-1.5 py-0.5 rounded text-[10px] font-bold {seleccionada(b.clave) ? 'text-primary-foreground' : 'text-current'}">
              {contadorBandeja(b.clave)}
            </span>
          </button>
        ))}
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="flex-1">
            <form
              id="form-filtros"
              className="flex flex-col sm:flex-row gap-2 mb-3"
              onSubmit={(e) => {
                e.preventDefault();
                actualizarFiltro('q', busqueda);
              }}
            >
              <SearchInput
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por número, cliente, reporte, RUC o serie"
                contenedorClassName="flex-1"
              />
              <Button type="submit" variant="secondary" className="min-h-11 px-5">
                Buscar
              </Button>
            </form>
          </div>
          {hayFiltros && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('');
                setBusquedaDebounce('');
                router.push('/casos');
              }}
              className="text-xs text-primary hover:underline font-medium py-1 min-h-11 inline-flex items-center"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 pt-2 border-t border-border">
          <FiltroSelect
            label="Estado"
            value={estadoFiltro}
            onChange={(valor) => actualizarFiltro('estado', valor)}
          >
            <option value="todos">Todos los estados</option>
            {ESTADOS_FILTRO.map((estado) => (
              <option key={estado} value={estado}>
                {etiquetaEstado(estado)}
              </option>
            ))}
          </FiltroSelect>
          <FiltroSelect
            label="Técnico"
            value={tecnicoFiltro}
            onChange={(valor) => actualizarFiltro('tecnico_id', valor)}
          >
            <option value="todos">Todos los técnicos</option>
            {tecnicosLista.map((tecnico) => (
              <option key={tecnico.id} value={tecnico.id}>
                {tecnico.nombre_completo}
              </option>
            ))}
          </FiltroSelect>
          <FiltroSelect
            label="Cliente"
            value={clienteFiltro}
            onChange={(valor) => actualizarFiltro('cliente_id', valor)}
          >
            <option value="todos">Todos los clientes</option>
            {clientesLista.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.razon_social} {cliente.ruc ? `(${cliente.ruc})` : ''}
              </option>
            ))}
          </FiltroSelect>
          <FiltroSelect
            label="Tipo de servicio"
            value={tipoFiltro}
            onChange={(valor) => actualizarFiltro('tipo_servicio_id', valor)}
          >
            <option value="todos">Todos los tipos</option>
            {tiposServicio.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </FiltroSelect>
          <FiltroSelect
            label="Modalidad"
            value={modalidadFiltro}
            onChange={(valor) => actualizarFiltro('modalidad_id', valor)}
          >
            <option value="todos">Todas las modalidades</option>
            {modalidades.map((modalidad) => (
              <option key={modalidad.id} value={modalidad.id}>
                {modalidad.nombre}
              </option>
            ))}
          </FiltroSelect>
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Exportar</label>
            <Button
              onClick={() => descargarExcel(casosBandeja)}
              variant="outline"
              className="w-full min-h-11 px-3 text-xs"
            >
              Excel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 pt-2 border-t border-border">
          <FiltroFecha
            label="Fecha desde"
            value={fechaDesde}
            onChange={(valor) => actualizarFiltro('fecha_desde', valor)}
          />
          <FiltroFecha
            label="Fecha hasta"
            value={fechaHasta}
            onChange={(valor) => actualizarFiltro('fecha_hasta', valor)}
          />
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando casos...</div>
      ) : casos.length === 0 ? (
        <Card className="text-center p-12">
          <p className="text-muted-foreground">No hay casos con estos filtros.</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden hidden md:block">
            <Table className="text-left border-collapse">
              <TableHeader>
                <TableRow className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <TableHead className="p-4">N° de caso</TableHead>
                  <TableHead className="p-4">Registro</TableHead>
                  <TableHead className="p-4">Cliente y sede</TableHead>
                  <TableHead className="p-4">Equipo</TableHead>
                  <TableHead className="p-4">Servicio</TableHead>
                  <TableHead className="p-4">Técnico</TableHead>
                  <TableHead className="p-4">Visita</TableHead>
                  <TableHead className="p-4">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border text-sm">
                {casos.map((caso) => (
                  <TableRow key={caso.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="p-4 font-medium text-primary">
                      <Link href={urlDetalle(caso.id)} className="hover:underline">
                        {caso.numero}
                      </Link>
                    </TableCell>
                    <TableCell className="p-4 text-muted-foreground">{fechaLima(caso.creado_en)}</TableCell>
                    <TableCell className="p-4 text-card-foreground font-medium truncate max-w-xs">
                      {caso.cliente_razon_social}
                      {caso.sede_nombre ? (
                        <span className="block text-xs text-muted-foreground mt-0.5">{caso.sede_nombre}</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="p-4 text-muted-foreground font-mono text-xs">
                      {caso.equipo_serie}
                    </TableCell>
                    <TableCell className="p-4 text-card-foreground text-sm">
                      <div>{caso.tipo_servicio_nombre}</div>
                      <div className="text-xs text-muted-foreground">{caso.modalidad_nombre} · {caso.modo_servicio_nombre}</div>
                    </TableCell>
                    <TableCell className="p-4 text-card-foreground text-sm">
                      {caso.tecnico_nombre || 'Sin asignar'}
                      {caso.tecnico_adjunto_nombre ? (
                        <span className="block text-xs text-muted-foreground mt-0.5">Adj: {caso.tecnico_adjunto_nombre}</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="p-4 text-muted-foreground text-sm">
                      {caso.fecha_programada || '—'} {caso.hora_programada || ''}
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-1.5">
                        <EstadoBadge estado={caso.estado} />
                        {caso.reaperturas > 0 && (
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            Reabierto {caso.reaperturas}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="md:hidden grid grid-cols-1 gap-3">
            {casos.map((caso) => (
              <Card
                key={caso.id}
                className="p-4 shadow-sm hover:border-primary/50 transition-all border border-border cursor-pointer"
                onClick={() => router.push(urlDetalle(caso.id))}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-primary">{caso.numero}</span>
                  <div className="flex items-center gap-1.5">
                    <EstadoBadge estado={caso.estado} />
                    {caso.reaperturas > 0 && (
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        Reabierto {caso.reaperturas}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-card-foreground font-semibold mb-1">
                  {caso.cliente_razon_social}
                </div>
                <div className="text-xs text-muted-foreground font-mono mb-1">
                  Serie: {caso.equipo_serie}
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {caso.tipo_servicio_nombre} · {caso.modalidad_nombre}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Técnico: {caso.tecnico_nombre || 'Sin asignar'}
                  {caso.tecnico_adjunto_nombre ? ` (adj: ${caso.tecnico_adjunto_nombre})` : ''}
                </div>
                <div className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                  Visita: {caso.fecha_programada || '—'} {caso.hora_programada || ''}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ListaCasosView() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando módulo de casos...</div>}>
      <ListaCasosContenido />
    </Suspense>
  );
}
