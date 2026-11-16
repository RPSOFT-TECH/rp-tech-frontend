'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ficha_cliente, guardar_cliente, type FichaCliente as DatosFicha } from '@/lib/datos/actions';
import { ChevronLeft, Pencil } from 'lucide-react';
import { AvatarIniciales } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Etiqueta } from '../comun/ListaEditable';
import { claseCampo } from '../comun/clases';
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
  const [editando, setEditando] = useState(false);

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
    setEditando(false);
    setMarca((valor) => valor + 1);
  };

  return (
    <div className="space-y-4">
      <Button type="button" variant="ghost" className="h-9 gap-1 px-2 text-muted-foreground lg:hidden" onClick={onVolver}>
        <ChevronLeft className="size-4" />
        Clientes
      </Button>
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start gap-3">
          <AvatarIniciales nombre={cliente.razon_social} className="size-12 rounded-xl text-base" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-foreground">{cliente.razon_social}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{cliente.ruc ? `RUC ${cliente.ruc}` : 'Sin RUC'}</span>
              <Etiqueta tono={cliente.activo ? 'verde' : 'neutro'}>{cliente.activo ? 'Activo' : 'Inactivo'}</Etiqueta>
              {cliente.soporte_vigente && <Etiqueta tono="azul">Soporte vigente</Etiqueta>}
            </div>
          </div>
          {!editando && (
            <Button type="button" variant="outline" className="h-10 gap-2 px-4 shadow-xs" onClick={() => setEditando(true)}>
              <Pencil className="size-4" />
              Editar datos
            </Button>
          )}
        </div>
        {!editando ? (
          <dl className="mt-4 grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-2 border-t border-border pt-4 text-sm sm:grid-cols-[6.5rem_1fr_6.5rem_1fr]">
            <dt className="text-muted-foreground">Teléfono</dt>
            <dd className="font-medium tabular-nums">{cliente.telefono || '—'}</dd>
            <dt className="text-muted-foreground">Correo</dt>
            <dd className="min-w-0 truncate font-medium">{cliente.email || '—'}</dd>
            <dt className="text-muted-foreground">Soporte</dt>
            <dd className="font-medium sm:col-span-3">
              {cliente.soporte_vigente
                ? `Vigente${cliente.soporte_verificado_nombre ? ` · verificado por ${cliente.soporte_verificado_nombre}` : ''}${
                    cliente.soporte_verificado_en ? ` el ${cliente.soporte_verificado_en.slice(0, 10).split('-').reverse().join('/')}` : ''
                  }`
                : 'Sin soporte vigente'}
            </dd>
          </dl>
        ) : (
          <form key={marca} onSubmit={(e) => void guardar(e)} className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo nombre="razon_social" label="Razón social" valor={cliente.razon_social} />
              <Campo nombre="ruc" label="RUC" valor={cliente.ruc ?? ''} />
              <Campo nombre="telefono" label="Teléfono" valor={cliente.telefono ?? ''} />
              <Campo nombre="email" label="Correo" valor={cliente.email ?? ''} />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex min-h-10 items-center gap-2 text-sm">
                <input type="checkbox" name="soporte_vigente" defaultChecked={cliente.soporte_vigente} className="size-4 accent-primary" />
                Soporte vigente
              </label>
              <label className="flex min-h-10 items-center gap-2 text-sm">
                <input type="checkbox" name="activo" defaultChecked={cliente.activo} className="size-4 accent-primary" />
                Cliente activo
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" className="h-10" onClick={() => setEditando(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="h-10">
                Guardar datos
              </Button>
            </div>
          </form>
        )}
      </section>
      <div role="tablist" className="no-scrollbar flex gap-6 overflow-x-auto border-b border-border">
        {PESTANAS.map((item) => {
          const total = item.id === 'sedes' ? datos.sedes.length : item.id === 'contactos' ? datos.contactos.length : item.id === 'equipos' ? datos.equipos.length : null;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={pestana === item.id}
              onClick={() => setPestana(item.id)}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 pb-2.5 text-sm whitespace-nowrap ${
                pestana === item.id ? 'border-primary font-semibold text-foreground' : 'border-transparent font-medium text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
              {total !== null && <span className="rounded-full bg-card px-1.5 text-xs leading-5 text-muted-foreground tabular-nums">{total}</span>}
            </button>
          );
        })}
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
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input name={nombre} defaultValue={valor} className={claseCampo} />
    </label>
  );
}
