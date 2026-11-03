'use client';

import { useState } from 'react';
import { crear_sede, type Sede } from '@/lib/datos-simulados/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';

interface ModalSedeProps {
  abierto: boolean;
  clienteId: string;
  onCerrar: () => void;
  onCreada: (sede: Sede) => void;
}

export function ModalSede({ abierto, clienteId, onCerrar, onCreada }: ModalSedeProps) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Crear sede">
      {abierto ? <FormularioSede clienteId={clienteId} onCerrar={onCerrar} onCreada={onCreada} /> : null}
    </Modal>
  );
}

function FormularioSede({ clienteId, onCerrar, onCreada }: Omit<ModalSedeProps, 'abierto'>) {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [distrito, setDistrito] = useState('');
  const [referencia, setReferencia] = useState('');
  const [principal, setPrincipal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    const resultado = await crear_sede({
      cliente_id: clienteId,
      nombre,
      direccion,
      distrito,
      referencia,
      principal,
    });
    setGuardando(false);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    onCreada(resultado.datos);
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
      <Campo id="sede_nombre" label="Nombre" value={nombre} onChange={setNombre} />
      <Campo id="sede_direccion" label="Dirección" value={direccion} onChange={setDireccion} />
      <Campo id="sede_distrito" label="Distrito" value={distrito} onChange={setDistrito} />
      <Campo id="sede_referencia" label="Referencia" value={referencia} onChange={setReferencia} />
      <label className="flex items-center gap-2 min-h-11 text-sm text-foreground">
        <input type="checkbox" checked={principal} onChange={(e) => setPrincipal(e.target.checked)} className="size-4" />
        Principal
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Acciones onCerrar={onCerrar} guardando={guardando} />
    </form>
  );
}

function Campo({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="min-h-11" />
    </div>
  );
}

function Acciones({ onCerrar, guardando }: { onCerrar: () => void; guardando: boolean }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="outline" className="min-h-11" onClick={onCerrar}>
        Cancelar
      </Button>
      <Button type="submit" className="min-h-11" disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  );
}
