'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  asignar_rol,
  hoyLima,
  quitar_rol,
  roles_asignables,
  type RolCodigo,
  type UsuarioAdmin,
} from '@/lib/datos/actions';
import { Button, CustomSelect, SelectorFecha } from '@/components/ui';
import { NOMBRE_ESTADO, NOMBRE_ROL } from '../comun/etiquetas';

export function RolesUsuario({ usuario, onCambio }: { usuario: UsuarioAdmin; onCambio: () => void }) {
  const [opciones] = useState(() => roles_asignables());
  const [codigo, setCodigo] = useState<RolCodigo | ''>('');
  const [desde, setDesde] = useState(() => hoyLima());
  const [hasta, setHasta] = useState('');
  const veSuperadmin = opciones.includes('superadmin');
  const roles = veSuperadmin ? usuario.roles : usuario.roles.filter((rol) => rol.codigo !== 'superadmin');

  const asignar = async () => {
    if (!codigo) {
      toast.error('Elige un rol.');
      return;
    }
    const resultado = await asignar_rol(usuario.id, codigo, desde, hasta.trim() || null);
    if (!resultado.ok) {
      toast.error(resultado.error);
      return;
    }
    toast.success('Rol asignado');
    setCodigo('');
    setHasta('');
    onCambio();
  };

  const quitar = async (id: string) => {
    const resultado = await quitar_rol(id);
    if (!resultado.ok) {
      toast.error(resultado.error);
      return;
    }
    toast.success('Rol actualizado');
    onCambio();
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="font-medium text-foreground">{usuario.nombre_completo}</p>
        <p className="text-xs text-muted-foreground">{usuario.email}</p>
      </div>
      <ul className="space-y-2">
        {roles.length === 0 && <li className="text-sm text-muted-foreground">Sin roles visibles.</li>}
        {roles.map((rol) => (
          <li key={rol.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-border rounded-lg p-3">
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {NOMBRE_ROL[rol.codigo]} · {NOMBRE_ESTADO[rol.estado]}
              </p>
              <p className="text-xs text-muted-foreground">
                {rol.desde}
                {rol.hasta ? ` al ${rol.hasta}` : ' en adelante'}
              </p>
            </div>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => void quitar(rol.id)}>
              Quitar desde hoy
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="space-y-2 border-t border-border pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          void asignar();
        }}
      >
        <p className="text-sm font-medium text-foreground">Asignar rol</p>
        <CustomSelect
          value={codigo}
          onChange={(valor) => setCodigo(valor as RolCodigo | '')}
          placeholder="Elige un rol"
          options={opciones.map((opcion) => ({ value: opcion, label: NOMBRE_ROL[opcion] }))}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SelectorFecha label="Desde" value={desde} onChange={setDesde} />
          <SelectorFecha label="Hasta" value={hasta} onChange={setHasta} />
        </div>
        <Button type="submit" className="min-h-11">
          Asignar rol
        </Button>
      </form>
    </div>
  );
}
