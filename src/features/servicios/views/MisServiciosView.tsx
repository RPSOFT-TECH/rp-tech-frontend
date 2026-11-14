'use client';

import { useEffect, useState } from 'react';
import { mis_servicios, hoyLima, obtenerUsuarioActual, type MiServicio } from '@/lib/datos/actions';
import Link from 'next/link';
import { MapPin, Wrench } from 'lucide-react';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Segmentado } from '@/components/ui/segmentado';
import { cn } from '@/lib/utils';

export function MisServiciosView() {
  const [servicios, setServicios] = useState<MiServicio[]>([]);
  const [nombre, setNombre] = useState('');
  const [hoy, setHoy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pestana, setPestana] = useState<Pestana>('hoy');

  useEffect(() => {
    let activo = true;
    const sesion = obtenerUsuarioActual();
    const dia = hoyLima();
    mis_servicios().then((lista) => {
      if (!activo) return;
      setNombre(sesion?.usuario.nombre_completo ?? '');
      setHoy(dia);
      setServicios(lista);
      setLoading(false);
    });
    return () => {
      activo = false;
    };
  }, []);

  useRegistrarTitulo('Mis servicios', nombre ? `Técnico: ${nombre}` : 'Órdenes asignadas y visitas técnicas', Wrench);

  if (loading || !hoy) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  const pendientes = servicios.filter((s) => !s.cerrado);
  const grupos: Record<Pestana, MiServicio[]> = {
    hoy: pendientes.filter((s) => s.fecha_programada !== null && s.fecha_programada <= hoy),
    proximos: pendientes.filter((s) => s.fecha_programada === null || s.fecha_programada > hoy),
    cerrados: servicios.filter((s) => s.cerrado),
  };
  const lista = grupos[pestana];
  const vacio = {
    hoy: 'No tienes visitas para hoy.',
    proximos: 'No tienes visitas programadas.',
    cerrados: 'Todavía no tienes reportes cerrados.',
  }[pestana];

  return (
    <div className="mx-auto w-full max-w-md space-y-4 pb-24 md:max-w-3xl">
      <Segmentado
        tamano="grande"
        ariaLabel="Qué servicios ver"
        value={pestana}
        onChange={setPestana}
        opciones={[
          { value: 'hoy', label: `Hoy · ${grupos.hoy.length}` },
          { value: 'proximos', label: `Próximos · ${grupos.proximos.length}` },
          { value: 'cerrados', label: `Cerrados · ${grupos.cerrados.length}` },
        ]}
      />
      {lista.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">{vacio}</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {lista.map((servicio) => (
            <TarjetaServicio key={servicio.id} servicio={servicio} hoy={hoy} />
          ))}
        </div>
      )}
    </div>
  );
}

type Pestana = 'hoy' | 'proximos' | 'cerrados';

function fechaCorta(iso: string | null): string {
  if (!iso) return 'Sin fecha';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

function TarjetaServicio({ servicio, hoy }: { servicio: MiServicio; hoy: string }) {
  const enlace = `/mis-servicios/${servicio.caso_id}/reporte`;
  const atrasado = !servicio.cerrado && servicio.fecha_programada !== null && servicio.fecha_programada < hoy;
  const enAtencion = servicio.estado === 'en_atencion';
  const direccion = [servicio.sede_direccion, servicio.sede_distrito].filter(Boolean).join(', ');
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
  const companero = servicio.soy_adjunto
    ? servicio.tecnico_nombre
      ? `Vas como adjunto de ${servicio.tecnico_nombre}`
      : 'Vas como adjunto'
    : servicio.tecnico_adjunto_nombre
      ? `Con ${servicio.tecnico_adjunto_nombre}`
      : null;

  let estado = { texto: 'Programado', clase: 'bg-muted text-muted-foreground' };
  if (servicio.cerrado) estado = { texto: 'Cerrado', clase: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' };
  else if (atrasado) estado = { texto: 'De días anteriores', clase: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
  else if (enAtencion) estado = { texto: 'En atención', clase: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300' };

  const accion = servicio.cerrado ? 'Ver reporte' : enAtencion ? 'Continuar reporte' : 'Abrir reporte';

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card p-4',
        enAtencion && !servicio.cerrado ? 'border-primary ring-1 ring-primary' : 'border-border',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl font-bold text-foreground tabular-nums">{servicio.hora_programada?.slice(0, 5) || '—'}</span>
          {servicio.fecha_programada !== hoy && <span className="text-xs text-muted-foreground">{fechaCorta(servicio.fecha_programada)}</span>}
        </div>
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', estado.clase)}>{estado.texto}</span>
      </div>
      <div className="space-y-0.5">
        <p className="font-semibold text-foreground">{servicio.cliente_razon_social}</p>
        <p className="text-sm text-muted-foreground">
          {servicio.sede_nombre} · {direccion}
          {servicio.sede_referencia ? ` · ${servicio.sede_referencia}` : ''}
        </p>
      </div>
      <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="font-mono">{servicio.numero_serie}</span>
        <span>{servicio.tipo_servicio_nombre}</span>
        <span>{servicio.modalidad_nombre}</span>
        <span>
          {servicio.numero_caso} · Visita {servicio.numero_visita}
        </span>
      </p>
      {companero && <p className="text-xs font-medium text-primary">{companero}</p>}
      <div className="flex gap-2">
        {!servicio.cerrado && direccion && (
          <a
            href={mapa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-input px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            <MapPin className="size-4" />
            Cómo llegar
          </a>
        )}
        <Link
          href={enlace}
          className={cn(
            'inline-flex h-11 flex-1 items-center justify-center rounded-lg px-3 text-sm font-semibold',
            servicio.cerrado ? 'border border-input text-foreground hover:bg-muted' : 'bg-primary text-primary-foreground hover:bg-primary/85',
          )}
        >
          {accion}
        </Link>
      </div>
    </article>
  );
}
