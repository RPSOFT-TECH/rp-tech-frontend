'use client';

import { Button, Card } from '@/components/ui';
import type { AdjuntoFila } from '../../reporte/pasos';
import type { FormularioReporte } from './tipo';

function SelectorArchivo({
  id,
  etiqueta,
  multiple,
  capture,
  accept,
  onArchivos,
}: {
  id: string;
  etiqueta: string;
  multiple?: boolean;
  capture?: boolean;
  accept: string;
  onArchivos: (archivos: File[]) => void;
}) {
  return (
    <>
      <input
        type="file"
        id={id}
        accept={accept}
        multiple={multiple}
        capture={capture ? 'environment' : undefined}
        className="sr-only"
        onChange={(evento) => {
          const archivos = Array.from(evento.target.files || []);
          if (archivos.length) onArchivos(archivos);
        }}
      />
      <label htmlFor={id} className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg text-sm transition-colors min-h-11 text-center">
        {etiqueta}
      </label>
    </>
  );
}

export function PasoFotos({ form }: { form: FormularioReporte }) {
  const { esPasoEditable, guardando, adjuntos, agregarAdjuntoItem, quitarAdjuntoItem, retrocederPaso, avanzarPaso } = form;
  const subir = (tipo: AdjuntoFila['tipo']) => (archivos: File[]) => {
    archivos.forEach((archivo) => agregarAdjuntoItem(tipo, archivo));
  };

  return (
    <Card className="p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">5. Fotos y adjuntos</h3>
      {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Foto de ingreso</label>
          <div className="flex gap-2">
            <SelectorArchivo id="foto-ingreso" etiqueta="Tomar foto" accept="image/*" capture onArchivos={subir('foto_ingreso')} />
            <SelectorArchivo id="foto-ingreso-galeria" etiqueta="Elegir varias" accept="image/*" multiple onArchivos={subir('foto_ingreso')} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Foto de salida</label>
          <div className="flex gap-2">
            <SelectorArchivo id="foto-salida" etiqueta="Tomar foto" accept="image/*" capture onArchivos={subir('foto_salida')} />
            <SelectorArchivo id="foto-salida-galeria" etiqueta="Elegir varias" accept="image/*" multiple onArchivos={subir('foto_salida')} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Otros archivos (videos, documentos)</label>
        <SelectorArchivo id="otros-archivos" etiqueta="Subir archivo" accept="*/*" multiple onArchivos={subir('otro')} />
      </div>
      <div className="space-y-2 mb-4">
        <h4 className="text-xs font-semibold text-muted-foreground">Adjuntos:</h4>
        {adjuntos.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin adjuntos.</p>
        ) : (
          <div className="space-y-1">
            {adjuntos.map((adjunto) => (
              <div key={adjunto.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded p-2">
                {adjunto.tipo === 'foto_ingreso' && <span className="text-primary font-bold">INGRESO</span>}
                {adjunto.tipo === 'foto_salida' && <span className="text-blue-600 font-bold">SALIDA</span>}
                {adjunto.tipo === 'otro' && <span className="text-muted-foreground font-bold">OTRO</span>}
                <span className="flex-1 truncate">{adjunto.nombre}</span>
                <button
                  onClick={() => quitarAdjuntoItem(adjunto.id)}
                  disabled={!esPasoEditable || guardando}
                  className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="min-h-11">Atrás</Button>
        <Button onClick={avanzarPaso} disabled={guardando} className="min-h-11">Siguiente</Button>
      </div>
    </Card>
  );
}
