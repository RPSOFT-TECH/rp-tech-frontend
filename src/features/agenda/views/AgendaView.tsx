'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { agenda_tecnico, hoyLima, tecnicos, type TecnicoLista } from '@/lib/datos/actions';
import { Calendar } from 'lucide-react';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { CuadriculaAgenda, type EventoDia } from '../components/CuadriculaAgenda';
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
  const [cargaMes, setCargaMes] = useState<{ mes: string; porDia: Record<string, EventoDia[]>; tecnicos: TecnicoLista[] } | null>(null);
  const [cargaDia, setCargaDia] = useState<{ fecha: string; columnas: ColumnaAgenda[] } | null>(null);
  const porDia = cargaMes?.mes === mes ? cargaMes.porDia : {};
  const listaTecnicos = cargaMes?.mes === mes ? cargaMes.tecnicos : [];
  const columnas = cargaDia?.fecha === fecha ? cargaDia.columnas : null;

  useEffect(() => {
    let vigente = true;
    tecnicos().then(async (lista) => {
      const dias = diasDelMes(`${mes}-01`);
      const pares = await Promise.all(
        dias.flatMap((iso) =>
          lista.map(async (tecnico) => ({
            iso,
            tecnico,
            visitas: await agenda_tecnico(tecnico.id, iso),
          })),
        ),
      );
      if (!vigente) return;
      // Una visita por fila: se usa la del técnico principal (el adjunto la repite).
      const siguientes: Record<string, EventoDia[]> = {};
      for (const par of pares) {
        for (const visita of par.visitas) {
          if (visita.como === 'adjunto') continue;
          (siguientes[par.iso] ??= []).push({
            id: visita.id,
            hora: visita.hora_programada?.slice(0, 5) ?? '',
            cliente: visita.cliente_razon_social,
            tecnicoId: par.tecnico.id,
            tecnicoNombre: par.tecnico.nombre_completo,
          });
        }
      }
      for (const lista of Object.values(siguientes)) lista.sort((a, b) => a.hora.localeCompare(b.hora));
      setCargaMes({ mes, porDia: siguientes, tecnicos: lista });
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
    <div className="grid h-full min-h-0 w-full grid-cols-1 gap-4 overflow-y-auto no-scrollbar lg:grid-cols-[minmax(0,1fr)_21rem] lg:overflow-hidden">
      <CuadriculaAgenda fecha={fecha} hoy={hoy} porDia={porDia} tecnicos={listaTecnicos} onIr={ir} />
      <PanelDia fecha={fecha} columnas={columnas} />
    </div>
  );
}
