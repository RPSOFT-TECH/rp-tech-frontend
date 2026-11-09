'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui';

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
  const movio = useRef(false);
  const edita = useRef(false);
  const [modo, setModo] = useState<'ver' | 'firmar'>(firma ? 'ver' : 'firmar');

  useEffect(() => {
    if (edita.current) return;
    setModo(firma ? 'ver' : 'firmar');
  }, [firma]);

  useEffect(() => {
    const canvas = lienzo.current;
    const caja = marco.current;
    if (!canvas || !caja || modo !== 'firmar') return;
    const preparar = () => {
      const rect = canvas.getBoundingClientRect();
      const densidad = window.devicePixelRatio || 1;
      const ancho = Math.max(1, Math.floor(rect.width * densidad));
      const alto = Math.max(1, Math.floor(rect.height * densidad));
      if (canvas.width === ancho && canvas.height === alto) return;
      canvas.width = ancho;
      canvas.height = alto;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(densidad, 0, 0, densidad, 0, 0);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = getComputedStyle(canvas).color;
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
    evento.currentTarget.setPointerCapture(evento.pointerId);
    trazando.current = true;
    movio.current = false;
    ultimo.current = punto(evento);
  };

  const mover = (evento: React.PointerEvent<HTMLCanvasElement>) => {
    if (!trazando.current || !ultimo.current) return;
    const ctx = lienzo.current?.getContext('2d');
    if (!ctx) return;
    const actual = punto(evento);
    const medio = { x: (ultimo.current.x + actual.x) / 2, y: (ultimo.current.y + actual.y) / 2 };
    ctx.beginPath();
    ctx.moveTo(ultimo.current.x, ultimo.current.y);
    ctx.quadraticCurveTo(ultimo.current.x, ultimo.current.y, medio.x, medio.y);
    ctx.stroke();
    ultimo.current = actual;
    movio.current = true;
  };

  const soltar = () => {
    if (!trazando.current) return;
    trazando.current = false;
    ultimo.current = null;
    if (!movio.current || !lienzo.current) return;
    onFirma(lienzo.current.toDataURL('image/png'));
  };

  const volverAFirmar = () => {
    edita.current = true;
    setModo('firmar');
  };

  const borrar = () => {
    edita.current = true;
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
        className="min-h-11 border border-border rounded-lg px-2 py-2 text-sm bg-background"
      />
      {muestraImagen && firma ? (
        <Image src={firma} alt={titulo} width={320} height={144} unoptimized className="h-36 w-full rounded-lg border border-border object-contain bg-card" />
      ) : (
        <div ref={marco} className="h-36 w-full rounded-lg border border-border bg-card">
          <canvas
            ref={lienzo}
            className="h-full w-full touch-none text-foreground"
            onPointerDown={iniciar}
            onPointerMove={mover}
            onPointerUp={soltar}
            onPointerCancel={soltar}
          />
        </div>
      )}
      {editable && (
        <div className="flex flex-wrap gap-2">
          {muestraImagen && (
            <Button type="button" variant="outline" className="min-h-11" onClick={volverAFirmar}>
              Volver a firmar
            </Button>
          )}
          <Button type="button" variant="outline" className="min-h-11" onClick={borrar}>
            Borrar
          </Button>
        </div>
      )}
    </div>
  );
}
