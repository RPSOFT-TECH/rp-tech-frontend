feature/lista-casos
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerCasoPorId } from '@/lib/datos-simulados/actions';
import { Caso } from '@/lib/datos-simulados/casos';

export default function ReporteServicioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [caso, setCaso] = useState<Caso | null>(null);
  const [estado, setEstado] = useState<Caso['estado']>('en_atencion');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargar() {
      if (!id) return;
      const data = await obtenerCasoPorId(id);
      if (data) {
        setCaso(data);
        setEstado(data.estado);
      }
      setLoading(false);
    }
    cargar();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caso) return;

    setGuardando(true);
    // Simulamos la actualización en memoria
    caso.estado = estado;
    await new Promise((r) => setTimeout(r, 400));
    setGuardando(false);
    router.push('/mis-servicios');
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Cargando reporte...</div>;
  }

  if (!caso) {
    return <div className="p-8 text-center text-red-600">Caso no encontrado.</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto md:max-w-2xl">
      <div className="mb-6">
        <Link href="/mis-servicios" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Volver a Mis Servicios
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Atención de Servicio: {caso.numero}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Estado del Servicio</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as Caso['estado'])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="programado">Programado</option>
            <option value="en_atencion">En atención</option>
            <option value="en_espera">En espera</option>
            <option value="atendido">Atendido</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Informe Técnico / Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={5}
            placeholder="Detalle los trabajos realizados, repuestos usados o motivo de espera..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors"
          style={{ minHeight: '44px' }}
        >
          {guardando ? 'Guardando reporte...' : 'Guardar y Finalizar'}
        </button>
      </form>
    </div>
  );
}
export default function ReportePage() {
  return <h1 className="text-2xl font-semibold p-6">Reporte</h1>;
}
main
