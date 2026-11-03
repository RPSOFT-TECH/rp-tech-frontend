'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { leerSesionEstable } from '@/lib/datos-simulados/actions';
import { ListaClientes } from '../components/ListaClientes';
import { FichaCliente } from '../components/FichaCliente';
import { UsuariosAdmin } from '../components/UsuariosAdmin';
import { ParametrosAdmin } from '../components/ParametrosAdmin';
import { CatalogosAdmin } from '../components/CatalogosAdmin';
import { PermisosAdmin } from '../components/PermisosAdmin';
import { pestanasVisibles } from '../components/pestanas';

export function AdministracionView() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando administración...</div>}>
      <Contenido />
    </Suspense>
  );
}

function Contenido() {
  const router = useRouter();
  const params = useSearchParams();
  const sesion = useSyncExternalStore(() => () => {}, leerSesionEstable, () => null);
  const roles = sesion?.rolesVigentes ?? [];
  const visibles = pestanasVisibles(roles);
  const pedida = params.get('seccion') ?? 'clientes';
  const seccion = visibles.some((pestana) => pestana.id === pedida) ? pedida : (visibles[0]?.id ?? '');
  const clienteId = seccion === 'clientes' ? params.get('cliente') : null;

  const ir = (id: string) => {
    router.push(id === 'clientes' ? '/administracion?seccion=clientes' : `/administracion?seccion=${id}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-4">Administración</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {visibles.map((pestana) => (
          <button
            key={pestana.id}
            type="button"
            onClick={() => ir(pestana.id)}
            className={`min-h-11 px-3 rounded-lg text-sm font-medium border ${
              seccion === pestana.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border'
            }`}
          >
            {pestana.label}
          </button>
        ))}
      </div>
      {seccion === 'clientes' && !clienteId && (
        <ListaClientes onAbrir={(id) => router.push(`/administracion?seccion=clientes&cliente=${id}`)} />
      )}
      {seccion === 'clientes' && clienteId && (
        <FichaCliente clienteId={clienteId} onVolver={() => ir('clientes')} />
      )}
      {seccion === 'catalogos' && <CatalogosAdmin />}
      {seccion === 'parametros' && <ParametrosAdmin />}
      {seccion === 'usuarios' && <UsuariosAdmin />}
      {seccion === 'permisos' && <PermisosAdmin />}
    </div>
  );
}
