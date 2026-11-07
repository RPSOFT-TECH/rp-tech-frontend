'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { agenda_tecnico, hoyLima, tecnicos } from '@/lib/datos/actions';
import { Calendar } from 'lucide-react';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { CuadriculaAgenda } from '../components/CuadriculaAgenda';
import { PanelDia, type ColumnaAgenda } from '../components/PanelDia';
import { diasDelMes, tituloDia } from '../utils/calendario';

function fechaPedida(valor: string | null): string {
  if (valor && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  return hoyLima();
}

export function AgendaView() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-muted-foreground">Cargando agenda...</p>}>
      <Contenido />
    </Suspense>
  );
}

function Contenido() {
  const router = useRouter();
  const params = useSearchParams();
  const fecha = fechaPedida(params.get('fecha'));
  const hoy = hoyLima();
  const mes = fecha.slice(0, 7);
  const [cargaMes, setCargaMes] = useState<{ mes: string; conteos: Record<string, number> } | null>(null);
  const [cargaDia, setCargaDia] = useState<{ fecha: string; columnas: ColumnaAgenda[] } | null>(null);
  const conteos = cargaMes?.mes === mes ? cargaMes.conteos : {};
  const columnas = cargaDia?.fecha === fecha ? cargaDia.columnas : null;

  useEffect(() => {
    let vigente = true;
    tecnicos().then(async (lista) => {
      const dias = diasDelMes(`${mes}-01`);
      const pares = await Promise.all(
        dias.flatMap((iso) =>
          lista.map(async (tecnico) => ({
            iso,
            visitas: await agenda_tecnico(tecnico.id, iso),
          })),
        ),
      );
      if (!vigente) return;
      const vistos = new Map<string, Set<string>>();
      for (const par of pares) {
        const ids = vistos.get(par.iso) ?? new Set<string>();
        for (const visita of par.visitas) ids.add(visita.id);
        vistos.set(par.iso, ids);
      }
      const siguientes: Record<string, number> = {};
      for (const dia of dias) siguientes[dia] = vistos.get(dia)?.size ?? 0;
      setCargaMes({ mes, conteos: siguientes });
    });
    return () => {
      vigente = false;
    };
  }, [mes]);

  useEffect(() => {
    let vigente = true;
    tecnicos().then(async (lista) => {
      const cargadas = await Promise.all(
        lista.map(async (tecnico) => ({
          tecnico,
          visitas: await agenda_tecnico(tecnico.id, fecha),
        })),
      );
      if (!vigente) return;
      cargadas.sort((a, b) => a.tecnico.nombre_completo.localeCompare(b.tecnico.nombre_completo, 'es'));
      setCargaDia({ fecha, columnas: cargadas });
    });
    return () => {
      vigente = false;
    };
  }, [fecha]);

  useRegistrarTitulo('Agenda', tituloDia(fecha), Calendar);

  const ir = (iso: string) => {
    router.push(iso === hoy ? '/agenda' : `/agenda?fecha=${iso}`);
  };

  return (
    <div className="grid h-full min-h-0 w-full grid-cols-1 gap-4 overflow-y-auto no-scrollbar lg:grid-cols-[minmax(0,1fr)_22rem] lg:overflow-hidden">
      <CuadriculaAgenda fecha={fecha} hoy={hoy} conteos={conteos} onIr={ir} />
      <PanelDia titulo={tituloDia(fecha)} columnas={columnas} />
    </div>
  );
}
