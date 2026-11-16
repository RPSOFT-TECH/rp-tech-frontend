import Link from 'next/link';
import type { TecnicoLista, VisitaAgenda } from '@/lib/datos/actions';
import { AvatarIniciales } from '@/components/ui';
import { tituloDia } from '../utils/calendario';

export interface ColumnaAgenda {
  tecnico: TecnicoLista;
  visitas: VisitaAgenda[];
}

interface PanelDiaProps {
  fecha: string;
  columnas: ColumnaAgenda[] | null;
}

// Lista del día elegido: todas las visitas por hora y la carga de cada técnico.
export function PanelDia({ fecha, columnas }: PanelDiaProps) {
  const [diaSemana, ...resto] = tituloDia(fecha).split(', ');
  const visitas = (columnas ?? [])
    .flatMap((c) => c.visitas.filter((v) => v.como !== 'adjunto').map((v) => ({ visita: v, tecnico: c.tecnico })))
    .sort((a, b) => (a.visita.hora_programada ?? '').localeCompare(b.visita.hora_programada ?? ''));
  const adjuntos = new Map<string, string[]>();
  for (const c of columnas ?? []) {
    for (const v of c.visitas) if (v.como === 'adjunto') adjuntos.set(v.id, [...(adjuntos.get(v.id) ?? []), c.tecnico.nombre_completo]);
  }

  return (
    <aside className="no-scrollbar flex min-h-0 min-w-0 flex-col lg:overflow-y-auto">
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <header className="border-b border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">{diaSemana}</p>
          <h2 className="text-lg font-bold text-foreground">{resto.join(', ').replace(/ de \d{4}$/, '')}</h2>
          {columnas && (
            <p className="text-xs text-muted-foreground">
              {visitas.length} {visitas.length === 1 ? 'visita' : 'visitas'}
            </p>
          )}
        </header>
        {columnas === null && <p className="px-4 py-3 text-sm text-muted-foreground">Cargando visitas...</p>}
        {columnas && visitas.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted-foreground">No hay visitas este día.</p>}
        <ul>
          {visitas.map(({ visita, tecnico }) => (
            <li key={visita.id} className="border-b border-border last:border-b-0">
              <Link href={`/casos/${visita.caso_id}`} className="grid grid-cols-[3.25rem_1fr] gap-3 px-4 py-3 hover:bg-accent/50">
                <span className="text-[15px] font-bold tabular-nums">{visita.hora_programada?.slice(0, 5) || '—'}</span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-semibold">{visita.cliente_razon_social}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{visita.numero_caso}</span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <AvatarIniciales nombre={tecnico.nombre_completo} className="size-6 text-[10px]" />
                    {tecnico.nombre_completo}
                    {adjuntos.get(visita.id)?.length ? <span className="text-muted-foreground">+ {adjuntos.get(visita.id)!.join(', ')}</span> : null}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {columnas && columnas.length > 0 && (
          <footer className="border-t border-border bg-muted/50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Carga del día</p>
            <ul className="flex flex-col gap-1.5">
              {columnas.map((c) => (
                <li key={c.tecnico.id} className="flex items-center gap-2 text-sm">
                  <AvatarIniciales nombre={c.tecnico.nombre_completo} className="size-6 text-[10px]" />
                  <span className="flex-1 truncate">{c.tecnico.nombre_completo}</span>
                  <span className={c.visitas.length ? 'font-semibold tabular-nums' : 'text-muted-foreground'}>
                    {c.visitas.length ? `${c.visitas.length} ${c.visitas.length === 1 ? 'visita' : 'visitas'}` : 'Libre'}
                  </span>
                </li>
              ))}
            </ul>
          </footer>
        )}
      </section>
    </aside>
  );
}
