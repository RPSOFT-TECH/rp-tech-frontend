'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { AvisoCierre, PasoCierre } from '../components/reporte/PasoCierre';
import { PasoConformidad } from '../components/reporte/PasoConformidad';
import { PasoDesarrollo } from '../components/reporte/PasoDesarrollo';
import { PasoFotos } from '../components/reporte/PasoFotos';
import { PasoLlegada } from '../components/reporte/PasoLlegada';
import { PasoRepuestos } from '../components/reporte/PasoRepuestos';
import { PasoRevision } from '../components/reporte/PasoRevision';
import { useReporteServicio } from '../hooks/useReporteServicio';
import { PASOS } from '../reporte/pasos';

function ReporteServicioContenido() {
  const form = useReporteServicio();
  const { loading, reporte, caso, mensaje, paso, router, setMensaje } = form;

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando reporte de servicio...</div>;
  }

  if (!reporte || !caso) {
    return <div className="p-8 text-center text-destructive">Reporte no encontrado.</div>;
  }

  const pasoActual = PASOS[paso - 1];
  const avisoOk = mensaje?.includes('correctamente') || mensaje?.includes('Guardado') || mensaje?.includes('enviado');

  return (
    <div className="p-4 max-w-md mx-auto md:max-w-2xl pb-24">
      <div className="mb-6">
        <Link href="/mis-servicios" className="text-sm text-primary hover:underline mb-2 inline-block">
          Volver a Mis Servicios
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Reporte de Servicio</h1>
        <p className="text-xs text-muted-foreground">
          Caso {caso.numero_caso} · Visita {reporte.numero_visita} · {reporte.numero ? `Reporte ${reporte.numero}` : 'Sin número'}
        </p>
      </div>

      {mensaje && (
        <div className={`mb-4 rounded-lg p-3 text-sm ${avisoOk ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-red-50 text-red-900 border border-red-200'}`}>
          {mensaje}
        </div>
      )}

      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Paso {paso} de {PASOS.length}: {pasoActual.nombre}
        </div>
        <div className="flex gap-1">
          {PASOS.map((item, indice) => (
            <div
              key={item.clave}
              className={`flex-1 h-1.5 rounded-full ${indice + 1 < paso ? 'bg-primary' : indice + 1 === paso ? 'bg-primary/30' : 'bg-muted'}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {paso === 1 && <PasoLlegada form={form} />}
        {paso === 2 && <PasoRevision form={form} />}
        {paso === 3 && <PasoDesarrollo form={form} />}
        {paso === 4 && <PasoRepuestos form={form} />}
        {paso === 5 && <PasoFotos form={form} />}
        {paso === 6 && <PasoConformidad form={form} />}
        {paso === 7 && <PasoCierre form={form} />}
        <AvisoCierre form={form} />
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => router.push('/mis-servicios')} className="min-h-11">
          Volver a Mis Servicios
        </Button>
        {reporte.numero && (
          <Button variant="outline" onClick={() => setMensaje('PDF disponible al conectar al backend.')} disabled className="min-h-11 opacity-50">
            Descargar PDF
          </Button>
        )}
      </div>
    </div>
  );
}

export function ReporteServicioView() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Cargando reporte...</div>}>
      <ReporteServicioContenido />
    </Suspense>
  );
}
