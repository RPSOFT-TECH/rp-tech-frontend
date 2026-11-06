'use client';

import { Button, Card } from '@/components/ui';
import type { FormularioReporte } from './tipo';

export function PasoDesarrollo({ form }: { form: FormularioReporte }) {
  const {
    esPasoEditable,
    guardando,
    procedimiento,
    setProcedimiento,
    conclusion,
    setConclusion,
    recomendaciones,
    setRecomendaciones,
    retrocederPaso,
    guardarDesarrollo,
    avanzarPaso,
  } = form;

  return (
    <Card className="p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">3. Desarrollo del servicio</h3>
      {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}
      <p className="text-xs text-muted-foreground mb-3">Puedes dictar con el micrófono del teclado.</p>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Procedimiento (obligatorio)</label>
        <textarea
          value={procedimiento}
          onChange={(evento) => setProcedimiento(evento.target.value)}
          rows={4}
          disabled={!esPasoEditable}
          className="min-h-[100px] border border-border rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Conclusión (obligatorio)</label>
        <textarea
          value={conclusion}
          onChange={(evento) => setConclusion(evento.target.value)}
          rows={3}
          disabled={!esPasoEditable}
          className="min-h-[80px] border border-border rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Recomendaciones</label>
        <textarea
          value={recomendaciones}
          onChange={(evento) => setRecomendaciones(evento.target.value)}
          rows={3}
          disabled={!esPasoEditable}
          className="min-h-[80px] border border-border rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="min-h-11">
          Atrás
        </Button>
        <Button
          onClick={() => {
            guardarDesarrollo();
            avanzarPaso();
          }}
          disabled={!esPasoEditable || guardando}
          className="min-h-11"
        >
          {guardando ? 'Guardando...' : 'Siguiente'}
        </Button>
      </div>
    </Card>
  );
}
