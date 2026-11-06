import { faltantes_cierre } from '@/lib/datos-simulados/actions';
import type { Reporte } from '@/lib/datos-simulados/types';
import type { AdjuntoFila } from './pasos';

export function faltasEnPantalla(
  reporte: Reporte,
  campos: {
    estadoEquipo: Reporte['estado_equipo'];
    limpieza: Reporte['limpieza'];
    estadoCabezales: Reporte['estado_cabezales'];
    sistemaProteccion: Reporte['sistema_proteccion'];
    sistemaProteccionOtro: string;
    tinta: string;
    voltajeLn: string;
    voltajeLt: string;
    voltajeNt: string;
    procedimiento: string;
    conclusion: string;
    firmaOperador: string | null;
    nombreOperadorFirma: string;
    firmaCliente: string | null;
    nombreClienteFirma: string;
  },
  adjuntos: AdjuntoFila[],
  remota: boolean,
): string[] {
  const numero = (valor: string) => (valor.trim() === '' ? null : Number(valor));
  const actual: Reporte = {
    ...reporte,
    estado_equipo: campos.estadoEquipo,
    limpieza: campos.limpieza,
    estado_cabezales: campos.estadoCabezales,
    sistema_proteccion: campos.sistemaProteccion,
    sistema_proteccion_otro: campos.sistemaProteccionOtro || null,
    tinta: campos.tinta || null,
    voltaje_ln: numero(campos.voltajeLn),
    voltaje_lt: numero(campos.voltajeLt),
    voltaje_nt: numero(campos.voltajeNt),
    procedimiento: campos.procedimiento || null,
    conclusion: campos.conclusion || null,
    firma_operador: campos.firmaOperador,
    nombre_operador_firma: campos.nombreOperadorFirma || null,
    firma_cliente: campos.firmaCliente,
    nombre_cliente_firma: campos.nombreClienteFirma || null,
  };
  const { revision, general } = faltantes_cierre(actual, adjuntos, remota);
  return [...general, ...(revision.length ? [`Revisión inicial (${revision.join(', ')})`] : [])];
}
