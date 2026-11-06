import type { CasoLista } from '@/lib/datos-simulados/actions';
import { BANDEJAS, contadorBandeja } from './bandejas';

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
    <div className="flex flex-wrap gap-2 mb-4">
      {BANDEJAS.map((item) => {
        const activa = item.clave === bandeja;
        return (
          <button
            key={item.clave}
            onClick={() => onSeleccionar(item.clave)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors min-h-9 ${
              activa
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-muted'
            }`}
          >
            {item.etiqueta}
            <span
              className={`bg-current/20 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activa ? 'text-primary-foreground' : 'text-current'
              }`}
            >
              {contadorBandeja(casos, item.clave)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
