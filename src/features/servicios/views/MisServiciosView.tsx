'use client';

import { useEffect, useState } from 'react';
import { mis_servicios, hoyLima, obtenerUsuarioActual, type MiServicio } from '@/lib/datos-simulados/actions';

export function MisServiciosView() {
  const [servicios, setServicios] = useState<MiServicio[]>([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const hoy = hoyLima();

  useEffect(() => {
    let activo = true;
    const sesion = obtenerUsuarioActual();
    mis_servicios().then((lista) => {
      if (!activo) return;
      setNombre(sesion?.usuario.nombre_completo ?? '');
      setServicios(lista);
      setLoading(false);
    });
    return () => {
      activo = false;
    };
  }, []);

  const serviciosHoy = servicios.filter((servicio) => servicio.fecha_programada === hoy);
  const serviciosProximos = servicios.filter((servicio) => servicio.fecha_programada !== hoy);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando tus servicios...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto md:max-w-3xl pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mis servicios</h1>
        <p className="text-xs text-muted-foreground">Técnico: {nombre}</p>
      </div>
      <Grupo titulo="Hoy" servicios={serviciosHoy} vacio="No tienes servicios para hoy." hoy />
      <Grupo titulo="Próximos" servicios={serviciosProximos} vacio="No tienes servicios programados." />
    </div>
  );
}

function Grupo({
  titulo,
  servicios,
  vacio,
  hoy = false,
}: {
  titulo: string;
  servicios: MiServicio[];
  vacio: string;
  hoy?: boolean;
}) {
  return (
    <div className="mb-8">
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 border-b border-border pb-1 ${hoy ? 'text-primary' : 'text-muted-foreground'}`}>
        {titulo} ({servicios.length})
      </h2>
      {servicios.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-card p-4 rounded-xl border border-border">{vacio}</p>
      ) : (
        <div className="space-y-4">
          {servicios.map((servicio) => (
            <a
              key={servicio.id}
              href={`/mis-servicios/${servicio.caso_id}/reporte`}
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
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                <span className="bg-muted px-2 py-1 rounded">Tipo: {servicio.tipo_servicio_nombre}</span>
                <span className="bg-muted px-2 py-1 rounded font-mono">Serie: {servicio.numero_serie}</span>
                {servicio.soy_adjunto && <span className="bg-accent px-2 py-1 rounded">Adjunto</span>}
              </div>
              {!hoy && servicio.fecha_programada && (
                <div className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">Fecha: {servicio.fecha_programada}</div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
