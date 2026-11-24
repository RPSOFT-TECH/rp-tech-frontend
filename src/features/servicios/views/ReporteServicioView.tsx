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
import { AvisoCierre } from '../components/reporte/PasoCierre';
import { PasoLlegadaRevision } from '../components/reporte/PasoLlegadaRevision';
import { PasoTrabajoRealizado } from '../components/reporte/PasoTrabajoRealizado';
import { PasoCierreConformidad } from '../components/reporte/PasoCierreConformidad';
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

  const pasoActual = PASOS[paso - 1] ?? PASOS[0];
  const avisoError = mensaje ? /error|no se pudo|no se envió|falta|indica/i.test(mensaje) : false;

  return (
    <div className="mx-auto w-full max-w-md pb-32 md:max-w-2xl md:pb-0">
      <div className="-mx-4 -mt-4 mb-4 bg-sidebar px-4 pt-3 pb-1 text-sidebar-foreground sm:mx-0 sm:mt-0 sm:bg-transparent sm:p-0 sm:text-foreground">
        <header className="mb-3 flex items-start gap-2 sm:mb-4">
          <Link
            href="/mis-servicios"
            aria-label="Volver a Mis servicios"
            className="-ml-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/80 sm:text-muted-foreground hover:bg-sidebar-accent sm:hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-sidebar-foreground sm:text-foreground">
              {caso.cliente_razon_social}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/80 sm:text-muted-foreground">
              Equipo: <span className="font-mono font-semibold">{caso.numero_serie}</span> · Caso #{caso.numero_caso} · {reporte.numero ? `Reporte: ${reporte.numero}` : 'Reporte: Se asigna al cerrar'}
            </p>
          </div>
          {reporte.numero && (
            <Button
              variant="outline"
              className="h-10 shrink-0 gap-1.5 border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground sm:border-input sm:bg-card sm:text-foreground sm:hover:bg-muted"
              onClick={() => (reporte.cerrado ? void form.abrirPdf() : setBorradorAbierto(true))}
            >
              <FileText className="size-4" />
              PDF
            </Button>
          )}
        </header>

        <nav aria-label="Pasos del reporte" className="mb-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-sidebar-foreground sm:text-foreground">
              {pasoActual.nombre}
            </h2>
            <span className="text-sm text-sidebar-foreground/70 tabular-nums sm:text-muted-foreground">
              {paso} de {PASOS.length}
            </span>
          </div>
          <div className="flex gap-1.5">
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
                    'h-2 w-full rounded-full transition-colors',
                    indice + 1 < paso && 'bg-emerald-500 group-hover:bg-emerald-600',
                    indice + 1 === paso && 'bg-sidebar-primary sm:bg-primary',
                    indice + 1 > paso &&
                      'bg-sidebar-accent group-hover:bg-sidebar-border sm:bg-border sm:group-hover:bg-muted-foreground/40',
                  )}
                />
              </button>
            ))}
          </div>
        </nav>
      </div>

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
        {paso === 1 && <PasoLlegadaRevision form={form} />}
        {paso === 2 && <PasoTrabajoRealizado form={form} />}
        {paso === 3 && <PasoCierreConformidad form={form} />}
        {paso === 3 && reporte.cerrado && <ReenvioPdf form={form} />}
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

// Botones inferiores de navegación y guardado
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
    principal = { texto: guardando ? 'Registrando...' : 'Llegué', accion: () => void registrarLlegada() };
  } else if (paso === PASOS.length) {
    if (reporte.cerrado || !esPasoEditable) {
      principal = { texto: 'Volver a Mis servicios', accion: () => router.push('/mis-servicios') };
    } else {
      const faltas = calcularFaltas().length;
      principal = {
        texto: guardando ? 'Cerrando...' : 'Cerrar reporte y generar PDF',
        accion: () => void cerrarReporte(),
        deshabilitado: faltas > 0 || !resultado,
        ayuda:
          faltas > 0
            ? `Faltan ${faltas} ${faltas === 1 ? 'cosa' : 'cosas'}`
            : !resultado
              ? 'Elige el resultado del servicio'
              : undefined,
      };
    }
  } else {
    principal = {
      texto: guardando ? 'Guardando...' : 'Siguiente',
      accion: () => {
        if (esPasoEditable && paso === 1) void guardarRevision();
        if (esPasoEditable && paso === 2) void guardarDesarrollo();
        avanzarPaso();
      },
      ayuda: esPasoEditable ? 'Se guarda automáticamente al pulsar Siguiente' : undefined,
    };
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-2.5 backdrop-blur md:sticky md:mt-4 md:rounded-t-xl md:border-x">
      <div className="flex items-center gap-2.5">
        {paso > 1 && (
          <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="h-10 w-20 shrink-0 text-sm font-semibold">
            Atrás
          </Button>
        )}
        <div className="flex flex-1 flex-col gap-0.5">
          <Button onClick={principal.accion} disabled={guardando || principal.deshabilitado} className="h-10 w-full text-sm font-semibold">
            {principal.texto}
          </Button>
          {principal.ayuda && <p className="text-center text-[11px] text-muted-foreground">{principal.ayuda}</p>}
        </div>
      </div>
    </div>
  );
}

function ReenvioPdf({ form }: { form: FormularioReporte }) {
  const { reenviarPdf, abrirPdf, guardando } = form;
  const [correo, setCorreo] = useState('');
  return (
    <SeccionReporte
      titulo="PDF del reporte"
      ayuda="Al cerrar se envió al contacto del caso. Puedes visualizarlo o reenviarlo a otro correo."
      className="p-3.5"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Botón Ver PDF */}
        <Button
          type="button"
          variant="outline"
          className="h-9 shrink-0 gap-2 text-xs font-semibold px-4 border-primary/40 text-primary hover:bg-primary/10 shadow-xs"
          onClick={() => void abrirPdf()}
        >
          <FileText className="size-4" /> Ver PDF
        </Button>

        {/* Separador vertical sutil en pantallas medianas */}
        <div className="hidden h-5 w-px bg-border sm:block" />

        {/* Reenviar a otro correo */}
        <div className="flex flex-1 items-center gap-1.5">
          <Input
            type="email"
            inputMode="email"
            placeholder="Reenviar a otro correo (opcional)..."
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            aria-label="Correo para reenviar el PDF"
            className="h-9 text-xs flex-1"
          />
          <Button
            type="button"
            className="h-9 shrink-0 gap-1.5 text-xs font-semibold px-3"
            disabled={guardando || !correo.trim()}
            onClick={() => void reenviarPdf(correo)}
          >
            <Send className="size-3.5" /> Reenviar
          </Button>
        </div>
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
