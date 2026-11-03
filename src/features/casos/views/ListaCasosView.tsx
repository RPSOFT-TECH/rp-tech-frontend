'use client';

import { Suspense, useEffect, useState, useTransition, useCallback, useSyncExternalStore } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  casos_lista,
  obtener_catalogos,
  tecnicos,
  leerSesionEstable,
  type CasoLista,
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
} from '@/components/ui';
import { EstadoBadge, ESTADOS_FILTRO, etiquetaEstado } from '../components/EstadoCaso';
import { FiltroFecha, FiltroSelect } from '../components/FiltrosListaCasos';

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

function ListaCasosContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [casos, setCasos] = useState<CasoLista[]>([]);
  const [tecnicosLista, setTecnicosLista] = useState<TecnicoLista[]>([]);
  const [tipos, setTipos] = useState<Catalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const sesion = useSyncExternalStore(() => () => {}, leerSesionEstable, () => null);
  const puedeCrear = !!sesion?.rolesVigentes.some((rol) => rol === 'superadmin' || rol === 'coordinador');

  const estadoFiltro = searchParams.get('estado') || 'todos';
  const tecnicoFiltro = searchParams.get('tecnico_id') || 'todos';
  const tipoFiltro = searchParams.get('tipo_servicio_id') || 'todos';
  const fechaDesde = searchParams.get('fecha_desde') || '';
  const fechaHasta = searchParams.get('fecha_hasta') || '';
  const [busqueda, setBusqueda] = useState(searchParams.get('q') || '');
  const [busquedaDebounce, setBusquedaDebounce] = useState(searchParams.get('q') || '');

  useEffect(() => {
    obtener_catalogos().then((data) => setTipos(data.tipos_servicio));
    tecnicos().then(setTecnicosLista);
  }, []);

  useEffect(() => {
    let activo = true;
    casos_lista({
      estado: estadoFiltro,
      tecnico_id: tecnicoFiltro,
      tipo_servicio_id: tipoFiltro,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      q: busquedaDebounce,
    }).then((datos) => {
      if (!activo) return;
      setCasos(datos);
      setLoading(false);
    });
    return () => {
      activo = false;
    };
  }, [estadoFiltro, tecnicoFiltro, tipoFiltro, fechaDesde, fechaHasta, busquedaDebounce]);

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

  const hayFiltros =
    estadoFiltro !== 'todos' ||
    tecnicoFiltro !== 'todos' ||
    tipoFiltro !== 'todos' ||
    busquedaDebounce !== '' ||
    fechaDesde !== '' ||
    fechaHasta !== '';

  const urlDetalle = (id: string) => `/casos/${id}?${searchParams.toString()}`;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Casos</h1>
          <p className="text-sm text-muted-foreground">Gestión de incidentes, visitas y atenciones técnicas</p>
        </div>
        {puedeCrear && (
          <Link
            href="/casos/nuevo"
            className="w-full md:w-auto inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm min-h-11"
          >
            Nuevo caso
          </Link>
        )}
      </div>

      <Card className="p-4 mb-4">
        <form
          className="flex flex-col sm:flex-row gap-2 mb-3"
          onSubmit={(e) => {
            e.preventDefault();
            actualizarFiltro('q', busqueda);
          }}
        >
          <SearchInput
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por número, cliente, serie o incidencia"
            contenedorClassName="flex-1"
          />
          <Button type="submit" variant="secondary" className="min-h-11 px-5">
            Buscar
          </Button>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-border">
          <FiltroSelect label="Estado" value={estadoFiltro} onChange={(valor) => actualizarFiltro('estado', valor)}>
            <option value="todos">Todos los estados</option>
            {ESTADOS_FILTRO.map((estado) => (
              <option key={estado} value={estado}>
                {etiquetaEstado(estado)}
              </option>
            ))}
          </FiltroSelect>
          <FiltroSelect label="Técnico" value={tecnicoFiltro} onChange={(valor) => actualizarFiltro('tecnico_id', valor)}>
            <option value="todos">Todos los técnicos</option>
            {tecnicosLista.map((tecnico) => (
              <option key={tecnico.id} value={tecnico.id}>
                {tecnico.nombre_completo}
              </option>
            ))}
          </FiltroSelect>
          <FiltroSelect label="Tipo de servicio" value={tipoFiltro} onChange={(valor) => actualizarFiltro('tipo_servicio_id', valor)}>
            <option value="todos">Todos los tipos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </FiltroSelect>
          <FiltroFecha label="Fecha desde" value={fechaDesde} onChange={(valor) => actualizarFiltro('fecha_desde', valor)} />
          <FiltroFecha label="Fecha hasta" value={fechaHasta} onChange={(valor) => actualizarFiltro('fecha_hasta', valor)} />
        </div>
        {hayFiltros && (
          <div className="flex justify-end pt-2">
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
          </div>
        )}
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
                  <TableHead className="p-4">Cliente</TableHead>
                  <TableHead className="p-4">Serie</TableHead>
                  <TableHead className="p-4">Tipo</TableHead>
                  <TableHead className="p-4">Reportes</TableHead>
                  <TableHead className="p-4">Técnico</TableHead>
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
                    <TableCell className="p-4 text-card-foreground font-medium truncate max-w-xs">{caso.cliente_razon_social}</TableCell>
                    <TableCell className="p-4 text-muted-foreground font-mono text-xs">{caso.equipo_serie}</TableCell>
                    <TableCell className="p-4 text-card-foreground">{caso.tipo_servicio_nombre}</TableCell>
                    <TableCell className="p-4 font-mono text-xs">{caso.reportes_numeros.join(', ') || '—'}</TableCell>
                    <TableCell className="p-4 text-card-foreground">{caso.tecnico_nombre || 'Sin asignar'}</TableCell>
                    <TableCell className="p-4">
                      <EstadoBadge estado={caso.estado} />
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
                  <EstadoBadge estado={caso.estado} />
                </div>
                <div className="text-sm text-card-foreground font-semibold mb-1">{caso.cliente_razon_social}</div>
                <div className="text-xs text-muted-foreground font-mono mb-1">Serie: {caso.equipo_serie}</div>
                <div className="text-xs text-muted-foreground">Tipo: {caso.tipo_servicio_nombre}</div>
                <div className="text-xs text-muted-foreground mt-2">Técnico: {caso.tecnico_nombre || 'Sin asignar'}</div>
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
