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
import { Button, CustomSelect } from '@/components/ui';
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
    <div className="space-y-4">
      <div className="max-w-sm">
        <CustomSelect
          id="catalogo"
          label="Catálogo"
          value={codigo}
          onChange={(valor) => setCodigo(valor as CodigoCatalogo)}
          options={CODIGOS_CATALOGO.map((item) => ({ value: item, label: NOMBRES[item] }))}
        />
      </div>
      <ul className="space-y-2">
        {items.map((item, indice) => (
          <li key={item.id} className="bg-card border border-border rounded-xl p-3 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                aria-label="Nombre"
                value={nombres[item.id] ?? item.nombre}
                onChange={(e) => setNombres((actual) => ({ ...actual, [item.id]: e.target.value }))}
                className={claseCampo}
              />
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => void aplicar(renombrar_catalogo(codigo, item.id, nombres[item.id] ?? item.nombre))}
              >
                Renombrar
              </Button>
            </div>
            {esRepuesto && (
              <p className="text-xs text-muted-foreground">
                {item.codigo} · {item.consumible ? 'Consumible' : 'No consumible'}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={indice === 0}
                onClick={() => void aplicar(mover_catalogo(codigo, item.id, 'subir'))}
              >
                Subir
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={indice === items.length - 1}
                onClick={() => void aplicar(mover_catalogo(codigo, item.id, 'bajar'))}
              >
                Bajar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => void aplicar(cambiar_activo_catalogo(codigo, item.id, !item.activo))}
              >
                {item.activo ? 'Desactivar' : 'Activar'}
              </Button>
              {!item.activo && <span className="text-xs text-muted-foreground self-center">Inactivo</span>}
            </div>
          </li>
        ))}
      </ul>
      <AltaCatalogo codigo={codigo} onCreado={() => setMarca((valor) => valor + 1)} />
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
      className="bg-card border border-border rounded-xl p-3 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
    >
      <p className="text-sm font-medium text-foreground">Agregar valor</p>
      <input aria-label="Nombre del valor" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className={claseCampo} />
      {esRepuesto && (
        <>
          <input
            aria-label="Código del repuesto"
            value={codigoRepuesto}
            onChange={(e) => setCodigoRepuesto(e.target.value)}
            placeholder="Código"
            className={claseCampo}
          />
          <label className="flex items-center gap-2 min-h-11 text-sm">
            <input type="checkbox" checked={consumible} onChange={(e) => setConsumible(e.target.checked)} className="size-4" />
            Consumible
          </label>
        </>
      )}
      <Button type="submit" className="min-h-11">
        Agregar
      </Button>
    </form>
  );
}
