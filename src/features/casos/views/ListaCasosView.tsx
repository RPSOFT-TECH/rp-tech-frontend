'use client';

import { Suspense, useEffect, useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  obtenerCasos,
  obtenerTecnicosActivos,
  FiltrosCasos,
  obtenerUsuarioActual,
} from '@/lib/datos-simulados/actions';
import { Caso } from '@/lib/datos-simulados/casos';
import { clientes } from '@/lib/datos-simulados/clientes';
import { equipos } from '@/lib/datos-simulados/equipos';
import { usuarios } from '@/lib/datos-simulados/usuarios';
import {
  SearchInput,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
} from '@/components/ui';

const ESTADO_ETIQUETA: Record<string, string> = {
  por_programar: 'Por programar',
  programado: 'Programado',
  en_atencion: 'En atención',
  en_espera: 'En espera',
  atendido: 'Atendido',
  cerrado: 'Cerrado',
};

const ESTADO_VARIANTE: Record<string, 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'> = {
  por_programar: 'secondary',
  programado: 'default',
  en_atencion: 'default',
  en_espera: 'outline',
  atendido: 'ghost',
  cerrado: 'ghost',
};

function esCoordinadoraOAdmin(rol: string): boolean {
  return [
    'coordinadora',
    'coordinador',
    'administrador',
    'superadmin',
    'gerente',
  ].includes(rol);
}

