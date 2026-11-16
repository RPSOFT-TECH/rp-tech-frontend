'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { leerSesionEstable, usuarios_admin, type UsuarioAdmin } from '@/lib/datos/actions';
import { Plus, Search } from 'lucide-react';
import { AvatarIniciales, Button, DataTable, Modal } from '@/components/ui';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { NOMBRE_ESTADO, NOMBRE_ROL } from '../comun/etiquetas';
import { FormularioUsuario } from './FormularioUsuario';
import { RolesUsuario } from './RolesUsuario';

export function UsuariosAdmin() {
  const sesion = useSyncExternalStore(() => () => {}, leerSesionEstable, () => null);
  const esSuper = sesion?.rolesVigentes.includes('superadmin') ?? false;
  const [filas, setFilas] = useState<UsuarioAdmin[]>([]);
  const [alta, setAlta] = useState(false);
  const [temporal, setTemporal] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [marca, setMarca] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const seleccionado = filas.find((fila) => fila.id === usuarioId) ?? null;

  useEffect(() => {
    let vigente = true;
    usuarios_admin().then((datos) => {
      if (vigente) setFilas(datos);
    });
    return () => {
      vigente = false;
    };
  }, [marca, alta]);

  const rolesDe = (fila: UsuarioAdmin) => (esSuper ? fila.roles : fila.roles.filter((rol) => rol.codigo !== 'superadmin'));
  const texto = busqueda.trim().toLowerCase();
  const visibles = texto
    ? filas.filter((fila) => `${fila.nombre_completo} ${fila.email}`.toLowerCase().includes(texto))
    : filas;
  const vigencia = (rol: UsuarioAdmin['roles'][number]) =>
    rol.estado === 'vigente' ? (rol.hasta ? `hasta ${rol.hasta}` : `desde ${rol.desde}`) : NOMBRE_ESTADO[rol.estado].toLowerCase();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo"
            aria-label="Buscar usuario"
            className="h-11 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 md:h-10"
          />
        </label>
        <Button type="button" className="h-11 gap-1.5 sm:ml-auto md:h-10" onClick={() => setAlta(true)}>
          <Plus className="size-4" />
          Nuevo usuario
        </Button>
      </div>
      <DataTable
        className="h-auto"
        datos={visibles}
        claveFila={(fila) => fila.id}
        textoVacio={texto ? 'Ningún usuario coincide con la búsqueda.' : 'No hay usuarios en la empresa.'}
        onFilaClick={(fila) => setUsuarioId(fila.id)}
        columnas={[
          {
            clave: 'nombre',
            encabezado: 'Usuario',
            render: (fila) => (
              <div className="flex items-center gap-3">
                <AvatarIniciales nombre={fila.nombre_completo} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{fila.nombre_completo}</p>
                  <p className="truncate text-xs text-muted-foreground">{fila.email}</p>
                </div>
              </div>
            ),
          },
          { clave: 'telefono', encabezado: 'Teléfono', render: (fila) => fila.telefono || '—' },
          {
            clave: 'roles',
            encabezado: 'Roles y vigencia',
            render: (fila) => {
              const roles = rolesDe(fila);
              if (roles.length === 0) return <span className="text-muted-foreground">Sin roles</span>;
              return (
                <div className="flex flex-wrap gap-1.5">
                  {roles.map((rol) => (
                    <span
                      key={rol.id}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold',
                        rol.estado === 'vigente' ? 'border-primary/25 bg-accent text-accent-foreground' : 'border-border bg-muted text-muted-foreground',
                      )}
                    >
                      {NOMBRE_ROL[rol.codigo]}
                      <span className="font-normal opacity-80">{vigencia(rol)}</span>
                    </span>
                  ))}
                </div>
              );
            },
          },
          {
            clave: 'activo',
            encabezado: 'Estado',
            render: (fila) => (
              <span
                className={cn(
                  'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold',
                  fila.activo ? 'bg-estado-ok text-estado-ok-fg' : 'bg-estado-anu text-estado-anu-fg',
                )}
              >
                {fila.activo ? 'Activo' : 'Inactivo'}
              </span>
            ),
          },
        ]}
      />
      <Modal abierto={alta} onCerrar={() => setAlta(false)} titulo="Nuevo usuario" tamano="lg">
        {alta ? (
          <FormularioUsuario
            onCerrar={() => setAlta(false)}
            onCreado={(clave) => {
              if (clave) setTemporal(clave);
              setMarca((valor) => valor + 1);
            }}
          />
        ) : null}
      </Modal>
      <Modal abierto={!!temporal} onCerrar={() => setTemporal(null)} titulo="Contraseña temporal" descripcion="Se muestra una sola vez.">
        <p className="font-mono text-lg text-foreground break-all">{temporal}</p>
        <div className="flex justify-end mt-4">
          <Button type="button" className="min-h-11" onClick={() => setTemporal(null)}>
            Entendido
          </Button>
        </div>
      </Modal>
      <Sheet open={!!seleccionado} onOpenChange={(abrir) => !abrir && setUsuarioId(null)}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto bg-card p-6 sm:max-w-md">
          <SheetTitle className="mb-4 text-lg">Usuario y roles</SheetTitle>
          {seleccionado ? <RolesUsuario usuario={seleccionado} onCambio={() => setMarca((valor) => valor + 1)} /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
