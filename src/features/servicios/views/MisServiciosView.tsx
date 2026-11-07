'use client';

import { useEffect, useState } from 'react';
import { mis_servicios, hoyLima, obtenerUsuarioActual, type MiServicio } from '@/lib/datos-simulados/actions';
import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { Skeleton } from '@/components/ui/skeleton';

export function MisServiciosView() {
  const [servicios, setServicios] = useState<MiServicio[]>([]);
  const [nombre, setNombre] = useState('');
  const [hoy, setHoy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;
    const sesion = obtenerUsuarioActual();
    const dia = hoyLima();
    mis_servicios().then((lista) => {
      if (!activo) return;
      setNombre(sesion?.usuario.nombre_completo ?? '');
      setHoy(dia);
      setServicios(lista);
      setLoading(false);
    });
    return () => {
      activo = false;
    };
  }, []);

  useRegistrarTitulo('Mis servicios', nombre ? `Técnico: ${nombre}` : 'Órdenes asignadas y visitas técnicas', Wrench);

  if (loading || !hoy) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  const serviciosHoy = servicios.filter((s) => !s.cerrado && s.fecha_programada === hoy);
  const serviciosDiasAnteriores = servicios.filter(
    (s) => !s.cerrado && s.fecha_programada !== null && s.fecha_programada < hoy,
  );
  const serviciosProximos = servicios.filter(
    (s) => !s.cerrado && s.fecha_programada !== null && s.fecha_programada > hoy,
  );
  const serviciosCerrados = servicios.filter((s) => s.cerrado);

  return (
    <div className="mx-auto w-full max-w-md pb-24 md:max-w-3xl">
      <p className="mb-6 text-xs text-muted-foreground">Técnico: {nombre}</p>

      {/* Día de hoy */}
      <div className="mb-8">
        <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 border-b border-border pb-1 text-primary`}>
          Hoy ({serviciosHoy.length})
        </h2>
        {serviciosDiasAnteriores.length > 0 && (
          <div className="mb-4 rounded-lg border border-chart-3/40 bg-chart-3/15 p-3 text-sm text-foreground">
            De días anteriores, sin cerrar: {serviciosDiasAnteriores.length}
          </div>
        )}
        {serviciosHoy.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card p-4 rounded-xl border border-border">
            No tienes servicios para hoy.
          </p>
        ) : (
          <div className="space-y-4">
            {serviciosHoy.map((servicio) => (
              <TarjetaServicio key={servicio.id} servicio={servicio} hoy={hoy} />
            ))}
          </div>
        )}
      </div>

      {/* Próximos */}
      <div className="mb-8">
        <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 border-b border-border pb-1 text-muted-foreground`}>
          Próximos ({serviciosProximos.length})
        </h2>
        {serviciosProximos.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card p-4 rounded-xl border border-border">
            No tienes servicios programados.
          </p>
        ) : (
          <div className="space-y-4">
            {serviciosProximos.map((servicio) => (
              <TarjetaServicio key={servicio.id} servicio={servicio} hoy={hoy} />
            ))}
          </div>
        )}
      </div>

      {/* Cerrados */}
      <div>
        <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 border-b border-border pb-1 text-muted-foreground`}>
          Cerrados ({serviciosCerrados.length})
        </h2>
        {serviciosCerrados.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card p-4 rounded-xl border border-border">
            No tienes reportes cerrados.
          </p>
        ) : (
          <div className="space-y-4">
            {serviciosCerrados.map((servicio) => (
              <TarjetaServicio key={servicio.id} servicio={servicio} hoy={hoy} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TarjetaServicio({ servicio, hoy }: { servicio: MiServicio; hoy: string }) {
  const enlace = `/mis-servicios/${servicio.caso_id}/reporte`;
  const esHoy = servicio.fecha_programada === hoy;
  const esAdjunto = servicio.soy_adjunto;

  return (
    <Link
      href={enlace}
      className="block bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/50 transition-all min-h-11"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
          {servicio.hora_programada || '—'}
        </span>
        <span className="font-bold text-card-foreground text-sm">{servicio.numero_caso}</span>
      </div>
      <div className="text-sm font-medium text-card-foreground mb-1">{servicio.cliente_razon_social}</div>
      <div className="text-xs text-muted-foreground mb-2">
        {servicio.sede_direccion}, {servicio.sede_distrito}
        {servicio.sede_referencia && ` · ${servicio.sede_referencia}`}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
        <span className="bg-muted px-2 py-1 rounded">Tipo: {servicio.tipo_servicio_nombre}</span>
        <span className="bg-muted px-2 py-1 rounded">Modalidad: {servicio.modalidad_nombre}</span>
        <span className="bg-muted px-2 py-1 rounded font-mono">Serie: {servicio.numero_serie}</span>
        {esAdjunto && (
          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
            Vas como adjunto
          </span>
        )}
        {servicio.estado === 'en_atencion' && (
          <span className="rounded border border-chart-2/40 bg-chart-2/15 px-2 py-1 text-xs font-medium text-chart-2">
            En atención
          </span>
        )}
        {!esHoy && servicio.fecha_programada && (
          <span className="bg-muted px-2 py-1 rounded">Visita {servicio.numero_visita}</span>
        )}
      </div>
      {!esHoy && servicio.fecha_programada && (
        <div className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
          Fecha: {servicio.fecha_programada}
        </div>
      )}
    </Link>
  );
}
