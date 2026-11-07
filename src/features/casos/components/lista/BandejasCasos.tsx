import {
  Ban,
  CalendarCheck,
  CalendarClock,
  CircleCheck,
  Clock3,
  Headset,
  Layers,
  Pause,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { CasoLista } from '@/lib/datos-simulados/actions';
import { MetricCard, type AcentoMetrica } from '@/components/ui';
import { BANDEJAS, contadorBandeja } from './bandejas';

const ICONO: Record<string, LucideIcon> = {
  todos: Layers,
  entrega_turno: CalendarClock,
  por_programar: Clock3,
  programado: CalendarCheck,
  en_atencion: Wrench,
  en_espera: Pause,
  pendientes_posventa: Headset,
  cerrado: CircleCheck,
  anulado: Ban,
};

const ACENTO: Record<string, AcentoMetrica> = {
  todos: 'primary',
  entrega_turno: 'chart-2',
  por_programar: 'chart-3',
  programado: 'chart-4',
  en_atencion: 'chart-5',
  en_espera: 'chart-3',
  pendientes_posventa: 'primary',
  cerrado: 'chart-2',
  anulado: 'destructive',
};

export function BandejasCasos({
  casos,
  bandeja,
  onSeleccionar,
}: {
  casos: CasoLista[];
  bandeja: string;
  onSeleccionar: (clave: string) => void;
}) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {BANDEJAS.map((item) => {
        const Icono = ICONO[item.clave] ?? Layers;
        return (
          <MetricCard
            key={item.clave}
            titulo={item.etiqueta}
            valor={contadorBandeja(casos, item.clave)}
            icono={<Icono className="size-5" />}
            acento={ACENTO[item.clave] ?? 'primary'}
            activo={item.clave === bandeja}
            onClick={() => onSeleccionar(item.clave)}
          />
        );
      })}
    </div>
  );
}
