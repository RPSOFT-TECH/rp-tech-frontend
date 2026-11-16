'use client';

import { Suspense, useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Archive, ArrowLeft, ExternalLink, TriangleAlert } from 'lucide-react';
import { historico_detalle, leerSesionEstable, type HistoricoDetalle } from '@/lib/datos/actions';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { Badge } from '@/components/ui';
import { VinculoHistorico } from '../components/VinculoHistorico';

const fechaCorta = (f: string | null) => (f ? f.split('-').reverse().join('/') : null);
const SI_NO = { si: 'Sí', no: 'No', sin_dato: 'Sin dato' } as const;
const TIPO_REPUESTO = { venta: 'Venta', descarte: 'Descarte', garantia: 'Garantía' } as const;
const VALORES: Record<string, string> = {
  operativo: 'Operativo', inoperativo: 'Inoperativo', limpio: 'Limpio', sucio: 'Sucio',
  bueno: 'Bueno', regular: 'Regular', malo: 'Malo', estabilizador: 'Estabilizador', ups: 'UPS', otro: 'Otro',
  resuelto: 'Resuelto', pendiente: 'Pendiente',
};

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{titulo}</h3>
      <dl className="grid grid-cols-[8.5rem_1fr] gap-x-3 gap-y-2 text-sm">{children}</dl>
    </section>
  );
}

function Texto({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{titulo}</h3>
      <div className="text-[15px] whitespace-pre-line text-foreground">{children}</div>
    </section>
  );
}

