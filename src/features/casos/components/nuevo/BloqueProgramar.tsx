'use client';

import { useEffect, useState } from 'react';
import { agenda_tecnico, tecnicos, type TecnicoLista, type VisitaAgenda } from '@/lib/datos/actions';
import { CustomSelect } from '@/components/ui/custom-select';
import { SelectorFecha } from '@/components/ui/selector-fecha';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
    <Card className="md:col-span-2 shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base font-semibold">Programar visita</CardTitle>
        {mostrarInterruptor && (
          <button
            type="button"
            role="switch"
            aria-checked={activo}
            onClick={() => onActivoChange?.(!activo)}
            className="flex items-center gap-2 text-sm text-foreground min-h-11"
          >
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${activo ? 'bg-primary' : 'bg-muted border border-border'}`}
            >
              <span
                className={`absolute top-0.5 size-5 rounded-full bg-background shadow transition-transform ${activo ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </span>
            Programar ahora
          </button>
        )}
      </CardHeader>
      {visible && (
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tecnico_visita">Técnico</Label>
              <CustomSelect
                id="tecnico_visita"
                value={valor.tecnicoId}
                onChange={cambiarTecnico}
                placeholder="Selecciona un técnico..."
                options={lista.map((tecnico) => ({ value: tecnico.id, label: tecnico.nombre_completo }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adjunto_visita">Técnico adjunto</Label>
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
            <div className="space-y-1.5">
              <SelectorFecha
                id="fecha_visita"
                label="Fecha"
                value={valor.fecha}
                onChange={(fecha) => onChange({ ...valor, fecha })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hora_visita">Hora</Label>
              <input
                id="hora_visita"
                type="time"
                value={valor.hora}
                onChange={(e) => onChange({ ...valor, hora: e.target.value })}
                className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground"
              />
            </div>
          </div>

          {valor.tecnicoId && valor.fecha && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agenda del día</p>
              {visitas.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tiene visitas ese día.</p>
              ) : (
                <ul className="space-y-1">
                  {visitas.map((visita) => (
                    <li key={visita.id} className="text-sm text-foreground">
                      <span className="font-mono">{visita.hora_programada?.slice(0, 5) || '—'}</span>
                      {' · '}
                      {visita.cliente_razon_social}
                      {' · '}
                      {visita.como === 'adjunto' ? 'Adjunto' : 'Técnico'}
                      {' · '}
                      {visita.numero_caso}
                    </li>
                  ))}
                </ul>
              )}
              {aviso && (
                <p className="text-sm text-foreground bg-accent border border-border rounded-md px-3 py-2">{aviso}</p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
