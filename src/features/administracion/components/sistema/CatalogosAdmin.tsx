'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  cambiar_activo_catalogo,
  CODIGOS_CATALOGO,
  crear_valor_catalogo,
  listar_catalogo,
  mover_catalogo,
  renombrar_catalogo,
  type CodigoCatalogo,
  type ItemCatalogo,
} from '@/lib/datos/actions';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Button, CustomSelect } from '@/components/ui';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { claseCampo } from '../comun/clases';

const NOMBRES: Record<CodigoCatalogo, string> = {
  tipos_servicio: 'Tipos de servicio',
  modos_servicio: 'Modos de servicio',
  modalidades: 'Modalidades',
  canales: 'Canales',
  lineas_maquina: 'Líneas de máquina',
  modelos_cabezal: 'Modelos de cabezal',
  motivos_espera: 'Motivos de espera',
  repuestos: 'Repuestos',
};

export function CatalogosAdmin() {
  const [codigo, setCodigo] = useState<CodigoCatalogo>('tipos_servicio');
  const [items, setItems] = useState<ItemCatalogo[]>([]);
  const [nombres, setNombres] = useState<Record<string, string>>({});
  const [marca, setMarca] = useState(0);
  const esRepuesto = codigo === 'repuestos';

  useEffect(() => {
    let vigente = true;
    listar_catalogo(codigo).then((datos) => {
      if (!vigente) return;
      setItems(datos);
      setNombres(Object.fromEntries(datos.map((item) => [item.id, item.nombre])));
    });
    return () => {
      vigente = false;
    };
  }, [codigo, marca]);

  const aplicar = async (accion: Promise<{ ok: boolean; error?: string }>) => {
    const resultado = await accion;
    if (!resultado.ok) {
      toast.error(resultado.error ?? 'No se pudo guardar.');
      return;
    }
    setMarca((valor) => valor + 1);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[16rem_1fr] lg:items-start">
      <nav aria-label="Catálogos" className="rounded-xl border border-border bg-card p-1.5 shadow-sm">
        <div className="lg:hidden">
          <CustomSelect
            id="catalogo"
            value={codigo}
            onChange={(valor) => setCodigo(valor as CodigoCatalogo)}
            options={CODIGOS_CATALOGO.map((item) => ({ value: item, label: NOMBRES[item] }))}
          />
        </div>
        <ul className="hidden flex-col gap-0.5 lg:flex">
          {CODIGOS_CATALOGO.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => setCodigo(item)}
                aria-current={codigo === item}
                className={cn(
                  'flex h-9 w-full items-center justify-between rounded-md px-3 text-left text-sm',
                  codigo === item ? 'bg-accent font-semibold text-accent-foreground' : 'font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {NOMBRES[item]}
                {codigo === item && <span className="text-xs tabular-nums">{items.length}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <header className="space-y-3 border-b border-border p-4">
          <div>
            <h3 className="text-base font-semibold">{NOMBRES[codigo]}</h3>
            <p className="text-sm text-muted-foreground">Se ofrecen en este orden en los formularios. Los inactivos no se ofrecen, pero se conservan en los casos antiguos.</p>
          </div>
          <AltaCatalogo codigo={codigo} onCreado={() => setMarca((valor) => valor + 1)} />
        </header>
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">Este catálogo aún no tiene valores.</p>
        ) : (
          <ul>
            {items.map((item, indice) => {
              const nombre = nombres[item.id] ?? item.nombre;
              const cambiado = nombre.trim() !== item.nombre;
              return (
                <li key={item.id} className={cn('flex flex-wrap items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0', !item.activo && 'bg-muted/40')}>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label="Subir"
                      disabled={indice === 0}
                      onClick={() => void aplicar(mover_catalogo(codigo, item.id, 'subir'))}
                      className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Bajar"
                      disabled={indice === items.length - 1}
                      onClick={() => void aplicar(mover_catalogo(codigo, item.id, 'bajar'))}
                      className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <input
                      aria-label="Nombre"
                      value={nombre}
                      onChange={(e) => setNombres((actual) => ({ ...actual, [item.id]: e.target.value }))}
                      className="h-9 w-full rounded-md border border-transparent bg-transparent px-2 font-semibold outline-none hover:border-input focus-visible:border-primary focus-visible:bg-card"
                    />
                    {esRepuesto && (
                      <p className="px-2 text-xs text-muted-foreground">
                        <span className="font-mono">{item.codigo}</span> · {item.consumible ? 'Consumible' : 'No consumible'}
                      </p>
                    )}
                  </div>
                  {cambiado && (
                    <Button type="button" className="h-8 px-3" onClick={() => void aplicar(renombrar_catalogo(codigo, item.id, nombre))}>
                      Guardar nombre
                    </Button>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Switch checked={item.activo} onCheckedChange={(v) => void aplicar(cambiar_activo_catalogo(codigo, item.id, v))} aria-label="Activo" />
                    <span className="w-14">{item.activo ? 'Activo' : 'Inactivo'}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function AltaCatalogo({ codigo, onCreado }: { codigo: CodigoCatalogo; onCreado: () => void }) {
  const [nombre, setNombre] = useState('');
  const [codigoRepuesto, setCodigoRepuesto] = useState('');
  const [consumible, setConsumible] = useState(false);
  const esRepuesto = codigo === 'repuestos';

  const guardar = async () => {
    const resultado = await crear_valor_catalogo(codigo, {
      nombre,
      codigo: esRepuesto ? codigoRepuesto : null,
      consumible,
    });
    if (!resultado.ok) {
      toast.error(resultado.error);
      return;
    }
    toast.success('Valor agregado');
    setNombre('');
    setCodigoRepuesto('');
    setConsumible(false);
    onCreado();
  };

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
    >
      {esRepuesto && (
        <input
          aria-label="Código del repuesto"
          value={codigoRepuesto}
          onChange={(e) => setCodigoRepuesto(e.target.value)}
          placeholder="Código"
          className={cn(claseCampo, 'sm:w-36')}
        />
      )}
      <input aria-label="Nombre del valor" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nuevo valor" className={cn(claseCampo, 'sm:flex-1')} />
      {esRepuesto && (
        <label className="flex min-h-10 items-center gap-2 text-sm whitespace-nowrap">
          <input type="checkbox" checked={consumible} onChange={(e) => setConsumible(e.target.checked)} className="size-4 accent-primary" />
          Consumible
        </label>
      )}
      <Button type="submit" className="h-11 gap-1.5 px-4 md:h-10" disabled={!nombre.trim()}>
        <Plus className="size-4" />
        Agregar
      </Button>
    </form>
  );
}
