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
} from '@/lib/datos-simulados/actions';
import { Button } from '@/components/ui';
import { claseCampo } from './clases';
import { NOMBRE_ESTADO, NOMBRE_ROL } from './etiquetas';

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
        <select aria-label="Rol" value={codigo} onChange={(e) => setCodigo(e.target.value as RolCodigo | '')} className={claseCampo}>
          <option value="">Elige un rol</option>
          {opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {NOMBRE_ROL[opcion]}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-foreground">Desde</span>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={claseCampo} />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-foreground">Hasta</span>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={claseCampo} />
          </label>
        </div>
        <Button type="submit" className="min-h-11">
          Asignar rol
        </Button>
      </form>
    </div>
  );
}
