interface DiaAgendaProps {
  dia: number;
  perteneceMes: boolean;
  esHoy: boolean;
  seleccionado: boolean;
  visitas: number;
  onElegir: () => void;
}

export function DiaAgenda({
  dia,
  perteneceMes,
  esHoy,
  seleccionado,
  visitas,
  onElegir,
}: DiaAgendaProps) {
  if (!perteneceMes) {
    return <div className="min-h-[60px] min-w-0 rounded-xl sm:min-h-[72px]" />;
  }

  const marcado = esHoy || seleccionado;
  const conVisitas = visitas > 0;
  const tono = seleccionado
    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
    : esHoy
      ? 'border-primary/70 bg-primary/5'
      : conVisitas
        ? 'border-chart-2/40 bg-chart-2/10'
        : 'border-border bg-card';

  return (
    <button
      type="button"
      onClick={onElegir}
      aria-pressed={seleccionado}
      aria-label={`Día ${dia}`}
      className={`flex min-h-[60px] w-full min-w-0 flex-col overflow-hidden rounded-xl border-2 p-1 text-left transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-[72px] sm:p-1.5 ${tono}`}
    >
      <span className={`self-end pr-0.5 text-sm font-bold ${marcado ? 'text-primary' : 'text-foreground'}`}>
        {dia}
      </span>
      {conVisitas && (
        <span className="mt-auto flex w-full min-w-0 items-center gap-1 overflow-hidden rounded-md bg-chart-2/15 px-1 py-0.5 text-[9px] font-semibold leading-none text-chart-2 sm:text-[10px]">
          <span className="shrink-0 tabular-nums">{visitas}</span>
          <span className="min-w-0 truncate">{visitas === 1 ? 'visita' : 'visitas'}</span>
        </span>
      )}
    </button>
  );
}
