import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AcentoMetrica = 'primary' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5' | 'destructive';

const VARIABLE: Record<AcentoMetrica, string> = {
  primary: 'var(--primary)',
  'chart-2': 'var(--chart-2)',
  'chart-3': 'var(--chart-3)',
  'chart-4': 'var(--chart-4)',
  'chart-5': 'var(--chart-5)',
  destructive: 'var(--destructive)',
};

function numeroFantasma(valor: string | number): string {
  const digitos = typeof valor === 'number' ? String(valor) : valor.replace(/\D/g, '');
  return digitos.slice(-2);
}

export function MetricCard({
  titulo,
  valor,
  icono,
  acento = 'primary',
  onClick,
  activo = false,
  className,
}: {
  titulo: string;
  valor: string | number;
  icono: ReactNode;
  acento?: AcentoMetrica;
  onClick?: () => void;
  activo?: boolean;
  className?: string;
}) {
  const tono = VARIABLE[acento];
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        activo ? 'border-primary ring-2 ring-primary/30' : 'border-border',
        className,
      )}
    >
      <span aria-hidden className="absolute top-0 left-0 h-full w-1 rounded-l-2xl" style={{ background: tono }} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: `radial-gradient(circle at 90% 10%, color-mix(in srgb, ${tono} 12%, transparent), transparent 70%)` }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-2 bottom-0 text-[2.4rem] leading-none font-black opacity-[0.06] select-none"
        style={{ color: tono }}
      >
        {numeroFantasma(valor)}
      </span>
      <span className="relative flex items-center gap-3 py-3 pr-3 pl-4">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `color-mix(in srgb, ${tono} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${tono} 25%, transparent)`,
            color: tono,
          }}
        >
          {icono}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[10px] leading-tight font-black tracking-[0.12em] text-muted-foreground uppercase">
            {titulo}
          </span>
          <span className="text-[1.45rem] leading-none font-black tracking-tight text-foreground tabular-nums">{valor}</span>
        </span>
      </span>
    </Tag>
  );
}
