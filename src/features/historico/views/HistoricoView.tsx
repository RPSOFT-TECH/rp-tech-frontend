'use client';

import { Suspense, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Archive, Download, X } from 'lucide-react';
import { historico_lista, type HistoricoLista } from '@/lib/datos/actions';
import { hoyLima } from '@/lib/datos-simulados/fecha';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { Badge, Button, Card, DataTable, Input, SearchInput, type Columna } from '@/components/ui';
import { SelectorFecha } from '@/components/ui/selector-fecha';
import { descargarHoja } from '@/lib/exportar/excel';

const fechaCorta = (f: string | null) => (f ? f.split('-').reverse().join('/') : '—');

function SinVincular({ h }: { h: HistoricoLista }) {
  return h.vinculado ? null : (
    <Badge variant="outline" className="text-xs whitespace-nowrap">
      Sin vincular
    </Badge>
  );
}

// Exportación con los campos vitales primero (pedido del área técnica).
function exportar(lista: HistoricoLista[]) {
  descargarHoja(
    `historico_${hoyLima()}.xlsx`,
    'Histórico',
    ['N° de talonario', 'Fecha', 'Cliente', 'Equipo', 'Técnico', 'Motivo', 'Resultado', 'Requerimiento', 'Vinculado'],
    lista.map((h) => [h.numero_talonario, h.fecha, h.cliente, h.equipo, h.tecnico, h.motivo, h.resultado, h.requerimiento, h.vinculado ? 'Sí' : 'No']),
  );
}

