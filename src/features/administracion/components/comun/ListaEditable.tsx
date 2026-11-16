'use client';

import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export function ListaEditable({
  titulo,
  accion,
  onNuevo,
  vacio,
  children,
}: {
  titulo: string;
  accion: string;
  onNuevo: () => void;
  vacio: string;
  children: ReactNode[];
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
        <Button type="button" variant="outline" className="h-9 gap-1.5 px-3 shadow-xs" onClick={onNuevo}>
          <Plus className="size-4" />
          {accion}
        </Button>
      </header>
      {children.length === 0 ? <p className="px-4 py-6 text-center text-sm text-muted-foreground">{vacio}</p> : <ul>{children}</ul>}
    </section>
  );
}

export function FilaEditable({
  titulo,
  etiquetas,
  detalle,
  activo,
  onActivo,
  onEditar,
  extra,
}: {
  titulo: ReactNode;
  etiquetas?: ReactNode;
  detalle: ReactNode;
  activo: boolean;
  onActivo: () => void;
  onEditar: () => void;
  extra?: ReactNode;
}) {
  return (
    <li className={cn('flex flex-col gap-3 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-center', !activo && 'bg-muted/40')}>
      <div className="min-w-0 flex-1">
        <p className={cn('flex flex-wrap items-center gap-2 font-semibold', !activo && 'text-muted-foreground')}>
          {titulo}
          {etiquetas}
        </p>
        <p className="text-sm text-muted-foreground">{detalle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Switch checked={activo} onCheckedChange={onActivo} aria-label={activo ? 'Desactivar' : 'Activar'} />
          <span className="w-14">{activo ? 'Activo' : 'Inactivo'}</span>
        </label>
        {extra}
        <Button type="button" variant="outline" className="h-9 px-3 shadow-xs" onClick={onEditar}>
          Editar
        </Button>
      </div>
    </li>
  );
}

export function Etiqueta({ children, tono = 'neutro' }: { children: ReactNode; tono?: 'neutro' | 'azul' | 'verde' }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded-full px-2 text-xs font-semibold',
        tono === 'azul' && 'bg-estado-prog text-estado-prog-fg',
        tono === 'verde' && 'bg-estado-ok text-estado-ok-fg',
        tono === 'neutro' && 'bg-estado-anu text-estado-anu-fg',
      )}
    >
      {children}
    </span>
  );
}
