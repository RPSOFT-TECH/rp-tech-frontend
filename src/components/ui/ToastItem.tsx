'use client';

import { AlertCircle, CheckCircle2, FilePlus2, Info, Loader2, XCircle } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'history';

const VARIANTS = {
  success: { Icon: CheckCircle2, strip: 'bg-primary', icono: 'bg-primary/10 text-primary' },
  error: { Icon: XCircle, strip: 'bg-destructive', icono: 'bg-destructive/10 text-destructive' },
  info: { Icon: Info, strip: 'bg-chart-1', icono: 'bg-chart-1/10 text-chart-1' },
  warning: { Icon: AlertCircle, strip: 'bg-chart-3', icono: 'bg-chart-3/10 text-chart-3' },
  loading: { Icon: Loader2, strip: 'bg-chart-2', icono: 'bg-chart-2/10 text-chart-2' },
  history: { Icon: FilePlus2, strip: 'bg-primary', icono: 'bg-primary/10 text-primary' },
} as const;

interface ToastItemProps {
  id: string | number;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

export function ToastItem({ id, variant, title, description, duration = 3000 }: ToastItemProps) {
  const { Icon, strip, icono } = VARIANTS[variant];

  return (
    <div className="relative w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg">
      <span className={cn('absolute inset-y-0 left-0 w-1', strip)} />
      <div className="flex items-start gap-3 p-3 pl-4">
        <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl', icono)}>
          <Icon className={cn('size-4', variant === 'loading' && 'animate-spin')} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{title}</p>
          {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => sonnerToast.dismiss(id)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Cerrar
        </button>
      </div>
      {variant !== 'loading' && duration < 60000 ? (
        <span
          className={cn('block h-0.5 origin-left', strip)}
          style={{ animation: `rptech-toast ${duration}ms linear forwards` }}
        />
      ) : null}
    </div>
  );
}
