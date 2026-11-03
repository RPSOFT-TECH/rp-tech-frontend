'use client';

import { useState } from 'react';
import { crear_cliente, type Cliente } from '@/lib/datos-simulados/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';

interface ModalClienteProps {
  abierto: boolean;
  onCerrar: () => void;
  onCreado: (cliente: Cliente) => void;
}

export function ModalCliente({ abierto, onCerrar, onCreado }: ModalClienteProps) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Crear cliente">
      {abierto ? <FormularioCliente onCerrar={onCerrar} onCreado={onCreado} /> : null}
    </Modal>
  );
}

function FormularioCliente({ onCerrar, onCreado }: Omit<ModalClienteProps, 'abierto'>) {
  const [razon, setRazon] = useState('');
  const [ruc, setRuc] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [soporte, setSoporte] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    const resultado = await crear_cliente({
      razon_social: razon,
      ruc,
      telefono,
      email,
      soporte_vigente: soporte,
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
      <div className="space-y-1.5">
        <Label htmlFor="alta_razon">Razón social</Label>
        <Input id="alta_razon" value={razon} onChange={(e) => setRazon(e.target.value)} className="min-h-11" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="alta_ruc">RUC</Label>
        <Input id="alta_ruc" value={ruc} onChange={(e) => setRuc(e.target.value)} placeholder="Opcional, 11 dígitos" className="min-h-11" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="alta_telefono">Teléfono</Label>
        <Input id="alta_telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="min-h-11" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="alta_correo">Correo</Label>
        <Input id="alta_correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-11" />
      </div>
      <label className="flex items-center gap-2 min-h-11 text-sm text-foreground">
        <input type="checkbox" checked={soporte} onChange={(e) => setSoporte(e.target.checked)} className="size-4" />
        Soporte vigente
      </label>
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
