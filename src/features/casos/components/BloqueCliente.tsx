'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Cliente, Contacto, Sede } from '@/lib/datos-simulados/actions';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { ModalCliente } from './altas/ModalCliente';
import { ModalSede } from './altas/ModalSede';
import { ModalContacto } from './altas/ModalContacto';

interface BloqueClienteProps {
  form: UseFormReturn<NuevoCasoFormValues>;
  queryCliente: string;
  setQueryCliente: (val: string) => void;
  clienteSeleccionado: Cliente | null;
  clientesResultados: Cliente[];
  buscando: boolean;
  sedes: Sede[];
  contactos: Contacto[];
  onSeleccionarCliente: (c: Cliente) => void;
  onCambiarCliente: () => void;
  onContactoChange: (idStr: string) => void;
  onSedeCreada: (sede: Sede) => void;
  onContactoCreado: (contacto: Contacto) => void;
}

const claseSelect =
  'w-full min-h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50';

export function BloqueCliente({
  form,
  queryCliente,
  setQueryCliente,
  clienteSeleccionado,
  clientesResultados,
  buscando,
  sedes,
  contactos,
  onSeleccionarCliente,
  onCambiarCliente,
  onContactoChange,
  onSedeCreada,
  onContactoCreado,
}: BloqueClienteProps) {
  const [altaCliente, setAltaCliente] = useState(false);
  const [altaSede, setAltaSede] = useState(false);
  const [altaContacto, setAltaContacto] = useState(false);
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const buscandoCliente = !clienteSeleccionado && queryCliente.trim().length >= 2;

  return (
    <Card className="h-fit shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-semibold">Cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-1.5 relative">
          <Label htmlFor="empresa">Empresa</Label>
          {clienteSeleccionado ? (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{clienteSeleccionado.razon_social}</p>
                  <p className="text-xs text-muted-foreground">
                    {clienteSeleccionado.ruc ? `RUC: ${clienteSeleccionado.ruc}` : 'Sin RUC'}
                  </p>
                  {clienteSeleccionado.soporte_vigente && <p className="text-xs text-primary">Soporte vigente</p>}
                </div>
                <Button type="button" variant="outline" className="min-h-11" onClick={onCambiarCliente}>
                  Cambiar
                </Button>
              </div>
            </div>
          ) : (
            <SearchInput
              id="empresa"
              placeholder="Buscar por razón social o RUC..."
              value={queryCliente}
              onChange={(e) => setQueryCliente(e.target.value)}
              onClear={() => setQueryCliente('')}
              className={errors.cliente_id ? 'border-destructive' : ''}
            />
          )}
          {errors.cliente_id && <p className="text-xs text-destructive">{errors.cliente_id.message}</p>}
          {buscandoCliente && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {buscando && <p className="px-3 py-2 text-xs text-muted-foreground">Buscando...</p>}
              {clientesResultados.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSeleccionarCliente(c)}
                  className="w-full text-left px-3 py-2.5 hover:bg-muted text-sm border-b border-border transition-colors"
                >
                  <div className="font-medium text-foreground">{c.razon_social}</div>
                  <div className="text-xs text-muted-foreground flex gap-2">
                    <span>{c.ruc ? `RUC: ${c.ruc}` : 'Sin RUC'}</span>
                    {c.soporte_vigente && <span className="text-primary">Soporte vigente</span>}
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAltaCliente(true)}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-primary hover:bg-muted min-h-11"
              >
                + Crear cliente
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="sede">Sede</Label>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 text-primary"
              disabled={!clienteSeleccionado}
              onClick={() => setAltaSede(true)}
            >
              + Crear
            </Button>
          </div>
          <select id="sede" disabled={!clienteSeleccionado} value={watch('sede_id')} {...register('sede_id')} className={claseSelect}>
            <option value="">Selecciona una sede...</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} — {s.direccion} ({s.distrito}) {s.principal ? '• Principal' : ''}
              </option>
            ))}
          </select>
          {errors.sede_id && <p className="text-xs text-destructive">{errors.sede_id.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="contacto">Contacto</Label>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 text-primary"
              disabled={!clienteSeleccionado}
              onClick={() => setAltaContacto(true)}
            >
              + Crear
            </Button>
          </div>
          <select
            id="contacto"
            disabled={!clienteSeleccionado}
            value={watch('contacto_id')}
            onChange={(e) => onContactoChange(e.target.value)}
            className={claseSelect}
          >
            <option value="">Selecciona un contacto...</option>
            {contactos.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.nombre} — {ct.cargo}
              </option>
            ))}
          </select>
          {errors.contacto_id && <p className="text-xs text-destructive">{errors.contacto_id.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            type="text"
            placeholder="Número de contacto"
            disabled={!clienteSeleccionado}
            {...register('telefono')}
            className={`min-h-11 ${errors.telefono ? 'border-destructive' : ''}`}
          />
          {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
        </div>
      </CardContent>

      <ModalCliente abierto={altaCliente} onCerrar={() => setAltaCliente(false)} onCreado={onSeleccionarCliente} />
      {clienteSeleccionado && (
        <>
          <ModalSede
            abierto={altaSede}
            clienteId={clienteSeleccionado.id}
            onCerrar={() => setAltaSede(false)}
            onCreada={onSedeCreada}
          />
          <ModalContacto
            abierto={altaContacto}
            clienteId={clienteSeleccionado.id}
            onCerrar={() => setAltaContacto(false)}
            onCreado={onContactoCreado}
          />
        </>
      )}
    </Card>
  );
}
