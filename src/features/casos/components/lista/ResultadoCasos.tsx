'use client';

import Link from 'next/link';
import type { CasoLista } from '@/lib/datos-simulados/actions';
import { Badge, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { EstadoBadge } from '../EstadoCaso';
import { fechaLima } from './bandejas';

function EstadoCaso({ caso }: { caso: CasoLista }) {
  return (
    <div className="flex items-center gap-1.5">
      <EstadoBadge estado={caso.estado} />
      {caso.reaperturas > 0 && (
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          Reabierto {caso.reaperturas}
        </Badge>
      )}
    </div>
  );
}

export function ResultadoCasos({
  casos,
  loading,
  urlDetalle,
  onAbrir,
}: {
  casos: CasoLista[];
  loading: boolean;
  urlDetalle: (id: string) => string;
  onAbrir: (id: string) => void;
}) {
  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando casos...</div>;
  }

  if (casos.length === 0) {
    return (
      <Card className="text-center p-12">
        <p className="text-muted-foreground">No hay casos con estos filtros.</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden hidden md:block">
        <Table className="text-left border-collapse">
          <TableHeader>
            <TableRow className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <TableHead className="p-4">N° de caso</TableHead>
              <TableHead className="p-4">Registro</TableHead>
              <TableHead className="p-4">Cliente y sede</TableHead>
              <TableHead className="p-4">Equipo</TableHead>
              <TableHead className="p-4">Servicio</TableHead>
              <TableHead className="p-4">Técnico</TableHead>
              <TableHead className="p-4">Visita</TableHead>
              <TableHead className="p-4">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border text-sm">
            {casos.map((caso) => (
              <TableRow key={caso.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="p-4 font-medium text-primary">
                  <Link href={urlDetalle(caso.id)} className="hover:underline">
                    {caso.numero}
                  </Link>
                </TableCell>
                <TableCell className="p-4 text-muted-foreground">{fechaLima(caso.creado_en)}</TableCell>
                <TableCell className="p-4 text-card-foreground font-medium truncate max-w-xs">
                  {caso.cliente_razon_social}
                  {caso.sede_nombre ? <span className="block text-xs text-muted-foreground mt-0.5">{caso.sede_nombre}</span> : null}
                </TableCell>
                <TableCell className="p-4 text-muted-foreground font-mono text-xs">{caso.equipo_serie}</TableCell>
                <TableCell className="p-4 text-card-foreground text-sm">
                  <div>{caso.tipo_servicio_nombre}</div>
                  <div className="text-xs text-muted-foreground">
                    {caso.modalidad_nombre} · {caso.modo_servicio_nombre}
                  </div>
                </TableCell>
                <TableCell className="p-4 text-card-foreground text-sm">
                  {caso.tecnico_nombre || 'Sin asignar'}
                  {caso.tecnico_adjunto_nombre ? (
                    <span className="block text-xs text-muted-foreground mt-0.5">Adj: {caso.tecnico_adjunto_nombre}</span>
                  ) : null}
                </TableCell>
                <TableCell className="p-4 text-muted-foreground text-sm">
                  {caso.fecha_programada || '—'} {caso.hora_programada || ''}
                </TableCell>
                <TableCell className="p-4">
                  <EstadoCaso caso={caso} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <div className="md:hidden grid grid-cols-1 gap-3">
        {casos.map((caso) => (
          <Card
            key={caso.id}
            className="p-4 shadow-sm hover:border-primary/50 transition-all border border-border cursor-pointer"
            onClick={() => onAbrir(caso.id)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-primary">{caso.numero}</span>
              <EstadoCaso caso={caso} />
            </div>
            <div className="text-sm text-card-foreground font-semibold mb-1">{caso.cliente_razon_social}</div>
            <div className="text-xs text-muted-foreground font-mono mb-1">Serie: {caso.equipo_serie}</div>
            <div className="text-xs text-muted-foreground mb-1">
              {caso.tipo_servicio_nombre} · {caso.modalidad_nombre}
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Técnico: {caso.tecnico_nombre || 'Sin asignar'}
              {caso.tecnico_adjunto_nombre ? ` (adj: ${caso.tecnico_adjunto_nombre})` : ''}
            </div>
            <div className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
              Visita: {caso.fecha_programada || '—'} {caso.hora_programada || ''}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
