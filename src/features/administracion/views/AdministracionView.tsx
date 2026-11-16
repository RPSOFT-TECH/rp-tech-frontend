'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { leerSesionEstable } from '@/lib/datos/actions';
import { ShieldCheck } from 'lucide-react';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { ListaClientes } from '../components/clientes/ListaClientes';
import { FichaCliente } from '../components/clientes/FichaCliente';
import { UsuariosAdmin } from '../components/usuarios/UsuariosAdmin';
import { ParametrosAdmin } from '../components/sistema/ParametrosAdmin';
import { CorreoAdmin } from '../components/sistema/CorreoAdmin';
import { CatalogosAdmin } from '../components/sistema/CatalogosAdmin';
import { PermisosAdmin } from '../components/sistema/PermisosAdmin';
import { pestanasVisibles } from '../components/comun/pestanas';

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
  useRegistrarTitulo('Administración', 'Gestión del sistema y perfiles', ShieldCheck);
  const visibles = pestanasVisibles(roles);
  const pedida = params.get('seccion') ?? 'clientes';
  const seccion = visibles.some((pestana) => pestana.id === pedida) ? pedida : (visibles[0]?.id ?? '');
  const clienteId = seccion === 'clientes' ? params.get('cliente') : null;

  const ir = (id: string) => {
    router.push(id === 'clientes' ? '/administracion?seccion=clientes' : `/administracion?seccion=${id}`);
  };

  return (
    <div className="w-full">
      <div className="-mx-4 -mt-4 mb-5 border-b border-border bg-card px-4 sm:-mx-6 sm:-mt-6 sm:px-6">
        <div role="tablist" className="no-scrollbar mx-auto flex max-w-6xl gap-6 overflow-x-auto">
          {visibles.map((pestana) => (
            <button
              key={pestana.id}
              type="button"
              role="tab"
              aria-selected={seccion === pestana.id}
              onClick={() => ir(pestana.id)}
              className={`shrink-0 border-b-2 pt-3.5 pb-3 text-sm whitespace-nowrap transition-colors ${
                seccion === pestana.id ? 'border-primary font-semibold text-foreground' : 'border-transparent font-medium text-muted-foreground hover:text-foreground'
              }`}
            >
              {pestana.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl">
        {seccion === 'clientes' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[20rem_1fr] lg:items-start">
            <div className={clienteId ? 'hidden lg:block' : ''}>
              <ListaClientes seleccionado={clienteId} onAbrir={(id) => router.push(`/administracion?seccion=clientes&cliente=${id}`)} />
            </div>
            {clienteId ? (
              <FichaCliente key={clienteId} clienteId={clienteId} onVolver={() => ir('clientes')} />
            ) : (
              <div className="hidden rounded-xl border border-dashed border-input p-10 text-center text-sm text-muted-foreground lg:block">
                Elige un cliente de la lista para ver sus sedes, contactos y equipos.
              </div>
            )}
          </div>
        )}
        {seccion === 'catalogos' && <CatalogosAdmin />}
        {seccion === 'parametros' && (
          <div className="space-y-6">
            <ParametrosAdmin />
            <CorreoAdmin />
          </div>
        )}
        {seccion === 'usuarios' && <UsuariosAdmin />}
        {seccion === 'permisos' && <PermisosAdmin />}
      </div>
    </div>
  );
}
