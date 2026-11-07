'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { crear_contacto, guardar_contacto, type Contacto } from '@/lib/datos-simulados/actions';
import { Button, Modal } from '@/components/ui';
import { claseCampo } from '../comun/clases';

export function EditorContactos({
  clienteId,
  contactos,
  onCambio,
}: {
  clienteId: string;
  contactos: Contacto[];
  onCambio: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Contacto | null>(null);

  const desactivar = async (contacto: Contacto) => {
    const resultado = await guardar_contacto({ ...contacto, activo: !contacto.activo });
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
      {contactos.map((contacto) => (
        <div key={contacto.id} className="bg-card border border-border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
          <div>
            <p className="font-medium text-foreground">
              {contacto.nombre} {!contacto.activo && '· Inactivo'}
            </p>
            <p className="text-xs text-muted-foreground">
              {contacto.cargo || 'Sin cargo'} · {contacto.telefono || 'Sin teléfono'} · {contacto.email || 'Sin correo'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="min-h-11" onClick={() => { setEditando(contacto); setAbierto(true); }}>
              Editar
            </Button>
            <Button type="button" variant="ghost" className="min-h-11" onClick={() => void desactivar(contacto)}>
              {contacto.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </div>
      ))}
      <Modal abierto={abierto} onCerrar={() => setAbierto(false)} titulo={editando ? 'Editar contacto' : 'Crear contacto'}>
        {abierto ? (
          <Formulario
            clienteId={clienteId}
            contacto={editando}
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

function Formulario({ clienteId, contacto, onListo }: { clienteId: string; contacto: Contacto | null; onListo: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const guardar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const comun = {
      nombre: String(datos.get('nombre') ?? ''),
      cargo: String(datos.get('cargo') ?? ''),
      telefono: String(datos.get('telefono') ?? ''),
      email: String(datos.get('email') ?? ''),
    };
    const resultado = contacto
      ? await guardar_contacto({ ...contacto, ...comun, activo: contacto.activo })
      : await crear_contacto({ cliente_id: clienteId, ...comun });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.success(contacto ? 'Contacto actualizado' : 'Contacto creado');
    onListo();
  };
  return (
    <form className="space-y-3" onSubmit={(e) => void guardar(e)}>
      <Campo nombre="nombre" label="Nombre" valor={contacto?.nombre ?? ''} />
      <Campo nombre="cargo" label="Cargo" valor={contacto?.cargo ?? ''} />
      <Campo nombre="telefono" label="Teléfono" valor={contacto?.telefono ?? ''} />
      <Campo nombre="email" label="Correo" valor={contacto?.email ?? ''} />
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
