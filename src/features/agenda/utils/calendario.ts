import { fechaISO } from '@/lib/datos-simulados/fecha';

export interface CeldaMes {
  dia: number;
  iso: string;
  perteneceMes: boolean;
  esHoy: boolean;
}

export function nombreMes(anio: number, mes: number): string {
  const fecha = new Date(Date.UTC(anio, mes - 1, 1, 12));
  const texto = new Intl.DateTimeFormat('es-PE', { timeZone: 'UTC', month: 'long' }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function tituloDia(iso: string): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia, 12));
  const texto = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function moverMes(iso: string, delta: number): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  const destino = new Date(Date.UTC(anio, mes - 1 + delta, 1));
  const anioDestino = destino.getUTCFullYear();
  const mesDestino = destino.getUTCMonth();
  const ultimo = new Date(Date.UTC(anioDestino, mesDestino + 1, 0)).getUTCDate();
  return fechaISO(anioDestino, mesDestino + 1, Math.min(dia, ultimo));
}

export function celdasDelMes(anio: number, mes: number, hoyIso: string): CeldaMes[] {
  const celdas: CeldaMes[] = [];
  const primero = new Date(Date.UTC(anio, mes - 1, 1));
  let huecos = primero.getUTCDay();
  huecos = huecos === 0 ? 6 : huecos - 1;
  const diasMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();

  for (let i = 0; i < huecos; i += 1) {
    celdas.push({ dia: 0, iso: '', perteneceMes: false, esHoy: false });
  }

  for (let dia = 1; dia <= diasMes; dia += 1) {
    const iso = fechaISO(anio, mes, dia);
    celdas.push({ dia, iso, perteneceMes: true, esHoy: iso === hoyIso });
  }

  while (celdas.length % 7 !== 0) {
    celdas.push({ dia: 0, iso: '', perteneceMes: false, esHoy: false });
  }

  return celdas;
}

export function diasDelMes(iso: string): string[] {
  const [anio, mes] = iso.slice(0, 7).split('-').map(Number);
  const ultimo = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const dias: string[] = [];
  for (let dia = 1; dia <= ultimo; dia += 1) {
    dias.push(fechaISO(anio, mes, dia));
  }
  return dias;
}
