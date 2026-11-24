'use client';

import { CheckCircle2, Clock, FileCheck, Wrench } from 'lucide-react';
import type { FormularioReporte } from './tipo';

export function ResumenCliente({ form }: { form: FormularioReporte }) {
  const {
    caso,
    reporte,
    procedimiento,
    conclusion,
    recomendaciones,
    repuestos,
    resultado,
    requerimiento,
    horaSalida,
  } = form;

  const calcularHoras = () => {
    if (!reporte?.hora_llegada || !horaSalida) return null;
    const [h1, m1] = reporte.hora_llegada.split(':').map(Number);
    const [h2, m2] = horaSalida.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;
    const mins = h2 * 60 + m2 - (h1 * 60 + m1);
    if (mins <= 0) return '0 hrs';
    const hrs = (mins / 60).toFixed(1);
    return `${hrs.endsWith('.0') ? hrs.slice(0, -2) : hrs} hrs`;
  };

  const horasTexto = calcularHoras();

  return (
    <div className="overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-3.5 shadow-sm space-y-3">
      {/* ── Encabezado: Título + Empresa/Equipo a la izquierda y Llegada/Salida a la derecha ── */}
      <div className="flex flex-col gap-2.5 border-b border-primary/20 pb-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Izquierda: Título + Empresa y Equipo debajo */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-primary">
            <FileCheck className="size-4 shrink-0" />
            <h3 className="text-sm font-bold text-foreground">
              Resumen de Atención Técnica
            </h3>
          </div>
          <div className="space-y-0.5 pl-5.5">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-muted-foreground uppercase text-[10px]">Empresa:</span>
              <span className="font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">{caso?.cliente_razon_social ?? '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-muted-foreground uppercase text-[10px]">Equipo:</span>
              <span className="font-mono font-bold text-foreground">{caso?.numero_serie ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Derecha: Llegada y Salida al lado de empresa */}
        <div className="flex items-center gap-2.5 rounded-lg bg-background/90 px-3 py-2 text-xs border border-border shadow-xs sm:self-center">
          <div className="flex items-center gap-1">
            <Clock className="size-3.5 text-primary" />
            <span className="text-muted-foreground text-[11px]">Llegada:</span>
            <span className="font-mono font-bold">{reporte?.hora_llegada?.slice(0, 5) || '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-3.5 text-primary" />
            <span className="text-muted-foreground text-[11px]">Salida:</span>
            <span className="font-mono font-bold">{horaSalida || '—'}</span>
          </div>
          {horasTexto && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-bold text-primary text-[11px]">
              {horasTexto}
            </span>
          )}
        </div>
      </div>

      {/* ── Los 4 bloques compactos en cuadrícula con altura uniforme ── */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {/* 1. Trabajo Realizado (Procedimiento) */}
        <div className="flex flex-col space-y-1 h-full">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block shrink-0">
            Trabajo Realizado (Procedimiento)
          </span>
          <div className="flex-1 rounded-lg bg-background p-2.5 text-xs text-foreground border border-border whitespace-pre-wrap break-all sm:break-words [overflow-wrap:anywhere]">
            {procedimiento?.trim() || <span className="italic text-muted-foreground text-[11px]">Sin procedimiento registrado.</span>}
          </div>
        </div>

        {/* 2. Conclusión Técnica */}
        <div className="flex flex-col space-y-1 h-full">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block shrink-0">
            Conclusión Técnica
          </span>
          <div className="flex-1 rounded-lg bg-background p-2.5 text-xs text-foreground border border-border whitespace-pre-wrap break-all sm:break-words [overflow-wrap:anywhere]">
            {conclusion?.trim() || <span className="italic text-muted-foreground text-[11px]">Sin conclusión registrada.</span>}
          </div>
        </div>

        {/* 3. Recomendaciones */}
        <div className="flex flex-col space-y-1 h-full">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block shrink-0">
            Recomendaciones
          </span>
          <div className="flex-1 rounded-lg bg-background p-2.5 text-xs text-foreground border border-border whitespace-pre-wrap break-all sm:break-words [overflow-wrap:anywhere]">
            {recomendaciones?.trim() || <span className="italic text-muted-foreground text-[11px]">Sin recomendaciones.</span>}
          </div>
        </div>

        {/* 4. Estado Final del Servicio */}
        <div className="flex flex-col space-y-1 h-full">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block shrink-0">
            Estado Final del Servicio
          </span>
          <div className="flex-1 flex flex-col justify-center rounded-lg bg-background p-2.5 text-xs border border-border">
            {resultado === 'resuelto' ? (
              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="size-3.5" /> Resuelto
              </span>
            ) : resultado === 'pendiente' ? (
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 self-start rounded-full bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
                  Queda pendiente
                </span>
                {requerimiento && (
                  <p className="text-[11px] text-muted-foreground break-words [overflow-wrap:anywhere]">
                    <b>Requiere:</b> {requerimiento}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">No definido</span>
            )}
          </div>
        </div>
      </div>

      {/* Repuestos si existen */}
      {repuestos.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-primary/20">
          <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <Wrench className="size-3" /> Repuestos suministrados ({repuestos.length}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {repuestos.map((rep) => (
              <span
                key={rep.id}
                className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1 text-xs border border-border text-foreground font-medium"
              >
                <b className="font-bold text-primary">{rep.cantidad}x</b> {rep.descripcion}
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">({rep.tipo})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
