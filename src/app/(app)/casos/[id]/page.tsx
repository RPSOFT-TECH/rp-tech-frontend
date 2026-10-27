feature/lista-casos
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { obtenerCasoPorId } from '@/lib/datos-simulados/actions';
import { Caso } from '@/lib/datos-simulados/casos';

function DetalleCasoContenido() {
  const params = useParams();
  const id = params.id as string;

  const [caso, setCaso] = useState<Caso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarCaso() {
      if (!id) return;
      setLoading(true);
      const data = await obtenerCasoPorId(id);
      setCaso(data);
      setLoading(false);
    }
    cargarCaso();
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Cargando detalle del caso...</div>;
  }

  if (!caso) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-bold text-red-600 mb-4">Caso no encontrado</h1>
        <Link href="/casos" className="text-blue-600 hover:underline">
          ← Volver a la lista de casos
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Botón Volver y Encabezado */}
      <div className="mb-6">
        <Link href="/casos" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Volver a la lista
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Detalle del Caso: {caso.numero}</h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {caso.estado}
          </span>
        </div>
      </div>

      {/* Tarjetas de Información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Información General</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong className="text-gray-900">N° de Caso:</strong> {caso.numero}</li>
            <li><strong className="text-gray-900">Tipo de Servicio:</strong> {caso.tipo_servicio}</li>
            <li><strong className="text-gray-900">Modo de Servicio:</strong> {caso.modo_servicio}</li>
            <li><strong className="text-gray-900">Modalidad:</strong> {caso.modalidad}</li>
            <li><strong className="text-gray-900">Prioridad:</strong> {caso.prioridad}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Asignación y Fechas</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong className="text-gray-900">Creado por:</strong> {caso.creado_por}</li>
            <li><strong className="text-gray-900">Fecha de Registro:</strong> {new Date(caso.creado_en).toLocaleDateString('es-PE')}</li>
            <li><strong className="text-gray-900">Técnico Asignado:</strong> {caso.tecnico_id ? caso.tecnico_id : 'Sin asignar'}</li>
            <li><strong className="text-gray-900">Fecha Programada:</strong> {caso.fecha_programada || 'No programada'}</li>
            <li><strong className="text-gray-900">Hora Programada:</strong> {caso.hora_programada || 'N/A'}</li>
          </ul>
        </div>
      </div>

      {/* Incidencia */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Incidencia Reportada</h3>
        <p className="text-sm text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-100">{caso.incidencia}</p>
      </div>

      {/* Referencias de Entidades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div><strong>Cliente ID:</strong> {caso.cliente_id}</div>
        <div><strong>Contacto ID:</strong> {caso.contacto_id}</div>
        <div><strong>Equipo ID:</strong> {caso.equipo_id}</div>
      </div>
    </div>
  );

export default function CasoDetallePage() {
  return <h1 className="text-2xl font-semibold p-6">Caso</h1>;
main
}

export default function DetalleCasoPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Cargando detalle del caso...</div>}>
      <DetalleCasoContenido />
    </Suspense>
  );
}