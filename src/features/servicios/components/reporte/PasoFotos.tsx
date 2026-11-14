'use client';

import { Camera, ExternalLink, Images, Loader2, Paperclip, X } from 'lucide-react';
import type { AdjuntoFila } from '../../reporte/pasos';
import { SeccionReporte } from './SeccionReporte';
import type { FormularioReporte } from './tipo';

function SelectorArchivo({
  id,
  etiqueta,
  icono: Icono,
  multiple,
  capture,
  accept,
  deshabilitado,
  principal,
  onArchivos,
}: {
  id: string;
  etiqueta: string;
  icono?: React.ComponentType<{ className?: string }>;
  multiple?: boolean;
  capture?: boolean;
  accept: string;
  deshabilitado?: boolean;
  principal?: boolean;
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
        className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors select-none active:scale-[0.98] ${
          principal
            ? 'bg-primary text-primary-foreground hover:bg-primary/85'
            : 'border border-input bg-card text-foreground hover:bg-muted'
        } ${deshabilitado ? 'pointer-events-none opacity-50' : ''}`}
      >
        {Icono && <Icono className="size-4 shrink-0" />}
        <span>{etiqueta}</span>
      </label>
    </>
  );
}

const esImagen = (adjunto: AdjuntoFila) =>
  adjunto.tipo === 'foto_ingreso' || adjunto.tipo === 'foto_salida' || /\.(jpe?g|png|webp|gif|avif|heic)$/i.test(adjunto.nombre);

// Fotos de ingreso (Llegada), de salida (Cierre) u otros archivos (Desarrollo).
export function BloqueAdjuntos({
  form,
  tipo,
  titulo,
  ayuda,
  obligatorio,
}: {
  form: FormularioReporte;
  tipo: AdjuntoFila['tipo'];
  titulo: string;
  ayuda: string;
  obligatorio: boolean;
}) {
  const { esPasoEditable, guardando, adjuntos, agregarAdjuntoItem, quitarAdjuntoItem } = form;
  const lista = adjuntos.filter((a) => a.tipo === tipo);
  const esFoto = tipo !== 'otro';
  const subir = (archivos: File[]) => archivos.forEach((archivo) => void agregarAdjuntoItem(tipo, archivo));

  const estado = obligatorio ? (
    lista.length > 0 ? (
      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        {lista.length} {lista.length === 1 ? 'foto' : 'fotos'}
      </span>
    ) : (
      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
        Falta
      </span>
    )
  ) : undefined;

  return (
    <SeccionReporte titulo={titulo} ayuda={ayuda} opcional={!obligatorio} extra={estado}>
      {lista.length > 0 && (
        <div className={esFoto ? 'grid grid-cols-3 gap-2' : 'space-y-2'}>
          {lista.map((adjunto) => {
            const subiendo = adjunto.id.startsWith('temp-');
            const quitar = (
              <button
                type="button"
                onClick={() => quitarAdjuntoItem(adjunto.id)}
                disabled={!esPasoEditable || guardando || subiendo}
                aria-label={`Quitar ${adjunto.nombre}`}
                className="inline-flex size-8 items-center justify-center rounded-md bg-card/90 text-muted-foreground shadow-sm hover:text-destructive disabled:hidden"
              >
                <X className="size-4" />
              </button>
            );
            if (esFoto && esImagen(adjunto) && adjunto.url) {
              return (
                <div key={adjunto.id} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={adjunto.url} alt={adjunto.nombre} className="size-full object-cover" />
                  <div className="absolute top-1 right-1">{quitar}</div>
                  {subiendo && (
                    <div className="absolute inset-0 grid place-items-center bg-background/60">
                      <Loader2 className="size-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div key={adjunto.id} className="flex items-center gap-3 rounded-lg border border-border p-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                  {subiendo ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm" title={adjunto.nombre}>
                  {adjunto.nombre}
                </span>
                {adjunto.url && !subiendo && (
                  <a href={adjunto.url} target="_blank" rel="noreferrer" aria-label="Ver archivo" className="p-1.5 text-muted-foreground hover:text-foreground">
                    <ExternalLink className="size-4" />
                  </a>
                )}
                {quitar}
              </div>
            );
          })}
        </div>
      )}

      {esPasoEditable && (
        <div className="flex gap-2">
          {esFoto ? (
            <>
              <SelectorArchivo
                id={`${tipo}-camara`}
                etiqueta={lista.length ? 'Tomar otra' : 'Tomar foto'}
                icono={Camera}
                accept="image/*"
                capture
                principal={lista.length === 0}
                deshabilitado={guardando}
                onArchivos={subir}
              />
              <SelectorArchivo
                id={`${tipo}-galeria`}
                etiqueta="Galería"
                icono={Images}
                accept="image/*"
                multiple
                deshabilitado={guardando}
                onArchivos={subir}
              />
            </>
          ) : (
            <SelectorArchivo
              id={`${tipo}-archivo`}
              etiqueta="Subir archivo"
              icono={Paperclip}
              accept="*/*"
              multiple
              deshabilitado={guardando}
              onArchivos={subir}
            />
          )}
        </div>
      )}
      {!esPasoEditable && lista.length === 0 && <p className="text-sm text-muted-foreground">Sin archivos.</p>}
    </SeccionReporte>
  );
}
