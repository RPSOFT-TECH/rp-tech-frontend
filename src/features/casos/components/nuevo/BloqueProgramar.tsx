'use client';

import { useEffect, useRef, useState } from 'react';
import { agenda_tecnico, tecnicos, type TecnicoLista, type VisitaAgenda } from '@/lib/datos/actions';
import { CustomSelect } from '@/components/ui/custom-select';
import { SelectorFecha } from '@/components/ui/selector-fecha';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Paperclip, Upload, X } from 'lucide-react';
import { avisoDeCruce } from './cruce-horario';

export interface ProgramacionVisita {
  tecnicoId: string;
  adjuntoId: string;
  fecha: string;
  hora: string;
  numeroReporte?: string;
  desarrolloServicio?: string;
  adjuntoNombre?: string;
  horaIngreso?: string;
  horaSalida?: string;
  numeroHoras?: string;
  estado?: string;
}

interface BloqueProgramarProps {
  valor: ProgramacionVisita;
  onChange: (valor: ProgramacionVisita) => void;
  excluirReporteId?: string;
}

function calcularHoras(ingreso?: string, salida?: string): string {
  if (!ingreso || !salida) return '';
  const [h1, m1] = ingreso.split(':').map(Number);
  const [h2, m2] = salida.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '';
  const mins = h2 * 60 + m2 - (h1 * 60 + m1);
  if (mins <= 0) return '0';
  const horas = (mins / 60).toFixed(1);
  return horas.endsWith('.0') ? horas.slice(0, -2) : horas;
}

const OPCIONES_ESTADO = [
  { value: 'por_programar', label: 'Abierto - Por programar' },
  { value: 'en_espera', label: 'Abierto - en espera' },
  { value: 'en_atencion', label: 'En atención' },
  { value: 'cerrado', label: 'Cerrado' },
  { value: 'otros', label: 'Otros...' },
];

