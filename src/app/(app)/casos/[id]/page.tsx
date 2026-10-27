feature/lista-casos
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { obtenerCasoPorId } from '@/lib/datos-simulados/actions';
import { Caso, Visita } from '@/lib/datos-simulados/casos';
import { clientes } from '@/lib/datos-simulados/clientes';
import { contactos } from '@/lib/datos-simulados/contactos';
import { direcciones } from '@/lib/datos-simulados/direcciones';
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

  const clienteData = clientes.find((c: any) => c.id === caso.cliente_id);
  const contactoData = contactos.find((c: any) => c.id === caso.contacto_id);
  const direccionData = direcciones.find((d: any) => d.id === (caso as any).sede_id || d.id === (caso as any).direccion_id);
  const equipoData = equipos.find((e: any) => e.id === caso.equipo_id);

  const volverAListaUrl = `/casos?${searchParams.toString()}`;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Botón Volver y Encabezado */}
      <div className="mb-6">
        <Link href={volverAListaUrl} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Volver a la lista
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Detalle del Caso: {caso.numero}</h1>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
              Canal: {caso.canal}
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
              {caso.estado.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Registrado el: {new Date(caso.creado_en).toLocaleString('es-PE')}
        </div>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* 1. Tarjeta Cliente */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cliente</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong className="text-gray-900">Empresa:</strong> {clienteData?.razon_social || ' — '}</li>
            <li><strong className="text-gray-900">RUC:</strong> {clienteData?.ruc || ' — '}</li>
            <li><strong className="text-gray-900">Soporte vigente:</strong> {(clienteData as any)?.soporte_vigente ? 'Sí' : 'No'}</li>
            <li><strong className="text-gray-900">Contacto:</strong> {contactoData ? `${contactoData.nombre} (${contactoData.cargo})` : ' — '}</li>
            <li><strong className="text-gray-900">Teléfono:</strong> {caso.telefono || ' — '}</li>
          </ul>
        </div>

        {/* 2. Tarjeta Sede */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sede / Dirección</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong className="text-gray-900">Dirección:</strong> {direccionData?.direccion || ' — '}</li>
            <li><strong className="text-gray-900">Distrito:</strong> {direccionData?.distrito || ' — '}</li>
            <li><strong className="text-gray-900">Referencia:</strong> {direccionData?.referencia || ' — '}</li>
          </ul>
        </div>

        {/* 3. Tarjeta Equipo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Equipo</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong className="text-gray-900">Número de serie:</strong> <span className="font-mono">{equipoData?.numero_serie || ' — '}</span></li>
            <li><strong className="text-gray-900">Línea y modelo:</strong> {equipoData ? `${(equipoData as any).linea || ''} - ${equipoData.modelo}` : ' — '}</li>
            <li><strong className="text-gray-900">Cabezal:</strong> {(equipoData as any)?.cabezal_modelo || ' — '}</li>
            <li><strong className="text-gray-900">Cant. cabezales:</strong> {equipoData?.cabezal_cantidad || ' — '}</li>
            <li><strong className="text-gray-900">Fecha de instalación:</strong> {(equipoData as any)?.fecha_instalacion || ' — '}</li>
          </ul>
        </div>

        {/* 4. Tarjeta Servicio */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Servicio</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong className="text-gray-900">Tipo de servicio:</strong> {caso.tipo_servicio || ' — '}</li>
            <li><strong className="text-gray-900">Modalidad:</strong> {caso.modalidad || ' — '}</li>
            <li><strong className="text-gray-900">Modo sugerido:</strong> {caso.modo_sugerido || ' — '}</li>
            <li><strong className="text-gray-900">Modo elegido:</strong> {caso.modo_servicio || ' — '}</li>
            {caso.modo_servicio !== caso.modo_sugerido && (
              <li><strong className="text-gray-900">Motivo de cambio:</strong> {caso.motivo_cambio_modo || ' — '}</li>
            )}
          </ul>
        </div>

      </div>

      {/* Incidencia */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Incidencia Reportada</h3>
        <p className="text-sm text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-line">
          {caso.incidencia || ' — '}
        </p>
      </div>

      {/* Visitas */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Visitas Programadas</h3>
        {visitas.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Sin visitas programadas</p>
        ) : (
          <div className="space-y-3">
            {visitas.map((v) => (
              <div key={v.id} className="border border-gray-200 rounded-lg p-3 text-sm flex justify-between items-center bg-gray-50">
                <div>
                  <span className="font-bold text-blue-600 mr-2">Visita #{v.numero_visita}</span>
                  <span className="text-gray-700">{v.fecha_programada || 'Sin fecha'} ({v.hora_programada || '—'})</span>
                  <div className="text-xs text-gray-500 mt-0.5">Técnico: {v.tecnico_id ? v.tecnico_id.split('@')[0] : 'Sin asignar'}</div>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 uppercase">
                  {v.resultado || 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TODO(especificación v1): Se agregarán aquí las secciones de reportes cerrados y notas adicionales */}
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
