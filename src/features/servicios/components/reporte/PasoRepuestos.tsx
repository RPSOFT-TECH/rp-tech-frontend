'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Segmentado } from '@/components/ui/segmentado';
import { CampoReporte, SeccionReporte } from './SeccionReporte';
import type { FormularioReporte } from './tipo';

const TIPOS = {
  garantia: { label: 'Garantía', clase: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  venta: { label: 'Venta', clase: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  descarte: { label: 'Descarte', clase: 'bg-muted text-muted-foreground' },
} as const;

export function PasoRepuestos({ form }: { form: FormularioReporte }) {
  const {
    esPasoEditable,
    guardando,
    repuestoCodigo,
    setRepuestoCodigo,
    repuestoDescripcion,
    setRepuestoDescripcion,
    repuestoCantidad,
    setRepuestoCantidad,
    repuestoTipo,
    setRepuestoTipo,
    repuestos,
    agregarRepuestoItem,
    quitarRepuestoItem,
  } = form;

  return (
    <>
      <SeccionReporte titulo="Repuestos usados" ayuda="Si no usaste repuestos, pulsa Siguiente." opcional>
        {repuestos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay repuestos en este reporte.</p>
        ) : (
          <ul className="space-y-2">
            {repuestos.map((repuesto) => (
              <li key={repuesto.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted font-semibold tabular-nums">{repuesto.cantidad}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{repuesto.descripcion}</p>
                  <p className="font-mono text-xs text-muted-foreground">{repuesto.codigo}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${TIPOS[repuesto.tipo].clase}`}>{TIPOS[repuesto.tipo].label}</span>
                {esPasoEditable && (
                  <button
                    type="button"
                    onClick={() => quitarRepuestoItem(repuesto.id)}
                    disabled={guardando}
                    aria-label={`Quitar ${repuesto.descripcion}`}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </SeccionReporte>

      {esPasoEditable && (
        <SeccionReporte titulo="Agregar repuesto">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_1fr]">
            <CampoReporte etiqueta="Código" htmlFor="repuesto_codigo">
              <Input id="repuesto_codigo" value={repuestoCodigo} onChange={(e) => setRepuestoCodigo(e.target.value)} placeholder="Ej.: DMP-3200" />
            </CampoReporte>
            <CampoReporte etiqueta="Descripción" htmlFor="repuesto_descripcion">
              <Input id="repuesto_descripcion" value={repuestoDescripcion} onChange={(e) => setRepuestoDescripcion(e.target.value)} placeholder="Nombre del repuesto" />
            </CampoReporte>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[6rem_1fr] sm:gap-3">
            <CampoReporte etiqueta="Cantidad" htmlFor="repuesto_cantidad">
              <Input
                id="repuesto_cantidad"
                type="number"
                inputMode="numeric"
                min={1}
                value={repuestoCantidad}
                onChange={(e) => setRepuestoCantidad(Number(e.target.value) || 1)}
                className="w-28 tabular-nums sm:w-full"
              />
            </CampoReporte>
            <CampoReporte etiqueta="Tipo">
              <Segmentado
                tamano="grande"
                value={repuestoTipo}
                onChange={setRepuestoTipo}
                opciones={[
                  { value: 'garantia', label: 'Garantía' },
                  { value: 'venta', label: 'Venta' },
                  { value: 'descarte', label: 'Descarte' },
                ]}
              />
            </CampoReporte>
          </div>
          <Button variant="outline" onClick={agregarRepuestoItem} disabled={guardando || !repuestoDescripcion.trim()} className="h-11 w-full">
            {guardando ? 'Agregando...' : 'Agregar repuesto'}
          </Button>
        </SeccionReporte>
      )}
    </>
  );
}
