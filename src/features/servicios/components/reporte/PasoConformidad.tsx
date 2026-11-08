'use client';

import { Button, Card } from '@/components/ui';
import type { FormularioReporte } from './tipo';
import { LienzoFirma } from './LienzoFirma';

export function PasoConformidad({ form }: { form: FormularioReporte }) {
  const {
    esPasoEditable,
    guardando,
    textoConformidad,
    nombreOperadorFirma,
    setNombreOperadorFirma,
    firmaOperador,
    setFirmaOperador,
    nombreClienteFirma,
    setNombreClienteFirma,
    firmaCliente,
    setFirmaCliente,
    guardarFirmas,
    retrocederPaso,
    avanzarPaso,
  } = form;

  return (
    <Card className="p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">6. Conformidad</h3>
      {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}
      <div className="mb-4">
        <label className="text-xs font-semibold text-muted-foreground block mb-1">Texto de conformidad</label>
        <textarea value={textoConformidad} readOnly rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <LienzoFirma
          titulo="Firma del operador"
          nombre={nombreOperadorFirma}
          onNombre={setNombreOperadorFirma}
          firma={firmaOperador}
          editable={esPasoEditable && !guardando}
          onFirma={(imagen) => {
            setFirmaOperador(imagen);
            void guardarFirmas(imagen, firmaCliente);
          }}
          onBorrar={() => {
            setFirmaOperador(null);
            void guardarFirmas(null, firmaCliente);
          }}
        />
        <LienzoFirma
          titulo="Firma del cliente"
          nombre={nombreClienteFirma}
          onNombre={setNombreClienteFirma}
          firma={firmaCliente}
          editable={esPasoEditable && !guardando}
          onFirma={(imagen) => {
            setFirmaCliente(imagen);
            void guardarFirmas(firmaOperador, imagen);
          }}
          onBorrar={() => {
            setFirmaCliente(null);
            void guardarFirmas(firmaOperador, null);
          }}
        />
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="min-h-11">Atrás</Button>
        <Button onClick={avanzarPaso} disabled={guardando} className="min-h-11">Siguiente</Button>
      </div>
    </Card>
  );
}
