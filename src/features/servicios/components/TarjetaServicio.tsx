import Link from 'next/link';
import { VisitaConDetalles } from '../types';

interface TarjetaServicioProps {
  visita: VisitaConDetalles;
  esHoy?: boolean;
}

export function TarjetaServicio({ visita, esHoy = false }: TarjetaServicioProps) {
  if (esHoy) {
    return (
      <Link
        href={`/mis-servicios/${visita.caso_id}/reporte`}
        className="block bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/50 transition-all min-h-11"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              {visita.hora_programada || '—'}
            </span>
            <span className="font-bold text-card-foreground text-sm">{visita.caso?.numero}</span>
          </div>
          {visita.numero_visita > 1 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
              Visita {visita.numero_visita}
            </span>
          )}
        </div>

        <div className="text-sm font-medium text-card-foreground mb-1">{visita.clienteRazonSocial}</div>
        <div className="text-xs text-muted-foreground mb-2">
          {visita.sedeNombre} ({visita.sedeDireccion}, {visita.sedeDistrito})
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
          <span className="bg-muted px-2 py-1 rounded">Tipo: {visita.caso?.tipo_servicio}</span>
          <span className="bg-muted px-2 py-1 rounded font-mono">Serie: {visita.equipoSerie}</span>
          <span className="bg-muted px-2 py-1 rounded">Modalidad: {visita.caso?.modalidad}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/mis-servicios/${visita.caso_id}/reporte`}
      className="block bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/50 transition-all min-h-11"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-card-foreground text-sm">{visita.caso?.numero}</span>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
          Fecha: {visita.fecha_programada} ({visita.hora_programada || '—'})
        </span>
      </div>

      <div className="text-sm font-medium text-card-foreground mb-1">{visita.clienteRazonSocial}</div>
      <div className="text-xs text-muted-foreground mb-2">
        {visita.sedeNombre} ({visita.sedeDistrito})
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
        <span className="bg-muted px-2 py-1 rounded">Tipo: {visita.caso?.tipo_servicio}</span>
        <span className="bg-muted px-2 py-1 rounded font-mono">Serie: {visita.equipoSerie}</span>
        <span className="bg-muted px-2 py-1 rounded">Modalidad: {visita.caso?.modalidad}</span>
      </div>
    </Link>
  );
}
