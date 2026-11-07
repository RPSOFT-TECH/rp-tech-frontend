'use client';

import { useState } from 'react';
import { programar_visita, reprogramar_visita } from '@/lib/datos-simulados/actions';
import { Button, Card, SelectorFecha } from '@/components/ui';
import type { FormAccionProps } from './tipos';

export function FormProgramarVisita({ caso, onEjecutar, onCerrar }: FormAccionProps) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [adjunto, setAdjunto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <Card className="p-6 mb-6 border border-primary/50 bg-primary/5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Programar visita</h3>
      {mensaje && (
        <div className="mb-3 text-xs border border-destructive/40 bg-destructive/10 text-destructive rounded p-2">{mensaje}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <SelectorFecha label="Fecha" value={fecha} onChange={setFecha} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Hora</label>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
        </div>
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Técnico</label>
        <input
          value={tecnico}
          onChange={(e) => setTecnico(e.target.value)}
          placeholder="ID del técnico"
          className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Técnico adjunto (opcional)</label>
        <input
          value={adjunto}
          onChange={(e) => setAdjunto(e.target.value)}
          placeholder="ID del adjunto"
          className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setCargando(true);
            setMensaje(null);
            programar_visita(caso.id, tecnico, fecha, hora, adjunto || null).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al programar.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Programar'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </Card>
  );
}

export function FormReprogramarVisita({ caso, onEjecutar, onCerrar }: FormAccionProps) {
  const ultima = caso.visitas[caso.visitas.length - 1];
  const [fecha, setFecha] = useState(ultima?.fecha_programada || '');
  const [hora, setHora] = useState(ultima?.hora_programada || '');
  const [tecnico, setTecnico] = useState(ultima?.tecnico_id || '');
  const [adjunto, setAdjunto] = useState(ultima?.tecnico_adjunto_id || '');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <Card className="p-6 mb-6 border border-primary/50 bg-primary/5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Reprogramar visita</h3>
      {mensaje && (
        <div className="mb-3 text-xs border border-destructive/40 bg-destructive/10 text-destructive rounded p-2">{mensaje}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <SelectorFecha label="Fecha" value={fecha} onChange={setFecha} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Hora</label>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
        </div>
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Técnico</label>
        <input value={tecnico} onChange={(e) => setTecnico(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Técnico adjunto (opcional)</label>
        <input value={adjunto} onChange={(e) => setAdjunto(e.target.value)} className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm" />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setCargando(true);
            setMensaje(null);
            reprogramar_visita(ultima!.id, tecnico, fecha, hora, adjunto || null).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al reprogramar.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Reprogramar'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
