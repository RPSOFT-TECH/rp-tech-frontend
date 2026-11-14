'use client';

import { CircleAlert, CircleCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Segmentado } from '@/components/ui/segmentado';
import { fechaHoraLima, pasoDeFalta } from '../../reporte/pasos';
import { BloqueAdjuntos } from './PasoFotos';
import { CampoReporte, SeccionReporte } from './SeccionReporte';
import type { FormularioReporte } from './tipo';

export function PasoCierre({ form }: { form: FormularioReporte }) {
  const {
    esPasoEditable,
    remota,
    resultado,
    setResultado,
    requerimiento,
    setRequerimiento,
    horaSalida,
    setHoraSalida,
    calcularFaltas,
    irAlPaso,
    reporteCerrado,
  } = form;
  const bloqueado = !esPasoEditable;
  const faltas = calcularFaltas();

  return (
    <>
      <BloqueAdjuntos
        form={form}
        tipo="foto_salida"
        titulo="Foto de salida"
        ayuda="Cómo queda la máquina al irte."
        obligatorio={!remota}
      />

      <SeccionReporte titulo="Cierre de la visita">
        <CampoReporte etiqueta="Hora de salida" htmlFor="hora_salida">
          <Input id="hora_salida" type="time" value={horaSalida} onChange={(e) => setHoraSalida(e.target.value)} disabled={bloqueado} />
        </CampoReporte>
        <CampoReporte etiqueta={<>Resultado<span aria-hidden className="text-destructive">*</span></>}>
          <Segmentado
            tamano="grande"
            disabled={bloqueado}
            value={resultado}
            onChange={setResultado}
            opciones={[
              { value: 'resuelto', label: 'Resuelto', tono: 'ok' },
              { value: 'pendiente', label: 'Queda pendiente', tono: 'alerta' },
            ]}
          />
        </CampoReporte>
        {resultado === 'pendiente' && (
          <CampoReporte etiqueta={<>¿Qué se requiere?<span aria-hidden className="text-destructive">*</span></>} htmlFor="requerimiento">
            <Input
              id="requerimiento"
              value={requerimiento}
              onChange={(e) => setRequerimiento(e.target.value)}
              disabled={bloqueado}
              placeholder="Ej.: cambio de cabezal, volver con repuesto"
            />
          </CampoReporte>
        )}
      </SeccionReporte>

      {!reporteCerrado && (
        <SeccionReporte titulo={faltas.length ? 'Para cerrar falta' : 'Todo listo para cerrar'}>
          {faltas.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <CircleCheck className="size-5" /> Al cerrar se envía el PDF al cliente.
            </p>
          ) : (
            <ul className="space-y-2">
              {faltas.map((falta) => {
                const destino = pasoDeFalta(falta);
                return (
                  <li key={falta} className="flex items-start gap-2 text-sm">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <span className="flex-1">
                      {falta}
                      {destino !== 6 && (
                        <button type="button" onClick={() => irAlPaso(destino)} className="ml-1.5 font-semibold text-primary hover:underline">
                          Ir al paso {destino}
                        </button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </SeccionReporte>
      )}
    </>
  );
}

export function AvisoCierre({ form }: { form: FormularioReporte }) {
  const { reporte, reporteCerrado } = form;
  if (!reporte || !reporteCerrado) return null;
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Reporte cerrado</p>
      <p className="text-sm text-emerald-900/80 dark:text-emerald-200/80">
        Ya no se puede modificar{reporte.cerrado_en ? ` · cerrado el ${fechaHoraLima(reporte.cerrado_en)}` : ''}
      </p>
    </div>
  );
}
