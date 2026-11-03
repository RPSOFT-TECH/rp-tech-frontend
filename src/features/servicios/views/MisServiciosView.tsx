'use client';

import { useEffect, useState } from 'react';
import { obtenerUsuarioActual, hoyLima, obtenerCasosTecnico } from '@/lib/datos-simulados/actions';
import { Caso } from '@/lib/datos-simulados/casos';
import { clientes } from '@/lib/datos-simulados/clientes';
import { sedes } from '@/lib/datos-simulados/sedes';
import { equipos } from '@/lib/datos-simulados/equipos';

interface ServicioTarjeta {
  id: string;
  numero: string;
  cliente: string;
  direccion: string;
  distrito: string;
  tipo: string;
  serie: string;
  prioridad: string;
  fecha: string | null;
  hora: string | null;
  esHoy: boolean;
}

export function MisServiciosView() {
  const [servicios, setServicios] = useState<ServicioTarjeta[]>([]);
  const [loading, setLoading] = useState(true);

  const sesion = obtenerUsuarioActual();
  const tecnicoId = sesion?.usuario.email;

  useEffect(() => {
    async function cargarMisServicios() {
      setLoading(true);
      if (!tecnicoId) {
        setServicios([]);
        setLoading(false);
        return;
      }

      const casos = await obtenerCasosTecnico(tecnicoId);
      const hoy = hoyLima();

      const lista: ServicioTarjeta[] = await Promise.all(
        casos.map(async (caso) => {
          const cliente = clientes.find((c) => c.id === caso.cliente_id);
          const direccion = sedes.find(
            (d) => d.id === (caso as any).sede_id || d.id === (caso as any).direccion_id
          );
          const equipo = equipos.find((e) => e.id === caso.equipo_id);
          return {
            id: caso.id,
            numero: caso.numero,
            cliente: cliente ? cliente.razon_social : 'Cliente desconocido',
            direccion: direccion?.direccion || '—',
            distrito: direccion?.distrito || '—',
            tipo: caso.tipo_servicio || '—',
            serie: equipo ? equipo.numero_serie : 'S/N',
            prioridad: caso.prioridad || '—',
            fecha: caso.fecha_programada || null,
            hora: caso.hora_programada || null,
            esHoy: caso.fecha_programada === hoy,
          };
        })
      );

      lista.sort((a, b) => {
        const fa = (a.fecha || '') + (a.hora || '');
        const fb = (b.fecha || '') + (b.hora || '');
        return fa.localeCompare(fb);
      });

      setServicios(lista);
      setLoading(false);
    }
    cargarMisServicios();
  }, [tecnicoId]);

  const hoy = hoyLima();
  const serviciosHoy = servicios.filter((s) => s.esHoy);
  const serviciosProximos = servicios.filter((s) => !s.esHoy);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando tus servicios...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto md:max-w-3xl pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mis servicios</h1>
        <p className="text-xs text-muted-foreground">Técnico: {tecnicoId}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 border-b border-border pb-1">
          Hoy ({serviciosHoy.length})
        </h2>
        {serviciosHoy.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card p-4 rounded-xl border border-border">
            No tienes servicios para hoy.
          </p>
        ) : (
          <div className="space-y-4">
            {serviciosHoy.map((s) => (
              <TarjetaServicio key={s.id} s={s} esHoy />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border pb-1">
          Próximos ({serviciosProximos.length})
        </h2>
        {serviciosProximos.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card p-4 rounded-xl border border-border">
            No tienes servicios programados.
          </p>
        ) : (
          <div className="space-y-4">
            {serviciosProximos.map((s) => (
              <TarjetaServicio key={s.id} s={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TarjetaServicio({ s, esHoy = false }: { s: ServicioTarjeta; esHoy?: boolean }) {
  return (
    <a
      href={`/mis-servicios/${s.id}/reporte`}
      className="block bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/50 transition-all min-h-11"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
          {s.hora || '—'}
        </span>
        <span className="font-bold text-card-foreground text-sm">{s.numero}</span>
      </div>

      <div className="text-sm font-medium text-card-foreground mb-1">{s.cliente}</div>
      <div className="text-xs text-muted-foreground mb-2">
        {s.direccion}, {s.distrito}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
        <span className="bg-muted px-2 py-1 rounded">Tipo: {s.tipo}</span>
        <span className="bg-muted px-2 py-1 rounded font-mono">Serie: {s.serie}</span>
        <span className="bg-muted px-2 py-1 rounded">Prioridad: {s.prioridad}</span>
      </div>

      {!esHoy && (
        <div className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
          Fecha: {s.fecha}
        </div>
      )}
    </a>
  );
}
