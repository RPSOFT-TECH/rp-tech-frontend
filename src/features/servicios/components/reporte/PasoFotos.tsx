'use client';

import { Button, Card, Badge } from '@/components/ui';
import { Camera, Images, Paperclip, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import type { AdjuntoFila } from '../../reporte/pasos';
import type { FormularioReporte } from './tipo';

function SelectorArchivo({
  id,
  etiqueta,
  icono: Icono,
  multiple,
  capture,
  accept,
  deshabilitado,
  onArchivos,
}: {
  id: string;
  etiqueta: string;
  icono?: React.ComponentType<{ className?: string }>;
  multiple?: boolean;
  capture?: boolean;
  accept: string;
  deshabilitado?: boolean;
  onArchivos: (archivos: File[]) => void;
}) {
  return (
    <>
      <input
        type="file"
        id={id}
        accept={accept}
        multiple={multiple}
        disabled={deshabilitado}
        capture={capture ? 'environment' : undefined}
        className="sr-only"
        onChange={(evento) => {
          const archivos = Array.from(evento.target.files || []);
          if (archivos.length) onArchivos(archivos);
          evento.target.value = '';
        }}
      />
      <label
        htmlFor={id}
        className={`flex-1 rounded-xl border border-border/80 bg-muted/60 hover:bg-muted font-medium py-3 px-3 text-sm transition-all min-h-11 flex items-center justify-center gap-2 cursor-pointer select-none text-foreground active:scale-[0.98] ${
          deshabilitado ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        {Icono && <Icono className="size-4 shrink-0 text-muted-foreground" />}
        <span>{etiqueta}</span>
      </label>
    </>
  );
}

export function PasoFotos({ form }: { form: FormularioReporte }) {
  const { esPasoEditable, guardando, adjuntos, agregarAdjuntoItem, quitarAdjuntoItem, retrocederPaso, avanzarPaso } = form;

  const subir = (tipo: AdjuntoFila['tipo']) => (archivos: File[]) => {
    archivos.forEach((archivo) => void agregarAdjuntoItem(tipo, archivo));
  };

  const esImagen = (adjunto: AdjuntoFila) =>
    adjunto.tipo === 'foto_ingreso' ||
    adjunto.tipo === 'foto_salida' ||
    /\.(jpe?g|png|webp|gif|avif)$/i.test(adjunto.nombre);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">5. Fotos y adjuntos</h3>
        {!esPasoEditable && <Badge variant="outline" className="text-xs">Modo lectura</Badge>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card/60 p-3.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
            <span>Foto de ingreso</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              {adjuntos.filter((a) => a.tipo === 'foto_ingreso').length} subida(s)
            </span>
          </label>
          <div className="flex gap-2">
            <SelectorArchivo
              id="foto-ingreso"
              etiqueta="Tomar foto"
              icono={Camera}
              accept="image/*"
              capture
              deshabilitado={!esPasoEditable}
              onArchivos={subir('foto_ingreso')}
            />
            <SelectorArchivo
              id="foto-ingreso-galeria"
              etiqueta="Elegir varias"
              icono={Images}
              accept="image/*"
              multiple
              deshabilitado={!esPasoEditable}
              onArchivos={subir('foto_ingreso')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card/60 p-3.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
            <span>Foto de salida</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              {adjuntos.filter((a) => a.tipo === 'foto_salida').length} subida(s)
            </span>
          </label>
          <div className="flex gap-2">
            <SelectorArchivo
              id="foto-salida"
              etiqueta="Tomar foto"
              icono={Camera}
              accept="image/*"
              capture
              deshabilitado={!esPasoEditable}
              onArchivos={subir('foto_salida')}
            />
            <SelectorArchivo
              id="foto-salida-galeria"
              etiqueta="Elegir varias"
              icono={Images}
              accept="image/*"
              multiple
              deshabilitado={!esPasoEditable}
              onArchivos={subir('foto_salida')}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6 rounded-xl border border-border/50 bg-card/60 p-3.5">
        <label className="text-xs font-semibold text-muted-foreground">Otros archivos (videos, documentos)</label>
        <SelectorArchivo
          id="otros-archivos"
          etiqueta="Subir archivo"
          icono={Paperclip}
          accept="*/*"
          multiple
          deshabilitado={!esPasoEditable}
          onArchivos={subir('otro')}
        />
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Adjuntos ({adjuntos.length})
          </h4>
        </div>

        {adjuntos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
            No se han subido fotos ni archivos para este servicio.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {adjuntos.map((adjunto) => {
              const estaSubiendo = adjunto.id.startsWith('temp-');
              const esImg = esImagen(adjunto);

              return (
                <div
                  key={adjunto.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-2.5 transition-all hover:border-border"
                >
                  {esImg && adjunto.url ? (
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={adjunto.url}
                        alt={adjunto.nombre}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                      <Paperclip className="size-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {adjunto.tipo === 'foto_ingreso' && (
                        <span className="text-[10px] font-bold tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          INGRESO
                        </span>
                      )}
                      {adjunto.tipo === 'foto_salida' && (
                        <span className="text-[10px] font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          SALIDA
                        </span>
                      )}
                      {adjunto.tipo === 'otro' && (
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          OTRO
                        </span>
                      )}
                      {estaSubiendo && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          <Loader2 className="size-2.5 animate-spin" />
                          Subiendo...
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate" title={adjunto.nombre}>
                      {adjunto.nombre}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {adjunto.url && !estaSubiendo && (
                      <a
                        href={adjunto.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Ver archivo"
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => quitarAdjuntoItem(adjunto.id)}
                      disabled={!esPasoEditable || guardando}
                      title="Eliminar"
                      className="p-1.5 text-destructive/80 hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="min-h-11">
          Atrás
        </Button>
        <Button onClick={avanzarPaso} disabled={guardando} className="min-h-11">
          Siguiente
        </Button>
      </div>
    </Card>
  );
}
