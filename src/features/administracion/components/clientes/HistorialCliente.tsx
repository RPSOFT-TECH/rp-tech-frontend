'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  casos_lista,
  historial_unificado,
  reportes_lista,
  type CasoLista,
  type HistorialFila,
  type ReporteLista,
} from '@/lib/datos/actions';
import { etiquetaEstado } from '@/features/casos';

// Reportes en papel (SIREP) del cliente o del equipo, ya vinculados por el coordinador.
// Usa la vista historial_unificado: si el usuario no puede ver el histórico, viene vacía.
function ReportesEnPapel({ filtro }: { filtro: { cliente_id?: string; equipo_id?: string } }) {
  const [filas, setFilas] = useState<HistorialFila[]>([]);
  const clave = filtro.cliente_id ?? filtro.equipo_id ?? '';
  useEffect(() => {
    let vigente = true;
    historial_unificado(filtro).then((datos) => vigente && setFilas(datos.filter((f) => f.origen === 'historico')));
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);
  if (filas.length === 0) return null;
  const consulta = filtro.cliente_id ? `cliente_id=${filtro.cliente_id}` : `equipo_id=${filtro.equipo_id}`;
  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Reportes en papel ({filas.length})</p>
        <Link href={`/historico?${consulta}`} className="text-xs font-semibold text-primary hover:underline">
          Ver en Histórico
        </Link>
      </div>
      <ul className="space-y-1">
        {filas.slice(0, 10).map((f) => (
          <li key={f.id} className="text-sm">
            <Link href={`/historico/${f.id}`} className="hover:underline">
              Talonario {f.numero ?? 'sin N°'}
              {f.fecha ? ` · ${f.fecha.split('-').reverse().join('/')}` : ''}
              {f.motivo ? ` · ${f.motivo}` : ''}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

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

  if (casos.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Este cliente no tiene casos.</p>
        <ReportesEnPapel filtro={{ cliente_id: clienteId }} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ReportesEnPapel filtro={{ cliente_id: clienteId }} />
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

  if (reportes.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Sin reportes del sistema para este equipo.</p>
        {abierto ? <ReportesEnPapel filtro={{ equipo_id: equipoId }} /> : null}
      </div>
    );
  }
  return (
    <div className="space-y-2">
    <ul className="space-y-1">
      {reportes.map((reporte) => (
        <li key={reporte.id} className="text-sm text-foreground">
          {reporte.numero_caso} · visita {reporte.numero_visita}
          {reporte.fecha_programada ? ` · ${reporte.fecha_programada}` : ''}
        </li>
      ))}
    </ul>
    <ReportesEnPapel filtro={{ equipo_id: equipoId }} />
    </div>
  );
}
