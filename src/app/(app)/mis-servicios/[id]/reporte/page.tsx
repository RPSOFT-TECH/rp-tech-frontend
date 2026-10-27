feature/lista-casos
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerCasoPorId } from '@/lib/datos-simulados/actions';
import { Caso } from '@/lib/datos-simulados/casos';
import { clientes } from '@/lib/datos-simulados/clientes';
import { direcciones } from '@/lib/datos-simulados/direcciones';
import { equipos } from '@/lib/datos-simulados/equipos';

interface RepuestoItem {
  id: string;
  descripcion: string;
  cantidad: number;
}

export default function ReporteServicioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [caso, setCaso] = useState<Caso | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados interactivos para la maqueta completa del reporte
  const [horaIngreso, setHoraIngreso] = useState<string>('');
  const [horaSalida, setHoraSalida] = useState<string>('12:30');
  const [revisionInicial, setRevisionInicial] = useState('');
  const [procedimiento, setProcedimiento] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  
  // Repuestos
  const [repuestos, setRepuestos] = useState<RepuestoItem[]>([
    { id: '1', descripcion: 'Damper para cabezal Epson i3200', cantidad: 2 }
  ]);

  // Resultado
  const [resultado, setResultado] = useState<'resuelto' | 'pendiente'>('resuelto');
  const [requeridoPendiente, setRequeridoPendiente] = useState('');

  // Firmas
  const [nombreOperador, setNombreOperador] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');

  useEffect(() => {
    async function cargar() {
      if (!id) return;
      const data = await obtenerCasoPorId(id);
      if (data) {
        setCaso(data);
      }
      setLoading(false);
    }
    cargar();
  }, [id]);

  const registrarIngreso = () => {
    const ahora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHoraIngreso(ahora);
  };

  const agregarRepuesto = () => {
    setRepuestos([...repuestos, { id: Date.now().toString(), descripcion: '', cantidad: 1 }]);
  };

  const quitarRepuesto = (index: number) => {
    setRepuestos(repuestos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caso) return;

    setGuardando(true);
    await new Promise((r) => setTimeout(r, 400));
    setGuardando(false);
    router.push('/mis-servicios');
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Cargando reporte de servicio...</div>;
  }

  if (!caso) {
    return <div className="p-8 text-center text-red-600">Caso no encontrado.</div>;
  }

  const clienteData = clientes.find((c: any) => c.id === caso.cliente_id);
  const direccionData = direcciones.find((d: any) => d.id === (caso as any).sede_id || d.id === (caso as any).direccion_id);
  const equipoData = equipos.find((e: any) => e.id === caso.equipo_id);

  return (
    <div className="p-4 max-w-md mx-auto md:max-w-2xl pb-28">
      {/* Encabezado Principal */}
      <div className="mb-6">
        <Link href="/mis-servicios" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Volver a Mis Servicios
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Reporte de Servicio</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. Bloque Encabezado del Servicio */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-2 text-sm">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Información General</h3>
          <div className="grid grid-cols-2 gap-2 text-gray-700">
            <div><strong className="text-gray-900">N° de Caso:</strong> {caso.numero}</div>
            <div><strong className="text-gray-900">N° de Visita:</strong> Visita #1</div>
            <div className="col-span-2"><strong className="text-gray-900">Cliente:</strong> {(clienteData as any)?.razon_social || '—'}</div>
            <div className="col-span-2"><strong className="text-gray-900">Sede:</strong> {(direccionData as any)?.direccion || '—'}, {(direccionData as any)?.distrito || ''}</div>
            <div><strong className="text-gray-900">Equipo (Serie):</strong> <span className="font-mono">{(equipoData as any)?.numero_serie || '—'}</span></div>
            <div><strong className="text-gray-900">Modelo:</strong> {(equipoData as any)?.modelo || '—'}</div>
          </div>
        </div>

        {/* 2. Bloque Horas */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Control de Horario</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Hora de Ingreso</label>
              <input
                type="text"
                readOnly
                value={horaIngreso || '—'}
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-center font-mono"
                style={{ minHeight: '44px' }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Hora de Salida</label>
              <input
                type="text"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center font-mono bg-white"
                style={{ minHeight: '44px' }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-600 pt-2 border-t">
            <span>Total de horas (solo lectura): <strong className="text-gray-900">2.5 hrs</strong></span>
          </div>

          <button
            type="button"
            onClick={registrarIngreso}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            style={{ minHeight: '44px' }}
          >
            📍 Registrar ingreso ahora
          </button>
        </div>

        {/* 3. Bloque Revisión Inicial */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Revisión Inicial</h3>
          <label className="block text-xs text-gray-500">Estado en que se encontró el equipo</label>
          <textarea
            value={revisionInicial}
            onChange={(e) => setRevisionInicial(e.target.value)}
            rows={3}
            placeholder="Describa el estado inicial del equipo..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* 4. Bloque Procedimiento */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Procedimiento</h3>
          <label className="block text-xs text-blue-600 font-medium">🎤 Puedes dictar con el micrófono del teclado</label>
          <textarea
            value={procedimiento}
            onChange={(e) => setProcedimiento(e.target.value)}
            rows={5}
            placeholder="Detalle el procedimiento realizado..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* 5. Bloque Conclusión */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conclusión</h3>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            rows={3}
            placeholder="Conclusión de la intervención..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* 6. Bloque Recomendaciones */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recomendaciones</h3>
          <textarea
            value={recomendaciones}
            onChange={(e) => setRecomendaciones(e.target.value)}
            rows={3}
            placeholder="Recomendaciones para el operador..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* 7. Bloque Repuestos */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Repuestos Utilizados</h3>
            <button
              type="button"
              onClick={agregarRepuesto}
              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ minHeight: '44px' }}
            >
              + Agregar repuesto
            </button>
          </div>

          <div className="space-y-3">
            {repuestos.map((item, index) => (
              <div key={item.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Descripción del repuesto"
                  value={item.descripcion}
                  onChange={(e) => {
                    const nuevos = [...repuestos];
                    nuevos[index].descripcion = e.target.value;
                    setRepuestos(nuevos);
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                  style={{ minHeight: '44px' }}
                />
                <input
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) => {
                    const nuevos = [...repuestos];
                    nuevos[index].cantidad = parseInt(e.target.value) || 1;
                    setRepuestos(nuevos);
                  }}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center bg-white"
                  style={{ minHeight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => quitarRepuesto(index)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ minHeight: '44px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Bloque Fotos de Ingreso */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fotos de Ingreso</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="border-2 border-dashed border-gray-300 hover:border-blue-500 text-gray-700 rounded-lg py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 bg-gray-50 transition-colors"
              style={{ minHeight: '44px' }}
            >
              📷 Tomar foto
            </button>
            <button
              type="button"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 bg-white transition-colors"
              style={{ minHeight: '44px' }}
            >
              📁 Subir foto
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="h-20 bg-gray-100 rounded-lg border flex items-center justify-center text-xs text-gray-400">Miniatura 1</div>
          </div>
        </div>

        {/* 9. Bloque Fotos de Salida */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fotos de Salida</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="border-2 border-dashed border-gray-300 hover:border-blue-500 text-gray-700 rounded-lg py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 bg-gray-50 transition-colors"
              style={{ minHeight: '44px' }}
            >
              📷 Tomar foto
            </button>
            <button
              type="button"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 bg-white transition-colors"
              style={{ minHeight: '44px' }}
            >
              📁 Subir foto
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="h-20 bg-gray-100 rounded-lg border flex items-center justify-center text-xs text-gray-400">Miniatura 1</div>
          </div>
        </div>

        {/* 10. Bloque Resultado */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resultado del Servicio</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer" style={{ minHeight: '44px' }}>
              <input
                type="radio"
                name="resultado"
                value="resuelto"
                checked={resultado === 'resuelto'}
                onChange={() => setResultado('resuelto')}
                className="w-4 h-4 text-blue-600"
              />
              Resuelto
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer" style={{ minHeight: '44px' }}>
              <input
                type="radio"
                name="resultado"
                value="pendiente"
                checked={resultado === 'pendiente'}
                onChange={() => setResultado('pendiente')}
                className="w-4 h-4 text-blue-600"
              />
              Pendiente
            </label>
          </div>

          {resultado === 'pendiente' && (
            <div className="pt-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">¿Qué se requiere? (ej. Damper, repuesto, etc.)</label>
              <input
                type="text"
                value={requeridoPendiente}
                onChange={(e) => setRequeridoPendiente(e.target.value)}
                placeholder="Escriba los requerimientos..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                style={{ minHeight: '44px' }}
              />
            </div>
          )}
        </div>

        {/* 11. Bloque Firmas */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Firmas Digitales</h3>
          
          {/* Firma Operador */}
          <div className="space-y-2 border-b pb-4">
            <label className="block text-xs font-medium text-gray-700">Firma del Operador</label>
            <input
              type="text"
              placeholder="Nombre completo del operador"
              value={nombreOperador}
              onChange={(e) => setNombreOperador(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              style={{ minHeight: '44px' }}
            />
            <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
              [ Recuadro para firmar con el dedo ]
            </div>
            <button
              type="button"
              className="text-xs text-red-600 hover:underline font-medium py-1"
              style={{ minHeight: '44px' }}
            >
              Borrar firma
            </button>
          </div>

          {/* Firma Cliente */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Firma del Cliente</label>
            <input
              type="text"
              placeholder="Nombre completo del cliente / responsable"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              style={{ minHeight: '44px' }}
            />
            <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
              [ Recuadro para firmar con el dedo ]
            </div>
            <button
              type="button"
              className="text-xs text-red-600 hover:underline font-medium py-1"
              style={{ minHeight: '44px' }}
            >
              Borrar firma
            </button>
          </div>
        </div>

        {/* 12. Bloque Acciones (Fijo abajo en celular) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:relative md:bg-transparent md:border-t-0 md:p-0 md:shadow-none z-10">
          <div className="max-w-md mx-auto md:max-w-2xl flex gap-3">
            <button
              type="button"
              disabled={guardando}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg text-sm transition-colors"
              style={{ minHeight: '44px' }}
            >
              Guardar borrador
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors shadow-sm"
              style={{ minHeight: '44px' }}
            >
              {guardando ? 'Guardando...' : 'Cerrar reporte'}
            </button>
          </div>
        </div>

      </form>

      {/* TODO(especificación v1): Falta la lógica de cierre, el bloqueo de reportes cerrados, y las notas adicionales */}
    </div>
  );
}
feature/lista-casos

export default function ReportePage() {
  return <h1 className="text-2xl font-semibold p-6">Reporte</h1>;
}
main
 main
