'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface ConfirmacionCasoDatos {
  id: string;
  numero: string;
  creadoEn: string;
  cliente: string;
  programado: boolean;
  tecnico: string | null;
  adjunto: string | null;
  fecha: string | null;
  hora: string | null;
  errorProgramacion: string | null;
}

function fechaLima(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fechaCorta(iso: string): string {
  const [anio, mes, dia] = iso.slice(0, 10).split('-');
  if (!anio || !mes || !dia) return iso;
  return `${dia}/${mes}/${anio}`;
}

export function ConfirmacionCaso({ datos, onOtro }: { datos: ConfirmacionCasoDatos; onOtro: () => void }) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <p className="text-sm text-muted-foreground">Caso registrado</p>
        <p className="text-4xl font-bold text-primary tracking-tight">{datos.numero}</p>
        <p className="text-sm text-foreground">{fechaLima(datos.creadoEn)}</p>
        <p className="text-base font-medium text-foreground">{datos.cliente}</p>
        {datos.errorProgramacion ? (
          <div className="rounded-lg border border-border bg-accent px-3 py-2 space-y-1">
            <p className="text-sm font-medium text-foreground">Por programar</p>
            <p className="text-sm text-muted-foreground">{datos.errorProgramacion}</p>
          </div>
        ) : datos.programado ? (
          <div className="text-sm text-foreground space-y-1">
            <p>Técnico: {datos.tecnico}</p>
            {datos.adjunto && <p>Adjunto: {datos.adjunto}</p>}
            <p>
              {datos.fecha ? fechaCorta(datos.fecha) : ''} {datos.hora?.slice(0, 5)}
            </p>
          </div>
        ) : (
          <p className="text-sm font-medium text-foreground">Por programar</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/casos/${datos.id}`}
            className="inline-flex items-center justify-center min-h-11 rounded-lg bg-primary text-primary-foreground px-4 text-sm font-medium"
          >
            Ver caso
          </Link>
          <Button type="button" variant="outline" className="min-h-11" onClick={onOtro}>
            Registrar otro
          </Button>
        </div>
      </div>
    </div>
  );
}
