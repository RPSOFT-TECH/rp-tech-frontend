'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { CasoLista, Catalogo, ClienteLista, TecnicoLista } from '@/lib/datos/actions';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { AvatarIniciales, Badge, Card, CustomSelect, DataTable, type Columna, type OpcionSelect } from '@/components/ui';
import { ESTADOS_FILTRO, EstadoBadge, etiquetaEstado } from '../EstadoCaso';
import { diaLegible, registroCorto } from './bandejas';

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

  const activos = [estado, tecnicoId, clienteId, tipoServicioId, modalidadId].filter((v) => v && v !== 'todos').length;

  const columnas: Columna<CasoLista>[] = [
    {
      clave: 'numero',
      encabezado: 'N° de caso',
      render: (caso) => (
        <span className="flex flex-col">
          <Link href={urlDetalle(caso.id)} onClick={(e) => e.stopPropagation()} className="font-bold whitespace-nowrap text-accent-foreground tabular-nums hover:underline">
            {caso.numero}
          </Link>
          <span className="text-xs text-muted-foreground tabular-nums">Reg. {registroCorto(caso.creado_en)}</span>
        </span>
      ),
    },
    {
      clave: 'cliente',
      encabezado: tituloFiltrado(
        'Cliente y sede',
        <CustomSelect variante="columna" menuTitulo="Cliente" value={clienteId} onChange={(valor) => onFiltro('cliente_id', valor)} options={clientesOpciones} />,
      ),
      render: (caso) => (
        <span className="flex flex-col">
          <span className="font-semibold">{caso.cliente_razon_social}</span>
          {caso.sede_nombre ? <span className="text-xs text-muted-foreground">{caso.sede_nombre}</span> : null}
        </span>
      ),
    },
    {
      clave: 'equipo',
      encabezado: 'Equipo',
      render: (caso) => (
        <span className="flex flex-col">
          <span className="font-mono text-xs whitespace-nowrap">{caso.equipo_serie}</span>
          <span className="text-xs text-muted-foreground">{caso.equipo_modelo}</span>
        </span>
      ),
    },
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
        <span className="flex flex-col">
          <span className="font-medium">{caso.tipo_servicio_nombre}</span>
          <span className="text-xs text-muted-foreground">
            {caso.modalidad_nombre} · {caso.modo_servicio_nombre}
          </span>
        </span>
      ),
    },
    {
      clave: 'tecnico',
      encabezado: tituloFiltrado(
        'Técnico',
        <CustomSelect variante="columna" menuTitulo="Técnico" value={tecnicoId} onChange={(valor) => onFiltro('tecnico_id', valor)} options={tecnicosOpciones} />,
      ),
      render: (caso) =>
        caso.tecnico_nombre ? (
          <span className="flex items-center gap-2 whitespace-nowrap">
            <AvatarIniciales nombre={caso.tecnico_nombre} />
            <span className="flex flex-col">
              <span className="font-medium">{caso.tecnico_nombre}</span>
              {caso.tecnico_adjunto_nombre ? <span className="text-xs text-muted-foreground">+ {caso.tecnico_adjunto_nombre}</span> : null}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">Sin asignar</span>
        ),
    },
    {
      clave: 'visita',
      encabezado: 'Visita',
      render: (caso) =>
        caso.fecha_programada ? (
          <span className="flex flex-col whitespace-nowrap">
            <span className="font-semibold">{diaLegible(caso.fecha_programada)}</span>
            <span className="text-xs text-muted-foreground tabular-nums">{caso.hora_programada?.slice(0, 5) || ''}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      clave: 'estado',
      encabezado: tituloFiltrado(
        'Estado',
        <CustomSelect variante="columna" menuTitulo="Estado" value={estado} onChange={(valor) => onFiltro('estado', valor)} options={estados} />,
      ),
      render: (caso) => <EstadoCaso caso={caso} />,
    },
    { clave: 'ir', encabezado: '', render: () => <ChevronRight className="size-4 text-muted-foreground" /> },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <details className="group mb-3 shrink-0 rounded-xl border border-border bg-card shadow-sm md:hidden">
        <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <span>
            Más filtros
            {activos > 0 && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{activos}</span>}
          </span>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
      <div className="grid grid-cols-1 gap-3 border-t border-border p-3 sm:grid-cols-2">
        <CustomSelect label="Estado" value={estado} onChange={(valor) => onFiltro('estado', valor)} options={estados} />
        <CustomSelect label="Técnico" value={tecnicoId} onChange={(valor) => onFiltro('tecnico_id', valor)} options={tecnicosOpciones} />
        <CustomSelect label="Cliente" value={clienteId} onChange={(valor) => onFiltro('cliente_id', valor)} options={clientesOpciones} />
        <CustomSelect label="Tipo de servicio" value={tipoServicioId} onChange={(valor) => onFiltro('tipo_servicio_id', valor)} options={tiposOpciones} />
        <CustomSelect label="Modalidad" value={modalidadId} onChange={(valor) => onFiltro('modalidad_id', valor)} options={modalidadesOpciones} />
      </div>
      </details>
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
              className="cursor-pointer gap-2 p-4 transition-colors hover:border-primary/50"
              onClick={() => onAbrir(caso.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-accent-foreground tabular-nums">{caso.numero}</span>
                <EstadoCaso caso={caso} />
              </div>
              <div>
                <div className="font-semibold text-card-foreground">{caso.cliente_razon_social}</div>
                <div className="text-xs text-muted-foreground">
                  {caso.sede_nombre} · <span className="font-mono">{caso.equipo_serie}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border pt-2 text-xs">
                <span className="flex items-center gap-2">
                  {caso.tecnico_nombre ? <AvatarIniciales nombre={caso.tecnico_nombre} className="size-6 text-[10px]" /> : null}
                  {caso.tecnico_nombre || 'Sin asignar'}
                </span>
                <span className="font-semibold">
                  {diaLegible(caso.fecha_programada)} {caso.hora_programada?.slice(0, 5) || ''}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
