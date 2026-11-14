'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { VistaPreviaPdf } from '@/components/pdf/VistaPreviaPdf';
import { cn } from '@/lib/utils';
import { HojaReporte } from '../components/reporte/HojaReporte';
import { AvisoCierre, PasoCierre } from '../components/reporte/PasoCierre';
import { PasoConformidad } from '../components/reporte/PasoConformidad';
import { PasoDesarrollo } from '../components/reporte/PasoDesarrollo';
import { PasoLlegada } from '../components/reporte/PasoLlegada';
import { PasoRepuestos } from '../components/reporte/PasoRepuestos';
import { PasoRevision } from '../components/reporte/PasoRevision';
import { SeccionReporte } from '../components/reporte/SeccionReporte';
import type { FormularioReporte } from '../components/reporte/tipo';
import { useReporteServicio } from '../hooks/useReporteServicio';
import { PASOS } from '../reporte/pasos';

function ReporteServicioContenido() {
  const form = useReporteServicio();
  const { loading, reporte, caso, mensaje, paso } = form;
  const [borradorAbierto, setBorradorAbierto] = useState(false);
  useRegistrarTitulo(
    'Reporte de servicio',
    caso ? `Caso ${caso.numero_caso}` : 'Informe de atención técnica, repuestos y firmas',
    FileText,
  );

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Cargando reporte de servicio...</div>;
  }

  if (!reporte || !caso) {
    return <div className="p-8 text-center text-destructive">Reporte no encontrado.</div>;
  }

  const pasoActual = PASOS[paso - 1];
  const avisoError = mensaje ? /error|no se pudo|no se envió|falta|indica/i.test(mensaje) : false;

  return (
    <div className="mx-auto w-full max-w-md pb-32 md:max-w-2xl md:pb-0">
      <header className="mb-4 flex items-start gap-2">
        <Link
          href="/mis-servicios"
          aria-label="Volver a Mis servicios"
          className="-ml-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{caso.cliente_razon_social}</p>
          <p className="truncate text-xs text-muted-foreground">
            {caso.sede_nombre} · <span className="font-mono">{caso.numero_serie}</span> · Caso {caso.numero_caso}
            {reporte.numero ? ` · ${reporte.numero}` : ''}
          </p>
        </div>
        {reporte.numero && (
          <Button
            variant="outline"
            className="h-10 shrink-0 gap-1.5"
            onClick={() => (reporte.cerrado ? void form.abrirPdf() : setBorradorAbierto(true))}
          >
            <FileText className="size-4" />
            PDF
          </Button>
        )}
      </header>

      <nav aria-label="Pasos del reporte" className="mb-4 space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-foreground">{pasoActual.nombre}</h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {paso} de {PASOS.length}
          </span>
        </div>
        <div className="flex gap-1">
          {PASOS.map((item, indice) => (
            <button
              type="button"
              key={item.clave}
              onClick={() => form.irAlPaso(indice + 1)}
              aria-label={`Paso ${indice + 1}: ${item.nombre}`}
              aria-current={indice + 1 === paso ? 'step' : undefined}
              className="group flex h-6 flex-1 items-center"
            >
              <span
                className={cn(
                  'h-1.5 w-full rounded-full transition-colors',
                  indice + 1 < paso && 'bg-emerald-500 group-hover:bg-emerald-600',
                  indice + 1 === paso && 'bg-primary',
                  indice + 1 > paso && 'bg-border group-hover:bg-muted-foreground/40',
                )}
              />
            </button>
          ))}
        </div>
      </nav>

      {mensaje && (
        <div
          role="status"
          className={cn(
            'mb-4 rounded-lg border p-3 text-sm',
            avisoError
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
          )}
        >
          {mensaje}
        </div>
      )}

      <div className="space-y-4">
        <AvisoCierre form={form} />
        {paso === 1 && <PasoLlegada form={form} />}
        {paso === 2 && <PasoRevision form={form} />}
        {paso === 3 && <PasoDesarrollo form={form} />}
        {paso === 4 && <PasoRepuestos form={form} />}
        {paso === 5 && <PasoConformidad form={form} />}
        {paso === 6 && <PasoCierre form={form} />}
        {paso === 6 && reporte.cerrado && <ReenvioPdf form={form} />}
      </div>

      <BarraPasos form={form} />

      {reporte.numero && !reporte.cerrado ? (
        <VistaPreviaPdf
          abierto={borradorAbierto}
          onCerrar={() => setBorradorAbierto(false)}
          titulo="Borrador del reporte (el PDF oficial se genera al cerrar)"
          nombreArchivo={`borrador-${reporte.numero}`}
        >
          <HojaReporte numeroCaso={caso.numero_caso} reporte={reporte} />
        </VistaPreviaPdf>
      ) : null}
    </div>
  );
}

