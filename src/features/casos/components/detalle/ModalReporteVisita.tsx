'use client';

import type { CasoDetalle } from '@/lib/datos-simulados/actions';
import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { fechaHoraLima, valor, visitaDeClave } from './formato';

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{titulo}</h3>
      {children}
    </div>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="font-semibold text-muted-foreground">{etiqueta}:</span> {children}
    </div>
  );
}

export function ModalReporteVisita({
  caso,
  accion,
  onCerrar,
}: {
  caso: CasoDetalle;
  accion: string | null;
  onCerrar: () => void;
}) {
  if (!accion?.startsWith('ver-')) return null;
  const visita = visitaDeClave(accion, caso.visitas);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onCerrar} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          ✕
        </button>
        <h2 className="text-lg font-bold text-foreground mb-4">Reporte de visita</h2>
        <div className="space-y-6">
          <Bloque titulo="Revisión inicial">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Dato etiqueta="Estado equipo">{valor(visita.estado_equipo)}</Dato>
              <Dato etiqueta="Limpieza">{valor(visita.limpieza)}</Dato>
              <Dato etiqueta="Cabezales">{valor(visita.estado_cabezales)}</Dato>
              <Dato etiqueta="Protección">
                {valor(visita.sistema_proteccion)}
                {visita.sistema_proteccion_otro && ` (${visita.sistema_proteccion_otro})`}
              </Dato>
              <Dato etiqueta="Tinta">{valor(visita.tinta)}</Dato>
              <Dato etiqueta="Voltaje L+N">{valor(visita.voltaje_ln)}</Dato>
              <Dato etiqueta="Voltaje L+T">{valor(visita.voltaje_lt)}</Dato>
              <Dato etiqueta="Voltaje N+T">{valor(visita.voltaje_nt)}</Dato>
              <Dato etiqueta="Último mantenimiento">{valor(visita.ultimo_mantenimiento)}</Dato>
              <Dato etiqueta="Operador">{valor(visita.operador)}</Dato>
              <Dato etiqueta="N° reporte físico">{valor(visita.numero_fisico)}</Dato>
            </div>
          </Bloque>
          <Bloque titulo="Procedimiento">
            <p className="text-sm text-card-foreground whitespace-pre-line bg-muted p-4 rounded-lg border border-border">
              {valor(visita.procedimiento)}
            </p>
          </Bloque>
          <Bloque titulo="Conclusión">
            <p className="text-sm text-card-foreground whitespace-pre-line bg-muted p-4 rounded-lg border border-border">
              {valor(visita.conclusion)}
            </p>
          </Bloque>
          <Bloque titulo="Recomendaciones">
            <p className="text-sm text-card-foreground whitespace-pre-line bg-muted p-4 rounded-lg border border-border">
              {valor(visita.recomendaciones)}
            </p>
          </Bloque>
          <Bloque titulo="Repuestos">
            {visita.repuestos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin repuestos registrados.</p>
            ) : (
              <Table className="text-left border-collapse w-full">
                <TableHeader>
                  <TableRow className="bg-muted border-b border-border text-xs font-semibold text-muted-foreground">
                    <TableHead className="p-2">Código</TableHead>
                    <TableHead className="p-2">Descripción</TableHead>
                    <TableHead className="p-2">Cantidad</TableHead>
                    <TableHead className="p-2">Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border text-sm">
                  {visita.repuestos.map((repuesto) => (
                    <TableRow key={repuesto.id}>
                      <TableCell className="p-2 font-mono">{repuesto.codigo}</TableCell>
                      <TableCell className="p-2">{repuesto.descripcion}</TableCell>
                      <TableCell className="p-2">{repuesto.cantidad}</TableCell>
                      <TableCell className="p-2">{repuesto.tipo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Bloque>
          <Bloque titulo="Adjuntos">
            {visita.adjuntos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin archivos adjuntos.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {visita.adjuntos.map((adjunto) => (
                  <li key={adjunto.id} className="text-muted-foreground">
                    {adjunto.tipo} - {adjunto.nombre_archivo}
                  </li>
                ))}
              </ul>
            )}
          </Bloque>
          <Bloque titulo="Firmas">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground">Operador:</span> {valor(visita.nombre_operador_firma)}
                {visita.firma_operador ? (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Firmado</span>
                ) : (
                  <span className="ml-2 text-xs text-muted-foreground">Pendiente</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Cliente:</span> {valor(visita.nombre_cliente_firma)}
                {visita.firma_cliente ? (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Firmado</span>
                ) : (
                  <span className="ml-2 text-xs text-muted-foreground">Pendiente</span>
                )}
              </div>
            </div>
          </Bloque>
          {visita.notas.length > 0 && (
            <Bloque titulo="Notas">
              <ul className="space-y-2 text-sm">
                {visita.notas.map((nota) => (
                  <li key={nota.id} className="text-card-foreground">
                    <span className="font-semibold">{valor(nota.autor_id)}</span> - {fechaHoraLima(nota.creado_en)}
                    <p className="text-sm text-muted-foreground mt-1">{nota.texto}</p>
                  </li>
                ))}
              </ul>
            </Bloque>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onCerrar}>Cerrar</Button>
        </div>
      </Card>
    </div>
  );
}
