export interface PartesLima {
  anio: number;
  mes: number;
  dia: number;
}

export function partesLima(fecha: Date = new Date()): PartesLima {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(fecha);
  const leer = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value);
  return { anio: leer('year'), mes: leer('month'), dia: leer('day') };
}

export function fechaISO(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

export function hoyLima(fecha: Date = new Date()): string {
  const p = partesLima(fecha);
  return fechaISO(p.anio, p.mes, p.dia);
}

export function horaLima(fecha: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const leer = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '00';
  return `${leer('hour')}:${leer('minute')}`;
}

export function ahoraLimaISO(fecha: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Lima',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const segundo = partes.find((p) => p.type === 'second')?.value ?? '00';
  return `${hoyLima(fecha)}T${horaLima(fecha)}:${segundo}-05:00`;
}

export function sumarDias(iso: string, dias: number): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  const marca = new Date(Date.UTC(anio, mes - 1, dia));
  marca.setUTCDate(marca.getUTCDate() + dias);
  return fechaISO(marca.getUTCFullYear(), marca.getUTCMonth() + 1, marca.getUTCDate());
}

export function sumarMeses(iso: string, meses: number): string {
  const [anio, mes, dia] = iso.split('-').map(Number);
  const marca = new Date(Date.UTC(anio, mes - 1, dia));
  marca.setUTCMonth(marca.getUTCMonth() + meses);
  return fechaISO(marca.getUTCFullYear(), marca.getUTCMonth() + 1, marca.getUTCDate());
}

export function inicioDeMes(iso: string): string {
  return `${iso.slice(0, 8)}01`;
}

export function mesesEntre(desde: string, hasta: string): number {
  const [anio1, mes1, dia1] = desde.split('-').map(Number);
  const [anio2, mes2, dia2] = hasta.split('-').map(Number);
  let meses = (anio2 - anio1) * 12 + (mes2 - mes1);
  if (dia2 < dia1) meses -= 1;
  return Math.max(0, meses);
}

export function horasEntre(desdeIso: string, hastaIso: string): number {
  const inicio = Date.parse(desdeIso);
  const fin = Date.parse(hastaIso);
  return (fin - inicio) / 3600000;
}