// Atrás / Siguiente siempre a la mano del pulgar. Guarda el paso al avanzar.
function BarraPasos({ form }: { form: FormularioReporte }) {
  const {
    paso,
    reporte,
    guardando,
    esPasoEditable,
    resultado,
    retrocederPaso,
    avanzarPaso,
    registrarLlegada,
    guardarRevision,
    guardarDesarrollo,
    cerrarReporte,
    calcularFaltas,
    router,
  } = form;
  if (!reporte) return null;

  let principal: { texto: string; accion: () => void; deshabilitado?: boolean; ayuda?: string };
  if (paso === 1 && !reporte.hora_llegada && esPasoEditable) {
    principal = { texto: guardando ? 'Registrando...' : 'Registrar llegada', accion: () => void registrarLlegada() };
  } else if (paso === PASOS.length) {
    if (reporte.cerrado || !esPasoEditable) {
      principal = { texto: 'Volver a Mis servicios', accion: () => router.push('/mis-servicios') };
    } else {
      const faltas = calcularFaltas().length;
      principal = {
        texto: guardando ? 'Cerrando...' : 'Cerrar reporte',
        accion: () => void cerrarReporte(),
        deshabilitado: faltas > 0 || !resultado,
        ayuda: faltas > 0 ? `Faltan ${faltas} ${faltas === 1 ? 'cosa' : 'cosas'}` : !resultado ? 'Elige el resultado' : undefined,
      };
    }
  } else {
    principal = {
      texto: guardando ? 'Guardando...' : 'Siguiente',
      accion: () => {
        if (esPasoEditable && paso === 2) void guardarRevision();
        if (esPasoEditable && paso === 3) void guardarDesarrollo();
        avanzarPaso();
      },
      ayuda: esPasoEditable && (paso === 2 || paso === 3) ? 'Se guarda al pulsar Siguiente' : undefined,
    };
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:sticky md:mt-6 md:rounded-t-xl md:border-x">
      <div className="flex items-start gap-3">
        {paso > 1 && (
          <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="h-12 w-24 shrink-0 text-base">
            Atrás
          </Button>
        )}
        <div className="flex flex-1 flex-col gap-1">
          <Button onClick={principal.accion} disabled={guardando || principal.deshabilitado} className="h-12 w-full text-base">
            {principal.texto}
          </Button>
          {principal.ayuda && <p className="text-center text-xs text-muted-foreground">{principal.ayuda}</p>}
        </div>
      </div>
    </div>
  );
}

function ReenvioPdf({ form }: { form: FormularioReporte }) {
  const { reenviarPdf, abrirPdf, guardando } = form;
  const [correo, setCorreo] = useState('');
  return (
    <SeccionReporte titulo="PDF del reporte" ayuda="Al cerrar se envió al contacto del caso. Puedes verlo o enviarlo a otro correo.">
      <Button variant="outline" className="h-11 w-full gap-2" onClick={() => void abrirPdf()}>
        <FileText className="size-4" /> Ver PDF
      </Button>
      <div className="flex gap-2">
        <Input
          type="email"
          inputMode="email"
          placeholder="Otro correo (opcional)"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          aria-label="Correo para reenviar el PDF"
        />
        <Button className="h-11 shrink-0 gap-2 md:h-10" disabled={guardando} onClick={() => void reenviarPdf(correo)}>
          <Send className="size-4" /> Reenviar
        </Button>
      </div>
    </SeccionReporte>
  );
}

export function ReporteServicioView() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Cargando reporte...</div>}>
      <ReporteServicioContenido />
    </Suspense>
  );
}
