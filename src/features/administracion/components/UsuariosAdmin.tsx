'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { leerSesionEstable, usuarios_admin, type UsuarioAdmin } from '@/lib/datos-simulados/actions';
import { Button, DataTable, Modal } from '@/components/ui';
import { NOMBRE_ESTADO, NOMBRE_ROL } from './etiquetas';
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" className="min-h-11" onClick={() => setAlta(true)}>
          + Nuevo usuario
        </Button>
      </div>
      <DataTable
        datos={filas}
        claveFila={(fila) => fila.id}
        textoVacio="No hay usuarios en la empresa."
        onFilaClick={(fila) => setUsuarioId(fila.id)}
        columnas={[
          { clave: 'nombre', encabezado: 'Usuario', render: (fila) => fila.nombre_completo },
          { clave: 'email', encabezado: 'Correo' },
          { clave: 'telefono', encabezado: 'Teléfono', render: (fila) => fila.telefono || '—' },
          {
            clave: 'roles',
            encabezado: 'Roles',
            render: (fila) => {
              const roles = rolesDe(fila);
              if (roles.length === 0) return 'Sin roles';
              return roles
                .map((rol) => `${NOMBRE_ROL[rol.codigo]} · ${NOMBRE_ESTADO[rol.estado]} · ${rol.desde}${rol.hasta ? ` al ${rol.hasta}` : ''}`)
                .join('; ');
            },
          },
          { clave: 'activo', encabezado: 'Estado', render: (fila) => (fila.activo ? 'Activo' : 'Inactivo') },
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
      <Modal abierto={!!seleccionado} onCerrar={() => setUsuarioId(null)} titulo="Usuario y roles" tamano="lg">
        {seleccionado ? <RolesUsuario usuario={seleccionado} onCambio={() => setMarca((valor) => valor + 1)} /> : null}
      </Modal>
    </div>
  );
}
