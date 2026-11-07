'use client';

import { useEffect, useState } from 'react';
import { casos_lista, reportes_lista, type CasoLista, type ReporteLista } from '@/lib/datos-simulados/actions';
import { etiquetaEstado } from '@/features/casos';

export function HistorialCliente({ clienteId }: { clienteId: string }) {
  const [casos, setCasos] = useState<CasoLista[]>([]);
  const [reportes, setReportes] = useState<ReporteLista[]>([]);

  useEffect(() => {
    let vigente = true;
    Promise.all([casos_lista({ cliente_id: clienteId }), reportes_lista({ cliente_id: clienteId })]).then(([lista, visitas]) => {
      if (!vigente) return;
      setCasos(lista);
      setReportes(visitas);
    });
    return () => {
      vigente = false;
    };
  }, [clienteId]);

  if (casos.length === 0) return <p className="text-sm text-muted-foreground">Este cliente no tiene casos.</p>;

  return (
    <div className="space-y-3">
      {casos.map((caso) => (
        <article key={caso.id} className="bg-card border border-border rounded-xl p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-foreground">{caso.numero}</p>
            <p className="text-xs text-muted-foreground">{etiquetaEstado(caso.estado)}</p>
          </div>
          <p className="text-sm text-muted-foreground">{caso.incidencia}</p>
          <ul className="space-y-1">
            {reportes
              .filter((reporte) => reporte.caso_id === caso.id)
              .map((reporte) => (
                <li key={reporte.id} className="text-xs text-foreground">
                  Visita {reporte.numero_visita}
                  {reporte.numero ? ` · ${reporte.numero}` : ''}
                  {reporte.fecha_programada ? ` · ${reporte.fecha_programada}` : ''}
                  {reporte.resultado ? ` · ${reporte.resultado}` : ''}
                </li>
              ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export function HistorialEquipo({ equipoId, abierto }: { equipoId: string; abierto: boolean }) {
  const [reportes, setReportes] = useState<ReporteLista[]>([]);

  useEffect(() => {
    if (!abierto) return;
    let vigente = true;
    reportes_lista({ equipo_id: equipoId }).then((datos) => {
      if (vigente) setReportes(datos);
    });
    return () => {
      vigente = false;
    };
  }, [equipoId, abierto]);

  if (reportes.length === 0) return <p className="text-sm text-muted-foreground">Sin reportes para este equipo.</p>;
  return (
    <ul className="space-y-1">
      {reportes.map((reporte) => (
        <li key={reporte.id} className="text-sm text-foreground">
          {reporte.numero_caso} · visita {reporte.numero_visita}
          {reporte.fecha_programada ? ` · ${reporte.fecha_programada}` : ''}
        </li>
      ))}
    </ul>
  );
}
