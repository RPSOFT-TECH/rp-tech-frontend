'use client';

import { useState } from 'react';
import { anular_caso, poner_en_espera, reabrir_caso, registrar_posventa } from '@/lib/datos/actions';
import { Button, CustomSelect } from '@/components/ui';
import type { FormAccionProps } from './tipos';

export function FormPonerEnEspera({ caso, onEjecutar, onCerrar }: FormAccionProps) {
  const [motivo, setMotivo] = useState('');
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Poner en espera</h3>
      {mensaje && (
        <div className="mb-3 text-xs border border-destructive/40 bg-destructive/10 text-destructive rounded p-2">{mensaje}</div>
      )}
      <div className="flex flex-col gap-1 mb-4">
        <CustomSelect
          label="Motivo de espera"
          value={motivo}
          onChange={setMotivo}
          placeholder="Selecciona un motivo"
          options={['Pieza o repuesto', 'Aprobación de cotización', 'Reprogramación del cliente', 'Continúa otro día', 'Otro'].map((item) => ({
            value: item,
            label: item,
          }))}
        />
      </div>
      {motivo === 'Otro' && (
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-sm font-medium text-foreground">Comentario (obligatorio para Otro)</label>
          <input value={comentario} onChange={(e) => setComentario(e.target.value)} className="h-11 rounded-lg border border-input bg-card px-3 text-sm md:h-10" />
        </div>
      )}
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setCargando(true);
            setMensaje(null);
            poner_en_espera(caso.id, motivo, motivo === 'Otro' ? comentario : null).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al poner en espera.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Poner en espera'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export function FormRegistrarPosventa({ caso, onEjecutar, onCerrar }: FormAccionProps) {
  const [resultado, setResultado] = useState<'conforme' | 'no_conforme' | ''>('');
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Registrar posventa</h3>
      {mensaje && (
        <div className="mb-3 text-xs border border-destructive/40 bg-destructive/10 text-destructive rounded p-2">{mensaje}</div>
      )}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-sm font-medium text-foreground">Resultado</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="resultado" value="conforme" checked={resultado === 'conforme'} onChange={() => setResultado('conforme')} />
            Conforme
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="resultado" value="no_conforme" checked={resultado === 'no_conforme'} onChange={() => setResultado('no_conforme')} />
            No conforme
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-sm font-medium text-foreground">Comentario</label>
        <input value={comentario} onChange={(e) => setComentario(e.target.value)} className="h-11 rounded-lg border border-input bg-card px-3 text-sm md:h-10" />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => {
            if (!resultado) {
              setMensaje('Selecciona un resultado.');
              return;
            }
            setCargando(true);
            setMensaje(null);
            registrar_posventa(caso.id, resultado, comentario || null).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al registrar posventa.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Registrar'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export function FormReabrirCaso({ caso, onEjecutar, onCerrar }: FormAccionProps) {
  const [motivo, setMotivo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Reabrir caso</h3>
      {mensaje && (
        <div className="mb-3 text-xs border border-destructive/40 bg-destructive/10 text-destructive rounded p-2">{mensaje}</div>
      )}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-sm font-medium text-foreground">Motivo de reapertura</label>
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className="h-11 rounded-lg border border-input bg-card px-3 text-sm md:h-10" />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setCargando(true);
            setMensaje(null);
            reabrir_caso(caso.id, motivo).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al reabrir.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Reabrir'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export function FormAnularCaso({ caso, onEjecutar, onCerrar }: FormAccionProps) {
  const [motivo, setMotivo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Anular caso</h3>
      {mensaje && (
        <div className="mb-3 text-xs border border-destructive/40 bg-destructive/10 text-destructive rounded p-2">{mensaje}</div>
      )}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-sm font-medium text-foreground">Motivo de anulación</label>
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className="h-11 rounded-lg border border-input bg-card px-3 text-sm md:h-10" />
      </div>
      <div className="flex gap-3">
        <Button
          variant="destructive"
          onClick={() => {
            setCargando(true);
            setMensaje(null);
            anular_caso(caso.id, motivo).then((r) => {
              setCargando(false);
              if (r.ok) {
                onEjecutar(() => Promise.resolve({ ok: true }));
              } else {
                setMensaje(r.error || 'Error al anular.');
              }
            });
          }}
          disabled={cargando}
          className="min-h-10"
        >
          {cargando ? 'Guardando...' : 'Anular'}
        </Button>
        <Button variant="outline" onClick={onCerrar} className="min-h-10">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
