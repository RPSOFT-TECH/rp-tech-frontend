'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { crear_sede, guardar_sede, type Sede } from '@/lib/datos/actions';
import { Button, Modal } from '@/components/ui';
import { claseCampo } from '../comun/clases';
import { Etiqueta, FilaEditable, ListaEditable } from '../comun/ListaEditable';

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
    <>
      <ListaEditable titulo={`Sedes (${sedes.length})`} accion="Nueva sede" vacio="Este cliente aún no tiene sedes." onNuevo={() => { setEditando(null); setAbierto(true); }}>
        {sedes.map((sede) => (
          <FilaEditable
            key={sede.id}
            titulo={sede.nombre}
            etiquetas={sede.principal ? <Etiqueta tono="azul">Principal</Etiqueta> : null}
            detalle={`${sede.direccion}, ${sede.distrito}${sede.referencia ? ` · ${sede.referencia}` : ''}`}
            activo={sede.activo}
            onActivo={() => void desactivar(sede)}
            onEditar={() => { setEditando(sede); setAbierto(true); }}
          />
        ))}
      </ListaEditable>
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
    </>
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
