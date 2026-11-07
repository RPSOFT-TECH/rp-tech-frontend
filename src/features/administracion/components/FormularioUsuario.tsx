'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { hoyLima, roles_asignables, usuarios, type RolCodigo } from '@/lib/datos-simulados/actions';
import { Button, CustomSelect, SelectorFecha } from '@/components/ui';
import { claseCampo } from './clases';
import { NOMBRE_ROL } from './etiquetas';

interface FilaRol {
  codigo: RolCodigo | '';
  desde: string;
  hasta: string;
}

export function FormularioUsuario({
  onCerrar,
  onCreado,
}: {
  onCerrar: () => void;
  onCreado: (temporal: string | null) => void;
}) {
  const [opciones] = useState(() => roles_asignables());
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [filas, setFilas] = useState<FilaRol[]>([{ codigo: '', desde: hoyLima(), hasta: '' }]);
  const [error, setError] = useState<string | null>(null);

  const cambiar = (indice: number, cambio: Partial<FilaRol>) => {
    setFilas((actuales) => actuales.map((fila, i) => (i === indice ? { ...fila, ...cambio } : fila)));
  };

  const guardar = async () => {
    const elegidos = filas.filter((fila) => fila.codigo && fila.desde);
    if (elegidos.length === 0) {
      setError('Asigna al menos un rol.');
      return;
    }
    const resultado = await usuarios({
      nombre_completo: nombre,
      email,
      telefono,
      password: password.trim() || null,
      roles: elegidos.map((fila) => ({
        codigo: fila.codigo as RolCodigo,
        desde: fila.desde,
        hasta: fila.hasta.trim() || null,
      })),
    });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.success('Usuario creado');
    onCreado(resultado.datos.password_temporal);
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
      <Campo id="nombre" label="Nombre" value={nombre} onChange={setNombre} />
      <Campo id="correo" label="Correo" value={email} onChange={setEmail} />
      <Campo id="tel" label="Teléfono" value={telefono} onChange={setTelefono} />
      <Campo id="clave" label="Contraseña" value={password} onChange={setPassword} tipo="password" placeholder="Opcional" />
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Roles y vigencia</p>
        {filas.map((fila, indice) => (
          <div key={indice} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <CustomSelect
              value={fila.codigo}
              onChange={(valor) => cambiar(indice, { codigo: valor as RolCodigo | '' })}
              placeholder="Elige un rol"
              options={opciones.map((codigo) => ({ value: codigo, label: NOMBRE_ROL[codigo] }))}
            />
            <SelectorFecha value={fila.desde} onChange={(desde) => cambiar(indice, { desde })} placeholder="Desde" />
            <SelectorFecha value={fila.hasta} onChange={(hasta) => cambiar(indice, { hasta })} placeholder="Hasta" />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => setFilas((actuales) => [...actuales, { codigo: '', desde: hoyLima(), hasta: '' }])}
        >
          Agregar otro rol
        </Button>
      </div>
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
  tipo = 'text',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  tipo?: string;
}) {
  return (
    <label className="block space-y-1 text-sm" htmlFor={id}>
      <span className="font-medium text-foreground">{label}</span>
      <input
        id={id}
        type={tipo}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={claseCampo}
      />
    </label>
  );
}
