'use client';

import { Textarea } from '@/components/ui/textarea';
import { BloqueAdjuntos } from './PasoFotos';
import { CampoReporte, SeccionReporte } from './SeccionReporte';
import type { FormularioReporte } from './tipo';

const MINIMO_PROCEDIMIENTO = 20;

export function PasoDesarrollo({ form }: { form: FormularioReporte }) {
  const { esPasoEditable, procedimiento, setProcedimiento, conclusion, setConclusion, recomendaciones, setRecomendaciones } = form;
  const bloqueado = !esPasoEditable;
  const largo = procedimiento.trim().length;

  return (
    <>
      <SeccionReporte titulo="Trabajo realizado" ayuda="Puedes dictar con el micrófono del teclado.">
        <CampoReporte etiqueta={<>Procedimiento<span aria-hidden className="text-destructive">*</span></>} htmlFor="procedimiento">
          <Textarea
            id="procedimiento"
            value={procedimiento}
            onChange={(e) => setProcedimiento(e.target.value)}
            rows={5}
            disabled={bloqueado}
            placeholder="Qué revisaste, qué cambiaste y qué pruebas hiciste."
          />
          {largo > 0 && largo < MINIMO_PROCEDIMIENTO && (
            <span className="text-xs text-amber-700 dark:text-amber-400">
              Escribe al menos {MINIMO_PROCEDIMIENTO} caracteres ({largo}/{MINIMO_PROCEDIMIENTO}).
            </span>
          )}
        </CampoReporte>
        <CampoReporte etiqueta={<>Conclusión<span aria-hidden className="text-destructive">*</span></>} htmlFor="conclusion">
          <Textarea id="conclusion" value={conclusion} onChange={(e) => setConclusion(e.target.value)} rows={2} disabled={bloqueado} placeholder="Ej.: falla por damper obstruido, máquina operativa." />
        </CampoReporte>
        <CampoReporte etiqueta={<>Recomendaciones <span className="font-normal text-muted-foreground">(opcional)</span></>} htmlFor="recomendaciones">
          <Textarea id="recomendaciones" value={recomendaciones} onChange={(e) => setRecomendaciones(e.target.value)} rows={2} disabled={bloqueado} placeholder="Ej.: mantenimiento cada 6 meses." />
        </CampoReporte>
      </SeccionReporte>

      <BloqueAdjuntos form={form} tipo="otro" titulo="Otros archivos" ayuda="Videos de la falla o documentos." obligatorio={false} />
    </>
  );
}
