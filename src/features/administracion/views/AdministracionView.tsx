'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { leerSesionEstable } from '@/lib/datos-simulados/actions';
import { ShieldCheck } from 'lucide-react';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { ListaClientes } from '../components/clientes/ListaClientes';
import { FichaCliente } from '../components/clientes/FichaCliente';
import { UsuariosAdmin } from '../components/usuarios/UsuariosAdmin';
import { ParametrosAdmin } from '../components/sistema/ParametrosAdmin';
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
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-wrap gap-2">
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
