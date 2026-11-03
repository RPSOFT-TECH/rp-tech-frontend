'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { clientes_admin, crear_cliente, type ClienteAdmin } from '@/lib/datos-simulados/actions';
import { Button, DataTable, Modal, SearchInput } from '@/components/ui';
import { claseCampo } from './clases';

export function ListaClientes({ onAbrir }: { onAbrir: (id: string) => void }) {
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <SearchInput
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onClear={() => setTexto('')}
          placeholder="Buscar por razón social o RUC"
          contenedorClassName="sm:max-w-md"
        />
        <Button type="button" className="min-h-11" onClick={() => setAlta(true)}>
          + Nuevo cliente
        </Button>
      </div>
      <DataTable
        datos={filas}
        claveFila={(fila) => fila.id}
        textoVacio="No hay clientes con esa búsqueda."
        onFilaClick={(fila) => onAbrir(fila.id)}
        columnas={[
          { clave: 'razon_social', encabezado: 'Cliente', render: (fila) => fila.razon_social },
          { clave: 'ruc', encabezado: 'RUC', render: (fila) => fila.ruc || 'Sin RUC' },
          { clave: 'soporte', encabezado: 'Soporte', render: (fila) => (fila.soporte_vigente ? 'Vigente' : 'No') },
          { clave: 'sedes', encabezado: 'Sedes' },
          { clave: 'equipos', encabezado: 'Equipos' },
          { clave: 'activo', encabezado: 'Estado', render: (fila) => (fila.activo ? 'Activo' : 'Inactivo') },
        ]}
      />
      <ModalCliente abierto={alta} onCerrar={() => setAlta(false)} onCreado={onAbrir} />
    </div>
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
    <label className="block space-y-1 text-sm" htmlFor={id}>
      <span className="font-medium text-foreground">{label}</span>
      <input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={claseCampo} />
    </label>
  );
}
