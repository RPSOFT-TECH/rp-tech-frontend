'use client';

import { Suspense, useCallback, useEffect, useMemo, useState, useSyncExternalStore, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  casos_lista,
  clientes_lista,
  leerSesionEstable,
  obtener_catalogos,
  tecnicos,
  type CasoLista,
  type Catalogo,
  type ClienteLista,
  type TecnicoLista,
} from '@/lib/datos/actions';
import { ClipboardList } from 'lucide-react';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { descargarExcel, listaFiltradaPorBandeja, puedeCrear } from '../components/lista/bandejas';
import { FiltrosCasos } from '../components/lista/FiltrosCasos';
import { ResultadoCasos } from '../components/lista/ResultadoCasos';

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
  const puedeCrearCaso = puedeCrear(sesion?.rolesVigentes ?? []);
  useRegistrarTitulo('Casos', 'Listado y seguimiento de órdenes de servicio', ClipboardList);

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
        filtrados = filtrados.filter((caso) => caso.estado !== 'cerrado' && caso.estado !== 'anulado');
      } else if (bandeja === 'pendientes_posventa') {
        filtrados = filtrados.filter((caso) => caso.estado === 'atendido');
      } else if (bandeja !== 'todos' && bandeja !== estadoFiltro) {
        filtrados = filtrados.filter((caso) => caso.estado === bandeja);
      }
      if (modalidadFiltro !== 'todos') {
        filtrados = filtrados.filter((caso) => caso.modalidad_id === modalidadFiltro);
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
    const timer = setTimeout(() => {
      setBusquedaDebounce(busqueda);
      const params = new URLSearchParams(window.location.search);
      if ((params.get('q') || '') === busqueda) return;
      if (busqueda) params.set('q', busqueda);
      else params.delete('q');
      const consulta = params.toString();
      startTransition(() => router.replace(consulta ? `/casos?${consulta}` : '/casos'));
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda, router, startTransition]);

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
  const consulta = searchParams.toString();

  return (
    <div className="flex h-full min-h-0 flex-col md:overflow-hidden">
      <FiltrosCasos
        busqueda={busqueda}
        onBusqueda={setBusqueda}
        hayFiltros={hayFiltros}
        onLimpiar={() => {
          setBusqueda('');
          setBusquedaDebounce('');
          router.push('/casos');
        }}
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onFiltro={actualizarFiltro}
        onExportar={() => descargarExcel(casosBandeja)}
        puedeCrearCaso={puedeCrearCaso}
      />
      <ResultadoCasos
        casos={casos}
        loading={loading}
        urlDetalle={(id) => `/casos/${id}?${consulta}`}
        onAbrir={(id) => router.push(`/casos/${id}?${consulta}`)}
        estado={estadoFiltro}
        tecnicoId={tecnicoFiltro}
        clienteId={clienteFiltro}
        tipoServicioId={tipoFiltro}
        modalidadId={modalidadFiltro}
        tecnicos={tecnicosLista}
        clientes={clientesLista}
        tiposServicio={tiposServicio}
        modalidades={modalidades}
        onFiltro={actualizarFiltro}
      />
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
