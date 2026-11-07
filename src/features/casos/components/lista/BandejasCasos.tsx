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
    <div className="mb-4 flex flex-wrap gap-2">
      {BANDEJAS.map((item) => {
        const activa = item.clave === bandeja;
        return (
          <button
            key={item.clave}
            type="button"
            onClick={() => onSeleccionar(item.clave)}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
              activa
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            {item.etiqueta}
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${activa ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
              {contadorBandeja(casos, item.clave)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
