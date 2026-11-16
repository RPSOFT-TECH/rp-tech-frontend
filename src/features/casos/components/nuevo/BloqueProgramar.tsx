'use client';

import { useEffect, useState } from 'react';
import { agenda_tecnico, tecnicos, type TecnicoLista, type VisitaAgenda } from '@/lib/datos/actions';
import { CustomSelect } from '@/components/ui/custom-select';
import { SelectorFecha } from '@/components/ui/selector-fecha';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { avisoDeCruce } from './cruce-horario';

export interface ProgramacionVisita {
  tecnicoId: string;
  adjuntoId: string;
  fecha: string;
  hora: string;
}

interface BloqueProgramarProps {
  valor: ProgramacionVisita;
  onChange: (valor: ProgramacionVisita) => void;
  activo?: boolean;
  onActivoChange?: (activo: boolean) => void;
  mostrarInterruptor?: boolean;
  excluirReporteId?: string;
}

export function BloqueProgramar({
  valor,
  onChange,
  activo = false,
  onActivoChange,
  mostrarInterruptor = true,
  excluirReporteId,
}: BloqueProgramarProps) {
  const visible = mostrarInterruptor ? activo : true;
  const [lista, setLista] = useState<TecnicoLista[]>([]);
  const [consulta, setConsulta] = useState<{ tecnicoId: string; fecha: string; visitas: VisitaAgenda[] } | null>(null);

  useEffect(() => {
    let vigente = true;
    tecnicos().then((datos) => {
      if (vigente) setLista(datos);
    });
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    if (!visible || !valor.tecnicoId || !valor.fecha) return;
    const tecnicoId = valor.tecnicoId;
    const fecha = valor.fecha;
    let vigente = true;
    agenda_tecnico(tecnicoId, fecha).then((visitas) => {
      if (vigente) setConsulta({ tecnicoId, fecha, visitas });
    });
    return () => {
      vigente = false;
    };
  }, [visible, valor.tecnicoId, valor.fecha]);

  const visitas =
    consulta && consulta.tecnicoId === valor.tecnicoId && consulta.fecha === valor.fecha ? consulta.visitas : [];
  const aviso = avisoDeCruce(visitas, valor.hora, excluirReporteId);
  const adjuntos = lista.filter((tecnico) => tecnico.id !== valor.tecnicoId);

  const cambiarTecnico = (tecnicoId: string) => {
    onChange({
      ...valor,
      tecnicoId,
      adjuntoId: valor.adjuntoId === tecnicoId ? '' : valor.adjuntoId,
    });
  };

  return (
    <>
      <hr className="border-border md:col-span-12" />
      <div className="flex items-center justify-between gap-3 md:col-span-12">
        <label htmlFor="switch-programar-ahora" className="cursor-pointer select-none">
          <span className="block text-sm font-semibold text-foreground">Programar visita</span>
          <span className="block text-xs text-muted-foreground">Opcional. Puedes programarla después desde el caso.</span>
        </label>
        {mostrarInterruptor && <Switch id="switch-programar-ahora" checked={activo} onCheckedChange={onActivoChange} />}
      </div>

      {visible && (
        <>
          <div className="space-y-1.5 md:col-span-6 lg:col-span-4">
            <Label htmlFor="tecnico_visita">
              Técnico<span aria-hidden className="-ml-1.5 text-destructive">*</span>
            </Label>
            <CustomSelect
              id="tecnico_visita"
              value={valor.tecnicoId}
              onChange={cambiarTecnico}
              placeholder="Selecciona un técnico..."
              options={lista.map((tecnico) => ({ value: tecnico.id, label: tecnico.nombre_completo }))}
            />
          </div>
          <div className="space-y-1.5 md:col-span-6 lg:col-span-3">
            <Label htmlFor="fecha_visita">
              Fecha<span aria-hidden className="-ml-1.5 text-destructive">*</span>
            </Label>
            <SelectorFecha id="fecha_visita" value={valor.fecha} onChange={(fecha) => onChange({ ...valor, fecha })} />
          </div>
          <div className="space-y-1.5 md:col-span-6 lg:col-span-2">
            <Label htmlFor="hora_visita">
              Hora<span aria-hidden className="-ml-1.5 text-destructive">*</span>
            </Label>
            <Input id="hora_visita" type="time" value={valor.hora} onChange={(e) => onChange({ ...valor, hora: e.target.value })} />
          </div>
          <div className="space-y-1.5 md:col-span-6 lg:col-span-3">
            <Label htmlFor="adjunto_visita">
              Adjunto <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <CustomSelect
              id="adjunto_visita"
              value={valor.adjuntoId}
              onChange={(adjuntoId) => onChange({ ...valor, adjuntoId })}
              placeholder="Sin adjunto"
              options={[
                { value: '', label: 'Sin adjunto' },
                ...adjuntos.map((tecnico) => ({ value: tecnico.id, label: tecnico.nombre_completo })),
              ]}
            />
          </div>

          {valor.tecnicoId && valor.fecha && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:col-span-12">
              {aviso ? (
                <span className="rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">{aviso}</span>
              ) : valor.hora ? (
                <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Sin cruces a esa hora
                </span>
              ) : null}
              <span className="text-muted-foreground">
                {visitas.length === 0
                  ? 'No tiene otras visitas ese día.'
                  : `Ese día: ${visitas
                      .map((v) => `${v.hora_programada?.slice(0, 5) || '—'} ${v.numero_caso}${v.como === 'adjunto' ? ' (adjunto)' : ''}`)
                      .join(' · ')}`}
              </span>
            </div>
          )}
        </>
      )}
    </>
  );
}
