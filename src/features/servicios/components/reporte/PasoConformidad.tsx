'use client';

import { Button, Card } from '@/components/ui';
import type { FormularioReporte } from './tipo';

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
        <Firma
          titulo="Firma operador del equipo"
          id="firma-operador"
          nombre={nombreOperadorFirma}
          onNombre={setNombreOperadorFirma}
          firma={firmaOperador}
          editable={esPasoEditable}
          onArchivo={(archivo) => {
            setFirmaOperador(URL.createObjectURL(archivo));
            guardarFirmas();
          }}
          onBorrar={() => {
            setFirmaOperador(null);
            guardarFirmas();
          }}
        />
        <Firma
          titulo="Firma cliente"
          id="firma-cliente"
          nombre={nombreClienteFirma}
          onNombre={setNombreClienteFirma}
          firma={firmaCliente}
          editable={esPasoEditable}
          onArchivo={(archivo) => {
            setFirmaCliente(URL.createObjectURL(archivo));
            guardarFirmas();
          }}
          onBorrar={() => {
            setFirmaCliente(null);
            guardarFirmas();
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

function Firma({
  titulo,
  id,
  nombre,
  onNombre,
  firma,
  editable,
  onArchivo,
  onBorrar,
}: {
  titulo: string;
  id: string;
  nombre: string;
  onNombre: (valor: string) => void;
  firma: string | null;
  editable: boolean;
  onArchivo: (archivo: File) => void;
  onBorrar: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-muted-foreground">{titulo}</label>
      <input
        value={nombre}
        onChange={(evento) => onNombre(evento.target.value)}
        placeholder="Nombre"
        disabled={!editable}
        className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
      />
      <div className="flex gap-2">
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          id={id}
          onChange={(evento) => {
            const archivo = evento.target.files?.[0];
            if (archivo) onArchivo(archivo);
          }}
        />
        <label htmlFor={id} className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg text-sm transition-colors min-h-11 text-center">
          {firma ? 'Cambiar firma' : 'Guardar firma'}
        </label>
        {firma && (
          <button onClick={onBorrar} className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded">
            Borrar
          </button>
        )}
      </div>
    </div>
  );
}
