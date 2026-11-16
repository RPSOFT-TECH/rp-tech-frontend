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
  rowHeight?: number;
  bodyMinHeight?: number;
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
  rowHeight,
  bodyMinHeight,
}: IDataTableProps<TRow>): React.ReactElement {
  if (data.length === 0 && !rowHeight) {
    return (
      <DataTableEmpty title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return (
    <div className={cn('flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm', className)}>
      <div
        data-table-scroll
        className="no-scrollbar flex min-h-0 min-w-0 flex-1 flex-col overflow-auto"
        style={bodyMinHeight ? { minHeight: bodyMinHeight } : undefined}
      >
        <table className={cn('w-full border-collapse text-sm', data.length === 0 && 'h-full')}>
          <thead className="sticky top-0 z-20">
            <tr className="bg-muted">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'border-b border-border px-4 py-2.5 text-xs font-semibold whitespace-nowrap text-muted-foreground',
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
          <tbody>
            {data.length === 0 ? (
              <tr className="h-full">
                <td colSpan={columns.length} className="px-5 text-center align-middle">
                  <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{emptyDescription}</p>
                  {emptyAction}
                </td>
              </tr>
            ) : null}
            {data.map((row, rowIndex) => {
              const id = typeof rowKey === 'function' ? rowKey(row) : String(row[rowKey]);
              return (
                <motion.tr
                  key={String(id)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(rowIndex, 8) * 0.02 }}
                  style={rowHeight ? { height: rowHeight } : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'bg-card transition-colors duration-150 hover:bg-accent/60 [&:not(:last-child)>td]:border-b [&>td]:border-border',
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(row),
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-2.5 text-sm text-foreground',
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