function HistoricoContenido() {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  useRegistrarTitulo('Histórico', 'Reportes en papel digitalizados', Archive);

  // Los filtros viven en la URL: se mantienen al volver del detalle.
  const desde = params.get('desde') || '';
  const hasta = params.get('hasta') || '';
  const talonario = params.get('talonario') || '';
  const clienteId = params.get('cliente_id') || '';
  const equipoId = params.get('equipo_id') || '';
  const [busqueda, setBusqueda] = useState(params.get('q') || '');
  const [q, setQ] = useState(busqueda);
  const [tal, setTal] = useState(talonario);
  const [lista, setLista] = useState<HistoricoLista[]>([]);
  const [cargando, setCargando] = useState(true);

  const fijar = (nombre: string, valor: string) => {
    const p = new URLSearchParams(window.location.search);
    if (valor) p.set(nombre, valor);
    else p.delete(nombre);
    const consulta = p.toString();
    startTransition(() => router.replace(consulta ? `/historico?${consulta}` : '/historico'));
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(busqueda);
      if ((new URLSearchParams(window.location.search).get('q') || '') !== busqueda) fijar('q', busqueda);
      if ((new URLSearchParams(window.location.search).get('talonario') || '') !== tal) fijar('talonario', tal);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, tal]);

  useEffect(() => {
    let vigente = true;
    const cargar = async () => {
      setCargando(true);
      const datos = await historico_lista({
      q: q || undefined,
      talonario: talonario || undefined,
      fecha_desde: desde || undefined,
      fecha_hasta: hasta || undefined,
      cliente_id: clienteId || undefined,
      equipo_id: equipoId || undefined,
      });
      if (!vigente) return;
      setLista(datos);
      setCargando(false);
    };
    cargar();
    return () => {
      vigente = false;
    };
  }, [q, talonario, desde, hasta, clienteId, equipoId]);

  const hayFiltros = Boolean(q || talonario || desde || hasta || clienteId || equipoId);
  const limpiar = () => {
    setBusqueda('');
    setTal('');
    startTransition(() => router.replace('/historico'));
  };

  const columnas: Columna<HistoricoLista>[] = useMemo(
    () => [
      { clave: 'numero_talonario', encabezado: 'Talonario', render: (h) => <span className="font-mono text-[13px]">{h.numero_talonario || 'Sin N°'}</span> },
      { clave: 'fecha', encabezado: 'Fecha', render: (h) => <span className="tabular-nums">{fechaCorta(h.fecha)}</span> },
      {
        clave: 'cliente',
        encabezado: 'Cliente',
        render: (h) => (
          <span className="flex items-center gap-2">
            <span className="truncate">{h.cliente || '—'}</span>
            <SinVincular h={h} />
          </span>
        ),
      },
      { clave: 'equipo', encabezado: 'Equipo', render: (h) => h.equipo || '—' },
      { clave: 'tecnico', encabezado: 'Técnico', render: (h) => h.tecnico || '—' },
      { clave: 'motivo', encabezado: 'Motivo', render: (h) => <span className="line-clamp-1">{h.motivo || '—'}</span> },
    ],
    [],
  );

  const abrir = (id: string) => router.push(`/historico/${id}`);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex shrink-0 flex-col gap-2 lg:flex-row lg:items-center">
        <form className="min-w-0 flex-1" onSubmit={(e) => e.preventDefault()}>
          <SearchInput
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onClear={() => setBusqueda('')}
            placeholder="Buscar por cliente, equipo, técnico o motivo"
            className="shadow-xs"
          />
        </form>
        <div className="grid grid-cols-2 gap-2 lg:flex lg:w-auto">
          <Input value={tal} onChange={(e) => setTal(e.target.value)} placeholder="N° de talonario" aria-label="N° de talonario" className="col-span-2 h-10 lg:w-40" />
          <SelectorFecha value={desde} onChange={(v) => fijar('desde', v)} placeholder="Desde" className="lg:w-44" />
          <SelectorFecha value={hasta} onChange={(v) => fijar('hasta', v)} placeholder="Hasta" className="lg:w-44" />
        </div>
        {hayFiltros ? (
          <Button type="button" variant="ghost" onClick={limpiar} className="h-10 gap-1.5 px-3 font-semibold text-muted-foreground">
            <X className="size-4" />
            Limpiar
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={() => exportar(lista)} disabled={lista.length === 0} className="h-10 gap-2 px-4 font-semibold shadow-xs">
          <Download className="size-4" />
          Excel
        </Button>
      </div>

      {clienteId || equipoId ? (
        <p className="mb-3 text-sm text-muted-foreground">
          Mostrando solo los reportes {clienteId ? 'de un cliente' : 'de un equipo'}.{' '}
          <button type="button" className="font-semibold text-primary hover:underline" onClick={limpiar}>
            Ver todos
          </button>
        </p>
      ) : null}

      <div className="hidden min-h-0 flex-1 md:block">
        <DataTable
          className="h-full"
          columnas={columnas}
          datos={lista}
          claveFila={(h) => h.id}
          cargando={cargando}
          textoVacio={hayFiltros ? 'No hay reportes en papel con estos filtros.' : 'Todavía no hay reportes en papel cargados desde SIREP.'}
          conservarEncabezado
          onFilaClick={(h) => abrir(h.id)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:hidden">
        {cargando ? <p className="text-sm text-muted-foreground">Cargando…</p> : null}
        {!cargando && lista.length === 0 ? (
          <p className="text-sm text-muted-foreground">{hayFiltros ? 'No hay reportes en papel con estos filtros.' : 'Todavía no hay reportes en papel.'}</p>
        ) : null}
        {lista.map((h) => (
          <Card key={h.id} className="cursor-pointer p-4" onClick={() => abrir(h.id)}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold">{h.numero_talonario || 'Sin N°'}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{fechaCorta(h.fecha)}</span>
            </div>
            <p className="mt-1 font-medium text-foreground">{h.cliente || '—'}</p>
            <p className="text-sm text-muted-foreground">{[h.equipo, h.tecnico].filter(Boolean).join(' · ') || '—'}</p>
            {h.motivo ? <p className="mt-1 line-clamp-2 text-sm">{h.motivo}</p> : null}
            <div className="mt-2">
              <SinVincular h={h} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function HistoricoView() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
      <HistoricoContenido />
    </Suspense>
  );
}
