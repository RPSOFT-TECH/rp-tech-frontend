'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { crear_sede, guardar_sede, type Sede } from '@/lib/datos/actions';
import { Button, Modal } from '@/components/ui';
import { claseCampo } from './clases';

export function EditorSedes({ clienteId, sedes, onCambio }: { clienteId: string; sedes: Sede[]; onCambio: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Sede | null>(null);

  const desactivar = async (sede: Sede) => {
    const resultado = await guardar_sede({ ...sede, activo: !sede.activo });
    if (!resultado.ok) {
      toast.error(resultado.error);
      return;
    }
    onCambio();
  };

  return (
    <div className="space-y-3">
      <Button type="button" className="min-h-11" onClick={() => { setEditando(null); setAbierto(true); }}>
        + Crear
      </Button>
      {sedes.map((sede) => (
        <div key={sede.id} className="bg-card border border-border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
          <div>
            <p className="font-medium text-foreground">
              {sede.nombre} {sede.principal ? '· Principal' : ''} {!sede.activo && '· Inactiva'}
            </p>
            <p className="text-xs text-muted-foreground">
              {sede.direccion}, {sede.distrito}
              {sede.referencia ? ` · ${sede.referencia}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="min-h-11" onClick={() => { setEditando(sede); setAbierto(true); }}>
              Editar
            </Button>
            <Button type="button" variant="ghost" className="min-h-11" onClick={() => void desactivar(sede)}>
              {sede.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </div>
      ))}
      <Modal abierto={abierto} onCerrar={() => setAbierto(false)} titulo={editando ? 'Editar sede' : 'Crear sede'}>
        {abierto ? (
          <FormularioSede
            clienteId={clienteId}
            sede={editando}
            onListo={() => {
              setAbierto(false);
              onCambio();
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function FormularioSede({ clienteId, sede, onListo }: { clienteId: string; sede: Sede | null; onListo: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const guardar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const comun = {
      nombre: String(datos.get('nombre') ?? ''),
      direccion: String(datos.get('direccion') ?? ''),
      distrito: String(datos.get('distrito') ?? ''),
      referencia: String(datos.get('referencia') ?? ''),
      principal: datos.get('principal') === 'on',
    };
    const resultado = sede
      ? await guardar_sede({ ...sede, ...comun, activo: sede.activo })
      : await crear_sede({ cliente_id: clienteId, ...comun });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.success(sede ? 'Sede actualizada' : 'Sede creada');
    onListo();
  };
  return (
    <form className="space-y-3" onSubmit={(e) => void guardar(e)}>
      <Campo nombre="nombre" label="Nombre" valor={sede?.nombre ?? ''} />
      <Campo nombre="direccion" label="Dirección" valor={sede?.direccion ?? ''} />
      <Campo nombre="distrito" label="Distrito" valor={sede?.distrito ?? ''} />
      <Campo nombre="referencia" label="Referencia" valor={sede?.referencia ?? ''} />
      <label className="flex items-center gap-2 min-h-11 text-sm">
        <input type="checkbox" name="principal" defaultChecked={sede?.principal ?? false} className="size-4" />
        Principal
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" className="min-h-11">Guardar</Button>
    </form>
  );
}

function Campo({ nombre, label, valor }: { nombre: string; label: string; valor: string }) {
  return (
    <label className="block space-y-1 text-sm">
      <span>{label}</span>
      <input name={nombre} defaultValue={valor} className={claseCampo} />
    </label>
  );
}
