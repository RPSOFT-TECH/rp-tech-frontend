'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { obtenerCasoPorId } from '@/lib/datos-simulados/actions';
import { Caso, Visita } from '@/lib/datos-simulados/casos';
import { clientes } from '@/lib/datos-simulados/clientes';
import { contactos } from '@/lib/datos-simulados/contactos';
import { sedes } from '@/lib/datos-simulados/sedes';
import { equipos } from '@/lib/datos-simulados/equipos';
import { usuarios } from '@/lib/datos-simulados/usuarios';

const ESTADO_ETIQUETA: Record<string, string> = {
  por_programar: 'Por programar',
  programado: 'Programado',
  en_atencion: 'En atención',
  en_espera: 'En espera',
  atendido: 'Atendido',
  cerrado: 'Cerrado',
};

function valor(v: string | null | undefined): string {
  if (v === null || v === undefined || v === '') return '—';
  return v;
}

function resolverTecnico(tecnicoId: string | null | undefined): string {
  if (!tecnicoId) return 'Sin asignar';
  const u = usuarios.find((user) => user.email === tecnicoId);
  return u ? u.nombre_completo : 'Sin asignar';
}

function fechaHoraLima(iso: string | null | undefined): string {
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

function DetalleCasoContenido() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [caso, setCaso] = useState<Caso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarCaso() {
      if (!id) return;
      setLoading(true);
      const data = await obtenerCasoPorId(id);
      if (data) {
        setCaso(data);
      }
      setLoading(false);
    }
    cargarCaso();
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Cargando detalle del caso...</div>;
  }

  if (!caso) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-bold text-destructive mb-4">Caso no encontrado</h1>
        <Link href="/casos" className="text-primary hover:underline">
          ← Volver a la lista de casos
        </Link>
      </div>
    );
  }

  const clienteData = clientes.find((c) => c.id === caso.cliente_id);
  const contactoData = contactos.find((c) => c.id === caso.contacto_id);
  const direccionData = sedes.find((d) => d.id === (caso as any).sede_id || d.id === (caso as any).direccion_id);
  const equipoData = equipos.find((e) => e.id === caso.equipo_id);

  const volverAListaUrl = `/casos?${searchParams.toString()}`;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={volverAListaUrl} className="text-sm text-primary hover:underline mb-2 inline-block">
          ← Volver a la lista
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Detalle del Caso: {caso.numero}</h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary uppercase">
            {ESTADO_ETIQUETA[caso.estado] || caso.estado}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Registrado el: {fechaHoraLima(caso.creado_en)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Cliente
          </h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li>
              <strong className="text-foreground">Empresa:</strong>{' '}
              {valor(clienteData?.razon_social)}
            </li>
            <li>
              <strong className="text-foreground">RUC:</strong>{' '}
              {valor(clienteData?.ruc)}
            </li>
            <li>
              <strong className="text-foreground">Contacto:</strong>{' '}
              {contactoData
                ? `${contactoData.nombre} (${contactoData.cargo})`
                : '—'}
            </li>
            <li>
              <strong className="text-foreground">Teléfono del caso:</strong>{' '}
              {valor(caso.telefono)}
            </li>
            <li>
              <strong className="text-foreground">Dirección:</strong>{' '}
              {valor(direccionData?.direccion)}
            </li>
            <li>
              <strong className="text-foreground">Distrito:</strong>{' '}
              {valor(direccionData?.distrito)}
            </li>
            <li>
              <strong className="text-foreground">Referencia:</strong>{' '}
              {valor(direccionData?.referencia)}
            </li>
          </ul>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Equipo
          </h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li>
              <strong className="text-foreground">Número de serie:</strong>{' '}
              <span className="font-mono">{valor(equipoData?.numero_serie)}</span>
            </li>
            <li>
              <strong className="text-foreground">Línea y modelo:</strong>{' '}
              {equipoData ? `${valor((equipoData as any).linea)} - ${equipoData.modelo}` : '—'}
            </li>
            <li>
              <strong className="text-foreground">Cabezal:</strong>{' '}
              {valor((equipoData as any)?.cabezal_modelo)}
            </li>
            <li>
              <strong className="text-foreground">Cant. cabezales:</strong>{' '}
              {valor(equipoData?.cabezal_cantidad?.toString())}
            </li>
          </ul>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Servicio
          </h3>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li>
              <strong className="text-foreground">Tipo:</strong>{' '}
              {valor(caso.tipo_servicio)}
            </li>
            <li>
              <strong className="text-foreground">Modo:</strong>{' '}
              {valor(caso.modo_servicio)}
            </li>
            <li>
              <strong className="text-foreground">Modalidad:</strong>{' '}
              {valor(caso.modalidad)}
            </li>
            <li>
              <strong className="text-foreground">Prioridad:</strong>{' '}
              {valor(caso.prioridad)}
            </li>
            <li>
              <strong className="text-foreground">Técnico:</strong>{' '}
              {resolverTecnico(caso.tecnico_id)}
            </li>
            <li>
              <strong className="text-foreground">Fecha programada:</strong>{' '}
              {valor(caso.fecha_programada)}
            </li>
            <li>
              <strong className="text-foreground">Hora programada:</strong>{' '}
              {valor(caso.hora_programada)}
            </li>
          </ul>
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Incidencia
          </h3>
          <p className="text-sm text-card-foreground bg-muted p-4 rounded-lg border border-border whitespace-pre-line">
            {caso.incidencia || '—'}
          </p>
        </div>
      </div>

      {/* TODO(especificación v1): aquí irán las visitas y reportes del caso. */}
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
