'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { Button, SearchInput } from '@/components/ui';
import { buttonVariants } from '@/components/ui/button';
import { FiltroFecha } from '../FiltrosListaCasos';

export function FiltrosCasos({
  busqueda,
  onBusqueda,
  hayFiltros,
  onLimpiar,
  fechaDesde,
  fechaHasta,
  onFiltro,
  onExportar,
  puedeCrearCaso,
}: {
  busqueda: string;
  onBusqueda: (valor: string) => void;
  hayFiltros: boolean;
  onLimpiar: () => void;
  fechaDesde: string;
  fechaHasta: string;
  onFiltro: (nombre: string, valor: string) => void;
  onExportar: () => void;
  puedeCrearCaso: boolean;
}) {
  return (
    <div className="mb-4 flex shrink-0 flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form className="min-w-0 flex-1" onSubmit={(evento) => evento.preventDefault()}>
          <SearchInput
            value={busqueda}
            onChange={(evento) => onBusqueda(evento.target.value)}
            placeholder="Buscar por número, cliente, reporte, RUC o serie"
          />
        </form>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {puedeCrearCaso ? (
            <Link href="/casos/nuevo" className={buttonVariants({ className: 'h-12 rounded-xl px-5 font-semibold' })}>
              Nuevo caso
            </Link>
          ) : null}
          <Button type="button" variant="outline" onClick={onExportar} className="h-12 rounded-xl px-5 font-semibold">
            Excel
          </Button>
          {hayFiltros ? (
            <Button type="button" variant="outline" onClick={onLimpiar} className="h-12 rounded-xl px-5 font-semibold">
              <X className="size-3.5" />
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-xl">
        <FiltroFecha label="Fecha desde" value={fechaDesde} onChange={(valor) => onFiltro('fecha_desde', valor)} />
        <FiltroFecha label="Fecha hasta" value={fechaHasta} onChange={(valor) => onFiltro('fecha_hasta', valor)} />
      </div>
    </div>
  );
}