function resolverTecnico(tecnicoId: string | null | undefined): string {
  if (!tecnicoId) return 'Sin asignar';
  const u = usuarios.find((user) => user.email === tecnicoId);
  return u ? u.nombre_completo : 'Sin asignar';
}

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

  const [casos, setCasos] = useState<Caso[]>([]);
  const [tecnicos, setTecnicos] = useState<{ id: string; nombre_completo: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const estadoFiltro = searchParams.get('estado') || 'todos';
  const tecnicoFiltro = searchParams.get('tecnico_id') || 'todos';
  const tipoFiltro = searchParams.get('tipo_servicio') || 'todos';
  const fechaDesde = searchParams.get('fecha_desde') || '';
  const fechaHasta = searchParams.get('fecha_hasta') || '';

  const [busqueda, setBusqueda] = useState(searchParams.get('q') || '');
  const [busquedaDebounce, setBusquedaDebounce] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setMounted(true);
  }, []);

  const sesion = mounted ? obtenerUsuarioActual() : null;
  const puedeCrear = sesion
    ? sesion.rolesVigentes.some(esCoordinadoraOAdmin)
    : false;

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      const tecnicosData = await obtenerTecnicosActivos();
      setTecnicos(
        tecnicosData.map((u) => ({
          id: String(u.id),
          nombre_completo: u.nombre_completo,
          email: u.email,
        }))
      );

      const filtros: FiltrosCasos = {
        estado: estadoFiltro,
        tecnico_id: tecnicoFiltro,
        tipo_servicio: tipoFiltro,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        q: busquedaDebounce,
      };

      const casosData = await obtenerCasos(filtros);
      setCasos(casosData);
      setLoading(false);
    }
    cargarDatos();
  }, [searchParams, busquedaDebounce]);

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounce(busqueda), 400);
    return () => clearTimeout(t);
  }, [busqueda]);

  const actualizarFiltro = useCallback(
    (nombre: string, valor: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (valor && valor !== 'todos') {
        params.set(nombre, valor);
      } else {
        params.delete(nombre);
      }
      startTransition(() => {
        router.push(`/casos?${params.toString()}`);
      });
    },
    [searchParams, router, startTransition]
  );

  const handleBusquedaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarFiltro('q', busqueda);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setBusquedaDebounce('');
    router.push('/casos');
  };

  const hayFiltrosActivos =
    estadoFiltro !== 'todos' ||
    tecnicoFiltro !== 'todos' ||
    tipoFiltro !== 'todos' ||
    busquedaDebounce !== '' ||
    fechaDesde !== '' ||
    fechaHasta !== '';

  const casosConDetalles = casos.map((caso: Caso) => {
    const cliente = clientes.find((c) => String(c.id) === String(caso.cliente_id));
    const equipo = equipos.find((e) => String(e.id) === String(caso.equipo_id));
    return {
      ...caso,
      razon_social: cliente ? cliente.razon_social : `Cliente #${caso.cliente_id}`,
      numero_serie: equipo ? equipo.numero_serie : `S/N #${caso.equipo_id}`,
      tecnico_nombre: resolverTecnico(caso.tecnico_id),
      prioridad_label: caso.prioridad || '—',
    };
  });

  const casosFiltrados = casosConDetalles.filter((caso) => {
    if (!busquedaDebounce) return true;
    const q = busquedaDebounce.toLowerCase();
    return (
      caso.numero.toLowerCase().includes(q) ||
      caso.incidencia.toLowerCase().includes(q) ||
      caso.razon_social.toLowerCase().includes(q) ||
      caso.numero_serie.toLowerCase().includes(q)
    );
  });

  const urlDetalle = (id: string) =>
    `/casos/${id}?${searchParams.toString()}`;

  const estadoBadge = (estado: string) => (
    <Badge
      variant={ESTADO_VARIANTE[estado] || 'secondary'}
      className="whitespace-nowrap"
    >
      {ESTADO_ETIQUETA[estado] || estado}
    </Badge>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Casos</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de incidentes, visitas y atenciones técnicas
          </p>
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

      <Card className="mb-6">
        <div className="p-4 rounded-xl shadow-sm border border-border space-y-4">
          <form onSubmit={handleBusquedaSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                placeholder="Buscar por N° caso, razón social o serie..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onClear={() => {
                  setBusqueda('');
                  setBusquedaDebounce('');
                  actualizarFiltro('q', '');
                }}
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="min-h-11 px-5"
            >
              Buscar
            </Button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Estado
              </label>
              <select
                value={estadoFiltro}
                onChange={(e) => actualizarFiltro('estado', e.target.value)}
                className="w-full border border-border rounded-lg px-2.5 py-2 text-sm bg-background text-foreground min-h-11"
              >
                <option value="todos">Todos los estados</option>
                <option value="por_programar">Por programar</option>
                <option value="programado">Programado</option>
                <option value="en_atencion">En atención</option>
                <option value="en_espera">En espera</option>
                <option value="atendido">Atendido</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Técnico
              </label>
              <select
                value={tecnicoFiltro}
                onChange={(e) => actualizarFiltro('tecnico_id', e.target.value)}
                className="w-full border border-border rounded-lg px-2.5 py-2 text-sm bg-background text-foreground min-h-11"
              >
                <option value="todos">Todos los técnicos</option>
                {tecnicos.map((tec) => (
                  <option key={tec.id} value={tec.email}>
                    {tec.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Tipo de Servicio
              </label>
              <select
                value={tipoFiltro}
                onChange={(e) => actualizarFiltro('tipo_servicio', e.target.value)}
                className="w-full border border-border rounded-lg px-2.5 py-2 text-sm bg-background text-foreground min-h-11"
              >
                <option value="todos">Todos los tipos</option>
                <option value="Mantenimiento general">Mantenimiento general</option>
                <option value="Inspección y diagnóstico">
                  Inspección y diagnóstico
                </option>
                <option value="Entrenamiento técnico">Entrenamiento técnico</option>
                <option value="Perfilación de color">Perfilación de color</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => actualizarFiltro('fecha_desde', e.target.value)}
                className="w-full border border-border rounded-lg px-2 py-2 text-xs bg-background text-foreground min-h-11"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => actualizarFiltro('fecha_hasta', e.target.value)}
                className="w-full border border-border rounded-lg px-2 py-2 text-xs bg-background text-foreground min-h-11"
              />
            </div>
          </div>

          {hayFiltrosActivos && (
            <div className="flex justify-end pt-2">
              <button
                onClick={limpiarFiltros}
                className="text-xs text-primary hover:underline font-medium py-1 min-h-11 inline-flex items-center"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Cargando casos...
        </div>
      ) : casosFiltrados.length === 0 ? (
        <Card className="text-center p-12">
          <p className="text-muted-foreground">No hay casos con estos filtros.</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table className="text-left border-collapse">
              <TableHeader>
                <TableRow className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <TableHead className="p-4">N° de caso</TableHead>
                  <TableHead className="p-4">Registro</TableHead>
                  <TableHead className="p-4">Cliente</TableHead>
                  <TableHead className="p-4">Serie</TableHead>
                  <TableHead className="p-4">Tipo</TableHead>
                  <TableHead className="p-4">Prioridad</TableHead>
                  <TableHead className="p-4">Técnico</TableHead>
                  <TableHead className="p-4">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border text-sm">
                {casosFiltrados.map((caso) => (
                  <TableRow key={caso.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="p-4 font-medium text-primary">
                      <Link
                        href={urlDetalle(caso.id)}
                        className="hover:underline"
                      >
                        {caso.numero}
                      </Link>
                    </TableCell>
                    <TableCell className="p-4 text-muted-foreground">
                      {fechaLima(caso.creado_en)}
                    </TableCell>
                    <TableCell className="p-4 text-card-foreground font-medium truncate max-w-xs">
                      {caso.razon_social}
                    </TableCell>
                    <TableCell className="p-4 text-muted-foreground font-mono text-xs">
                      {caso.numero_serie}
                    </TableCell>
                    <TableCell className="p-4 text-card-foreground">
                      {caso.tipo_servicio}
                    </TableCell>
                    <TableCell className="p-4 text-card-foreground">
                      {caso.prioridad_label}
                    </TableCell>
                    <TableCell className="p-4 text-card-foreground">
                      {caso.tecnico_nombre}
                    </TableCell>
                    <TableCell className="p-4">
                      {estadoBadge(caso.estado)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="md:hidden grid grid-cols-1 gap-3">
            {casosFiltrados.map((caso) => (
              <Card
                key={caso.id}
                className="p-4 shadow-sm hover:border-primary/50 transition-all border border-border cursor-pointer group"
                onClick={() => router.push(urlDetalle(caso.id))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') router.push(urlDetalle(caso.id));
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-primary">{caso.numero}</span>
                  {estadoBadge(caso.estado)}
                </div>
                <div className="text-sm text-card-foreground font-semibold mb-1">
                  {caso.razon_social}
                </div>
                <div className="text-xs text-muted-foreground mb-1 font-mono">
                  Serie: {caso.numero_serie}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Tipo: {caso.tipo_servicio}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                  <span>Prioridad: {caso.prioridad_label}</span>
                  <span>Técnico: {caso.tecnico_nombre}</span>
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
