'use client';

import { ReactNode } from 'react';

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
      <div className="bg-card border border-border rounded-xl p-12 text-center text-sm text-muted-foreground shadow-xs">
        {textoCargando}
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center text-sm text-muted-foreground shadow-xs">
        {textoVacio}
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-xl shadow-xs border border-border overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {columnas.map((col) => (
                <th key={col.clave} className={`p-4 ${col.className || ''}`}>
                  {col.encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {datos.map((fila) => {
              const id = claveFila(fila);
              return (
                <tr
                  key={id}
                  onClick={() => onFilaClick && onFilaClick(fila)}
                  className={`transition-colors hover:bg-muted/40 ${onFilaClick ? 'cursor-pointer' : ''}`}
                >
                  {columnas.map((col) => (
                    <td key={col.clave} className={`p-4 ${col.className || ''}`}>
                      {col.render ? col.render(fila) : textoCelda(fila, col.clave)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
