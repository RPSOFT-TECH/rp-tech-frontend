'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mis_servicios, parametros_actuales, type MiServicio } from '@/lib/datos-simulados/actions';
import { RepuestoItem } from '../types';
import { RepuestosList } from '../components/RepuestosList';
import { FirmasDigitales } from '../components/FirmasDigitales';
import { FotosReporte } from '../components/FotosReporte';

function ReporteServicioContenido() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [caso, setCaso] = useState<MiServicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [horaIngreso, setHoraIngreso] = useState<string>('');
  const [horaSalida, setHoraSalida] = useState<string>('12:30');
  const [revisionInicial, setRevisionInicial] = useState('');
  const [procedimiento, setProcedimiento] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  
  const [repuestos, setRepuestos] = useState<RepuestoItem[]>([
    { id: '1', descripcion: 'Damper para cabezal Epson i3200', cantidad: 2 }
  ]);

  const [resultado, setResultado] = useState<'resuelto' | 'pendiente'>('resuelto');
  const [requeridoPendiente, setRequeridoPendiente] = useState('');

  const [nombreOperador, setNombreOperador] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [textoConformidad, setTextoConformidad] = useState('');

  useEffect(() => {
    async function cargar() {
      const parametros = await parametros_actuales();
      if (parametros) setTextoConformidad(parametros.texto_conformidad);
      if (!id) {
        setLoading(false);
        return;
      }
      const data = await mis_servicios();
      const encontrado = data.find((item) => item.caso_id === id);
      if (encontrado) setCaso(encontrado);
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
    return <div className="text-center py-12 text-muted-foreground">Cargando reporte de servicio...</div>;
  }

  if (!caso) {
    return <div className="p-8 text-center text-destructive">Caso no encontrado.</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto md:max-w-2xl pb-28">
      <div className="mb-6">
        <Link href="/mis-servicios" className="text-sm text-primary hover:underline mb-2 inline-block">
          Volver a Mis Servicios
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Reporte de Servicio</h1>
        <p className="text-xs text-muted-foreground">Caso: {caso.numero_caso}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente y Equipo</h3>
          <div className="text-sm font-bold text-card-foreground">{caso.cliente_razon_social || '—'}</div>
          <div className="text-xs text-muted-foreground">
            {caso.sede_nombre} ({caso.sede_direccion})
          </div>
          <div className="flex gap-2 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
            <span className="font-mono bg-muted px-2 py-0.5 rounded">Serie: {caso.numero_serie}</span>
            <span className="bg-muted px-2 py-0.5 rounded">{caso.tipo_servicio_nombre}</span>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{caso.modo_servicio_nombre}</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hora de Ingreso</h3>
            <div className="text-lg font-mono font-bold text-card-foreground mt-1">
              {horaIngreso || 'No registrado'}
            </div>
          </div>
          {!horaIngreso && (
            <button
              type="button"
              onClick={registrarIngreso}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shadow-sm min-h-11"
            >
              Registrar ingreso ahora
            </button>
          )}
        </div>

        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Hora de Salida</h3>
          <input
            type="time"
            value={horaSalida}
            onChange={(e) => setHoraSalida(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground min-h-11"
          />
        </div>

        <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revisión Inicial</h3>
          <textarea
            rows={3}
            value={revisionInicial}
            onChange={(e) => setRevisionInicial(e.target.value)}
            placeholder="Describa el estado en el que encontró la máquina..."
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground min-h-11"
          />
        </div>

        <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Procedimiento Realizado</h3>
          <textarea
            rows={4}
            value={procedimiento}
            onChange={(e) => setProcedimiento(e.target.value)}
            placeholder="Describa las acciones técnicas realizadas paso a paso..."
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground min-h-11"
          />
        </div>

        <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Conclusión</h3>
            <textarea
              rows={2}
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Conclusiones finales..."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground min-h-11"
            />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recomendaciones al Cliente</h3>
            <textarea
              rows={2}
              value={recomendaciones}
              onChange={(e) => setRecomendaciones(e.target.value)}
              placeholder="Recomendaciones operativas o de mantenimiento..."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground min-h-11"
            />
          </div>
        </div>

        <RepuestosList
          repuestos={repuestos}
          setRepuestos={setRepuestos}
          agregarRepuesto={agregarRepuesto}
          quitarRepuesto={quitarRepuesto}
        />

        <FotosReporte />

        <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resultado del Servicio</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-card-foreground cursor-pointer min-h-11">
              <input
                type="radio"
                name="resultado"
                value="resuelto"
                checked={resultado === 'resuelto'}
                onChange={() => setResultado('resuelto')}
                className="w-4 h-4 text-primary"
              />
              Resuelto
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-card-foreground cursor-pointer min-h-11">
              <input
                type="radio"
                name="resultado"
                value="pendiente"
                checked={resultado === 'pendiente'}
                onChange={() => setResultado('pendiente')}
                className="w-4 h-4 text-primary"
              />
              Pendiente
            </label>
          </div>

          {resultado === 'pendiente' && (
            <div className="pt-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">¿Qué se requiere? (ej. Damper, repuesto, etc.)</label>
              <input
                type="text"
                value={requeridoPendiente}
                onChange={(e) => setRequeridoPendiente(e.target.value)}
                placeholder="Escriba los requerimientos..."
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground min-h-11"
              />
            </div>
          )}
        </div>

        <FirmasDigitales
          nombreOperador={nombreOperador}
          setNombreOperador={setNombreOperador}
          nombreCliente={nombreCliente}
          setNombreCliente={setNombreCliente}
          textoConformidad={textoConformidad}
        />

        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg md:relative md:bg-transparent md:border-t-0 md:p-0 md:shadow-none z-10">
          <div className="max-w-md mx-auto md:max-w-2xl flex gap-3">
            <button
              type="button"
              disabled={guardando}
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg text-sm transition-colors min-h-11"
            >
              Guardar borrador
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg text-sm transition-colors shadow-sm min-h-11"
            >
              {guardando ? 'Guardando...' : 'Firmar y entregar'}
            </button>
          </div>
        </div>
      </form>
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
