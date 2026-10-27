'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerCasos, obtenerUsuarioActual } from '@/lib/datos-simulados/actions';
import { Caso } from '@/lib/datos-simulados/casos';

export default function MisServiciosPage() {
  const [casosHoy, setCasosHoy] = useState<Caso[]>([]);
  const [casosProximos, setCasosProximos] = useState<Caso[]>([]);
  const [loading, setLoading] = useState(true);

  const sesion = obtenerUsuarioActual();
  // Si no hay sesión, simulamos 'tecnico1@rptech.test' para pruebas en desarrollo
  const tecnicoId = sesion?.usuario.email || 'tecnico1@rptech.test';

  useEffect(() => {
    async function cargarMisServicios() {
      setLoading(true);
      // Obtenemos todos los casos asignados a este técnico
      const todosLosCasos = await obtenerCasos({ tecnico_id: tecnicoId });

      const hoyStr = new Date().toISOString().split('T')[0];

      const hoy: Caso[] = [];
      const proximos: Caso[] = [];

      todosLosCasos.forEach((caso: Caso) => {
        if (!caso.fecha_programada) return;
        if (caso.fecha_programada === hoyStr) {
          hoy.push(caso);
        } else if (caso.fecha_programada > hoyStr) {
          proximos.push(caso);
        }
      });

      setCasosHoy(hoy);
      setCasosProximos(proximos);
      setLoading(false);
    }
    cargarMisServicios();
  }, [tecnicoId]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Cargando tus servicios...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto md:max-w-3xl">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Servicios</h1>
        <p className="text-xs text-gray-500">Técnico: {tecnicoId}</p>
      </div>

      {/* Sección HOY */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-3 border-b pb-1">
          📅 Hoy ({casosHoy.length})
        </h2>
        {casosHoy.length === 0 ? (
          <p className="text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-200">
            No tienes servicios programados para hoy.
          </p>
        ) : (
          <div className="space-y-4">
            {casosHoy.map((caso) => (
              <div key={caso.id} className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-blue-600 text-sm">{caso.numero}</span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {caso.estado}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1"><strong>Hora:</strong> {caso.hora_programada || 'Por definir'}</p>
                <p className="text-sm text-gray-900 mb-3"><strong>Incidencia:</strong> {caso.incidencia}</p>
                <Link
                  href={`/mis-servicios/${caso.id}/reporte`}
                  className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
                  style={{ minHeight: '44px' }} // Botón optimizado para toque móvil (mínimo 44px)
                >
                  Ver / Atender Servicio
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección PRÓXIMOS */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-600 mb-3 border-b pb-1">
          ⏳ Próximos ({casosProximos.length})
        </h2>
        {casosProximos.length === 0 ? (
          <p className="text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-200">
            No tienes servicios próximos en los siguientes días.
          </p>
        ) : (
          <div className="space-y-4">
            {casosProximos.map((caso) => (
              <div key={caso.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800 text-sm">{caso.numero}</span>
                  <span className="text-xs text-gray-500">Fecha: {caso.fecha_programada}</span>
                </div>
                <p className="text-sm text-gray-800 mb-3"><strong>Incidencia:</strong> {caso.incidencia}</p>
                <Link
                  href={`/casos/${caso.id}`}
                  className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Ver detalle
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}