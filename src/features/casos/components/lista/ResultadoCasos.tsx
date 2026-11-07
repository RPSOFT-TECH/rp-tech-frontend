'use client';

import Link from 'next/link';
import type { CasoLista } from '@/lib/datos-simulados/actions';
import { Badge, Card, DataTable, type Columna } from '@/components/ui';
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
  const columnas: Columna<CasoLista>[] = [
    {
      clave: 'numero',
      encabezado: 'N° de caso',
      render: (caso) => (
        <Link href={urlDetalle(caso.id)} className="font-medium text-primary hover:underline">
          {caso.numero}
        </Link>
      ),
    },
    { clave: 'registro', encabezado: 'Registro', render: (caso) => fechaLima(caso.creado_en) },
    {
      clave: 'cliente',
      encabezado: 'Cliente y sede',
      render: (caso) => (
        <span>
          {caso.cliente_razon_social}
          {caso.sede_nombre ? <span className="mt-0.5 block text-xs text-muted-foreground">{caso.sede_nombre}</span> : null}
        </span>
      ),
    },
    { clave: 'equipo', encabezado: 'Equipo', render: (caso) => <span className="font-mono text-xs">{caso.equipo_serie}</span> },
    {
      clave: 'servicio',
      encabezado: 'Servicio',
      render: (caso) => (
        <span>
          {caso.tipo_servicio_nombre}
          <span className="block text-xs text-muted-foreground">{caso.modalidad_nombre} · {caso.modo_servicio_nombre}</span>
        </span>
      ),
    },
    {
      clave: 'tecnico',
      encabezado: 'Técnico',
      render: (caso) => (
        <span>
          {caso.tecnico_nombre || 'Sin asignar'}
          {caso.tecnico_adjunto_nombre ? <span className="mt-0.5 block text-xs text-muted-foreground">Adj: {caso.tecnico_adjunto_nombre}</span> : null}
        </span>
      ),
    },
    {
      clave: 'visita',
      encabezado: 'Visita',
      render: (caso) => `${caso.fecha_programada || '—'} ${caso.hora_programada || ''}`,
    },
    { clave: 'estado', encabezado: 'Estado', render: (caso) => <EstadoCaso caso={caso} /> },
  ];

  return (
    <>
      <div className="hidden md:block">
        <DataTable
          columnas={columnas}
          datos={casos}
          claveFila={(caso) => caso.id}
          cargando={loading}
          textoVacio="No hay casos con estos filtros."
          onFilaClick={(caso) => onAbrir(caso.id)}
        />
      </div>
      {!loading && casos.length > 0 ? <div className="grid grid-cols-1 gap-3 md:hidden">
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
      </div> : null}
    </>
  );
}
