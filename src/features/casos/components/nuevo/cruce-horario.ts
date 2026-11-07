export interface VisitaConHora {
  id: string;
  hora_programada: string | null;
}

export function avisoDeCruce(visitas: VisitaConHora[], hora: string, excluirId?: string): string | null {
  const actual = minutos(hora);
  if (actual === null) return null;
  let mejor: { hora: string; diferencia: number } | null = null;
  for (const visita of visitas) {
    if (excluirId && visita.id === excluirId) continue;
    const otra = minutos(visita.hora_programada ?? '');
    if (otra === null) continue;
    const diferencia = Math.abs(otra - actual);
    if (diferencia >= 120) continue;
    if (!mejor || diferencia < mejor.diferencia) {
      mejor = { hora: (visita.hora_programada ?? '').slice(0, 5), diferencia };
    }
  }
  if (!mejor) return null;
  return `Este técnico ya tiene una visita a las ${mejor.hora}, a menos de 2 horas.`;
}

function minutos(hora: string): number | null {
  const match = /^(\d{2}):(\d{2})/.exec(hora);
  if (!match) return null;
  const horas = Number(match[1]);
  const mins = Number(match[2]);
  if (horas > 23 || mins > 59) return null;
  return horas * 60 + mins;
}
