import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { celdasDelMes, moverMes, nombreMes } from '../utils/calendario';
import { DiaAgenda } from './DiaAgenda';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface CuadriculaAgendaProps {
  fecha: string;
  hoy: string;
  conteos: Record<string, number>;
  onIr: (iso: string) => void;
}

export function CuadriculaAgenda({ fecha, hoy, conteos, onIr }: CuadriculaAgendaProps) {
  const [anio, mes] = fecha.split('-').map(Number);
  const celdas = celdasDelMes(anio, mes, hoy);

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Mes anterior"
            onClick={() => onIr(moverMes(fecha, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Mes siguiente"
            onClick={() => onIr(moverMes(fecha, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="min-w-0 text-center">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">{nombreMes(anio, mes)}</h2>
          <p className="text-sm text-muted-foreground">{anio}</p>
        </div>
        <Button type="button" size="sm" disabled={fecha === hoy} onClick={() => onIr(hoy)}>
          Hoy
        </Button>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {DIAS.map((dia) => (
          <div
            key={dia}
            className="py-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs"
          >
            {dia}
          </div>
        ))}
      </div>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="grid h-full min-w-0 grid-cols-7 gap-1.5 sm:gap-2 [grid-auto-rows:minmax(60px,1fr)] sm:[grid-auto-rows:minmax(72px,1fr)]">
          {celdas.map((celda, indice) => (
            <DiaAgenda
              key={celda.perteneceMes ? celda.iso : `vacio-${indice}`}
              dia={celda.dia}
              perteneceMes={celda.perteneceMes}
              esHoy={celda.esHoy}
              seleccionado={celda.iso === fecha}
              visitas={conteos[celda.iso] ?? 0}
              onElegir={() => onIr(celda.iso)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
