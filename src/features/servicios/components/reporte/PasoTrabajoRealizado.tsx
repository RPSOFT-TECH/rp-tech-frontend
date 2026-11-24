'use client';

import { useEffect, useState } from 'react';
import { Camera, FileText, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Segmentado } from '@/components/ui/segmentado';
import { Textarea } from '@/components/ui/textarea';
import { obtener_catalogos, type CatalogosActivos } from '@/lib/datos/actions';
import type { Repuesto } from '@/lib/datos-simulados/types';
import { BotonMicrofono } from './BotonMicrofono';
import { BloqueAdjuntos } from './PasoFotos';
import { SeccionReporte } from './SeccionReporte';
import type { FormularioReporte } from './tipo';

const MINIMO_PROCEDIMIENTO = 20;

const TIPOS_REPUESTO = {
  venta: { label: 'Venta', clase: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  descarte: { label: 'Descarte', clase: 'bg-muted text-muted-foreground' },
  garantia: { label: 'Garantía', clase: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
} as const;

export function PasoTrabajoRealizado({ form }: { form: FormularioReporte }) {
  const {
    esPasoEditable,
    guardando,
    procedimiento,
    setProcedimiento,
    conclusion,
    setConclusion,
    recomendaciones,
    setRecomendaciones,
    repuestos,
    repuestoCodigo,
    setRepuestoCodigo,
    repuestoDescripcion,
    setRepuestoDescripcion,
    repuestoCantidad,
    setRepuestoCantidad,
    repuestoTipo,
    setRepuestoTipo,
    agregarRepuestoItem,
    quitarRepuestoItem,
    agregarAdjuntoItem,
    remota,
  } = form;

  const [catalogoRepuestos, setCatalogoRepuestos] = useState<Repuesto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoFotoSeleccionada, setTipoFotoSeleccionada] = useState<'otro' | 'foto_salida' | 'foto_ingreso'>('otro');

  useEffect(() => {
    let activo = true;
    obtener_catalogos().then((data: CatalogosActivos) => {
      if (activo && data.repuestos) {
        setCatalogoRepuestos(data.repuestos);
      }
    });
    return () => {
      activo = false;
    };
  }, []);

  const repuestosFiltrados = busqueda.trim().length >= 2
    ? catalogoRepuestos.filter(
        (r) =>
          r.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
          r.codigo.toLowerCase().includes(busqueda.toLowerCase()),
      ).slice(0, 6)
    : [];

  const seleccionarDelCatalogo = (r: Repuesto) => {
    setRepuestoCodigo(r.codigo);
    setRepuestoDescripcion(r.descripcion);
    setBusqueda('');
  };

  const bloqueado = !esPasoEditable || guardando;
  const largo = procedimiento.trim().length;

  const subirArchivos = (archivos: FileList | File[]) => {
    const files = Array.from(archivos);
    files.forEach((f) => void agregarAdjuntoItem(tipoFotoSeleccionada, f));
  };

  return (
    <div className="space-y-3">
      {/* ── 1. Procedimiento, conclusión y recomendaciones ── */}
      <SeccionReporte titulo="Informe del trabajo" className="p-3">
        {/* Procedimiento */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="procedimiento" className="text-xs">
              Procedimiento<span className="text-destructive">*</span>
            </Label>
            <BotonMicrofono onTexto={(txt) => setProcedimiento(procedimiento ? `${procedimiento} ${txt}` : txt)} />
          </div>
          <Textarea
            id="procedimiento"
            value={procedimiento}
            onChange={(e) => setProcedimiento(e.target.value)}
            rows={3}
            disabled={bloqueado}
            placeholder="Tareas realizadas, limpieza, cambio de piezas, pruebas..."
            className="text-sm"
          />
          {largo > 0 && largo < MINIMO_PROCEDIMIENTO && (
            <span className="text-[11px] text-amber-700 dark:text-amber-400">
              Mínimo {MINIMO_PROCEDIMIENTO} caracteres ({largo}/{MINIMO_PROCEDIMIENTO}).
            </span>
          )}
        </div>

        {/* Conclusión y Recomendaciones en 2 columnas */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="conclusion" className="text-xs">
                Conclusión<span className="text-destructive">*</span>
              </Label>
              <BotonMicrofono onTexto={(txt) => setConclusion(conclusion ? `${conclusion} ${txt}` : txt)} />
            </div>
            <Textarea
              id="conclusion"
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              rows={2}
              disabled={bloqueado}
              placeholder="Diagnóstico final..."
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="recomendaciones" className="text-xs">Recomendaciones</Label>
              <BotonMicrofono onTexto={(txt) => setRecomendaciones(recomendaciones ? `${recomendaciones} ${txt}` : txt)} />
            </div>
            <Textarea
              id="recomendaciones"
              value={recomendaciones}
              onChange={(e) => setRecomendaciones(e.target.value)}
              rows={2}
              disabled={bloqueado}
              placeholder="Indicaciones para el cliente..."
              className="text-sm"
            />
          </div>
        </div>
      </SeccionReporte>

      {/* ── 2. Repuestos ── */}
      <SeccionReporte titulo="Repuestos" opcional ayuda="Si no se cambiaron piezas, continúa." className="p-3">
        {esPasoEditable && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-2.5">
            {/* Buscador */}
            <div className="relative">
              <Input
                id="buscar_repuesto"
                placeholder="Buscar repuesto por código o nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                disabled={bloqueado}
                className="h-8 text-xs"
              />
              {repuestosFiltrados.length > 0 && (
                <div className="absolute top-full left-0 z-20 mt-0.5 max-h-40 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
                  {repuestosFiltrados.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => seleccionarDelCatalogo(item)}
                      className="flex w-full items-center justify-between px-2 py-1.5 text-left text-xs hover:bg-muted"
                    >
                      <span className="font-medium">{item.descripcion}</span>
                      <span className="font-mono text-muted-foreground">{item.codigo}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fila: Cant + Desc + Tipo + Agregar */}
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-14">
                <Label htmlFor="rep_cant" className="text-[11px]">Cant.</Label>
                <Input
                  id="rep_cant"
                  type="number"
                  min={1}
                  value={repuestoCantidad}
                  onChange={(e) => setRepuestoCantidad(Math.max(1, Number(e.target.value) || 1))}
                  disabled={bloqueado}
                  className="h-8 text-center text-sm font-bold mt-0.5"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Label htmlFor="rep_desc" className="text-[11px]">Descripción</Label>
                <Input
                  id="rep_desc"
                  placeholder="Repuesto"
                  value={repuestoDescripcion}
                  onChange={(e) => setRepuestoDescripcion(e.target.value)}
                  disabled={bloqueado}
                  className="h-8 text-xs mt-0.5"
                />
              </div>
              <div className="w-48">
                <Label className="text-[11px]">Tipo</Label>
                <Segmentado
                  disabled={bloqueado}
                  value={repuestoTipo}
                  onChange={setRepuestoTipo}
                  opciones={[
                    { value: 'venta', label: 'Venta' },
                    { value: 'descarte', label: 'Desc.' },
                    { value: 'garantia', label: 'Gtía.' },
                  ]}
                  className="mt-0.5"
                />
              </div>
              <Button
                type="button"
                onClick={() => void agregarRepuestoItem()}
                disabled={bloqueado || !repuestoDescripcion.trim()}
                className="h-8 gap-1 text-xs font-semibold px-3"
              >
                <Plus className="size-3.5" />
                Agregar
              </Button>
            </div>
          </div>
        )}

        {/* Lista tipo nota de venta */}
        {repuestos.length === 0 ? (
          <p className="py-1.5 text-center text-xs text-muted-foreground">Sin repuestos.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border mt-2">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 text-center font-semibold w-12">Cant.</th>
                  <th className="px-2 py-1.5 font-semibold">Repuesto</th>
                  <th className="px-2 py-1.5 text-center font-semibold w-20">Tipo</th>
                  {esPasoEditable && <th className="w-8"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {repuestos.map((rep) => (
                  <tr key={rep.id} className="hover:bg-muted/20">
                    <td className="px-2 py-1.5 text-center font-bold tabular-nums">{rep.cantidad}</td>
                    <td className="px-2 py-1.5">
                      <span className="font-medium">{rep.descripcion}</span>
                      {rep.codigo && <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">({rep.codigo})</span>}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${TIPOS_REPUESTO[rep.tipo].clase}`}>
                        {TIPOS_REPUESTO[rep.tipo].label}
                      </span>
                    </td>
                    {esPasoEditable && (
                      <td className="px-1 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => void quitarRepuestoItem(rep.id)}
                          disabled={guardando}
                          className="p-0.5 text-muted-foreground hover:text-destructive"
                          title="Quitar"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SeccionReporte>

      {/* ── 3. Fotos y archivos ── */}
      <SeccionReporte titulo="Fotos y evidencias" className="p-3">
        <div className="space-y-2">
          {/* Selector de clasificación + botones de acción en la misma área */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-0.5 flex-1 max-w-xs">
              <Label className="text-[11px]">Clasificar como:</Label>
              <Segmentado
                disabled={bloqueado}
                value={tipoFotoSeleccionada}
                onChange={(val) => setTipoFotoSeleccionada(val as 'otro' | 'foto_salida' | 'foto_ingreso')}
                opciones={[
                  { value: 'otro', label: 'Prueba/Estado' },
                  { value: 'foto_salida', label: 'Salida' },
                  { value: 'foto_ingreso', label: 'Ingreso' },
                ]}
              />
            </div>
            <div className="flex gap-1.5">
              {/* Tomar foto */}
              <input
                type="file"
                id="btn-camara"
                accept="image/*"
                capture="environment"
                disabled={bloqueado}
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.length) subirArchivos(e.target.files);
                  e.target.value = '';
                }}
              />
              <label
                htmlFor="btn-camara"
                className="flex h-8 cursor-pointer items-center gap-1 rounded-md border border-input bg-card px-2.5 text-xs font-medium shadow-sm hover:bg-muted select-none active:scale-95"
              >
                <Camera className="size-3.5 text-primary" />
                Cámara
              </label>

              {/* Galería */}
              <input
                type="file"
                id="btn-galeria"
                accept="image/*"
                multiple
                disabled={bloqueado}
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.length) subirArchivos(e.target.files);
                  e.target.value = '';
                }}
              />
              <label
                htmlFor="btn-galeria"
                className="flex h-8 cursor-pointer items-center gap-1 rounded-md border border-input bg-card px-2.5 text-xs font-medium shadow-sm hover:bg-muted select-none active:scale-95"
              >
                <ImageIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Galería
              </label>

              {/* Archivo */}
              <input
                type="file"
                id="btn-archivo"
                multiple
                disabled={bloqueado}
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.length) subirArchivos(e.target.files);
                  e.target.value = '';
                }}
              />
              <label
                htmlFor="btn-archivo"
                className="flex h-8 cursor-pointer items-center gap-1 rounded-md border border-input bg-card px-2.5 text-xs font-medium shadow-sm hover:bg-muted select-none active:scale-95"
              >
                <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                Archivo
              </label>
            </div>
          </div>
        </div>

        {/* Muestra archivos adjuntos */}
        <div className="mt-2.5 pt-2 border-t border-border">
          <BloqueAdjuntos
            form={form}
            tipo="otro"
            titulo="Archivos adjuntos"
            ayuda="Test de impresión, bandas, videos o documentos."
            obligatorio={false}
          />
        </div>
      </SeccionReporte>
    </div>
  );
}
