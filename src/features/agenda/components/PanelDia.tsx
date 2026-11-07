import Link from 'next/link';
import { GraficoBarras } from '@/components/ui/charts/GraficoBarras';
import type { TecnicoLista, VisitaAgenda } from '@/lib/datos-simulados/actions';

export interface ColumnaAgenda {
  tecnico: TecnicoLista;
  visitas: VisitaAgenda[];
}

interface PanelDiaProps {
  titulo: string;
  columnas: ColumnaAgenda[] | null;
}

export function PanelDia({ titulo, columnas }: PanelDiaProps) {
  return (
    <aside className="no-scrollbar flex min-h-0 min-w-0 flex-col gap-3 lg:overflow-y-auto">
      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Día seleccionado</p>
        <h2 className="mt-1 text-base font-bold text-foreground">{titulo}</h2>
      </section>
      {columnas === null && <p className="text-sm text-muted-foreground">Cargando visitas...</p>}
      {columnas && columnas.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay técnicos vigentes.</p>
      )}
      {columnas && columnas.length > 0 && (
        <GraficoBarras
          etiqueta="Visitas por técnico"
          datos={columnas.map((columna) => ({
            nombre: columna.tecnico.nombre_completo.split(' ')[0] || columna.tecnico.nombre_completo,
            valor: columna.visitas.length,
          }))}
        />
      )}
      {columnas && columnas.length > 0 && (
        <div className="flex flex-col gap-3">
          {columnas.map((columna) => (
            <section key={columna.tecnico.id} className="space-y-2 rounded-xl border border-border bg-card p-3">
              <h3 className="text-sm font-semibold text-foreground">{columna.tecnico.nombre_completo}</h3>
              {columna.visitas.length === 0 && <p className="text-xs text-muted-foreground">Sin visitas</p>}
              {columna.visitas.map((visita) => (
                <Link
                  key={visita.id}
                  href={`/casos/${visita.caso_id}`}
                  className="block min-h-11 rounded-lg border border-border bg-background p-3 hover:border-primary"
                >
                  <p className="font-mono font-bold text-primary">{visita.hora_programada || '—'}</p>
                  <p className="text-sm font-medium text-foreground">{visita.numero_caso}</p>
                  <p className="text-xs text-muted-foreground">{visita.cliente_razon_social}</p>
                  {visita.como === 'adjunto' && <p className="text-xs text-muted-foreground">Adjunto</p>}
                </Link>
              ))}
            </section>
          ))}
        </div>
      )}
    </aside>
  );
}
