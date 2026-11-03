'use client';

import { useState } from 'react';
import { crear_contacto, type Contacto } from '@/lib/datos-simulados/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';

interface ModalContactoProps {
  abierto: boolean;
  clienteId: string;
  onCerrar: () => void;
  onCreado: (contacto: Contacto) => void;
}

export function ModalContacto({ abierto, clienteId, onCerrar, onCreado }: ModalContactoProps) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Crear contacto">
      {abierto ? <FormularioContacto clienteId={clienteId} onCerrar={onCerrar} onCreado={onCreado} /> : null}
    </Modal>
  );
}

function FormularioContacto({ clienteId, onCerrar, onCreado }: Omit<ModalContactoProps, 'abierto'>) {
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    const resultado = await crear_contacto({
      cliente_id: clienteId,
      nombre,
      cargo,
      telefono,
      email,
    });
    setGuardando(false);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    onCreado(resultado.datos);
    onCerrar();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
      className="space-y-3"
    >
      <Campo id="contacto_nombre" label="Nombre" value={nombre} onChange={setNombre} />
      <Campo id="contacto_cargo" label="Cargo" value={cargo} onChange={setCargo} />
      <Campo id="contacto_telefono" label="Teléfono" value={telefono} onChange={setTelefono} />
      <Campo id="contacto_correo" label="Correo" value={email} onChange={setEmail} type="email" />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" className="min-h-11" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" className="min-h-11" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}

function Campo({
  id,
  label,
  value,
  onChange,
  type = 'text',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="min-h-11" />
    </div>
  );
}
