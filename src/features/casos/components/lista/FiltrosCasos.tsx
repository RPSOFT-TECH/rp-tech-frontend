'use client';

import Link from 'next/link';
import { Download, Plus, TriangleAlert, X } from 'lucide-react';
import type { CasoLista } from '@/lib/datos/actions';
import { Button, SearchInput } from '@/components/ui';
import { buttonVariants } from '@/components/ui/button';
import { SelectorFecha } from '@/components/ui/selector-fecha';
import { cn } from '@/lib/utils';
import { BANDEJAS, contadorBandeja, pendientesDeAtencion } from './bandejas';

export function FiltrosCasos({
  casos,
  bandeja,
  onBandeja,
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
  casos: CasoLista[];
  bandeja: string;
  onBandeja: (clave: string) => void;
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
  const { sinTecnico, atrasados } = pendientesDeAtencion(casos);
  const partes = [
    sinTecnico ? `${sinTecnico} ${sinTecnico === 1 ? 'caso sin técnico' : 'casos sin técnico'}` : null,
    atrasados ? `${atrasados} ${atrasados === 1 ? 'visita de días anteriores' : 'visitas de días anteriores'} sin cerrar` : null,
  ].filter(Boolean);

  return (
    <div className="mb-4 flex shrink-0 flex-col gap-3">
      {partes.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300/70 bg-estado-por px-4 py-2.5 text-sm text-estado-por-fg">
          <TriangleAlert className="size-4 shrink-0" />
          <span className="flex-1 font-medium">{partes.join(' · ')}</span>
          {sinTecnico > 0 && bandeja !== 'por_programar' && (
            <button type="button" onClick={() => onBandeja('por_programar')} className="font-semibold hover:underline">
              Ver sin técnico
            </button>
          )}
        </div>
      )}

      <div className="flex items-center">
        <div role="tablist" aria-label="Bandejas" className="no-scrollbar -mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 py-0.5">
          {BANDEJAS.map((item) => {
            const activa = bandeja === item.clave;
            const total = contadorBandeja(casos, item.clave);
            return (
              <button
                key={item.clave}
                type="button"
                role="tab"
                aria-selected={activa}
                onClick={() => onBandeja(item.clave)}
                className={cn(
                  'flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold whitespace-nowrap transition-colors',
                  activa
                    ? 'border-input bg-card text-foreground shadow-sm'
                    : 'border-transparent text-muted-foreground hover:bg-card/60 hover:text-foreground',
                )}
              >
                {item.etiqueta}
                <span
                  className={cn(
                    'min-w-6 rounded-full px-1.5 text-center text-xs leading-5 tabular-nums',
                    activa ? 'bg-foreground text-background' : total > 0 && item.tono ? item.tono : 'bg-black/5 text-muted-foreground dark:bg-white/10',
                  )}
                >
                  {total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <form className="min-w-0 flex-1" onSubmit={(evento) => evento.preventDefault()}>
          <SearchInput
            value={busqueda}
            onChange={(evento) => onBusqueda(evento.target.value)}
            onClear={() => onBusqueda('')}
            placeholder="Buscar por número, cliente, reporte, RUC o serie"
            className="shadow-xs"
          />
        </form>
        <div className="grid grid-cols-2 gap-2 lg:flex lg:w-auto">
          <SelectorFecha value={fechaDesde} onChange={(valor) => onFiltro('fecha_desde', valor)} placeholder="Desde" className="lg:w-44" />
          <SelectorFecha value={fechaHasta} onChange={(valor) => onFiltro('fecha_hasta', valor)} placeholder="Hasta" className="lg:w-44" />
        </div>
        {hayFiltros ? (
          <Button type="button" variant="ghost" onClick={onLimpiar} className="h-10 gap-1.5 px-3 font-semibold text-muted-foreground">
            <X className="size-4" />
            Limpiar
          </Button>
        ) : null}
        <div className="flex shrink-0 items-center gap-2 lg:ml-1">
          <Button type="button" variant="outline" onClick={onExportar} className="h-10 gap-2 px-4 font-semibold shadow-xs">
            <Download className="size-4" />
            Excel
          </Button>
          {puedeCrearCaso ? (
            <Link href="/casos/nuevo" className={buttonVariants({ className: 'h-10 gap-2 px-4 font-semibold shadow-sm' })}>
              <Plus className="size-4" />
              Nuevo caso
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
