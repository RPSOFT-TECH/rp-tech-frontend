'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Cliente, Contacto, Sede } from '@/lib/datos/actions';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/custom-select';
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
    setValue,
    formState: { errors },
  } = form;
  const buscandoCliente = !clienteSeleccionado && queryCliente.trim().length >= 2;

  return (
    <>
      <div className="relative space-y-1.5 md:col-span-7 lg:col-span-9">
        <Label htmlFor="empresa">
          Cliente<span aria-hidden className="-ml-1.5 text-destructive">*</span>
        </Label>
        {clienteSeleccionado ? (
          <div className="flex min-h-11 items-center gap-2 rounded-lg border border-input bg-card px-3 py-1.5 md:min-h-10">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="truncate text-sm font-semibold text-foreground">{clienteSeleccionado.razon_social}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {clienteSeleccionado.ruc ? clienteSeleccionado.ruc : 'Sin RUC'}
              </span>
              {clienteSeleccionado.soporte_vigente && (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                  Soporte vigente
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={onCambiarCliente}
              aria-label="Cambiar cliente"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <SearchInput
            id="empresa"
            placeholder="Buscar por razón social o RUC..."
            value={queryCliente}
            onChange={(e) => setQueryCliente(e.target.value)}
            onClear={() => setQueryCliente('')}
            className={errors.cliente_id ? 'border-destructive' : ''}
            autoComplete="off"
          />
        )}
        {errors.cliente_id && <p className="text-xs text-destructive">{errors.cliente_id.message}</p>}
        {buscandoCliente && (
          <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
            {buscando && <p className="px-3 py-2 text-xs text-muted-foreground">Buscando...</p>}
            {clientesResultados.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSeleccionarCliente(c)}
                className="w-full border-b border-border px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
              >
                <div className="font-medium text-foreground">{c.razon_social}</div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{c.ruc ? c.ruc : 'Sin RUC'}</span>
                  {c.soporte_vigente && <span className="text-emerald-700 dark:text-emerald-400">Soporte vigente</span>}
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAltaCliente(true)}
              className="min-h-11 w-full px-3 py-2.5 text-left text-sm font-medium text-primary hover:bg-muted"
            >
              + Crear cliente
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5 md:col-span-6 lg:col-span-5">
        <EtiquetaConAlta
          htmlFor="sede"
          texto="Sede"
          accion="+ Nueva"
          disabled={!clienteSeleccionado}
          onClick={() => setAltaSede(true)}
        />
        <CustomSelect
          id="sede"
          disabled={!clienteSeleccionado}
          value={watch('sede_id') || ''}
          onChange={(valor) => setValue('sede_id', valor, { shouldValidate: true, shouldDirty: true })}
          placeholder={clienteSeleccionado ? 'Selecciona una sede...' : 'Primero elige el cliente'}
          options={sedes.map((s) => ({
            value: s.id,
            label: `${s.nombre} · ${s.direccion}${s.principal ? ' (principal)' : ''}`,
          }))}
        />
        {errors.sede_id && <p className="text-xs text-destructive">{errors.sede_id.message}</p>}
      </div>

      <div className="space-y-1.5 md:col-span-6 lg:col-span-4">
        <EtiquetaConAlta
          htmlFor="contacto"
          texto="Contacto"
          accion="+ Nuevo"
          disabled={!clienteSeleccionado}
          onClick={() => setAltaContacto(true)}
        />
        <CustomSelect
          id="contacto"
          disabled={!clienteSeleccionado}
          value={watch('contacto_id') || ''}
          onChange={onContactoChange}
          placeholder={clienteSeleccionado ? 'Selecciona un contacto...' : '—'}
          options={contactos.map((ct) => ({ value: ct.id, label: ct.cargo ? `${ct.nombre} · ${ct.cargo}` : ct.nombre }))}
        />
        {errors.contacto_id && <p className="text-xs text-destructive">{errors.contacto_id.message}</p>}
      </div>

      <div className="space-y-1.5 md:col-span-6 lg:col-span-3">
        <Label htmlFor="telefono">
          Teléfono<span aria-hidden className="-ml-1.5 text-destructive">*</span>
        </Label>
        <Input
          id="telefono"
          type="tel"
          inputMode="tel"
          placeholder="Número de contacto"
          disabled={!clienteSeleccionado}
          {...register('telefono')}
          className={errors.telefono ? 'border-destructive' : ''}
        />
        {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
      </div>

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
    </>
  );
}

export function EtiquetaConAlta({
  htmlFor,
  texto,
  accion,
  disabled,
  onClick,
}: {
  htmlFor: string;
  texto: string;
  accion: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor={htmlFor}>
        {texto}
        <span aria-hidden className="-ml-1.5 text-destructive">*</span>
      </Label>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="text-xs font-semibold text-primary hover:underline disabled:pointer-events-none disabled:opacity-40"
      >
        {accion}
      </button>
    </div>
  );
}
