import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SeccionReporte({
  titulo,
  ayuda,
  opcional,
  extra,
  children,
  className,
}: {
  titulo?: string;
  ayuda?: string;
  opcional?: boolean;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-4 rounded-xl border border-border bg-card p-4', className)}>
      {titulo && (
        <header className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
            {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
          </div>
          {extra ?? (opcional ? (
            <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">Opcional</span>
          ) : null)}
        </header>
      )}
      {children}
    </section>
  );
}

export function CampoReporte({ etiqueta, children, htmlFor }: { etiqueta: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {etiqueta}
      </label>
      {children}
    </div>
  );
}
