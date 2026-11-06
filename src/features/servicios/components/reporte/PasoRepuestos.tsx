'use client';

import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import type { FormularioReporte } from './tipo';

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
    retrocederPaso,
    avanzarPaso,
  } = form;

  return (
    <Card className="p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">4. Repuestos</h3>
      {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Código</label>
          <input value={repuestoCodigo} onChange={(evento) => setRepuestoCodigo(evento.target.value)} disabled={!esPasoEditable} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Descripción</label>
          <input value={repuestoDescripcion} onChange={(evento) => setRepuestoDescripcion(evento.target.value)} disabled={!esPasoEditable} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Cantidad</label>
          <input type="number" value={repuestoCantidad} onChange={(evento) => setRepuestoCantidad(Number(evento.target.value) || 1)} disabled={!esPasoEditable} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Tipo</label>
          <select
            value={repuestoTipo}
            onChange={(evento) => setRepuestoTipo(evento.target.value as 'venta' | 'descarte' | 'garantia')}
            disabled={!esPasoEditable}
            className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
          >
            <option value="venta">Venta</option>
            <option value="descarte">Descarte</option>
            <option value="garantia">Garantía</option>
          </select>
        </div>
      </div>
      <Button onClick={agregarRepuestoItem} disabled={!esPasoEditable || guardando || !repuestoDescripcion} className="w-full min-h-11 mb-4">
        {guardando ? 'Agregando...' : 'Agregar repuesto'}
      </Button>
      {repuestos.length > 0 && (
        <Table className="text-left border-collapse w-full">
          <TableHeader>
            <TableRow className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground">
              <TableHead className="p-2">Código</TableHead>
              <TableHead className="p-2">Descripción</TableHead>
              <TableHead className="p-2">Cant.</TableHead>
              <TableHead className="p-2">Tipo</TableHead>
              <TableHead className="p-2 text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border text-sm">
            {repuestos.map((repuesto) => (
              <TableRow key={repuesto.id}>
                <TableCell className="p-2 font-mono">{repuesto.codigo}</TableCell>
                <TableCell className="p-2">{repuesto.descripcion}</TableCell>
                <TableCell className="p-2">{repuesto.cantidad}</TableCell>
                <TableCell className="p-2">{repuesto.tipo}</TableCell>
                <TableCell className="p-2 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quitarRepuestoItem(repuesto.id)}
                    disabled={!esPasoEditable || guardando}
                    className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                  >
                    Quitar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="min-h-11">Atrás</Button>
        <Button onClick={avanzarPaso} disabled={guardando} className="min-h-11">Siguiente</Button>
      </div>
    </Card>
  );
}
