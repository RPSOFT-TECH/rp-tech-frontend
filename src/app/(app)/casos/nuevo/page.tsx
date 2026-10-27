'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { crearCaso, buscarClientes, obtenerContactos, obtenerDirecciones, obtenerEquipos } from '@/lib/datos-simulados/actions';
import { Cliente } from '@/lib/datos-simulados/clientes';
import { Contacto } from '@/lib/datos-simulados/contactos';
import { Direccion } from '@/lib/datos-simulados/direcciones';
import { Equipo } from '@/lib/datos-simulados/equipos';

export default function NuevoCasoPage() {
  const router = useRouter();

  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  const [contactoId, setContactoId] = useState('');
  const [direccionId, setDireccionId] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoServicio, setTipoServicio] = useState('Mantenimiento general');
  const [modoServicio, setModoServicio] = useState('Garantía de la máquina');
  const [modalidad, setModalidad] = useState('Presencial');
  const [prioridad, setPrioridad] = useState('Producción afectada');
  const [incidencia, setIncidencia] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Buscar clientes al escribir
  const handleBuscarCliente = async (query: string) => {
    setBusquedaCliente(query);
    if (query.length >= 2) {
      const resultados = await buscarClientes(query);
      setClientesEncontrados(resultados);
    } else {
      setClientesEncontrados([]);
    }
  };

  // Seleccionar cliente y cargar sus dependencias
  const seleccionarCliente = async (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(cliente.razon_social);
    setClientesEncontrados([]);

    const [cData, dData, eData] = await Promise.all([
      obtenerContactos(cliente.id),
      obtenerDirecciones(cliente.id),
      obtenerEquipos(cliente.id),
    ]);

    setContactos(cData);
    setDirecciones(dData);
    setEquipos(eData);

    if (cData.length > 0) setContactoId(String(cData[0].id));
    if (dData.length > 0) setDireccionId(String(dData[0].id));
    if (eData.length > 0) setEquipoId(String(eData[0].id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSeleccionado) {
      setError('Debes seleccionar un cliente.');
      return;
    }
    if (!incidencia.trim()) {
      setError('La descripción de la incidencia es obligatoria.');
      return;
    }

    try {
      setGuardando(true);
      setError('');
      await crearCaso({
        creado_por: 'coordinadora@rptech.test',
        cliente_id: String(clienteSeleccionado.id),
        contacto_id: contactoId || '1',
        direccion_id: direccionId || '1',
        telefono: telefono || '999999999',
        equipo_id: equipoId || '1',
        incidencia,
        tipo_servicio: tipoServicio,
        modo_servicio: modoServicio,
        modalidad,
        prioridad,
        tecnico_id: null,
        fecha_programada: null,
        hora_programada: null,
      });
      router.push('/casos');
    } catch (err: any) {
      setError(err.message || 'Error al crear el caso.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/casos" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Volver a la lista
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Caso</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        {/* Buscador de Cliente */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">Buscar Cliente (Razón social o RUC)</label>
          <input
            type="text"
            value={busquedaCliente}
            onChange={(e) => handleBuscarCliente(e.target.value)}
            placeholder="Ej. Textiles Andinos o 2060..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
          {clientesEncontrados.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {clientesEncontrados.map((c) => (
                <li
                  key={c.id}
                  onClick={() => seleccionarCliente(c)}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b last:border-none"
                >
                  <span className="font-medium">{c.razon_social}</span> <span className="text-xs text-gray-500">(RUC: {c.ruc})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {clienteSeleccionado && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contacto</label>
              <select
                value={contactoId}
                onChange={(e) => setContactoId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {contactos.map((ct) => (
                  <option key={ct.id} value={ct.id}>{ct.nombre} - {ct.cargo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
              <select
                value={direccionId}
                onChange={(e) => setDireccionId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {direcciones.map((dir) => (
                  <option key={dir.id} value={dir.id}>{dir.direccion} ({dir.distrito})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Equipo afectado</label>
              <select
                value={equipoId}
                onChange={(e) => setEquipoId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {equipos.map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.modelo} - Serie: {eq.numero_serie}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono de contacto</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="987654321"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Servicio</label>
            <select
              value={tipoServicio}
              onChange={(e) => setTipoServicio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="Mantenimiento general">Mantenimiento general</option>
              <option value="Inspección y diagnóstico">Inspección y diagnóstico</option>
              <option value="Entrenamiento técnico">Entrenamiento técnico</option>
              <option value="Perfilación de color">Perfilación de color</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Modo de Servicio</label>
            <select
              value={modoServicio}
              onChange={(e) => setModoServicio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="Garantía de la máquina">Garantía de la máquina</option>
              <option value="Facturado">Facturado</option>
              <option value="Garantía de soporte técnico">Garantía de soporte técnico</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Modalidad</label>
            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="Presencial">Presencial</option>
              <option value="Remoto">Remoto</option>
              <option value="En taller">En taller</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Prioridad</label>
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="Producción afectada">Producción afectada</option>
              <option value="Máquina detenida">Máquina detenida</option>
              <option value="Consulta">Consulta</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Descripción de la Incidencia</label>
          <textarea
            value={incidencia}
            onChange={(e) => setIncidencia(e.target.value)}
            rows={4}
            placeholder="Detalle el problema presentado..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {guardando ? 'Guardando...' : 'Crear Caso'}
        </button>
      </form>
    </div>
  );
}