export function BloqueProgramar({ valor, onChange, excluirReporteId }: BloqueProgramarProps) {
  const [lista, setLista] = useState<TecnicoLista[]>([]);
  const [consulta, setConsulta] = useState<{ tecnicoId: string; fecha: string; visitas: VisitaAgenda[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!valor.tecnicoId || !valor.fecha) return;
    const tecnicoId = valor.tecnicoId;
    const fecha = valor.fecha;
    let vigente = true;
    agenda_tecnico(tecnicoId, fecha).then((visitas) => {
      if (vigente) setConsulta({ tecnicoId, fecha, visitas });
    });
    return () => {
      vigente = false;
    };
  }, [valor.tecnicoId, valor.fecha]);

  const visitas =
    consulta && consulta.tecnicoId === valor.tecnicoId && consulta.fecha === valor.fecha ? consulta.visitas : [];
  const aviso = avisoDeCruce(visitas, valor.hora, excluirReporteId);

  const cambiarTecnico = (tecnicoId: string) => {
    onChange({
      ...valor,
      tecnicoId,
      adjuntoId: valor.adjuntoId === tecnicoId ? '' : valor.adjuntoId,
    });
  };

  const cambiarIngreso = (hIngreso: string) => {
    const horas = calcularHoras(hIngreso, valor.horaSalida);
    onChange({
      ...valor,
      horaIngreso: hIngreso,
      numeroHoras: horas,
    });
  };

  const cambiarSalida = (hSalida: string) => {
    const horas = calcularHoras(valor.horaIngreso, hSalida);
    onChange({
      ...valor,
      horaSalida: hSalida,
      numeroHoras: horas,
    });
  };

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        ...valor,
        adjuntoNombre: file.name,
      });
    }
  };

  const eliminarArchivo = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange({
      ...valor,
      adjuntoNombre: '',
    });
  };

  return (
    <>
      <hr className="border-border md:col-span-12 my-1" />

      {/* ── Fila 5: Tecnico + Fecha + hora + # de Reporte ── */}
      <div className="space-y-1.5 md:col-span-4 lg:col-span-4">
        <Label htmlFor="tecnico_visita">Tecnico</Label>
        <CustomSelect
          id="tecnico_visita"
          value={valor.tecnicoId}
          onChange={cambiarTecnico}
          placeholder="Seleccionar técnico..."
          options={lista.map((tecnico) => ({ value: tecnico.id, label: tecnico.nombre_completo }))}
        />
      </div>

      <div className="space-y-1.5 md:col-span-3 lg:col-span-3">
        <Label htmlFor="fecha_visita" className="flex items-center gap-1.5">
          <Calendar className="size-3.5 text-muted-foreground" /> Fecha
        </Label>
        <SelectorFecha id="fecha_visita" value={valor.fecha} onChange={(fecha) => onChange({ ...valor, fecha })} />
      </div>

      <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
        <Label htmlFor="hora_visita" className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" /> hora
        </Label>
        <Input
          id="hora_visita"
          type="time"
          value={valor.hora}
          onChange={(e) => onChange({ ...valor, hora: e.target.value })}
        />
      </div>

      <div className="space-y-1.5 md:col-span-3 lg:col-span-3">
        <Label htmlFor="num_reporte"># de Reporte</Label>
        <Input
          id="num_reporte"
          type="text"
          placeholder="N° Reporte"
          value={valor.numeroReporte ?? ''}
          onChange={(e) => onChange({ ...valor, numeroReporte: e.target.value })}
        />
      </div>

      {valor.tecnicoId && valor.fecha && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:col-span-12 -mt-2 mb-1">
          {aviso ? (
            <span className="rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              {aviso}
            </span>
          ) : valor.hora ? (
            <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              Sin cruces a esa hora
            </span>
          ) : null}
          <span className="text-muted-foreground">
            {visitas.length === 0
              ? 'No tiene otras visitas ese día.'
              : `Ese día: ${visitas
                  .map(
                    (v) =>
                      `${v.hora_programada?.slice(0, 5) || '—'} ${v.numero_caso}${
                        v.como === 'adjunto' ? ' (adjunto)' : ''
                      }`,
                  )
                  .join(' · ')}`}
          </span>
        </div>
      )}

      {/* ── Fila 6: Desarrollo del servicio ── */}
      <div className="space-y-1.5 md:col-span-12">
        <Label htmlFor="desarrollo_servicio">Desarrollo del servicio</Label>
        <Textarea
          id="desarrollo_servicio"
          rows={3}
          placeholder="Escriba los detalles o informe del servicio..."
          value={valor.desarrolloServicio ?? ''}
          onChange={(e) => onChange({ ...valor, desarrolloServicio: e.target.value })}
          className="bg-amber-50/50 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-900/40 focus-visible:ring-amber-500/30"
        />
      </div>

      {/* ── Fila 7: Adjunto ── */}
      <div className="space-y-1.5 md:col-span-12">
        <Label htmlFor="adjunto_archivo" className="flex items-center gap-1.5">
          <Paperclip className="size-3.5 text-muted-foreground" /> Adjunto
        </Label>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleArchivoSeleccionado}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <div className="relative flex-1">
            <Input
              id="adjunto_archivo"
              readOnly
              placeholder="Ningún archivo seleccionado"
              value={valor.adjuntoNombre ?? ''}
              className="w-full pr-9 bg-amber-50/50 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-900/40 text-foreground"
            />
            {valor.adjuntoNombre && (
              <button
                type="button"
                onClick={eliminarArchivo}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-destructive rounded-md transition-colors"
                title="Quitar archivo adjunto"
                aria-label="Quitar archivo adjunto"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 font-bold px-4"
            title="Seleccionar archivo"
          >
            ...
          </Button>
        </div>
        {valor.adjuntoNombre && (
          <div className="flex items-center gap-2 pt-0.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Archivo:</span>
            <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground">
              {valor.adjuntoNombre}
            </span>
            <button
              type="button"
              onClick={eliminarArchivo}
              className="inline-flex items-center gap-1 text-destructive hover:underline font-medium text-[11px] cursor-pointer"
            >
              <X className="size-3" /> Eliminar
            </button>
          </div>
        )}
      </div>

      {/* ── Fila 8: H.Ingreso + H. salida + N° Horas + Estado ── */}
      <div className="space-y-1.5 md:col-span-3 lg:col-span-3">
        <Label htmlFor="h_ingreso" className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" /> H.Ingreso
        </Label>
        <Input
          id="h_ingreso"
          type="time"
          value={valor.horaIngreso ?? ''}
          onChange={(e) => cambiarIngreso(e.target.value)}
          className="bg-amber-50/50 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-900/40"
        />
      </div>

      <div className="space-y-1.5 md:col-span-3 lg:col-span-3">
        <Label htmlFor="h_salida" className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" /> H. salida
        </Label>
        <Input
          id="h_salida"
          type="time"
          value={valor.horaSalida ?? ''}
          onChange={(e) => cambiarSalida(e.target.value)}
          className="bg-amber-50/50 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-900/40"
        />
      </div>

      <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
        <Label htmlFor="num_horas">N° Horas</Label>
        <Input
          id="num_horas"
          readOnly
          disabled
          value={valor.numeroHoras || '—'}
          className="bg-muted font-mono text-center text-muted-foreground"
        />
      </div>

      <div className="space-y-1.5 md:col-span-4 lg:col-span-4">
        <Label htmlFor="estado_caso">Estado</Label>
        <CustomSelect
          id="estado_caso"
          value={valor.estado ?? 'por_programar'}
          onChange={(estado) => onChange({ ...valor, estado })}
          placeholder="Seleccionar estado..."
          options={OPCIONES_ESTADO}
        />
      </div>
    </>
  );
}
