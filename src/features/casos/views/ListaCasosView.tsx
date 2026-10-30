'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { obtenerCasos, obtenerTecnicosActivos, FiltrosCasos, obtenerUsuarioActual } from '@/lib/datos-simulados/actions';
import { Caso } from '@/lib/datos-simulados/casos';
import { clientes } from '@/lib/datos-simulados/clientes';
import { equipos } from '@/lib/datos-simulados/equipos';
import { Usuario } from '@/lib/datos-simulados/usuarios';
import { SearchInput, Button } from '@/components/ui';

function ListaCasosContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [casos, setCasos] = useState<Caso[]>([]);
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const estadoFiltro = searchParams.get('estado') || 'todos';
  const tecnicoFiltro = searchParams.get('tecnico_id') || 'todos';
  const tipoFiltro = searchParams.get('tipo_servicio') || 'todos';
  const busquedaFiltro = searchParams.get('q') || '';
  const fechaDesde = searchParams.get('fecha_desde') || '';
  const fechaHasta = searchParams.get('fecha_hasta') || '';

  const [busqueda, setBusqueda] = useState(busquedaFiltro);

  const sesion = mounted ? obtenerUsuarioActual() : null;
  const puedeCrear = sesion?.rolesVigentes.some((r) => 
    r === 'coordinador' || r === 'superadmin' || r === 'gerente'
  );

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      const tecnicosData = await obtenerTecnicosActivos();
      setTecnicos(tecnicosData);

      const filtros: FiltrosCasos = {
        estado: estadoFiltro,
        tecnico_id: tecnicoFiltro,
        tipo_servicio: tipoFiltro,
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        q: busquedaFiltro,
      };

      const casosData = await obtenerCasos(filtros);
      setCasos(casosData);
      setLoading(false);
    }
    cargarDatos();
  }, [searchParams]);

  const actualizarFiltro = (nombre: string, valor: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (valor && valor !== 'todos') {
      params.set(nombre, valor);
    } else {
      params.delete(nombre);
    }
    startTransition(() => {
      router.push(`/casos?${params.toString()}`);
    });
  };

  const handleBusquedaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarFiltro('q', busqueda);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    router.push('/casos');
  };

  const hayFiltrosActivos =
    estadoFiltro !== 'todos' ||
    tecnicoFiltro !== 'todos' ||
    tipoFiltro !== 'todos' ||
    busquedaFiltro !== '' ||
    fechaDesde !== '' ||
    fechaHasta !== '';

  const casosConDetalles = casos.map((caso: Caso) => {
    const cliente = clientes.find((c) => String(c.id) === String(caso.cliente_id));
    const equipo = equipos.find((e) => String(e.id) === String(caso.equipo_id));
    return {
      ...caso,
      razon_social: cliente ? cliente.razon_social : `Cliente #${caso.cliente_id}`,
      numero_serie: equipo ? equipo.numero_serie : `S/N #${caso.equipo_id}`,
    };
  });

  const casosFiltrados = casosConDetalles.filter((caso) => {
    if (!busquedaFiltro) return true;
    const q = busquedaFiltro.toLowerCase();
    return (
      caso.numero.toLowerCase().includes(q) ||
      caso.incidencia.toLowerCase().includes(q) ||
      caso.razon_social.toLowerCase().includes(q) ||
      caso.numero_serie.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Módulo de Casos</h1>
          <p className="text-sm text-muted-foreground">Gestión de incidentes, visitas y atenciones técnicas</p>
        </div>

        {puedeCrear && (
          <Link
            href="/casos/nuevo"
            className="w-full md:w-auto inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm min-h-11"
          >
            + Crear nuevo caso
          </Link>
        )}
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border border-border mb-6 space-y-4">
        <form onSubmit={handleBusquedaSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar por RUC, razón social, serie o N° caso..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onClear={() => {
                setBusqueda('');
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
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Estado</label>
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
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Técnico</label>
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
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Tipo de Servicio</label>
            <select
              value={tipoFiltro}
              onChange={(e) => actualizarFiltro('tipo_servicio', e.target.value)}
              className="w-full border border-border rounded-lg px-2.5 py-2 text-sm bg-background text-foreground min-h-11"
            >
              <option value="todos">Todos los tipos</option>
              <option value="Mantenimiento general">Mantenimiento general</option>
              <option value="Inspección y diagnóstico">Inspección y diagnóstico</option>
              <option value="Entrenamiento técnico">Entrenamiento técnico</option>
              <option value="Instalación y entrega">Instalación y entrega</option>
              <option value="Perfilación de color">Perfilación de color</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Fecha Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => actualizarFiltro('fecha_desde', e.target.value)}
              className="w-full border border-border rounded-lg px-2 py-2 text-xs bg-background text-foreground min-h-11"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Fecha Hasta</label>
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
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando casos...</div>
      ) : casosFiltrados.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          No hay casos con estos filtros.
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">N° de caso</th>
                  <th className="p-4">Registro</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Equipo (Serie)</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Modo</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {casosFiltrados.map((caso) => (
                  <tr key={caso.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium text-primary">
                      <Link href={`/casos/${caso.id}`} className="hover:underline">
                        {caso.numero}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(caso.creado_en).toLocaleDateString('es-PE')}
                    </td>
                    <td className="p-4 text-card-foreground font-medium truncate max-w-xs">{caso.razon_social}</td>
                    <td className="p-4 text-muted-foreground font-mono text-xs">{caso.numero_serie}</td>
                    <td className="p-4 text-card-foreground">{caso.tipo_servicio}</td>
                    <td className="p-4 text-card-foreground">{caso.modo_servicio}</td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                        {caso.estado.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden grid grid-cols-1 gap-4">
            {casosFiltrados.map((caso) => (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                className="block bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/50 transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-primary">{caso.numero}</span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                    {caso.estado.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-card-foreground font-semibold mb-1">{caso.razon_social}</div>
                <div className="text-xs text-muted-foreground mb-1 font-mono">Serie: {caso.numero_serie}</div>
                <div className="text-xs text-muted-foreground mb-2">Tipo: {caso.tipo_servicio}</div>
                <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                  <span>Modo: {caso.modo_servicio}</span>
                  <span>Canal: {caso.canal}</span>
                </div>
              </Link>
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
