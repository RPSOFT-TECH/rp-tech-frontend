'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EquipoVista, Sede } from '@/lib/datos/actions';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { CustomSelect } from '@/components/ui/custom-select';
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
}: BloqueEquipoProps) {
  const [alta, setAlta] = useState(false);
  const {
    watch,
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
    <div className="space-y-1.5 md:col-span-12">
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
        placeholder={clienteId ? 'Selecciona un equipo...' : 'Primero elige el cliente'}
        options={equipos.map((eq) => ({
          value: eq.id,
          label: `${eq.numero_serie} · ${eq.linea_nombre} · ${eq.modelo}`,
        }))}
      />
      {ficha.length > 0 && <p className="text-xs text-muted-foreground">{ficha.join(' · ')}</p>}
      {errors.equipo_id && <p className="text-xs text-destructive">{errors.equipo_id.message}</p>}
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
    </div>
  );
}
