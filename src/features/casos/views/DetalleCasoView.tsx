'use client';

import { Suspense, useCallback, useEffect, useState, useTransition } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  dentro_plazo_misma_falla,
  fue_tecnico_del_caso,
  obtener_caso_detalle,
  obtenerUsuarioActual,
  type CasoDetalle,
} from '@/lib/datos-simulados/actions';
import { ClipboardList } from 'lucide-react';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { AccionesDetalle, FormulariosAccion } from '../components/detalle/AccionesDetalle';
import { EncabezadoDetalle, MensajesDetalle } from '../components/detalle/EncabezadoDetalle';
import { FichaDetalle } from '../components/detalle/FichaDetalle';
import { leerPerfilId, puedeCoordinador, puedeGerente } from '../components/detalle/formato';
import { ModalReporteVisita } from '../components/detalle/ModalReporteVisita';
import { VisitasDetalle } from '../components/detalle/VisitasDetalle';

function DetalleCasoContenido() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [, startTransition] = useTransition();

  const [caso, setCaso] = useState<CasoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [accionAbierta, setAccionAbierta] = useState<string | null>(null);
  const [accionMensaje, setAccionMensaje] = useState<string | null>(null);
  const [plazoPorCaso, setPlazoPorCaso] = useState<{ id: string; vigente: boolean } | null>(null);
  const [esTecnicoDelCasoValor, setEsTecnicoDelCasoValor] = useState<boolean | null>(null);
  useRegistrarTitulo(
    caso ? `Caso ${caso.numero}` : 'Detalle de caso',
    'Información y estado del servicio',
    ClipboardList,
  );

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      setLoading(true);
      const sesion = obtenerUsuarioActual();
      if (!sesion?.rolesVigentes) {
        setLoading(false);
        return;
      }
      const datos = await obtener_caso_detalle(id);
      if (!activo) return;
      setCaso(datos ?? null);
      setLoading(false);
    };
    cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  const ejecutarAccion = useCallback(
    async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
      setAccionMensaje(null);
      const resultado = await fn();
      if (resultado.ok) {
        setAccionMensaje('Acción realizada correctamente.');
        setAccionAbierta(null);
        startTransition(() => router.refresh());
      } else {
        setAccionMensaje(resultado.error || 'Error al ejecutar la acción.');
      }
    },
    [router, startTransition],
  );

  useEffect(() => {
    if (caso?.estado !== 'cerrado' || !caso.id) return;
    const idCaso = caso.id;
    dentro_plazo_misma_falla(idCaso).then((vigente) => setPlazoPorCaso({ id: idCaso, vigente }));
  }, [caso?.estado, caso?.id]);

  useEffect(() => {
    fue_tecnico_del_caso(caso?.id ?? '', leerPerfilId()).then((valorTecnico) => setEsTecnicoDelCasoValor(valorTecnico));
  }, [caso?.id]);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando detalle del caso...</div>;
  }

  if (!caso) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-bold text-destructive mb-4">Caso no encontrado</h1>
        <Link href={`/casos?${searchParams.toString()}`} className="text-primary hover:underline">
          Volver a la lista de casos
        </Link>
      </div>
    );
  }

  const sesion = (() => {
    const memoria = (globalThis as { localStorage?: Storage }).localStorage;
    if (!memoria) return null;
    const raw = memoria.getItem('rptech_session_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as { usuario: { id: string }; rolesVigentes: string[] };
    } catch {
      return null;
    }
  })();

  const roles = sesion?.rolesVigentes ?? [];
  const puedeProgramar = puedeCoordinador(roles);
  const puedePosventa = puedeGerente(roles) || puedeCoordinador(roles);
  const puedeAnular = puedeGerente(roles) || puedeCoordinador(roles);
  const puedeReabrir = puedeCoordinador(roles);
  const esTecnicoDelCaso = esTecnicoDelCasoValor === true;
  const visitaAbierta = caso.visitas.some((visita) => !visita.cerrado && visita.hora_llegada === null);
  const ultimaVisita = caso.visitas.length > 0 ? caso.visitas[caso.visitas.length - 1] : null;
  const reporteAbierto = Boolean(ultimaVisita && !ultimaVisita.cerrado);
  const plazoVigente = caso.estado === 'cerrado' && plazoPorCaso?.id === caso.id ? plazoPorCaso.vigente : null;
  const contacto = caso.contacto_cargo ? `${caso.contacto_nombre} (${caso.contacto_cargo})` : caso.contacto_nombre;
  const consulta = searchParams.toString();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <EncabezadoDetalle caso={caso} consulta={consulta} />
      <MensajesDetalle
        caso={caso}
        visitaAbierta={visitaAbierta}
        ultimaVisita={ultimaVisita}
        esTecnicoDelCaso={esTecnicoDelCaso}
        accionMensaje={accionMensaje}
      />
      <AccionesDetalle
        caso={caso}
        roles={roles}
        puedeProgramar={puedeProgramar}
        puedePosventa={puedePosventa}
        puedeReabrir={puedeReabrir}
        puedeAnular={puedeAnular}
        esTecnicoDelCaso={esTecnicoDelCaso}
        visitaAbierta={visitaAbierta}
        reporteAbierto={reporteAbierto}
        ultimaVisita={ultimaVisita}
        plazoVigente={plazoVigente}
        accionAbierta={accionAbierta}
        accionMensaje={accionMensaje}
        onAbrir={setAccionAbierta}
        onCerrarMensaje={() => setAccionMensaje(null)}
      />
      <FichaDetalle caso={caso} contacto={contacto} />
      <VisitasDetalle caso={caso} roles={roles} onAbrir={setAccionAbierta} />
      <ModalReporteVisita caso={caso} accion={accionAbierta} onCerrar={() => setAccionAbierta(null)} />
      <FormulariosAccion
        accion={accionAbierta}
        caso={caso}
        onEjecutar={ejecutarAccion}
        onCerrar={() => setAccionAbierta(null)}
      />
    </div>
  );
}

export function DetalleCasoView() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <DetalleCasoContenido />
    </Suspense>
  );
}
