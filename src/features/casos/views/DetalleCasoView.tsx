'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { casos_lista, type CasoLista } from '@/lib/datos-simulados/actions';
import { etiquetaEstado } from '../components/EstadoCaso';

function valor(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

function fechaHoraLima(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DetalleCasoContenido() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [caso, setCaso] = useState<CasoLista | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;
    casos_lista().then((lista) => {
      if (!activo) return;
      setCaso(lista.find((item) => item.id === id) ?? null);
      setLoading(false);
    });
    return () => {
      activo = false;
    };
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando detalle del caso...</div>;
  }

  if (!caso) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-bold text-destructive mb-4">Caso no encontrado</h1>
        <Link href="/casos" className="text-primary hover:underline">
          Volver a la lista de casos
        </Link>
      </div>
    );
  }

  const volverAListaUrl = `/casos?${searchParams.toString()}`;
  const contacto = caso.contacto_cargo ? `${caso.contacto_nombre} (${caso.contacto_cargo})` : caso.contacto_nombre;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={volverAListaUrl} className="text-sm text-primary hover:underline mb-2 inline-block">
          Volver a la lista
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Detalle del Caso: {caso.numero}</h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary uppercase">
            {etiquetaEstado(caso.estado)}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Registrado el: {fechaHoraLima(caso.creado_en)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cliente</h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li><strong className="text-foreground">Empresa:</strong> {valor(caso.cliente_razon_social)}</li>
            <li><strong className="text-foreground">RUC:</strong> {caso.cliente_ruc || 'Sin RUC'}</li>
            <li><strong className="text-foreground">Contacto:</strong> {valor(contacto)}</li>
            <li><strong className="text-foreground">Teléfono del caso:</strong> {valor(caso.telefono)}</li>
            <li><strong className="text-foreground">Dirección:</strong> {valor(caso.sede_direccion)}</li>
            <li><strong className="text-foreground">Distrito:</strong> {valor(caso.sede_distrito)}</li>
            <li><strong className="text-foreground">Referencia:</strong> {valor(caso.sede_referencia)}</li>
          </ul>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Equipo</h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li>
              <strong className="text-foreground">Número de serie:</strong>{' '}
              <span className="font-mono">{valor(caso.equipo_serie)}</span>
            </li>
            <li><strong className="text-foreground">Línea y modelo:</strong> {valor(caso.equipo_linea)} - {valor(caso.equipo_modelo)}</li>
            <li><strong className="text-foreground">Cabezal:</strong> {valor(caso.equipo_cabezal)}</li>
            <li><strong className="text-foreground">Cant. cabezales:</strong> {valor(caso.equipo_cabezal_cantidad)}</li>
          </ul>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Servicio</h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li><strong className="text-foreground">Canal:</strong> {valor(caso.canal_nombre)}</li>
            <li><strong className="text-foreground">Tipo:</strong> {valor(caso.tipo_servicio_nombre)}</li>
            <li><strong className="text-foreground">Modo:</strong> {valor(caso.modo_servicio_nombre)}</li>
            <li><strong className="text-foreground">Modalidad:</strong> {valor(caso.modalidad_nombre)}</li>
            <li><strong className="text-foreground">Técnico:</strong> {valor(caso.tecnico_nombre)}</li>
            <li><strong className="text-foreground">Adjunto:</strong> {valor(caso.tecnico_adjunto_nombre)}</li>
            <li><strong className="text-foreground">Fecha programada:</strong> {valor(caso.fecha_programada)}</li>
            <li><strong className="text-foreground">Hora programada:</strong> {valor(caso.hora_programada)}</li>
            <li><strong className="text-foreground">Reportes:</strong> {caso.reportes_numeros.join(', ') || '—'}</li>
          </ul>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Incidencia</h3>
          <p className="text-sm text-card-foreground bg-muted p-4 rounded-lg border border-border whitespace-pre-line">
            {caso.incidencia || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DetalleCasoView() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <DetalleCasoContenido />
    </Suspense>
  );
}
