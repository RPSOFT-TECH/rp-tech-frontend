'use client';

import { BloqueAdjuntos } from './PasoFotos';
import { SeccionReporte } from './SeccionReporte';
import type { FormularioReporte } from './tipo';

export function PasoLlegada({ form }: { form: FormularioReporte }) {
  const { reporte, remota } = form;
  if (!reporte) return null;
  const llego = Boolean(reporte.hora_llegada);

  return (
    <>
      <SeccionReporte>
        {llego ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Hora de llegada</p>
              <p className="font-mono text-3xl font-bold tracking-tight text-foreground tabular-nums">{reporte.hora_llegada?.slice(0, 5)}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Registrada
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Aún no registras tu llegada</p>
            <p className="text-sm text-muted-foreground">
              Al llegar donde el cliente pulsa <b className="text-foreground">Registrar llegada</b>. Se guarda la hora de Lima y se crea el número de reporte.
            </p>
          </div>
        )}
      </SeccionReporte>

      {llego && (
        <BloqueAdjuntos
          form={form}
          tipo="foto_ingreso"
          titulo="Foto de ingreso"
          ayuda="Cómo encontraste la máquina al llegar."
          obligatorio={!remota}
        />
      )}
    </>
  );
}
