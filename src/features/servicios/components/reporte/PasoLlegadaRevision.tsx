'use client';

import { useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Segmentado } from '@/components/ui/segmentado';
import { SelectorFecha } from '@/components/ui/selector-fecha';
import { Switch } from '@/components/ui/switch';
import { BloqueAdjuntos } from './PasoFotos';
import { SeccionReporte } from './SeccionReporte';
import type { FormularioReporte } from './tipo';

export function PasoLlegadaRevision({ form }: { form: FormularioReporte }) {
  const {
    reporte,
    caso,
    esPasoEditable,
    guardando,
    remota,
    registrarLlegada,
    estadoEquipo,
    setEstadoEquipo,
    limpieza,
    setLimpieza,
    estadoCabezales,
    setEstadoCabezales,
    sistemaProteccion,
    setSistemaProteccion,
    sistemaProteccionOtro,
    setSistemaProteccionOtro,
    tinta,
    setTinta,
    voltajeLn,
    setVoltajeLn,
    voltajeLt,
    setVoltajeLt,
    voltajeNt,
    setVoltajeNt,
    operador,
    setOperador,
    ultimoMantenimiento,
    setUltimoMantenimiento,
    numeroFisico,
    setNumeroFisico,
  } = form;

  const [llenadoPapel, setLlenadoPapel] = useState(Boolean(numeroFisico));
  const bloqueado = !esPasoEditable || guardando;
  if (!reporte) return null;

  const llego = Boolean(reporte.hora_llegada);
  const citaHora = caso?.hora_programada ? caso.hora_programada.slice(0, 5) : '—';
  const llegadaHora = reporte.hora_llegada ? reporte.hora_llegada.slice(0, 5) : null;

  return (
    <div className="space-y-3">
      {/* ── 1. Llegada ── */}
      <SeccionReporte titulo="Control de llegada" className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-5">
            <div>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="size-3" /> Cita
              </p>
              <p className="font-mono text-lg font-bold tabular-nums">{citaHora}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" /> Llegada
              </p>
              {llego ? (
                <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {llegadaHora}
                </p>
              ) : (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Pendiente</p>
              )}
            </div>
          </div>
          <div>
            {llego ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="size-3.5" /> Registrada
              </span>
            ) : (
              <Button
                type="button"
                onClick={() => void registrarLlegada()}
                disabled={bloqueado}
                className="h-9 gap-1.5 bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm"
              >
                <MapPin className="size-3.5" />
                Llegué
              </Button>
            )}
          </div>
        </div>
      </SeccionReporte>

      {/* ── 2. Foto de ingreso ── */}
      <BloqueAdjuntos
        form={form}
        tipo="foto_ingreso"
        titulo="Foto de ingreso"
        ayuda="Cómo encontraste la máquina. (Obligatoria)"
        obligatorio={!remota}
      />

      {/* ── 3. Estado, limpieza y cabezales ── */}
      <SeccionReporte titulo="Estado inicial" className="p-3">
        <div className="divide-y divide-border/50 -mx-1">
          {/* Fila: Estado del equipo */}
          <div className="flex items-center justify-between gap-2 px-1 py-2 first:pt-0">
            <span className="text-sm font-medium shrink-0">Estado del equipo</span>
            <Segmentado
              disabled={bloqueado}
              value={estadoEquipo}
              onChange={setEstadoEquipo}
              opciones={[
                { value: 'operativo', label: 'Operativo', tono: 'ok' },
                { value: 'inoperativo', label: 'Inoperativo', tono: 'alerta' },
              ]}
              className="max-w-[220px]"
            />
          </div>

          {/* Fila: Limpieza */}
          {!remota && (
            <div className="flex items-center justify-between gap-2 px-1 py-2">
              <span className="text-sm font-medium shrink-0">Limpieza</span>
              <Segmentado
                disabled={bloqueado}
                value={limpieza}
                onChange={setLimpieza}
                opciones={[
                  { value: 'limpio', label: 'Limpio', tono: 'ok' },
                  { value: 'sucio', label: 'Sucio', tono: 'alerta' },
                ]}
                className="max-w-[220px]"
              />
            </div>
          )}

          {/* Fila: Cabezales */}
          <div className="flex items-center justify-between gap-2 px-1 py-2 last:pb-0">
            <span className="text-sm font-medium shrink-0">Cabezales</span>
            <Segmentado
              disabled={bloqueado}
              value={estadoCabezales}
              onChange={setEstadoCabezales}
              opciones={[
                { value: 'bueno', label: 'Bueno', tono: 'ok' },
                { value: 'regular', label: 'Regular' },
                { value: 'malo', label: 'Malo', tono: 'alerta' },
              ]}
              className="max-w-[260px]"
            />
          </div>
        </div>
      </SeccionReporte>

      {/* ── 4. Protección y Tinta ── */}
      {!remota && (
        <SeccionReporte titulo="Protección y tinta" className="p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Sistema de protección</Label>
              <Segmentado
                disabled={bloqueado}
                value={sistemaProteccion}
                onChange={setSistemaProteccion}
                opciones={[
                  { value: 'estabilizador', label: 'Estab.' },
                  { value: 'ups', label: 'UPS' },
                  { value: 'otro', label: 'Otro' },
                ]}
              />
              {sistemaProteccion === 'otro' && (
                <Input
                  value={sistemaProteccionOtro}
                  onChange={(e) => setSistemaProteccionOtro(e.target.value)}
                  disabled={bloqueado}
                  placeholder="¿Cuál?"
                  className="mt-1 h-8 text-xs"
                />
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tinta</Label>
              <Segmentado
                disabled={bloqueado}
                value={tinta}
                onChange={setTinta}
                opciones={[
                  { value: 'Original', label: 'Original' },
                  { value: 'De terceros', label: 'Terceros', tono: 'alerta' },
                  { value: 'No se sabe', label: 'N/S' },
                ]}
              />
              {tinta === 'De terceros' && (
                <div className="flex items-center gap-1 rounded bg-amber-50 p-1.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  <AlertCircle className="size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Anula la garantía.</span>
                </div>
              )}
            </div>
          </div>
        </SeccionReporte>
      )}

      {/* ── 5. Voltaje ── */}
      {!remota && (
        <SeccionReporte titulo="Líneas de alimentación" className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {([
              ['voltaje_ln', 'L + N', voltajeLn, setVoltajeLn, '220'],
              ['voltaje_lt', 'L + T', voltajeLt, setVoltajeLt, '220'],
              ['voltaje_nt', 'N + T', voltajeNt, setVoltajeNt, '0'],
            ] as const).map(([id, label, val, setter, ph]) => (
              <div key={id} className="space-y-0.5">
                <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground">{label}</label>
                <div className="relative">
                  <Input
                    id={id}
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    disabled={bloqueado}
                    placeholder={ph}
                    className="h-9 pr-6 tabular-nums text-sm"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">V</span>
                </div>
              </div>
            ))}
          </div>
        </SeccionReporte>
      )}

      {/* ── 6. Operador + Último mantenimiento + Reporte físico ── */}
      <SeccionReporte titulo="Operación del equipo" className="p-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="operador" className="text-xs">Operador</Label>
            <Input
              id="operador"
              value={operador}
              onChange={(e) => setOperador(e.target.value)}
              disabled={bloqueado}
              placeholder="Nombre del operador"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Último mantenimiento</Label>
            <SelectorFecha
              value={ultimoMantenimiento}
              onChange={setUltimoMantenimiento}
              disabled={bloqueado}
            />
          </div>
        </div>

        {/* Se llenó en papel + N° reporte físico inline */}
        <div className="mt-3 pt-2.5 border-t border-border flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Switch
              id="switch-llenado-papel"
              checked={llenadoPapel}
              onCheckedChange={(v) => {
                setLlenadoPapel(v);
                if (!v) setNumeroFisico('');
              }}
              disabled={bloqueado}
            />
            <label htmlFor="switch-llenado-papel" className="cursor-pointer text-xs font-medium text-foreground select-none">
              Se llenó en papel <span className="text-muted-foreground">(sin señal)</span>
            </label>
          </div>
          {llenadoPapel && (
            <Input
              id="numero_fisico"
              value={numeroFisico}
              onChange={(e) => setNumeroFisico(e.target.value)}
              disabled={bloqueado}
              placeholder="N° reporte físico"
              className="h-8 w-full font-mono text-xs sm:w-44 animate-in fade-in duration-200"
            />
          )}
        </div>
      </SeccionReporte>
    </div>
  );
}