function DetalleHistoricoContenido() {
  const { id } = useParams<{ id: string }>();
  const [reporte, setReporte] = useState<HistoricoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const sesion = useSyncExternalStore(() => () => {}, leerSesionEstable, () => null);
  const roles = sesion?.rolesVigentes ?? [];
  // Vinculan el Gerente y el Coordinador (la base vuelve a comprobarlo).
  const puedeVincular = roles.some((r) => r === 'superadmin' || r === 'gerente' || r === 'coordinador');
  useRegistrarTitulo(reporte ? `Talonario ${reporte.numero_talonario ?? 'sin N°'}` : 'Reporte en papel', 'Reporte histórico digitalizado por SIREP', Archive);

  const cargar = useCallback(async () => {
    const r = await historico_detalle(id);
    setReporte(r);
    setCargando(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [cargar]);

  if (cargando) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (!reporte) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">No se encontró el reporte o no tienes acceso.</p>
        <Link href="/historico" className="text-sm font-semibold text-primary hover:underline">
          Volver al histórico
        </Link>
      </div>
    );
  }

  const r = reporte;
  // Campos que la lectura marcó con confianza baja o como ilegibles: revisar con el papel.
  const dudoso = (campo: string) => {
    const c = r.revision_campos[campo];
    return c && (c.confianza === 'baja' || c.estado === 'ilegible');
  };
  const val = (campo: string, v: ReactNode) => {
    const original = r.datos_originales[campo];
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        {v === null || v === undefined || v === '' ? <span className="text-muted-foreground">—</span> : v}
        {typeof original === 'string' && original ? <span className="text-xs text-muted-foreground">(en el papel: «{original}»)</span> : null}
        {dudoso(campo) ? (
          <Badge variant="outline" className="gap-1 text-xs">
            <TriangleAlert className="size-3" />
            Revisar con el papel
          </Badge>
        ) : null}
      </span>
    );
  };
  const opcion = (v: string | null) => (v ? VALORES[v] ?? v : null);
  const esImagen = r.escaneo_tipo.startsWith('image/');

  return (
    <div className="space-y-4 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/historico" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Histórico
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="outline">Cerrado</Badge>
          <span className="text-muted-foreground">
            Fecha del servicio: <span className="font-medium text-foreground tabular-nums">{fechaCorta(r.fecha) ?? '—'}</span>
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloque titulo="Cliente y equipo">
          <dt className="text-muted-foreground">Cliente</dt>
          <dd className="font-medium">{val('cliente_texto', r.cliente)}</dd>
          <dt className="text-muted-foreground">Equipo</dt>
          <dd className="font-medium">{val('equipo_texto', r.equipo)}</dd>
          <dt className="text-muted-foreground">Técnico</dt>
          <dd className="font-medium">{val('tecnico_texto', r.tecnico)}</dd>
          <dt className="text-muted-foreground">Sede</dt>
          <dd className="font-medium">{val('direccion_texto', r.sede ?? r.direccion_texto)}</dd>
          <dt className="text-muted-foreground">Contacto</dt>
          <dd className="font-medium">{val('contacto_texto', r.contacto_texto)}</dd>
          <dt className="text-muted-foreground">Teléfono</dt>
          <dd className="font-medium tabular-nums">{val('telefono_texto', r.telefono_texto)}</dd>
          {r.vinculado_en ? (
            <>
              <dt className="text-muted-foreground">Vinculado por</dt>
              <dd className="text-muted-foreground">{r.vinculado_por_nombre ?? '—'}</dd>
            </>
          ) : null}
        </Bloque>

        <Bloque titulo="Revisión inicial">
          <dt className="text-muted-foreground">Estado del equipo</dt>
          <dd className="font-medium">{val('estado_equipo', opcion(r.estado_equipo))}</dd>
          <dt className="text-muted-foreground">Último mant.</dt>
          <dd className="font-medium">{val('ultimo_mantenimiento', fechaCorta(r.ultimo_mantenimiento))}</dd>
          <dt className="text-muted-foreground">Limpieza</dt>
          <dd className="font-medium">{val('limpieza', opcion(r.limpieza))}</dd>
          <dt className="text-muted-foreground">Cabezales</dt>
          <dd className="font-medium">{val('estado_cabezales', opcion(r.estado_cabezales))}</dd>
          <dt className="text-muted-foreground">Protección</dt>
          <dd className="font-medium">{val('sistema_proteccion', [opcion(r.sistema_proteccion), r.sistema_proteccion_otro].filter(Boolean).join(': '))}</dd>
          <dt className="text-muted-foreground">Tinta</dt>
          <dd className="font-medium">{val('tinta', r.tinta)}</dd>
          <dt className="text-muted-foreground">Voltajes</dt>
          <dd className="font-medium tabular-nums">
            {val('voltaje_ln', r.voltaje_ln === null ? null : `L+N ${r.voltaje_ln}`)}{' '}
            {val('voltaje_lt', r.voltaje_lt === null ? null : `L+T ${r.voltaje_lt}`)}{' '}
            {val('voltaje_nt', r.voltaje_nt === null ? null : `N+T ${r.voltaje_nt}`)}
          </dd>
          <dt className="text-muted-foreground">Operador</dt>
          <dd className="font-medium">{val('operador', r.operador)}</dd>
        </Bloque>
      </div>

      {r.motivo ? <Texto titulo="Motivo">{r.motivo}</Texto> : null}
      <Texto titulo="Procedimiento">{val('procedimiento', r.procedimiento)}</Texto>
      <div className="grid gap-4 lg:grid-cols-2">
        <Texto titulo="Conclusión">{val('conclusion', r.conclusion)}</Texto>
        <Texto titulo="Recomendaciones">{val('recomendaciones', r.recomendaciones)}</Texto>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloque titulo="Labor">
          <dt className="text-muted-foreground">Llegada y salida</dt>
          <dd className="font-medium tabular-nums">
            {val('hora_llegada', r.hora_llegada)} – {val('hora_salida', r.hora_salida)}
          </dd>
          <dt className="text-muted-foreground">Horas</dt>
          <dd className="font-medium tabular-nums">{r.horas ?? '—'}</dd>
          <dt className="text-muted-foreground">Garantía</dt>
          <dd className="font-medium">{val('garantia', SI_NO[r.garantia])}</dd>
          <dt className="text-muted-foreground">Facturado</dt>
          <dd className="font-medium">{val('facturado', SI_NO[r.facturado])}</dd>
          <dt className="text-muted-foreground">Firmas</dt>
          <dd className="font-medium">
            Operador: {r.firma_operador_presente === null ? 'sin dato' : r.firma_operador_presente ? 'sí' : 'no'} · Cliente:{' '}
            {r.firma_cliente_presente === null ? 'sin dato' : r.firma_cliente_presente ? 'sí' : 'no'}
          </dd>
        </Bloque>

        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Repuestos</h3>
          {r.repuestos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {Object.keys(r.datos_originales).some((k) => k.startsWith('repuestos'))
                ? 'Los repuestos del papel no se pudieron ordenar; están abajo, en el texto leído sin formato.'
                : 'Sin repuestos.'}
            </p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {r.repuestos.map((p) => (
                <li key={p.orden} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0">
                    {p.codigo ? <span className="mr-2 font-mono text-[13px] text-muted-foreground">{p.codigo}</span> : null}
                    {p.descripcion}
                  </span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {p.cantidad} · {TIPO_REPUESTO[p.tipo]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {Object.keys(r.datos_originales).length > 0 ? (
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Texto leído sin formato</h3>
          <p className="mb-3 text-xs text-muted-foreground">Lo que estaba escrito en el papel y no encajó en los campos del sistema.</p>
          <dl className="grid grid-cols-[10rem_1fr] gap-x-3 gap-y-1 text-sm">
            {Object.entries(r.datos_originales).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="whitespace-pre-line">{typeof v === 'string' ? v : JSON.stringify(v)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">Escaneo del papel</h3>
          {r.escaneo_url ? (
            <a href={r.escaneo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Abrir <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>
        {!r.escaneo_url ? (
          <p className="text-sm text-muted-foreground">No se pudo abrir el escaneo.</p>
        ) : esImagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.escaneo_url} alt={`Escaneo del talonario ${r.numero_talonario ?? ''}`} className="max-h-[80vh] w-full rounded-lg border border-border object-contain" />
        ) : (
          <iframe src={r.escaneo_url} title="Escaneo del reporte" className="h-[80vh] w-full rounded-lg border border-border" />
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Revisado en SIREP{r.revisado_por ? ` por ${r.revisado_por}` : ''}. El enlace vence en una hora.
        </p>
      </section>

      {puedeVincular ? <VinculoHistorico reporte={r} onGuardado={cargar} /> : null}
    </div>
  );
}

export function DetalleHistoricoView() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
      <DetalleHistoricoContenido />
    </Suspense>
  );
}
