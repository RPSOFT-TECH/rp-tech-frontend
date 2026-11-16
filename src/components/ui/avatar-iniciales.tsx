import { cn } from '@/lib/utils';

const TONOS = [
  'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
];

export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const ultima = partes[partes.length - 1];
  // "Técnico 1" -> "T1"; "Rosa Quispe" -> "RQ"
  if (partes.length > 1 && /^\d+$/.test(ultima)) return `${partes[0][0]}${ultima}`.toUpperCase();
  return partes.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

// Mismo nombre, mismo color en toda la app (tabla, agenda, ficha).
export function tonoDe(clave: string): string {
  let suma = 0;
  for (const letra of clave) suma = (suma * 31 + letra.charCodeAt(0)) >>> 0;
  return TONOS[suma % TONOS.length];
}

export function AvatarIniciales({
  nombre,
  clave,
  className,
}: {
  nombre: string;
  clave?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', tonoDe(clave ?? nombre), className)}
    >
      {iniciales(nombre)}
    </span>
  );
}
