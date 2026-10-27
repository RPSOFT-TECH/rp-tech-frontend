'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerUsuarioActual } from '@/lib/datos-simulados/actions';
import { visitasSimuladas, casosSimulados, Caso, Visita } from '@/lib/datos-simulados/casos';
import { clientes } from '@/lib/datos-simulados/clientes';
import { direcciones } from '@/lib/datos-simulados/direcciones';
import { equipos } from '@/lib/datos-simulados/equipos';

interface VisitaConDetalles extends Visita {
  caso?: Caso;
  clienteRazonSocial?: string;
  sedeNombre?: string;
  sedeDireccion?: string;
  sedeDistrito?: string;
  equipoSerie?: string;
}

export default function MisServiciosPage() {
  const [visitasHoy, setVisitasHoy] = useState<VisitaConDetalles[]>([]);
  const [visitasProximas, setVisitasProximas] = useState<VisitaConDetalles[]>([]);
  const [loading, setLoading] = useState(true);

  const usuario = obtenerUsuarioActual();
  const tecnicoId = usuario?.email || 'tecnico1@rptech.test';

  useEffect(() => {
    async function cargarMisServicios() {
      setLoading(true);

      const misVisitas = visitasSimuladas.filter((v) => v.tecnico_id === tecnicoId);
      const hoyStr = new Date().toISOString().split('T')[0];

      const hoy: VisitaConDetalles[] = [];
      const proximos: VisitaConDetalles[] = [];

      misVisitas.forEach((visita) => {
        if (!visita.fecha_programada) return;

        const casoData = casosSimulados.find((c) => c.id === visita.caso_id);
        const clienteData = casoData ? clientes.find((cl: any) => cl.id === casoData.cliente_id) : null;
        const direccionData = casoData ? direcciones.find((d: any) => d.id === (casoData as any).sede_id || d.id === (casoData as any).direccion_id) : null;
        const equipoData = casoData ? equipos.find((e: any) => e.id === casoData.equipo_id) : null;

        const detalleVisita: VisitaConDetalles = {
          ...visita,
          caso: casoData,
          clienteRazonSocial: (clienteData as any)?.razon_social || 'Cliente desconocido',
          sedeNombre: (direccionData as any)?.nombre || 'Sede principal',
          sedeDireccion: (direccionData as any)?.direccion || '',
          sedeDistrito: (direccionData as any)?.distrito || '',
          equipoSerie: (equipoData as any)?.numero_serie || 'S/N',
        };

        if (visita.fecha_programada === hoyStr) {
          hoy.push(detalleVisita);
        } else if (visita.fecha_programada > hoyStr) {
          proximos.push(detalleVisita);
        }
      });

      hoy.sort((a, b) => (a.hora_programada || '').localeCompare(b.hora_programada || ''));
      proximos.sort((a, b) => (a.fecha_programada || '').localeCompare(b.fecha_programada || ''));

      setVisitasHoy(hoy);
      setVisitasProximas(proximos);
      setLoading(false);
    }
    cargarMisServicios();
  }, [tecnicoId]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Cargando tus servicios...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto md:max-w-3xl pb-24">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Servicios</h1>
        <p className="text-xs text-gray-500">Técnico: {tecnicoId}</p>
      </div>

      {/* Sección HOY */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-3 border-b pb-1">
          📅 Hoy ({visitasHoy.length})
        </h2>
        {visitasHoy.length === 0 ? (
          <p className="text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-200">
            No tienes servicios para hoy.
          </p>
        ) : (
          <div className="space-y-4">
            {visitasHoy.map((visita) => (
              <Link
                key={visita.id}
                href={`/mis-servicios/${visita.caso_id}/reporte`}
                className="block bg-white border border-blue-200 rounded-xl p-4 shadow-sm hover:border-blue-400 transition-all"
                style={{ minHeight: '44px' }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {visita.hora_programada || '—'}
                    </span>
                    <span className="font-bold text-gray-900 text-sm">{visita.caso?.numero}</span>
                  </div>
                  {visita.numero_visita > 1 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                      Visita {visita.numero_visita}
                    </span>
                  )}
                </div>

                <div className="text-sm font-medium text-gray-900 mb-1">{visita.clienteRazonSocial}</div>
                <div className="text-xs text-gray-600 mb-2">
                  📍 {visita.sedeNombre} ({visita.sedeDireccion}, {visita.sedeDistrito})
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-gray-600 border-t pt-2 mt-2">
                  <span className="bg-gray-100 px-2 py-1 rounded">Tipo: {visita.caso?.tipo_servicio}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono">Serie: {visita.equipoSerie}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Modalidad: {visita.caso?.modalidad}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Sección PRÓXIMOS */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-600 mb-3 border-b pb-1">
          ⏳ Próximos ({visitasProximas.length})
        </h2>
        {visitasProximas.length === 0 ? (
          <p className="text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-200">
            No tienes servicios programados.
          </p>
        ) : (
          <div className="space-y-4">
            {visitasProximas.map((visita) => (
              <Link
                key={visita.id}
                href={`/mis-servicios/${visita.caso_id}/reporte`}
                className="block bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition-all"
                style={{ minHeight: '44px' }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800 text-sm">{visita.caso?.numero}</span>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Fecha: {visita.fecha_programada} ({visita.hora_programada || '—'})
                  </span>
                </div>

                <div className="text-sm font-medium text-gray-900 mb-1">{visita.clienteRazonSocial}</div>
                <div className="text-xs text-gray-600 mb-2">
                  📍 {visita.sedeNombre} ({visita.sedeDistrito})
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-gray-600 border-t pt-2 mt-2">
                  <span className="bg-gray-100 px-2 py-1 rounded">Tipo: {visita.caso?.tipo_servicio}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded font-mono">Serie: {visita.equipoSerie}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}