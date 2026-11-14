'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface OpcionSegmentado<T extends string> {
  value: T;
  label: ReactNode;
  tono?: 'normal' | 'alerta' | 'ok';
}

export function Segmentado<T extends string>({
  value,
  onChange,
  opciones,
  disabled = false,
  tamano = 'normal',
  className,
  ariaLabel,
}: {
  value: T | null | undefined;
  onChange: (valor: T) => void;
  opciones: OpcionSegmentado<T>[];
  disabled?: boolean;
  tamano?: 'normal' | 'grande';
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'flex w-full gap-0.5 rounded-lg border border-border bg-muted p-[3px]',
        disabled && 'opacity-60',
        className,
      )}
    >
      {opciones.map((opcion) => {
        const marcada = opcion.value === value;
        return (
          <button
            key={opcion.value}
            type="button"
            role="radio"
            aria-checked={marcada}
            disabled={disabled}
            onClick={() => onChange(opcion.value)}
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-1 text-sm transition-colors outline-none',
              'focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed [&_svg]:size-4 [&_svg]:shrink-0',
              tamano === 'grande' ? 'h-11' : 'h-9 md:h-8',
              marcada
                ? 'bg-card font-semibold shadow-sm ring-1 ring-border'
                : 'font-medium text-muted-foreground hover:text-foreground',
              marcada && opcion.tono === 'alerta' && 'text-destructive',
              marcada && opcion.tono === 'ok' && 'text-emerald-700 dark:text-emerald-400',
              marcada && (!opcion.tono || opcion.tono === 'normal') && 'text-foreground',
            )}
          >
            <span className="truncate">{opcion.label}</span>
          </button>
        );
      })}
    </div>
  );
}
