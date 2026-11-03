'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EquipoVista, Sede } from '@/lib/datos-simulados/actions';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ModalEquipo } from './altas/ModalEquipo';

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

const claseSelect =
  'w-full min-h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50';

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

  return (
    <Card className="h-fit shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Equipo</CardTitle>
        <Button type="button" variant="ghost" className="min-h-11 text-primary" disabled={!clienteId} onClick={() => setAlta(true)}>
          + Crear
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <Label htmlFor="equipo">Equipo</Label>
          <select
            id="equipo"
            disabled={!clienteId}
            value={watch('equipo_id')}
            onChange={(e) => onEquipoChange(e.target.value)}
            className={claseSelect}
          >
            <option value="">Selecciona un equipo...</option>
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.numero_serie} — {eq.linea_nombre} ({eq.modelo})
              </option>
            ))}
          </select>
          {errors.equipo_id && <p className="text-xs text-destructive">{errors.equipo_id.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Dato label="Línea" valor={equipoSeleccionado?.linea_nombre} />
          <Dato label="Modelo" valor={equipoSeleccionado?.modelo} />
          <Dato label="Cabezal" valor={equipoSeleccionado?.cabezal_nombre} />
          <Dato label="N° de cabezales" valor={equipoSeleccionado ? String(equipoSeleccionado.cabezal_cantidad) : undefined} />
          <Dato label="Instalación" valor={equipoSeleccionado ? fechaCorta(equipoSeleccionado.fecha_instalacion) : undefined} />
        </div>
      </CardContent>
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
    </Card>
  );
}

function Dato({ label, valor }: { label: string; valor: string | undefined }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="min-h-11 px-2.5 py-2 rounded-md bg-muted text-xs text-foreground flex items-center border border-border">
        {valor || '—'}
      </div>
    </div>
  );
}
