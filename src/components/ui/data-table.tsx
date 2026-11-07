'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { DataTable as Tabla } from './data-table/DataTable';
import { DataTablePagination } from './data-table/DataTablePagination';
import { DataTableSkeleton } from './data-table/DataTableSkeleton';

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

const POR_PAGINA = 5;

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
  porPagina = POR_PAGINA,
  conservarEncabezado = false,
}: DataTableProps<T>) {
  const firma = firmaDe(datos, claveFila);
  const [pagina, setPagina] = useState(1);
  const [firmaPrev, setFirmaPrev] = useState(firma);
  let paginaActual = pagina;
  if (firma !== firmaPrev) {
    setFirmaPrev(firma);
    paginaActual = 1;
    if (pagina !== 1) setPagina(1);
  }
  const totalPaginas = Math.max(1, Math.ceil(datos.length / porPagina));
  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
    setPagina(totalPaginas);
  }

  if (cargando) {
    return (
      <DataTableSkeleton
        rows={porPagina}
        columns={Math.max(columnas.length, 1)}
        actionButtonsCount={0}
        className={className}
      />
    );
  }

  const columnasTabla = columnas.map((col) => ({
    key: col.clave,
    header: col.encabezado,
    render: (fila: T) => (col.render ? col.render(fila) : textoCelda(fila, col.clave)),
  }));

  if (datos.length === 0) {
    if (!conservarEncabezado) {
      return (
        <Tabla
          className={className}
          columns={columnasTabla}
          data={datos}
          rowKey={claveFila}
          emptyTitle={textoVacio}
          emptyDescription="No hay datos para mostrar en este momento."
          onRowClick={onFilaClick}
        />
      );
    }
    return (
      <div className={cn('overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm', className)}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-muted/90">
              {columnasTabla.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-4 text-left text-[12px] font-black tracking-[0.12em] whitespace-nowrap text-foreground/90 uppercase"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columnasTabla.length} className="px-5 py-10 text-center text-sm text-muted-foreground">
                {textoVacio}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const inicio = (paginaActual - 1) * porPagina;
  const visibles = datos.slice(inicio, inicio + porPagina);

  const llena = className.includes('h-full');

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm',
        llena && 'flex min-h-0 flex-col',
        className,
      )}
    >
      <Tabla
        className={cn('rounded-none border-0 shadow-none', llena && 'min-h-0 flex-1')}
        columns={columnasTabla}
        data={visibles}
        rowKey={claveFila}
        onRowClick={onFilaClick}
      />
      <div className="shrink-0 border-t border-border/40 px-4 py-2">
        <DataTablePagination
          currentPage={paginaActual}
          totalPages={totalPaginas}
          totalItems={datos.length}
          perPage={porPagina}
          onPageChange={setPagina}
        />
      </div>
    </div>
  );
}
