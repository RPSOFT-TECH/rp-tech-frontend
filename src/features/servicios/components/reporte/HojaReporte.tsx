import type { Reporte } from '@/lib/datos-simulados/types';

function fila(etiqueta: string, valor: string | number | null | undefined) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 border-b border-border py-1.5 text-sm">
      <span className="text-muted-foreground">{etiqueta}</span>
      <span className="text-foreground">{valor === null || valor === undefined || valor === '' ? '—' : valor}</span>
    </div>
  );
}

export function HojaReporte({
  numeroCaso,
  reporte,
}: {
  numeroCaso: string;
  reporte: Reporte;
}) {
  return (
    <article className="space-y-1 bg-card text-foreground">
      <h2 className="text-lg font-bold text-primary">Reporte técnico RP-TECH</h2>
      {fila('Caso', numeroCaso)}
      {fila('Visita', reporte.numero_visita)}
      {fila('Reporte', reporte.numero)}
      {fila('Llegada', reporte.hora_llegada)}
      {fila('Salida', reporte.hora_salida)}
      {fila('Equipo', reporte.estado_equipo)}
      {fila('Limpieza', reporte.limpieza)}
      {fila('Cabezales', reporte.estado_cabezales)}
      {fila('Operador', reporte.operador)}
      {fila('Procedimiento', reporte.procedimiento)}
      {fila('Conclusión', reporte.conclusion)}
      {fila('Recomendaciones', reporte.recomendaciones)}
      {fila('Resultado', reporte.resultado)}
      {fila('Firma operador', reporte.nombre_operador_firma)}
      {fila('Firma cliente', reporte.nombre_cliente_firma)}
      {fila('Cerrado', reporte.cerrado ? 'Sí' : 'No')}
    </article>
  );
}
