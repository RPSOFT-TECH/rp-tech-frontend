'use client';

import { useEffect, useState } from 'react';
import { programar_visita, reprogramar_visita, tecnicos, type TecnicoLista } from '@/lib/datos/actions';
import { Button, Card, CustomSelect, SelectorFecha } from '@/components/ui';
import type { FormAccionProps } from './tipos';

export function FormProgramarVisita({ caso, onEjecutar, onCerrar }: FormAccionProps) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [adjunto, setAdjunto] = useState('');
  const [listaTecnicos, setListaTecnicos] = useState<TecnicoLista[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    tecnicos().then((datos) => {
      if (vigente) setListaTecnicos(datos);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const adjuntosDisponibles = listaTecnicos.filter((t) => t.id !== tecnico);

  const ejecutarProgramacion = () => {
    if (!fecha || !hora || !tecnico) {
      setMensaje('Debes seleccionar fecha, hora y técnico.');
      return;
    }
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
  };

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
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="min-h-12 border border-border rounded-xl px-3 py-2 text-sm bg-card" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <CustomSelect
            id="tecnico_visita"
            label="Técnico"
            value={tecnico}
            onChange={(val) => {
              setTecnico(val);
              if (adjunto === val) setAdjunto('');
            }}
            placeholder="Selecciona un técnico..."
            options={listaTecnicos.map((t) => ({ value: t.id, label: t.nombre_completo }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <CustomSelect
            id="adjunto_visita"
            label="Técnico adjunto (opcional)"
            value={adjunto}
            onChange={setAdjunto}
            placeholder="Sin adjunto"
            options={[
              { value: '', label: 'Sin adjunto' },
              ...adjuntosDisponibles.map((t) => ({ value: t.id, label: t.nombre_completo })),
            ]}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={ejecutarProgramacion}
          disabled={cargando}
          className="min-h-11"
        >
          {cargando ? 'Guardando...' : 'Programar'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-11">
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
  const [listaTecnicos, setListaTecnicos] = useState<TecnicoLista[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    tecnicos().then((datos) => {
      if (vigente) setListaTecnicos(datos);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const adjuntosDisponibles = listaTecnicos.filter((t) => t.id !== tecnico);

  const ejecutarReprogramacion = () => {
    if (!fecha || !hora || !tecnico) {
      setMensaje('Debes seleccionar fecha, hora y técnico.');
      return;
    }
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
  };

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
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="min-h-12 border border-border rounded-xl px-3 py-2 text-sm bg-card" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <CustomSelect
            id="reprogramar_tecnico"
            label="Técnico"
            value={tecnico}
            onChange={(val) => {
              setTecnico(val);
              if (adjunto === val) setAdjunto('');
            }}
            placeholder="Selecciona un técnico..."
            options={listaTecnicos.map((t) => ({ value: t.id, label: t.nombre_completo }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <CustomSelect
            id="reprogramar_adjunto"
            label="Técnico adjunto (opcional)"
            value={adjunto}
            onChange={setAdjunto}
            placeholder="Sin adjunto"
            options={[
              { value: '', label: 'Sin adjunto' },
              ...adjuntosDisponibles.map((t) => ({ value: t.id, label: t.nombre_completo })),
            ]}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={ejecutarReprogramacion}
          disabled={cargando}
          className="min-h-11"
        >
          {cargando ? 'Guardando...' : 'Reprogramar'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-11">
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
