'use client';

import type { Catalogo, ClienteLista, TecnicoLista } from '@/lib/datos-simulados/actions';
import { Button, Card, SearchInput } from '@/components/ui';
import { ESTADOS_FILTRO, etiquetaEstado } from '../EstadoCaso';
import { FiltroFecha, FiltroSelect } from '../FiltrosListaCasos';

export function FiltrosCasos({
  busqueda,
  onBusqueda,
  onBuscar,
  hayFiltros,
  onLimpiar,
  estado,
  tecnicoId,
  clienteId,
  tipoServicioId,
  modalidadId,
  fechaDesde,
  fechaHasta,
  tecnicos,
  clientes,
  tiposServicio,
  modalidades,
  onFiltro,
  onExportar,
}: {
  busqueda: string;
  onBusqueda: (valor: string) => void;
  onBuscar: () => void;
  hayFiltros: boolean;
  onLimpiar: () => void;
  estado: string;
  tecnicoId: string;
  clienteId: string;
  tipoServicioId: string;
  modalidadId: string;
  fechaDesde: string;
  fechaHasta: string;
  tecnicos: TecnicoLista[];
  clientes: ClienteLista[];
  tiposServicio: Catalogo[];
  modalidades: Catalogo[];
  onFiltro: (nombre: string, valor: string) => void;
  onExportar: () => void;
}) {
  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="flex-1">
          <form
            id="form-filtros"
            className="flex flex-col sm:flex-row gap-2 mb-3"
            onSubmit={(evento) => {
              evento.preventDefault();
              onBuscar();
            }}
          >
            <SearchInput
              value={busqueda}
              onChange={(evento) => onBusqueda(evento.target.value)}
              placeholder="Buscar por número, cliente, reporte, RUC o serie"
              contenedorClassName="flex-1"
            />
            <Button type="submit" variant="secondary" className="min-h-11 px-5">
              Buscar
            </Button>
          </form>
        </div>
        {hayFiltros && (
          <button
            type="button"
            onClick={onLimpiar}
            className="text-xs text-primary hover:underline font-medium py-1 min-h-11 inline-flex items-center"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 pt-2 border-t border-border">
        <FiltroSelect label="Estado" value={estado} onChange={(valor) => onFiltro('estado', valor)}>
          <option value="todos">Todos los estados</option>
          {ESTADOS_FILTRO.map((item) => (
            <option key={item} value={item}>
              {etiquetaEstado(item)}
            </option>
          ))}
        </FiltroSelect>
        <FiltroSelect label="Técnico" value={tecnicoId} onChange={(valor) => onFiltro('tecnico_id', valor)}>
          <option value="todos">Todos los técnicos</option>
          {tecnicos.map((tecnico) => (
            <option key={tecnico.id} value={tecnico.id}>
              {tecnico.nombre_completo}
            </option>
          ))}
        </FiltroSelect>
        <FiltroSelect label="Cliente" value={clienteId} onChange={(valor) => onFiltro('cliente_id', valor)}>
          <option value="todos">Todos los clientes</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.razon_social} {cliente.ruc ? `(${cliente.ruc})` : ''}
            </option>
          ))}
        </FiltroSelect>
        <FiltroSelect label="Tipo de servicio" value={tipoServicioId} onChange={(valor) => onFiltro('tipo_servicio_id', valor)}>
          <option value="todos">Todos los tipos</option>
          {tiposServicio.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </FiltroSelect>
        <FiltroSelect label="Modalidad" value={modalidadId} onChange={(valor) => onFiltro('modalidad_id', valor)}>
          <option value="todos">Todas las modalidades</option>
          {modalidades.map((modalidad) => (
            <option key={modalidad.id} value={modalidad.id}>
              {modalidad.nombre}
            </option>
          ))}
        </FiltroSelect>
        <div className="flex flex-col">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Exportar</label>
          <Button onClick={onExportar} variant="outline" className="w-full min-h-11 px-3 text-xs">
            Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 pt-2 border-t border-border">
        <FiltroFecha label="Fecha desde" value={fechaDesde} onChange={(valor) => onFiltro('fecha_desde', valor)} />
        <FiltroFecha label="Fecha hasta" value={fechaHasta} onChange={(valor) => onFiltro('fecha_hasta', valor)} />
      </div>
    </Card>
  );
}
