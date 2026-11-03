'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ficha_cliente, guardar_cliente, type FichaCliente as DatosFicha } from '@/lib/datos-simulados/actions';
import { Button } from '@/components/ui/button';
import { claseCampo } from './clases';
import { EditorSedes } from './EditorSedes';
import { EditorContactos } from './EditorContactos';
import { EditorEquipos } from './EditorEquipos';
import { HistorialCliente } from './HistorialCliente';

const PESTANAS = [
  { id: 'sedes', label: 'Sedes' },
  { id: 'contactos', label: 'Contactos' },
  { id: 'equipos', label: 'Equipos' },
  { id: 'historial', label: 'Historial' },
] as const;

type Pestana = (typeof PESTANAS)[number]['id'];

export function FichaCliente({ clienteId, onVolver }: { clienteId: string; onVolver: () => void }) {
  const [datos, setDatos] = useState<DatosFicha | null>(null);
  const [pestana, setPestana] = useState<Pestana>('sedes');
  const [marca, setMarca] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    ficha_cliente(clienteId).then((resultado) => {
      if (!vigente) return;
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      setDatos(resultado.datos);
    });
    return () => {
      vigente = false;
    };
  }, [clienteId, marca]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!datos) return <p className="text-sm text-muted-foreground">Cargando cliente...</p>;
  const cliente = datos.cliente;

  const guardar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formulario = new FormData(evento.currentTarget);
    const resultado = await guardar_cliente({
      id: cliente.id,
      razon_social: String(formulario.get('razon_social') ?? ''),
      ruc: String(formulario.get('ruc') ?? ''),
      telefono: String(formulario.get('telefono') ?? ''),
      email: String(formulario.get('email') ?? ''),
      soporte_vigente: formulario.get('soporte_vigente') === 'on',
      activo: formulario.get('activo') === 'on',
    });
    if (!resultado.ok) {
      toast.error(resultado.error);
      return;
    }
    toast.success('Cliente actualizado');
    setMarca((valor) => valor + 1);
  };

  return (
    <div className="space-y-4">
      <Button type="button" variant="ghost" className="min-h-11" onClick={onVolver}>
        Volver a clientes
      </Button>
      <form key={marca} onSubmit={(e) => void guardar(e)} className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">{cliente.razon_social}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Campo nombre="razon_social" label="Razón social" valor={cliente.razon_social} />
          <Campo nombre="ruc" label="RUC" valor={cliente.ruc ?? ''} />
          <Campo nombre="telefono" label="Teléfono" valor={cliente.telefono ?? ''} />
          <Campo nombre="email" label="Correo" valor={cliente.email ?? ''} />
        </div>
        <label className="flex items-center gap-2 min-h-11 text-sm">
          <input type="checkbox" name="soporte_vigente" defaultChecked={cliente.soporte_vigente} className="size-4" />
          Soporte vigente
        </label>
        {cliente.soporte_vigente && cliente.soporte_verificado_nombre && (
          <p className="text-xs text-muted-foreground">
            Verificado por {cliente.soporte_verificado_nombre}
            {cliente.soporte_verificado_en ? ` el ${cliente.soporte_verificado_en.slice(0, 16).replace('T', ' ')}` : ''}
          </p>
        )}
        <label className="flex items-center gap-2 min-h-11 text-sm">
          <input type="checkbox" name="activo" defaultChecked={cliente.activo} className="size-4" />
          Activo
        </label>
        <Button type="submit" className="min-h-11">
          Guardar datos
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {PESTANAS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPestana(item.id)}
            className={`min-h-11 px-3 rounded-lg text-sm border ${
              pestana === item.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {pestana === 'sedes' && <EditorSedes clienteId={clienteId} sedes={datos.sedes} onCambio={() => setMarca((v) => v + 1)} />}
      {pestana === 'contactos' && (
        <EditorContactos clienteId={clienteId} contactos={datos.contactos} onCambio={() => setMarca((v) => v + 1)} />
      )}
      {pestana === 'equipos' && (
        <EditorEquipos clienteId={clienteId} sedes={datos.sedes} equipos={datos.equipos} onCambio={() => setMarca((v) => v + 1)} />
      )}
      {pestana === 'historial' && <HistorialCliente clienteId={clienteId} />}
    </div>
  );
}

function Campo({ nombre, label, valor }: { nombre: string; label: string; valor: string }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <input name={nombre} defaultValue={valor} className={claseCampo} />
    </label>
  );
}
