'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EquipoVista, Sede } from '@/lib/datos/actions';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { CustomSelect } from '@/components/ui/custom-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModalEquipo } from './altas/ModalEquipo';
import { EtiquetaConAlta } from './BloqueCliente';

interface Opcion {
  id: string;
  nombre: string;
}

interface BloqueEquipoProps {
  form: UseFormReturn<NuevoCasoFormValues>;
  clienteId: string | null;
  equipos: EquipoVista[];
  equipoSeleccionado: EquipoVista | null;
  sedes: Sede[];
  lineas: Opcion[];
  cabezales: Opcion[];
  onEquipoChange: (idStr: string) => void;
  onEquipoCreado: (equipo: EquipoVista) => void;
  catalogos: {
    tipos_servicio: { id: string; nombre: string }[];
  };
}

function fechaCorta(iso: string | undefined): string {
  if (!iso) return '—';
  const [anio, mes, dia] = iso.slice(0, 10).split('-');
  if (!anio || !mes || !dia) return iso;
  return `${dia}/${mes}/${anio}`;
}

export function BloqueEquipo({
  form,
  clienteId,
  equipos,
  equipoSeleccionado,
  sedes,
  lineas,
  cabezales,
  onEquipoChange,
  onEquipoCreado,
  catalogos,
}: BloqueEquipoProps) {
  const [alta, setAlta] = useState(false);
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const e = equipoSeleccionado;
  const ficha = e
    ? [
        e.cabezal_nombre ? `Cabezal ${e.cabezal_nombre} × ${e.cabezal_cantidad}` : null,
        e.fecha_instalacion ? `Instalado ${fechaCorta(e.fecha_instalacion)}` : null,
      ].filter(Boolean)
    : [];

  return (
    <>
      <hr className="border-border md:col-span-12" />
      {/* ── Fila 3: Equipo + Cabezales (info) + Tipo de Servicio ── */}
      <div className="space-y-1.5 md:col-span-5 lg:col-span-5">
        <EtiquetaConAlta
          htmlFor="equipo"
          texto="Equipo"
          accion="+ Nuevo equipo"
          disabled={!clienteId}
          onClick={() => setAlta(true)}
        />
        <CustomSelect
          id="equipo"
          disabled={!clienteId}
          value={watch('equipo_id') || ''}
          onChange={onEquipoChange}
          placeholder={clienteId ? 'Selecciona un equipo...' : 'Primero elige la empresa'}
          options={equipos.map((eq) => ({
            value: eq.id,
            label: `${eq.numero_serie} · ${eq.linea_nombre} · ${eq.modelo}`,
          }))}
        />
        {ficha.length > 0 && <p className="text-xs text-muted-foreground">{ficha.join(' · ')}</p>}
        {errors.equipo_id && <p className="text-xs text-destructive">{errors.equipo_id.message}</p>}
      </div>

      <div className="space-y-1.5 md:col-span-3 lg:col-span-3">
        <Label>Cabezales</Label>
        <div className="flex gap-2">
          <Input
            value={e?.cabezal_cantidad ? String(e.cabezal_cantidad) : ''}
            placeholder="Cant."
            readOnly
            disabled
            className="w-14 text-center bg-muted/40 font-mono text-xs text-foreground shrink-0 md:h-10"
          />
          <Input
            value={e?.cabezal_nombre ?? ''}
            placeholder="Modelo cabezal"
            readOnly
            disabled
            className="flex-1 bg-muted/40 text-xs text-foreground truncate md:h-10"
          />
        </div>
      </div>

      <div className="space-y-1.5 md:col-span-4 lg:col-span-4">
        <Label htmlFor="tipo_servicio_id">
          Tipo de Servicio<span aria-hidden className="-ml-1.5 text-destructive">*</span>
        </Label>
        <CustomSelect
          id="tipo_servicio_id"
          value={watch('tipo_servicio_id') || ''}
          onChange={(valor) => setValue('tipo_servicio_id', valor, { shouldValidate: true, shouldDirty: true })}
          placeholder="Selecciona tipo..."
          options={catalogos.tipos_servicio.map((item) => ({ value: item.id, label: item.nombre }))}
        />
        {errors.tipo_servicio_id && <p className="text-xs text-destructive">{errors.tipo_servicio_id.message}</p>}
      </div>

      {clienteId && (
        <ModalEquipo
          abierto={alta}
          clienteId={clienteId}
          sedes={sedes}
          lineas={lineas}
          cabezales={cabezales}
          onCerrar={() => setAlta(false)}
          onCreado={onEquipoCreado}
        />
      )}
    </>
  );
}
