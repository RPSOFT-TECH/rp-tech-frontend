'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { clientes_admin, crear_cliente, type ClienteAdmin } from '@/lib/datos/actions';
import { Plus } from 'lucide-react';
import { Button, Modal, SearchInput } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Etiqueta } from '../comun/ListaEditable';
import { claseCampo } from '../comun/clases';

export function ListaClientes({ onAbrir, seleccionado }: { onAbrir: (id: string) => void; seleccionado: string | null }) {
  const [texto, setTexto] = useState('');
  const [consulta, setConsulta] = useState('');
  const [filas, setFilas] = useState<ClienteAdmin[]>([]);
  const [alta, setAlta] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setConsulta(texto.trim()), 300);
    return () => clearTimeout(timer);
  }, [texto]);

  useEffect(() => {
    let vigente = true;
    clientes_admin(consulta).then((datos) => {
      if (vigente) setFilas(datos);
    });
    return () => {
      vigente = false;
    };
  }, [consulta, alta]);

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex gap-2 border-b border-border p-3">
        <SearchInput
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onClear={() => setTexto('')}
          placeholder="Razón social o RUC"
          contenedorClassName="flex-1"
        />
        <Button type="button" size="icon" className="size-11 shrink-0 md:size-10" aria-label="Nuevo cliente" onClick={() => setAlta(true)}>
          <Plus className="size-5" />
        </Button>
      </div>
      {filas.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">No hay clientes con esa búsqueda.</p>
      ) : (
        <ul className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          {filas.map((fila) => (
            <li key={fila.id}>
              <button
                type="button"
                onClick={() => onAbrir(fila.id)}
                aria-current={seleccionado === fila.id}
                className={cn(
                  'flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors',
                  seleccionado === fila.id ? 'bg-accent' : 'hover:bg-muted/60',
                )}
              >
                <span className={cn('font-semibold', !fila.activo && 'text-muted-foreground')}>{fila.razon_social}</span>
                <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{fila.ruc || 'Sin RUC'}</span>
                  <span>
                    {fila.sedes} {fila.sedes === 1 ? 'sede' : 'sedes'} · {fila.equipos} {fila.equipos === 1 ? 'equipo' : 'equipos'}
                  </span>
                  {fila.soporte_vigente && <Etiqueta tono="verde">Soporte</Etiqueta>}
                  {!fila.activo && <Etiqueta>Inactivo</Etiqueta>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <ModalCliente abierto={alta} onCerrar={() => setAlta(false)} onCreado={onAbrir} />
    </section>
  );
}

function ModalCliente({
  abierto,
  onCerrar,
  onCreado,
}: {
  abierto: boolean;
  onCerrar: () => void;
  onCreado: (id: string) => void;
}) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Nuevo cliente">
      {abierto ? <AltaCliente onCerrar={onCerrar} onCreado={onCreado} /> : null}
    </Modal>
  );
}

function AltaCliente({ onCerrar, onCreado }: { onCerrar: () => void; onCreado: (id: string) => void }) {
  const [razon, setRazon] = useState('');
  const [ruc, setRuc] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [soporte, setSoporte] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async () => {
    const resultado = await crear_cliente({ razon_social: razon, ruc, telefono, email, soporte_vigente: soporte });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.success('Cliente creado');
    onCreado(resultado.datos.id);
    onCerrar();
  };

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
    >
      <Campo id="razon" label="Razón social" value={razon} onChange={setRazon} />
      <Campo id="ruc" label="RUC" value={ruc} onChange={setRuc} placeholder="Opcional, 11 dígitos" />
      <Campo id="tel" label="Teléfono" value={telefono} onChange={setTelefono} />
      <Campo id="correo" label="Correo" value={email} onChange={setEmail} />
      <label className="flex items-center gap-2 min-h-11 text-sm">
        <input type="checkbox" checked={soporte} onChange={(e) => setSoporte(e.target.checked)} className="size-4" />
        Soporte vigente
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" className="min-h-11" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" className="min-h-11">
          Guardar
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
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm" htmlFor={id}>
      <span className="font-medium text-foreground">{label}</span>
      <input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={claseCampo} />
    </label>
  );
}
