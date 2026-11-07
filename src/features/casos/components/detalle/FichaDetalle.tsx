import type { CasoDetalle } from '@/lib/datos/actions';
import { Card } from '@/components/ui';
import { valor } from './formato';

function Fila({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <li>
      <strong className="text-foreground">{etiqueta}:</strong> {children}
    </li>
  );
}

export function FichaDetalle({ caso, contacto }: { caso: CasoDetalle; contacto: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cliente</h3>
        <ul className="space-y-2 text-sm text-card-foreground">
          <Fila etiqueta="Empresa">{valor(caso.cliente_razon_social)}</Fila>
          <Fila etiqueta="RUC">{caso.cliente_ruc || '—'}</Fila>
          <Fila etiqueta="Contacto">{valor(contacto)}</Fila>
          <Fila etiqueta="Teléfono">{valor(caso.telefono)}</Fila>
        </ul>
      </Card>
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sede</h3>
        <ul className="space-y-2 text-sm text-card-foreground">
          <Fila etiqueta="Nombre">{valor(caso.sede_nombre)}</Fila>
          <Fila etiqueta="Dirección">{valor(caso.sede_direccion)}</Fila>
          <Fila etiqueta="Distrito">{valor(caso.sede_distrito)}</Fila>
          <Fila etiqueta="Referencia">{valor(caso.sede_referencia)}</Fila>
        </ul>
      </Card>
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Equipo</h3>
        <ul className="space-y-2 text-sm text-card-foreground">
          <Fila etiqueta="Serie">
            <span className="font-mono">{valor(caso.equipo_serie)}</span>
          </Fila>
          <Fila etiqueta="Línea y modelo">
            {caso.equipo_linea} - {valor(caso.equipo_modelo)}
          </Fila>
          <Fila etiqueta="Cabezal">{valor(caso.equipo_cabezal)}</Fila>
          <Fila etiqueta="Cant. cabezales">{valor(caso.equipo_cabezal_cantidad)}</Fila>
        </ul>
      </Card>
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Servicio</h3>
        <ul className="space-y-2 text-sm text-card-foreground">
          <Fila etiqueta="Tipo">{valor(caso.tipo_servicio_nombre)}</Fila>
          <Fila etiqueta="Modalidad">{valor(caso.modalidad_nombre)}</Fila>
          <Fila etiqueta="Modo">{valor(caso.modo_servicio_nombre)}</Fila>
          {caso.modo_sugerido_nombre && <Fila etiqueta="Modo sugerido">{valor(caso.modo_sugerido_nombre)}</Fila>}
          {caso.motivo_cambio_modo && <Fila etiqueta="Motivo del cambio">{valor(caso.motivo_cambio_modo)}</Fila>}
        </ul>
      </Card>
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Incidencia</h3>
        <p className="text-sm text-card-foreground bg-muted p-4 rounded-lg border border-border whitespace-pre-line">
          {caso.incidencia || '—'}
        </p>
      </Card>
    </div>
  );
}
