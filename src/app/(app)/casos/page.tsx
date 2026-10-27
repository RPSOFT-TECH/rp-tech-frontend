'use client';

import { Suspense, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { obtenerCasos, obtenerTecnicosActivos, FiltrosCasos, obtenerUsuarioActual } from '@/lib/datos-simulados/actions';
import { Caso } from '@/lib/datos-simulados/casos';
import { clientes } from '@/lib/datos-simulados/clientes';
import { equipos } from '@/lib/datos-simulados/equipos';

function ListaCasosContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [casos, setCasos] = useState<Caso[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
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

  const usuario = mounted ? obtenerUsuarioActual() : null;
  const puedeCrear = 
    (usuario?.rol as any) === 'coordinador' || 
    (usuario?.rol as any) === 'superadmin' || 
    (usuario?.rol as any) === 'gerente' || 
    (usuario?.rol as any) === 'coordinadora' || 
    (usuario?.rol as any) === 'administrador';

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda !== busquedaFiltro) {
        actualizarFiltro('q', busqueda);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const hayFiltrosActivos =
    estadoFiltro !== 'todos' ||
    tecnicoFiltro !== 'todos' ||
    tipoFiltro !== 'todos' ||
    busquedaFiltro !== '' ||
    fechaDesde !== '' ||
    fechaHasta !== '';

  const limpiarFiltros = () => {
    setBusqueda('');
    router.push('/casos');
  };

  const casosConDetalles = casos.map((caso: Caso) => {
    const cliente = clientes.find((c: { id: number }) => c.id === caso.cliente_id);
    const equipo = equipos.find((e: { id: number }) => e.id === caso.equipo_id);
    return {
      ...caso,
      razon_social: cliente ? (cliente as any).razon_social : `Cliente #${caso.cliente_id}`,
      numero_serie: equipo ? (equipo as any).numero_serie : `S/N #${caso.equipo_id}`,
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
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Casos</h1>
        {puedeCrear && (
          <Link
            href="/casos/nuevo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            + Nuevo caso
          </Link>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
        {/* Buscador */}
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">Buscar (N° caso / cliente / serie)</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtro Estado */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={estadoFiltro}
            onChange={(e) => actualizarFiltro('estado', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos</option>
            <option value="por_programar">Por programar</option>
            <option value="programado">Programado</option>
            <option value="en_atencion">En atención</option>
            <option value="en_espera">En espera</option>
            <option value="atendido">Atendido</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>

        {/* Filtro Técnico */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Técnico</label>
          <select
            value={tecnicoFiltro}
            onChange={(e) => actualizarFiltro('tecnico_id', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos</option>
            <option value="sin_asignar">Sin asignar</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.email}>
                {t.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Tipo de Servicio */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Servicio</label>
          <select
            value={tipoFiltro}
            onChange={(e) => actualizarFiltro('tipo_servicio', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos</option>
            <option value="Inspección y diagnóstico">Inspección y diagnóstico</option>
            <option value="Mantenimiento general">Mantenimiento general</option>
            <option value="Entrenamiento técnico">Entrenamiento técnico</option>
            <option value="Perfilación de color">Perfilación de color</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        {/* Fechas */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => actualizarFiltro('fecha_desde', e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => actualizarFiltro('fecha_hasta', e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white"
          />
        </div>

        {/* Botón Limpiar Filtros */}
        {hayFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-2 underline self-center"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Contenido / Tabla (PC) y Tarjetas (Celular) */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando casos...</div>
      ) : casosFiltrados.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          No hay casos con estos filtros.
        </div>
      ) : (
        <>
          {/* Vista PC: Tabla */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="p-4">N° de caso</th>
                  <th className="p-4">Registro</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Equipo (Serie)</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Modo</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {casosFiltrados.map((caso) => (
                  <tr key={caso.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-blue-600">
                      <Link href={`/casos/${caso.id}`} className="hover:underline">
                        {caso.numero}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(caso.creado_en).toLocaleDateString('es-PE')}
                    </td>
                    <td className="p-4 text-gray-900 font-medium truncate max-w-xs">{caso.razon_social}</td>
                    <td className="p-4 text-gray-600 font-mono text-xs">{caso.numero_serie}</td>
                    <td className="p-4 text-gray-700">{caso.tipo_servicio}</td>
                    <td className="p-4 text-gray-700">{caso.modo_servicio}</td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {caso.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista Celular: Tarjetas */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {casosFiltrados.map((caso) => (
              <Link
                key={caso.id}
                href={`/casos/${caso.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blue-300 transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-blue-600">{caso.numero}</span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {caso.estado}
                  </span>
                </div>
                <div className="text-sm text-gray-900 font-semibold mb-1">{caso.razon_social}</div>
                <div className="text-xs text-gray-500 mb-1 font-mono">Serie: {caso.numero_serie}</div>
                <div className="text-xs text-gray-500 mb-2">Tipo: {caso.tipo_servicio}</div>
                <div className="flex justify-between text-xs text-gray-600 border-t pt-2 mt-2">
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

export default function ListaCasosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando módulo de casos...</div>}>
      <ListaCasosContenido />
    </Suspense>
  );
}
