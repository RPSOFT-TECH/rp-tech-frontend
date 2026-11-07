'use client';

import { useEffect, useId, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

function parseIso(iso: string): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!partes) return null;
  return new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
}

function aIso(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function texto(iso: string): string {
  const fecha = parseIso(iso);
  if (!fecha) return '';
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

function mismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function celdasDelMes(mes: Date): Date[] {
  const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const desplazamiento = (inicio.getDay() + 6) % 7;
  const cursor = new Date(inicio);
  cursor.setDate(inicio.getDate() - desplazamiento);
  return Array.from({ length: 42 }, (_, indice) => {
    const dia = new Date(cursor);
    dia.setDate(cursor.getDate() + indice);
    return dia;
  });
}

export function SelectorFecha({
  value,
  onChange,
  label,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  className,
  id,
}: {
  value: string;
  onChange: (valor: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  const generado = useId();
  const campoId = id || generado;
  const [abierto, setAbierto] = useState(false);
  const [mes, setMes] = useState<Date>(() => parseIso(value) ?? new Date());
  const campoRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const hoy = new Date();
  const elegida = parseIso(value);

  function abrir() {
    if (disabled) return;
    const siguiente = parseIso(value) ?? new Date();
    setMes(new Date(siguiente.getFullYear(), siguiente.getMonth(), 1));
    setAbierto((actual) => !actual);
  }

  useEffect(() => {
    if (!abierto) return;
    const medir = () => {
      const caja = campoRef.current?.getBoundingClientRect();
      if (!caja) return;
      const ancho = 232;
      const alto = 268;
      const left = Math.min(Math.max(8, caja.left), window.innerWidth - ancho - 8);
      const cabeAbajo = window.innerHeight - caja.bottom > alto + 12;
      setPos({
        top: cabeAbajo ? caja.bottom + 6 : Math.max(8, caja.top - alto - 6),
        left,
      });
    };
    medir();
    const cerrar = (evento: MouseEvent) => {
      const nodo = evento.target as Node;
      if (campoRef.current?.contains(nodo) || panelRef.current?.contains(nodo)) return;
      setAbierto(false);
    };
    document.addEventListener('mousedown', cerrar);
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', medir, true);
    return () => {
      document.removeEventListener('mousedown', cerrar);
      window.removeEventListener('resize', medir);
      window.removeEventListener('scroll', medir, true);
    };
  }, [abierto]);

  const dias = celdasDelMes(mes);

  return (
    <div className={cn('flex w-full flex-col gap-1', className)}>
      {label ? (
        <label htmlFor={campoId} className="text-xs font-semibold text-muted-foreground">
          {label}
        </label>
      ) : null}
      <div
        ref={campoRef}
        className={cn(
          'flex h-12 items-center gap-2 rounded-xl border bg-card px-3 shadow-xs',
          abierto ? 'border-primary ring-2 ring-primary/20' : 'border-border',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <CalendarDays className="size-4 shrink-0 text-primary" />
        <button
          id={campoId}
          type="button"
          disabled={disabled}
          onClick={abrir}
          className={cn('min-w-0 flex-1 truncate text-left text-sm font-semibold', value ? 'text-foreground' : 'text-muted-foreground')}
        >
          {value ? texto(value) : placeholder}
        </button>
        {value && !disabled ? (
          <button
            type="button"
            aria-label="Quitar fecha"
            onClick={() => onChange('')}
            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
      {abierto && pos
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={label || 'Seleccionar fecha'}
              style={{ top: pos.top, left: pos.left, width: 232 }}
              className="fixed z-[80] rounded-xl border border-border bg-card p-2 shadow-xl"
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Mes anterior"
                  onClick={() => setMes((actual) => new Date(actual.getFullYear(), actual.getMonth() - 1, 1))}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-xs font-bold text-foreground">
                  {MESES[mes.getMonth()]} {mes.getFullYear()}
                </span>
                <button
                  type="button"
                  aria-label="Mes siguiente"
                  onClick={() => setMes((actual) => new Date(actual.getFullYear(), actual.getMonth() + 1, 1))}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <div className="mb-1 grid grid-cols-7 text-center text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                {DIAS.map((dia) => (
                  <span key={dia}>{dia}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {dias.map((dia) => {
                  const enMes = dia.getMonth() === mes.getMonth();
                  const seleccionado = Boolean(elegida && mismoDia(dia, elegida));
                  const esHoy = mismoDia(dia, hoy);
                  return (
                    <button
                      key={aIso(dia)}
                      type="button"
                      disabled={!enMes}
                      onClick={() => {
                        onChange(aIso(dia));
                        setAbierto(false);
                      }}
                      className={cn(
                        'flex h-7 items-center justify-center rounded-md text-[11px] font-medium',
                        !enMes && 'cursor-default text-muted-foreground/30',
                        enMes && seleccionado && 'bg-primary font-bold text-primary-foreground',
                        enMes && !seleccionado && esHoy && 'border border-primary font-bold text-primary',
                        enMes && !seleccionado && !esHoy && 'text-foreground hover:bg-primary/15 hover:text-primary',
                      )}
                    >
                      {dia.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
