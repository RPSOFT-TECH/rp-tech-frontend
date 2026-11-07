'use client';

import type { CasoDetalle } from '@/lib/datos/actions';
import { Button, Card } from '@/components/ui';
import { EstadoBadge, etiquetaEstado } from '../EstadoCaso';
import { fechaHoraLima, horaLima, puedeCoordinador } from './formato';

export function VisitasDetalle({
  caso,
  roles,
  onAbrir,
}: {
  caso: CasoDetalle;
  roles: string[];
  onAbrir: (accion: string) => void;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Visitas y reportes
      </h2>
      {caso.visitas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Este caso aún no tiene visitas registradas.</p>
      ) : (
        <div className="space-y-4">
          {caso.visitas.map((visita) => (
            <Card key={visita.id} className="p-4 cursor-pointer hover:border-primary/50 transition-all border border-border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-primary">Visita {visita.numero_visita}</div>
                  {visita.numero && <div className="text-xs font-mono text-muted-foreground">Reporte {visita.numero}</div>}
                  {visita.numero_fisico && (
                    <div className="text-xs text-muted-foreground">N° físico: {visita.numero_fisico}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-card-foreground">
                    {fechaHoraLima(visita.fecha_programada ? `${visita.fecha_programada}T${visita.hora_programada}` : null)}
                  </div>
                  <EstadoBadge estado={visita.cerrado ? 'atendido' : 'programado'} />
                </div>
              </div>
              <div className="space-y-2 text-sm text-card-foreground">
                <div>
                  <span className="font-semibold text-muted-foreground">Técnico:</span> {visita.tecnico_nombre || 'Sin asignar'}
                  {visita.tecnico_adjunto_nombre && (
                    <span className="ml-2 text-xs text-muted-foreground">(adjunto: {visita.tecnico_adjunto_nombre})</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Estado:</span> {etiquetaEstado(caso.estado)}
                </div>
                {visita.hora_llegada && (
                  <div>
                    <span className="font-semibold text-muted-foreground">Llegada:</span> {horaLima(visita.hora_llegada)}
                  </div>
                )}
                {visita.hora_salida && (
                  <div>
                    <span className="font-semibold text-muted-foreground">Salida:</span> {horaLima(visita.hora_salida)}
                  </div>
                )}
                {visita.resultado && (
                  <div>
                    <span className="font-semibold text-muted-foreground">Resultado:</span>
                    {visita.resultado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                    {visita.requerimiento && ` - Se requiere: ${visita.requerimiento}`}
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => onAbrir(`ver-${visita.id}`)} variant="outline" size="sm" className="px-3">
                  Ver reporte
                </Button>
                {!visita.cerrado && visita.hora_llegada && puedeCoordinador(roles) && (
                  <Button onClick={() => onAbrir(`cerrar-${visita.id}`)} variant="outline" size="sm" className="px-3">
                    Cerrar reporte
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
