'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { obtenerCasoPorId } from '@/lib/datos-simulados/actions';
import { Caso, Visita } from '@/lib/datos-simulados/casos';
import { clientes } from '@/lib/datos-simulados/clientes';
import { contactos } from '@/lib/datos-simulados/contactos';
import { sedes } from '@/lib/datos-simulados/sedes';
import { equipos } from '@/lib/datos-simulados/equipos';

function DetalleCasoContenido() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [caso, setCaso] = useState<Caso | null>(null);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarCaso() {
      if (!id) return;
      setLoading(true);
      const data = await obtenerCasoPorId(id);
      if (data) {
        setCaso(data);
        setVisitas((data as any).visitas || []);
      }
      setLoading(false);
    }
    cargarCaso();
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando detalle del caso...</div>;
  }

  if (!caso) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-bold text-destructive mb-4">Caso no encontrado</h1>
        <Link href="/casos" className="text-primary hover:underline">
          ← Volver a la lista de casos
        </Link>
      </div>
    );
  }

  const clienteData = clientes.find((c: any) => c.id === caso.cliente_id);
  const contactoData = contactos.find((c: any) => c.id === caso.contacto_id);
  const direccionData = sedes.find((d: any) => d.id === (caso as any).sede_id || d.id === (caso as any).direccion_id);
  const equipoData = equipos.find((e: any) => e.id === caso.equipo_id);

  const volverAListaUrl = `/casos?${searchParams.toString()}`;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={volverAListaUrl} className="text-sm text-primary hover:underline mb-2 inline-block">
          ← Volver a la lista
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Detalle del Caso: {caso.numero}</h1>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-muted text-muted-foreground">
              Canal: {caso.canal}
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary uppercase">
              {caso.estado.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Registrado el: {new Date(caso.creado_en).toLocaleString('es-PE')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cliente</h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li><strong className="text-foreground">Empresa:</strong> {clienteData?.razon_social || ' — '}</li>
            <li><strong className="text-foreground">RUC:</strong> {clienteData?.ruc || ' — '}</li>
            <li><strong className="text-foreground">Soporte vigente:</strong> {clienteData?.soporte_vigente ? 'Sí' : 'No'}</li>
            <li><strong className="text-foreground">Contacto:</strong> {contactoData ? `${contactoData.nombre} (${contactoData.cargo})` : ' — '}</li>
            <li><strong className="text-foreground">Teléfono:</strong> {caso.telefono || ' — '}</li>
          </ul>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sede / Dirección</h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li><strong className="text-foreground">Dirección:</strong> {direccionData?.direccion || ' — '}</li>
            <li><strong className="text-foreground">Distrito:</strong> {direccionData?.distrito || ' — '}</li>
            <li><strong className="text-foreground">Referencia:</strong> {direccionData?.referencia || ' — '}</li>
          </ul>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Equipo</h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li><strong className="text-foreground">Número de serie:</strong> <span className="font-mono">{equipoData?.numero_serie || ' — '}</span></li>
            <li><strong className="text-foreground">Línea y modelo:</strong> {equipoData ? `${(equipoData as any).linea || ''} - ${equipoData.modelo}` : ' — '}</li>
            <li><strong className="text-foreground">Cabezal:</strong> {(equipoData as any)?.cabezal_modelo || ' — '}</li>
            <li><strong className="text-foreground">Cant. cabezales:</strong> {equipoData?.cabezal_cantidad || ' — '}</li>
            <li><strong className="text-foreground">Fecha de instalación:</strong> {(equipoData as any)?.fecha_instalacion || ' — '}</li>
          </ul>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Servicio</h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li><strong className="text-foreground">Tipo de servicio:</strong> {caso.tipo_servicio || ' — '}</li>
            <li><strong className="text-foreground">Modalidad:</strong> {caso.modalidad || ' — '}</li>
            <li><strong className="text-foreground">Modo sugerido:</strong> {caso.modo_sugerido || ' — '}</li>
            <li><strong className="text-foreground">Modo elegido:</strong> {caso.modo_servicio || ' — '}</li>
            {caso.modo_servicio !== caso.modo_sugerido && (
              <li><strong className="text-foreground">Motivo de cambio:</strong> {caso.motivo_cambio_modo || ' — '}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Incidencia Reportada</h3>
        <p className="text-sm text-card-foreground bg-muted p-4 rounded-lg border border-border whitespace-pre-line">
          {caso.incidencia || ' — '}
        </p>
      </div>

      <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Visitas Programadas</h3>
        {visitas.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Sin visitas programadas</p>
        ) : (
          <div className="space-y-3">
            {visitas.map((v) => (
              <div key={v.id} className="border border-border rounded-lg p-3 text-sm flex justify-between items-center bg-muted/40">
                <div>
                  <span className="font-bold text-primary mr-2">Visita #{v.numero_visita}</span>
                  <span className="text-card-foreground">{v.fecha_programada || 'Sin fecha'} ({v.hora_programada || '—'})</span>
                  <div className="text-xs text-muted-foreground mt-0.5">Técnico: {v.tecnico_id ? v.tecnico_id.split('@')[0] : 'Sin asignar'}</div>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium rounded bg-primary/10 text-primary uppercase">
                  {v.resultado || 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        )}
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
