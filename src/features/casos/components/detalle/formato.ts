export function leerPerfilId(): string {
  const memoria = (globalThis as { localStorage?: Storage }).localStorage;
  if (!memoria) return '';
  const raw = memoria.getItem('rptech_session_user');
  if (!raw) return '';
  try {
    const sesion = JSON.parse(raw) as { usuario: { id: string } };
    return sesion.usuario.id;
  } catch {
    return '';
  }
}

export function valor(dato: string | number | null | undefined): string {
  if (dato === null || dato === undefined || dato === '') return '—';
  return String(dato);
}

export function fechaHoraLima(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function horaLima(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function puedeCoordinador(roles: string[]): boolean {
  return roles.some((rol) => rol === 'superadmin' || rol === 'coordinador');
}

export function puedeGerente(roles: string[]): boolean {
  return roles.some((rol) => rol === 'superadmin' || rol === 'gerente');
}

export function visitaDeClave<T extends { id: string }>(clave: string, visitas: T[]): T {
  const id = clave.replace(/^ver-/, '');
  return visitas.find((visita) => visita.id === id) || visitas[0];
}
