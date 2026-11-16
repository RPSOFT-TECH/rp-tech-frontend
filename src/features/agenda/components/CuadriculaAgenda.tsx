import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TecnicoLista } from '@/lib/datos/actions';
import { AvatarIniciales, Button } from '@/components/ui';
import { tonoDe } from '@/components/ui/avatar-iniciales';
import { cn } from '@/lib/utils';
import { celdasDelMes, moverMes, nombreMes } from '../utils/calendario';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export interface EventoDia {
  id: string;
  hora: string;
  cliente: string;
  tecnicoId: string;
  tecnicoNombre: string;
}

interface CuadriculaAgendaProps {
  fecha: string;
  hoy: string;
  porDia: Record<string, EventoDia[]>;
  tecnicos: TecnicoLista[];
  onIr: (iso: string) => void;
}

function nombreCorto(razon: string): string {
  return razon.replace(/\b(S\.?A\.?C\.?|S\.?R\.?L\.?|E\.?I\.?R\.?L\.?|S\.?A\.?)\s*$/i, '').trim();
}

export function CuadriculaAgenda({ fecha, hoy, porDia, tecnicos, onIr }: CuadriculaAgendaProps) {
  const [anio, mes] = fecha.split('-').map(Number);
  const celdas = celdasDelMes(anio, mes, hoy);
  const filas = celdas.length / 7;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
        <Button type="button" variant="outline" size="icon" aria-label="Mes anterior" className="size-9 shadow-xs" onClick={() => onIr(moverMes(fecha, -1))}>
          <ChevronLeft />
        </Button>
        <Button type="button" variant="outline" size="icon" aria-label="Mes siguiente" className="size-9 shadow-xs" onClick={() => onIr(moverMes(fecha, 1))}>
          <ChevronRight />
        </Button>
        <h2 className="ml-1 text-lg font-bold text-foreground">
          {nombreMes(anio, mes)} {anio}
        </h2>
        <Button type="button" variant="outline" className="h-9 px-3 shadow-xs" disabled={fecha === hoy} onClick={() => onIr(hoy)}>
          Hoy
        </Button>
        {tecnicos.length > 0 && (
          <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {tecnicos.map((t) => (
              <span key={t.id} className="flex items-center gap-1.5">
                <AvatarIniciales nombre={t.nombre_completo} className="size-5 text-[9px]" />
                {t.nombre_completo}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-7 border-y border-border bg-muted">
        {DIAS.map((dia) => (
          <div key={dia} className="px-2 py-2 text-xs font-semibold text-muted-foreground">
            {dia}
          </div>
        ))}
      </div>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="grid h-full grid-cols-7" style={{ gridTemplateRows: `repeat(${filas}, minmax(88px, 1fr))` }}>
          {celdas.map((celda, indice) => {
            const finDeSemana = indice % 7 >= 5;
            const bordes = cn('border-border', indice % 7 !== 6 && 'border-r', indice < celdas.length - 7 && 'border-b');
            if (!celda.perteneceMes) {
              return <div key={`vacio-${indice}`} className={cn(bordes, 'bg-muted/60')} />;
            }
            const eventos = porDia[celda.iso] ?? [];
            const seleccionado = celda.iso === fecha;
            return (
              <button
                key={celda.iso}
                type="button"
                onClick={() => onIr(celda.iso)}
                aria-pressed={seleccionado}
                aria-label={`${celda.dia}: ${eventos.length} ${eventos.length === 1 ? 'visita' : 'visitas'}`}
                className={cn(
                  bordes,
                  'flex min-w-0 flex-col gap-1 overflow-hidden p-1.5 text-left transition-colors hover:bg-accent/50 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary',
                  finDeSemana ? 'bg-muted/30' : 'bg-card',
                  seleccionado && 'relative z-[1] shadow-[inset_0_0_0_2px_var(--color-primary)]',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                    celda.esHoy ? 'bg-primary text-primary-foreground' : 'text-foreground',
                  )}
                >
                  {celda.dia}
                </span>
                {eventos.slice(0, 2).map((evento) => (
                  <span key={evento.id} className={cn('flex min-w-0 gap-1 truncate rounded px-1.5 py-0.5 text-[11px] leading-tight font-medium', tonoDe(evento.tecnicoNombre))}>
                    <b className="shrink-0 font-bold tabular-nums">{evento.hora}</b>
                    <span className="truncate">{nombreCorto(evento.cliente)}</span>
                  </span>
                ))}
                {eventos.length > 2 && <span className="px-1.5 text-[11px] font-semibold text-muted-foreground">+{eventos.length - 2} más</span>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
