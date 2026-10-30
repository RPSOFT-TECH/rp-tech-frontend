'use client';

import { useEffect, useState } from 'react';
import { obtenerUsuarioActual } from '@/lib/datos-simulados/actions';
import { visitasSimuladas, casosSimulados } from '@/lib/datos-simulados/casos';
import { clientes } from '@/lib/datos-simulados/clientes';
import { sedes } from '@/lib/datos-simulados/sedes';
import { equipos } from '@/lib/datos-simulados/equipos';
import { VisitaConDetalles } from '../types';
import { TarjetaServicio } from '../components/TarjetaServicio';

export function MisServiciosView() {
  const [visitasHoy, setVisitasHoy] = useState<VisitaConDetalles[]>([]);
  const [visitasProximas, setVisitasProximas] = useState<VisitaConDetalles[]>([]);
  const [loading, setLoading] = useState(true);

  const sesion = obtenerUsuarioActual();
  const tecnicoId = sesion?.usuario.email || 'tecnico1@rptech.test';

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
        const direccionData = casoData ? sedes.find((d: any) => d.id === (casoData as any).sede_id || d.id === (casoData as any).direccion_id) : null;
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
    return <div className="text-center py-12 text-muted-foreground">Cargando tus servicios...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto md:max-w-3xl pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mis Servicios</h1>
        <p className="text-xs text-muted-foreground">Técnico: {tecnicoId}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 border-b border-border pb-1">
          Hoy ({visitasHoy.length})
        </h2>
        {visitasHoy.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card p-4 rounded-xl border border-border">
            No tienes servicios para hoy.
          </p>
        ) : (
          <div className="space-y-4">
            {visitasHoy.map((visita) => (
              <TarjetaServicio key={visita.id} visita={visita} esHoy />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border pb-1">
          Próximos ({visitasProximas.length})
        </h2>
        {visitasProximas.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card p-4 rounded-xl border border-border">
            No tienes servicios programados.
          </p>
        ) : (
          <div className="space-y-4">
            {visitasProximas.map((visita) => (
              <TarjetaServicio key={visita.id} visita={visita} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
