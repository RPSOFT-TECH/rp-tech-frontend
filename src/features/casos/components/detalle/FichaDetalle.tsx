import type { ReactNode } from 'react';
import type { CasoDetalle } from '@/lib/datos/actions';
import { valor } from './formato';

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{titulo}</h3>
      <dl className="grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-2 text-sm">{children}</dl>
    </section>
  );
}

function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{etiqueta}</dt>
      <dd className="min-w-0 font-medium break-words text-foreground">{children}</dd>
    </>
  );
}

// Columna derecha del detalle: contacto y sede, equipo y servicio.
export function FichaDetalle({ caso, contacto }: { caso: CasoDetalle; contacto: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Bloque titulo="Contacto y sede">
        <Fila etiqueta="Contacto">{valor(contacto)}</Fila>
        <Fila etiqueta="Teléfono">
          <span className="tabular-nums">{valor(caso.telefono)}</span>
        </Fila>
        <Fila etiqueta="RUC">{caso.cliente_ruc || <span className="text-muted-foreground">Sin RUC</span>}</Fila>
        <Fila etiqueta="Sede">{valor(caso.sede_nombre)}</Fila>
        <Fila etiqueta="Dirección">
          {valor(caso.sede_direccion)}
          {caso.sede_distrito ? `, ${caso.sede_distrito}` : ''}
        </Fila>
        {caso.sede_referencia ? <Fila etiqueta="Referencia">{caso.sede_referencia}</Fila> : null}
      </Bloque>
      <Bloque titulo="Equipo">
        <Fila etiqueta="Serie">
          <span className="font-mono text-[13px]">{valor(caso.equipo_serie)}</span>
        </Fila>
        <Fila etiqueta="Línea">{valor(caso.equipo_linea)}</Fila>
        <Fila etiqueta="Modelo">{valor(caso.equipo_modelo)}</Fila>
        <Fila etiqueta="Cabezal">
          {valor(caso.equipo_cabezal)}
          {caso.equipo_cabezal_cantidad ? ` × ${caso.equipo_cabezal_cantidad}` : ''}
        </Fila>
      </Bloque>
      <Bloque titulo="Servicio">
        <Fila etiqueta="Tipo">{valor(caso.tipo_servicio_nombre)}</Fila>
        <Fila etiqueta="Modalidad">{valor(caso.modalidad_nombre)}</Fila>
        <Fila etiqueta="Modo">{valor(caso.modo_servicio_nombre)}</Fila>
        {caso.modo_sugerido_nombre && <Fila etiqueta="Sugerido">{caso.modo_sugerido_nombre}</Fila>}
        {caso.motivo_cambio_modo && <Fila etiqueta="Motivo del cambio">{caso.motivo_cambio_modo}</Fila>}
      </Bloque>
    </div>
  );
}

export function IncidenciaDetalle({ caso }: { caso: CasoDetalle }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-foreground">Incidencia</h3>
      <p className="text-[15px] whitespace-pre-line text-foreground">{caso.incidencia || '—'}</p>
    </section>
  );
}
