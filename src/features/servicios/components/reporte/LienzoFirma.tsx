'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { Check, PenTool, RotateCcw } from 'lucide-react';

interface LienzoFirmaProps {
  titulo: string;
  nombre: string;
  onNombre: (valor: string) => void;
  firma: string | null;
  editable: boolean;
  onFirma: (imagen: string) => void;
  onBorrar: () => void;
}

export function LienzoFirma({ titulo, nombre, onNombre, firma, editable, onFirma, onBorrar }: LienzoFirmaProps) {
  const marco = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const trazando = useRef(false);
  const ultimo = useRef<{ x: number; y: number } | null>(null);
  const edita = useRef(false);
  const [hayTrazos, setHayTrazos] = useState(false);
  const [modo, setModo] = useState<'ver' | 'firmar'>(firma ? 'ver' : 'firmar');

  useEffect(() => {
    if (edita.current) return;
    setModo(firma ? 'ver' : 'firmar');
  }, [firma]);

  const obtenerColorTrazo = () => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return '#ffffff';
    }
    return '#0f172a';
  };

  const aplicarEstiloTrazo = (ctx: CanvasRenderingContext2D) => {
    const color = obtenerColorTrazo();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  useEffect(() => {
    const canvas = lienzo.current;
    const caja = marco.current;
    if (!canvas || !caja || modo !== 'firmar') return;

    const preparar = () => {
      const rect = caja.getBoundingClientRect();
      const densidad = window.devicePixelRatio || 1;
      const ancho = Math.max(1, Math.floor(rect.width * densidad));
      const alto = Math.max(1, Math.floor(rect.height * densidad));
      if (canvas.width === ancho && canvas.height === alto) return;
      canvas.width = ancho;
      canvas.height = alto;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(densidad, 0, 0, densidad, 0, 0);
      aplicarEstiloTrazo(ctx);
    };

    preparar();
    const observador = new ResizeObserver(preparar);
    observador.observe(caja);
    return () => observador.disconnect();
  }, [modo]);

  const punto = (evento: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = evento.currentTarget.getBoundingClientRect();
    return { x: evento.clientX - rect.left, y: evento.clientY - rect.top };
  };

  const iniciar = (evento: React.PointerEvent<HTMLCanvasElement>) => {
    if (!editable) return;
    try {
      evento.currentTarget.setPointerCapture(evento.pointerId);
    } catch {
      // ignore
    }
    trazando.current = true;
    const p = punto(evento);
    ultimo.current = p;

    const ctx = lienzo.current?.getContext('2d');
    if (!ctx) return;
    aplicarEstiloTrazo(ctx);

    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    setHayTrazos(true);
  };

  const mover = (evento: React.PointerEvent<HTMLCanvasElement>) => {
    if (!trazando.current || !ultimo.current) return;
    const ctx = lienzo.current?.getContext('2d');
    if (!ctx) return;
    aplicarEstiloTrazo(ctx);

    const actual = punto(evento);
    ctx.beginPath();
    ctx.moveTo(ultimo.current.x, ultimo.current.y);
    ctx.lineTo(actual.x, actual.y);
    ctx.stroke();

    ultimo.current = actual;
    setHayTrazos(true);
  };

  const soltar = (evento?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!trazando.current) return;
    trazando.current = false;
    ultimo.current = null;
    if (evento) {
      try {
        evento.currentTarget.releasePointerCapture(evento.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const guardarFirma = () => {
    const canvas = lienzo.current;
    if (!canvas || !hayTrazos) return;
    const dataUrl = canvas.toDataURL('image/png');
    edita.current = false;
    setModo('ver');
    onFirma(dataUrl);
  };

  const limpiar = () => {
    const canvas = lienzo.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHayTrazos(false);
  };

  const volverAFirmar = () => {
    edita.current = true;
    setModo('firmar');
    setHayTrazos(false);
    setTimeout(() => {
      limpiar();
    }, 50);
  };

  const borrar = () => {
    edita.current = true;
    limpiar();
    setModo('firmar');
    onBorrar();
  };

  const muestraImagen = Boolean(firma) && (modo === 'ver' || !editable);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-muted-foreground" htmlFor={`nombre-${titulo}`}>
        {titulo}
      </label>
      <input
        id={`nombre-${titulo}`}
        value={nombre}
        onChange={(evento) => onNombre(evento.target.value)}
        placeholder="Nombre"
        disabled={!editable}
        className="min-h-11 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
      />
      {muestraImagen && firma ? (
        <div className="relative h-36 w-full rounded-lg border border-border bg-card flex items-center justify-center p-2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={firma}
            alt={titulo}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div ref={marco} className="relative h-36 w-full rounded-lg border border-border bg-card overflow-hidden">
          <canvas
            ref={lienzo}
            className="h-full w-full touch-none cursor-crosshair text-foreground"
            onPointerDown={iniciar}
            onPointerMove={mover}
            onPointerUp={soltar}
            onPointerCancel={soltar}
          />
          {!hayTrazos && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/50 select-none">
              Dibuja la firma aquí
            </div>
          )}
        </div>
      )}
      {editable && (
        <div className="flex flex-wrap gap-2 pt-1">
          {muestraImagen ? (
            <>
              <Button type="button" variant="outline" className="min-h-11 flex items-center gap-1.5" onClick={volverAFirmar}>
                <PenTool className="size-4" />
                Volver a firmar
              </Button>
              <Button type="button" variant="outline" className="min-h-11 text-destructive hover:bg-destructive/10" onClick={borrar}>
                Borrar
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                className="min-h-11 flex items-center gap-1.5"
                onClick={guardarFirma}
                disabled={!hayTrazos}
              >
                <Check className="size-4" />
                Guardar firma
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 flex items-center gap-1.5"
                onClick={limpiar}
                disabled={!hayTrazos}
              >
                <RotateCcw className="size-4" />
                Limpiar trazo
              </Button>
              {Boolean(firma) && (
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11"
                  onClick={() => {
                    edita.current = false;
                    setModo('ver');
                  }}
                >
                  Cancelar
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
