'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DismissableLayerBranch } from '@radix-ui/react-dismissable-layer';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OpcionSelect {
  value: string;
  label: string;
}

interface MenuPos {
  top: number;
  left: number;
  width: number;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  label,
  disabled = false,
  className,
  id,
  variante = 'campo',
  menuTitulo,
}: {
  value: string;
  onChange: (valor: string) => void;
  options: OpcionSelect[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  variante?: 'campo' | 'columna';
  menuTitulo?: string;
}) {
  const generado = useId();
  const campoId = id || generado;
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [pos, setPos] = useState<MenuPos | null>(null);
  const anclaRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const elegido = options.find((opcion) => opcion.value === value);
  const activo = value !== '' && value !== 'todos';
  const visible = busqueda.trim()
    ? options.filter((opcion) => opcion.label.toLowerCase().includes(busqueda.trim().toLowerCase()))
    : options;
  const conBusqueda = options.length > 8;

  useLayoutEffect(() => {
    if (!abierto) return;
    const medir = () => {
      const caja = anclaRef.current?.getBoundingClientRect();
      if (!caja) return;
      const ancho = variante === 'columna' ? 200 : Math.max(caja.width, 220);
      const left = Math.min(Math.max(8, variante === 'columna' ? caja.left - 24 : caja.left), window.innerWidth - ancho - 8);
      const abajo = window.innerHeight - caja.bottom;
      const alto = 280;
      const top = abajo > 160 || abajo >= caja.top ? caja.bottom + 6 : Math.max(8, caja.top - alto - 6);
      setPos({ top, left, width: ancho });
    };
    medir();
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', medir, true);
    return () => {
      window.removeEventListener('resize', medir);
      window.removeEventListener('scroll', medir, true);
    };
  }, [abierto, variante]);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = (evento: MouseEvent) => {
      const nodo = evento.target as Node;
      if (anclaRef.current?.contains(nodo) || menuRef.current?.contains(nodo)) return;
      setAbierto(false);
    };
    const tecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('mousedown', cerrar);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('mousedown', cerrar);
      document.removeEventListener('keydown', tecla);
    };
  }, [abierto]);

  function alternar() {
    if (disabled) return;
    setBusqueda('');
    setAbierto((actual) => !actual);
  }

  function elegir(siguiente: string) {
    onChange(siguiente);
    setAbierto(false);
    setBusqueda('');
  }

  const menu = abierto && pos
    ? createPortal(
        <DismissableLayerBranch
          ref={menuRef}
          role="listbox"
          data-custom-select="true"
          onPointerDown={(e) => e.stopPropagation()}
          aria-labelledby={campoId}
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          className="fixed z-[80] pointer-events-auto overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl"
        >
          {menuTitulo ? (
            <p className="px-2.5 py-1.5 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">{menuTitulo}</p>
          ) : null}
          {conBusqueda ? (
            <div className="relative mb-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar"
                className="h-9 w-full rounded-lg border border-border bg-background pr-2 pl-8 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
          ) : null}
          <div className="max-h-60 space-y-0.5 overflow-y-auto">
            {visible.length === 0 ? (
              <p className="px-2.5 py-3 text-xs text-muted-foreground">Sin resultados</p>
            ) : (
              visible.map((opcion) => {
                const marcada = opcion.value === value;
                return (
                  <button
                    key={opcion.value || 'vacio'}
                    type="button"
                    role="option"
                    aria-selected={marcada}
                    onClick={() => elegir(opcion.value)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[13px]',
                      marcada
                        ? 'bg-primary font-semibold text-primary-foreground'
                        : 'text-foreground hover:bg-primary/10 hover:text-primary',
                    )}
                  >
                    <span className="truncate">{opcion.label}</span>
                    {marcada ? <Check className="size-3.5 shrink-0" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </DismissableLayerBranch>,
        document.body,
      )
    : null;

  if (variante === 'columna') {
    return (
      <>
        <button
          ref={anclaRef}
          id={campoId}
          type="button"
          disabled={disabled}
          aria-label={label || menuTitulo || placeholder}
          aria-expanded={abierto}
          onClick={(evento) => {
            evento.stopPropagation();
            alternar();
          }}
          className={cn(
            'inline-flex size-5 items-center justify-center rounded-md',
            activo ? 'text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            className,
          )}
        >
          <ChevronDown className={cn('size-3.5 transition-transform', abierto && 'rotate-180')} />
        </button>
        {menu}
      </>
    );
  }

  return (
    <div className={cn('flex w-full flex-col gap-1', className)}>
      {label ? (
        <label htmlFor={campoId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <button
        ref={anclaRef}
        id={campoId}
        type="button"
        disabled={disabled}
        aria-expanded={abierto}
        onClick={alternar}
        className={cn(
          'flex h-11 w-full items-center gap-2 rounded-lg border bg-card px-3 text-left text-sm font-medium text-foreground transition-colors outline-none md:h-10',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
          'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
          abierto ? 'border-primary ring-3 ring-primary/20' : 'border-input hover:border-primary/50',
        )}
      >
        <span className={cn('min-w-0 flex-1 truncate', value === '' && 'font-normal text-muted-foreground')}>
          {value === '' ? placeholder : elegido?.label || placeholder}
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', abierto && 'rotate-180')} />
      </button>
      {menu}
    </div>
  );
}
