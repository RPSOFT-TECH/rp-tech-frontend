'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  definir_permisos_consulta,
  empresas_permisos,
  type EmpresaPermisos,
  type PermisosConsulta,
} from '@/lib/datos/actions';
import { DataTable, Switch } from '@/components/ui';

const CAMPOS: { clave: keyof PermisosConsulta; label: string }[] = [
  { clave: 'casos', label: 'Casos' },
  { clave: 'reportes', label: 'Reportes' },
  { clave: 'clientes', label: 'Clientes' },
];

export function PermisosAdmin() {
  const [filas, setFilas] = useState<EmpresaPermisos[]>([]);
  const [marca, setMarca] = useState(0);

  useEffect(() => {
    let vigente = true;
    empresas_permisos().then((datos) => {
      if (vigente) setFilas(datos);
    });
    return () => {
      vigente = false;
    };
  }, [marca]);

  const cambiar = async (empresa: EmpresaPermisos, campo: keyof PermisosConsulta, valor: boolean) => {
    const resultado = await definir_permisos_consulta(empresa.id, {
      ...empresa.permisos_consulta,
      [campo]: valor,
    });
    if (!resultado.ok) {
      toast.error(resultado.error);
      return;
    }
    toast.success('Permisos actualizados');
    setMarca((actual) => actual + 1);
  };

  return (
    <div className="max-w-4xl space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="font-semibold">Qué ve el rol Consulta</p>
        <p className="text-sm text-muted-foreground">Solo lectura. Elige por empresa qué secciones puede ver. Los cambios se guardan al instante.</p>
      </div>
    <DataTable
        className="h-auto"
      datos={filas}
      claveFila={(fila) => fila.id}
      textoVacio="No hay empresas para configurar."
      columnas={[
        { clave: 'nombre', encabezado: 'Empresa', render: (fila: EmpresaPermisos) => <span className="font-semibold">{fila.nombre}</span> },
        ...CAMPOS.map((campo) => ({
          clave: campo.clave,
          encabezado: campo.label,
          render: (fila: EmpresaPermisos) => (
            <label className="flex cursor-pointer items-center gap-2">
              <Switch
                checked={fila.permisos_consulta[campo.clave]}
                aria-label={campo.label}
                onCheckedChange={(checked) => void cambiar(fila, campo.clave, checked)}
              />
              <span className={fila.permisos_consulta[campo.clave] ? '' : 'text-muted-foreground'}>
                {fila.permisos_consulta[campo.clave] ? 'Puede ver' : 'Oculto'}
              </span>
            </label>
          ),
        })),
      ]}
    />
    </div>
  );
}
