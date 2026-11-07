'use client';

import { ReactNode, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DataTable as Tabla } from './data-table/DataTable';
import { DataTablePagination } from './data-table/DataTablePagination';
import { DataTableSkeleton } from './data-table/DataTableSkeleton';
import { useAjustePagina } from './data-table/use-ajuste-pagina';

export interface Columna<T> {
  clave: string;
  encabezado: ReactNode;
  render?: (fila: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columnas: Columna<T>[];
  datos: T[];
  claveFila: (fila: T) => string | number;
  cargando?: boolean;
  textoCargando?: string;
  textoVacio?: string;
  onFilaClick?: (fila: T) => void;
  className?: string;
  porPagina?: number;
  conservarEncabezado?: boolean;
}

function textoCelda<T>(fila: T, clave: string): ReactNode {
  if (typeof fila !== 'object' || fila === null || !(clave in fila)) return '';
  const valor = (fila as Record<string, unknown>)[clave];
  if (typeof valor === 'string' || typeof valor === 'number') return valor;
  return '';
}

function firmaDe<T>(datos: T[], claveFila: (fila: T) => string | number): string {
  if (datos.length === 0) return '0';
  return `${datos.length}:${claveFila(datos[0])}:${claveFila(datos[datos.length - 1])}`;
}

export function DataTable<T>({
  columnas,
  datos,
  claveFila,
  cargando = false,
  textoVacio = 'No se encontraron resultados.',
  onFilaClick,
  className = '',
  porPagina,
}: DataTableProps<T>) {
  const llena = className.includes('h-full');
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const ajuste = useAjustePagina(contenedorRef, llena);
  const cupo = porPagina ?? ajuste.cupo;
  const firma = firmaDe(datos, claveFila);
  const [pagina, setPagina] = useState(1);
  const [firmaPrev, setFirmaPrev] = useState(firma);
  let paginaActual = pagina;
  if (firma !== firmaPrev) {
    setFirmaPrev(firma);
    paginaActual = 1;
    if (pagina !== 1) setPagina(1);
  }
  const totalPaginas = Math.max(1, Math.ceil(datos.length / cupo));
  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
    setPagina(totalPaginas);
  }

  const columnasTabla = columnas.map((col) => ({
    key: col.clave,
    header: col.encabezado,
    render: (fila: T) => (col.render ? col.render(fila) : textoCelda(fila, col.clave)),
  }));

  const inicio = (paginaActual - 1) * cupo;
  const visibles = datos.slice(inicio, inicio + cupo);
  const altoCuerpo = llena ? undefined : cupo * ajuste.altoFila;

  return (
    <div
      ref={contenedorRef}
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm',
        llena && 'h-full min-h-0',
        className,
      )}
    >
      {cargando ? (
        <div data-table-scroll className="min-h-0 flex-1 overflow-hidden" style={altoCuerpo ? { minHeight: altoCuerpo } : undefined}>
          <DataTableSkeleton
            rows={cupo}
            columns={Math.max(columnas.length, 1)}
            actionButtonsCount={0}
            className="h-full rounded-none border-0 shadow-none"
          />
        </div>
      ) : (
        <Tabla
          className={cn('h-auto rounded-none border-0 shadow-none', llena && 'min-h-0 flex-1')}
          columns={columnasTabla}
          data={visibles}
          rowKey={claveFila}
          rowHeight={ajuste.altoFila}
          bodyMinHeight={altoCuerpo}
          emptyTitle={textoVacio}
          emptyDescription="No hay datos para mostrar en este momento."
          onRowClick={onFilaClick}
        />
      )}
      <div data-pagination-footer className="shrink-0 border-t border-border/40 px-4 py-2">
        <DataTablePagination
          currentPage={paginaActual}
          totalPages={totalPaginas}
          totalItems={datos.length}
          perPage={cupo}
          onPageChange={setPagina}
        />
      </div>
    </div>
  );
}
