'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DataTableEmpty } from './DataTableEmpty';

export interface TDataTableColumn<TRow> {
  key: string;
  header: React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: TRow, index: number) => React.ReactNode;
}

interface IDataTableProps<TRow> {
  columns: TDataTableColumn<TRow>[];
  data: TRow[];
  rowKey: keyof TRow | ((row: TRow) => string | number);
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  rowClassName?: (row: TRow) => string;
  onRowClick?: (row: TRow) => void;
}

export function DataTable<TRow>({
  columns,
  data,
  rowKey,
  emptyTitle = 'Sin registros',
  emptyDescription = 'No se encontraron datos para mostrar.',
  emptyAction,
  className,
  rowClassName,
  onRowClick,
}: IDataTableProps<TRow>): React.ReactElement {
  if (data.length === 0) {
    return (
      <DataTableEmpty title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return (
    <div className={cn('flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm', className)}>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-20">
            <tr className="border-b border-border/40 bg-muted/90 backdrop-blur-sm">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'px-5 py-4 text-[12px] font-black uppercase tracking-[0.12em] whitespace-nowrap text-foreground/90',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    (!col.align || col.align === 'left') && 'text-left',
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {data.map((row, rowIndex) => {
              const id = typeof rowKey === 'function' ? rowKey(row) : String(row[rowKey]);
              return (
                <motion.tr
                  key={String(id)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(rowIndex, 8) * 0.02 }}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'transition-colors duration-200 hover:bg-primary/[0.04]',
                    rowIndex % 2 === 0 ? 'bg-card' : 'bg-muted/5',
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(row),
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-5 py-3.5 text-[14.5px] font-medium text-foreground',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                        (!col.align || col.align === 'left') && 'text-left',
                      )}
                    >
                      {col.render ? col.render(row, rowIndex) : String(row[col.key as keyof TRow] ?? '—')}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
