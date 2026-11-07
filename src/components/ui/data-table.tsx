'use client';

import { ReactNode } from 'react';
import { DataTable as Tabla } from './data-table/DataTable';
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
}

function textoCelda<T>(fila: T, clave: string): ReactNode {
  if (typeof fila !== 'object' || fila === null || !(clave in fila)) return '';
  const valor = (fila as Record<string, unknown>)[clave];
  if (typeof valor === 'string' || typeof valor === 'number') return valor;
  return '';
}

export function DataTable<T>({
  columnas,
  datos,
  claveFila,
  cargando = false,
  textoCargando = 'Cargando información...',
  textoVacio = 'No se encontraron resultados.',
  onFilaClick,
  className = '',
}: DataTableProps<T>) {
  if (cargando) {
    return (
      <DataTableSkeleton
        rows={8}
        columns={Math.max(columnas.length, 1)}
        actionButtonsCount={0}
        className={className}
      />
    );
  }

  return (
    <Tabla
      className={className}
      columns={columnas.map((col) => ({
        key: col.clave,
        header: col.encabezado,
        render: (fila: T) => (col.render ? col.render(fila) : textoCelda(fila, col.clave)),
      }))}
      data={datos}
      rowKey={claveFila}
      emptyTitle={textoVacio}
      emptyDescription={textoCargando}
      onRowClick={onFilaClick}
    />
  );
}
