'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { CasoLista, Catalogo, ClienteLista, TecnicoLista } from '@/lib/datos-simulados/actions';
import { Badge, Card, CustomSelect, DataTable, type Columna, type OpcionSelect } from '@/components/ui';
import { ESTADOS_FILTRO, EstadoBadge, etiquetaEstado } from '../EstadoCaso';
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

function tituloFiltrado(texto: string, filtro: ReactNode) {
  return (
    <span className="inline-flex items-center gap-1">
      {texto}
      {filtro}
    </span>
  );
}

export function ResultadoCasos({
  casos,
  loading,
  urlDetalle,
  onAbrir,
  estado,
  tecnicoId,
  clienteId,
  tipoServicioId,
  modalidadId,
  tecnicos,
  clientes,
  tiposServicio,
  modalidades,
  onFiltro,
}: {
  casos: CasoLista[];
  loading: boolean;
  urlDetalle: (id: string) => string;
  onAbrir: (id: string) => void;
  estado: string;
  tecnicoId: string;
  clienteId: string;
  tipoServicioId: string;
  modalidadId: string;
  tecnicos: TecnicoLista[];
  clientes: ClienteLista[];
  tiposServicio: Catalogo[];
  modalidades: Catalogo[];
  onFiltro: (nombre: string, valor: string) => void;
}) {
  const estados: OpcionSelect[] = [
    { value: 'todos', label: 'Todos los estados' },
    ...ESTADOS_FILTRO.map((item) => ({ value: item, label: etiquetaEstado(item) })),
  ];
  const tecnicosOpciones: OpcionSelect[] = [
    { value: 'todos', label: 'Todos los técnicos' },
    ...tecnicos.map((tecnico) => ({ value: tecnico.id, label: tecnico.nombre_completo })),
  ];
  const clientesOpciones: OpcionSelect[] = [
    { value: 'todos', label: 'Todos los clientes' },
    ...clientes.map((cliente) => ({
      value: cliente.id,
      label: cliente.ruc ? `${cliente.razon_social} (${cliente.ruc})` : cliente.razon_social,
    })),
  ];
  const tiposOpciones: OpcionSelect[] = [
    { value: 'todos', label: 'Todos los tipos' },
    ...tiposServicio.map((tipo) => ({ value: tipo.id, label: tipo.nombre })),
  ];
  const modalidadesOpciones: OpcionSelect[] = [
    { value: 'todos', label: 'Todas las modalidades' },
    ...modalidades.map((modalidad) => ({ value: modalidad.id, label: modalidad.nombre })),
  ];

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
      encabezado: tituloFiltrado(
        'Cliente y sede',
        <CustomSelect variante="columna" menuTitulo="Cliente" value={clienteId} onChange={(valor) => onFiltro('cliente_id', valor)} options={clientesOpciones} />,
      ),
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
      encabezado: tituloFiltrado(
        'Servicio',
        <>
          <CustomSelect variante="columna" menuTitulo="Tipo de servicio" value={tipoServicioId} onChange={(valor) => onFiltro('tipo_servicio_id', valor)} options={tiposOpciones} />
          <CustomSelect variante="columna" menuTitulo="Modalidad" value={modalidadId} onChange={(valor) => onFiltro('modalidad_id', valor)} options={modalidadesOpciones} />
        </>,
      ),
      render: (caso) => (
        <span>
          {caso.tipo_servicio_nombre}
          <span className="block text-xs text-muted-foreground">{caso.modalidad_nombre} · {caso.modo_servicio_nombre}</span>
        </span>
      ),
    },
    {
      clave: 'tecnico',
      encabezado: tituloFiltrado(
        'Técnico',
        <CustomSelect variante="columna" menuTitulo="Técnico" value={tecnicoId} onChange={(valor) => onFiltro('tecnico_id', valor)} options={tecnicosOpciones} />,
      ),
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
    {
      clave: 'estado',
      encabezado: tituloFiltrado(
        'Estado',
        <CustomSelect variante="columna" menuTitulo="Estado" value={estado} onChange={(valor) => onFiltro('estado', valor)} options={estados} />,
      ),
      render: (caso) => <EstadoCaso caso={caso} />,
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
        <CustomSelect label="Estado" value={estado} onChange={(valor) => onFiltro('estado', valor)} options={estados} />
        <CustomSelect label="Técnico" value={tecnicoId} onChange={(valor) => onFiltro('tecnico_id', valor)} options={tecnicosOpciones} />
        <CustomSelect label="Cliente" value={clienteId} onChange={(valor) => onFiltro('cliente_id', valor)} options={clientesOpciones} />
        <CustomSelect label="Tipo de servicio" value={tipoServicioId} onChange={(valor) => onFiltro('tipo_servicio_id', valor)} options={tiposOpciones} />
        <CustomSelect label="Modalidad" value={modalidadId} onChange={(valor) => onFiltro('modalidad_id', valor)} options={modalidadesOpciones} />
      </div>
      <div className="hidden h-full min-h-0 flex-1 flex-col md:flex">
        <DataTable
          className="h-full"
          columnas={columnas}
          datos={casos}
          claveFila={(caso) => caso.id}
          cargando={loading}
          textoVacio="No hay casos con estos filtros."
          conservarEncabezado
          onFilaClick={(caso) => onAbrir(caso.id)}
        />
      </div>
      {!loading && casos.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {casos.map((caso) => (
            <Card
              key={caso.id}
              className="cursor-pointer border border-border p-4 shadow-sm transition-all hover:border-primary/50"
              onClick={() => onAbrir(caso.id)}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold text-primary">{caso.numero}</span>
                <EstadoCaso caso={caso} />
              </div>
              <div className="mb-1 text-sm font-semibold text-card-foreground">{caso.cliente_razon_social}</div>
              <div className="mb-1 font-mono text-xs text-muted-foreground">Serie: {caso.equipo_serie}</div>
              <div className="mb-1 text-xs text-muted-foreground">
                {caso.tipo_servicio_nombre} · {caso.modalidad_nombre}
              </div>
              <div className="mb-2 text-xs text-muted-foreground">
                Técnico: {caso.tecnico_nombre || 'Sin asignar'}
                {caso.tecnico_adjunto_nombre ? ` (adj: ${caso.tecnico_adjunto_nombre})` : ''}
              </div>
              <div className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                Visita: {caso.fecha_programada || '—'} {caso.hora_programada || ''}
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
