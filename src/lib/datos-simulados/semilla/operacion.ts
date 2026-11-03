import { idCatalogo, uid } from '../ids';
import { hoyLima, sumarDias } from '../fecha';
import type {
  Adjunto,
  Caso,
  EnvioReporte,
  EstadoCaso,
  HistorialEstado,
  Nota,
  Posventa,
  Reporte,
  ReporteRepuesto,
} from '../types';
import { CAT, ID } from './referencias';

export function sembrarOperacion() {
  const hoy = hoyLima();
  const anio = hoy.slice(0, 4);
  const ayer = sumarDias(hoy, -1);
  const manana = sumarDias(hoy, 1);
  const anteayer = sumarDias(hoy, -2);

  const casos: Caso[] = [
    caso(ID.caso1, `OS-${anio}-00001`, ID.cliAndinos, ID.sedeAte, ID.conJuan, '987111111', ID.eqSub, 'Imprime con líneas blancas en toda la tela.', CAT.tipoMantenimiento, CAT.modoGarantia, 'programado', `${anteayer}T09:10:00-05:00`),
    caso(ID.caso2, `OS-${anio}-00002`, ID.cliEstampados, ID.sedeEstampados, ID.conLuis, '987333333', ID.eqDtf, 'El blanco no cubre y se mancha el film.', CAT.tipoInspeccion, CAT.modoFacturado, 'por_programar', `${ayer}T11:00:00-05:00`),
    caso(ID.caso3, `OS-${anio}-00003`, ID.cliSur, ID.sedeSur, ID.conSur, '987654323', ID.eqSur, 'La máquina se detiene a mitad de trabajo.', CAT.tipoMantenimiento, CAT.modoGarantia, 'en_atencion', `${hoy}T08:00:00-05:00`),
    caso(ID.caso4, `OS-${anio}-00004`, ID.cliAndinos, ID.sedeAte, ID.conMaria, '987222222', ID.eqSub, 'Ruido en el carro al imprimir.', CAT.tipoMantenimiento, CAT.modoGarantia, 'atendido', `${anteayer}T15:00:00-05:00`),
    caso(ID.caso5, `OS-${anio}-00005`, ID.cliGrafica, ID.sedeGrafica, ID.conGrafica, '987555556', ID.eqGrafica, 'No reconoce el archivo de impresión.', CAT.tipoCapacitacion, CAT.modoFacturado, 'en_espera', `${ayer}T16:40:00-05:00`, CAT.motivoPieza),
    caso(ID.caso6, `OS-${anio}-00006`, ID.cliEstampados, ID.sedeEstampados, ID.conLuis, '987333333', ID.eqDtf, 'Caso duplicado del mismo día.', CAT.tipoInspeccion, CAT.modoFacturado, 'anulado', `${anteayer}T12:00:00-05:00`),
    caso(ID.casoOtra, `OS-${anio}-00001`, ID.cliOtra, ID.sedeOtra, ID.conOtra, '954333444', ID.eqOtra, 'Falla de tensión en la tela.', CAT.tipoInspeccionOtra, CAT.modoFacturadoOtra, 'por_programar', `${hoy}T10:00:00-05:00`, null, ID.empOtra, CAT.canalLlamadaOtra, CAT.modPresencialOtra, ID.pCoordOtra),
  ];

  casos[5].anulado_por = ID.pCoord;
  casos[5].anulado_en = `${ayer}T09:00:00-05:00`;
  casos[5].motivo_anulacion = 'Duplicado';

  const reportes: Reporte[] = [
    visita(ID.rep1, ID.caso1, 1, ID.pTec1, hoy, '10:00', ID.pTec2),
    visita(ID.rep2, ID.caso3, 1, ID.pTec1, hoy, '08:30', null, {
      numero: `RT-${anio}-00001`,
      hora_llegada: '08:35',
      estado_equipo: 'inoperativo',
    }),
    visita(ID.rep3, ID.caso4, 1, ID.pTec2, ayer, '15:30', null, {
      numero: `RT-${anio}-00002`,
      hora_llegada: '15:40',
      hora_salida: '17:10',
      estado_equipo: 'operativo',
      limpieza: 'limpio',
      estado_cabezales: 'regular',
      sistema_proteccion: 'ups',
      tinta: 'Original',
      voltaje_ln: 220,
      voltaje_lt: 220,
      voltaje_nt: 2,
      operador: 'María Gómez',
      procedimiento: 'Se ajustó la correa del carro.',
      conclusion: 'El ruido desapareció.',
      resultado: 'resuelto',
      firma_operador: 'firma-operador',
      nombre_operador_firma: 'María Gómez',
      firma_cliente: 'firma-cliente',
      nombre_cliente_firma: 'Juan Pérez',
      cerrado: true,
      cerrado_en: `${ayer}T17:15:00-05:00`,
    }),
    visita(ID.rep4, ID.caso5, 1, ID.pTec2, manana, '09:00', null),
    visita(ID.rep5, ID.caso6, 1, ID.pTec1, anteayer, '12:30', null),
  ];

  const adjuntos: Adjunto[] = [
    adjunto(1, ID.rep3, 'foto_ingreso', 'ingreso.jpg', ID.pTec2),
    adjunto(2, ID.rep3, 'foto_salida', 'salida.jpg', ID.pTec2),
  ];

  const reporte_repuestos: ReporteRepuesto[] = [
    {
      id: uid(24, 1),
      reporte_id: ID.rep3,
      repuesto_id: idCatalogo(18, 1, 1),
      codigo: 'RP-DAM-01',
      descripcion: 'Damper Epson i3200',
      cantidad: 1,
      tipo: 'garantia',
    },
  ];

  const notas: Nota[] = [
    {
      id: uid(22, 1),
      reporte_id: ID.rep3,
      autor_id: ID.pTec2,
      texto: 'Olvidé anotar que el damper se cambió en el cabezal 2.',
      creado_en: `${hoy}T09:20:00-05:00`,
    },
  ];

  const posventas: Posventa[] = [];
  const envios_reporte: EnvioReporte[] = [
    {
      id: uid(23, 1),
      reporte_id: ID.rep3,
      canal: 'correo',
      destino: 'juan.perez@andinos.com',
      estado: 'enviado',
      detalle: 'enviado a juan.perez@andinos.com',
      enviado_por: ID.pTec2,
    },
  ];

  const historial_estados: HistorialEstado[] = [
    hist(1, ID.caso1, null, 'por_programar', ID.pCoord, `${anteayer}T09:10:00-05:00`),
    hist(2, ID.caso1, 'por_programar', 'programado', ID.pCoord, `${anteayer}T09:20:00-05:00`),
    hist(3, ID.caso3, null, 'por_programar', ID.pCoord, `${hoy}T08:00:00-05:00`),
    hist(4, ID.caso3, 'por_programar', 'programado', ID.pCoord, `${hoy}T08:05:00-05:00`),
    hist(5, ID.caso3, 'programado', 'en_atencion', ID.pTec1, `${hoy}T08:35:00-05:00`),
    hist(6, ID.caso4, null, 'por_programar', ID.pCoord, `${anteayer}T15:00:00-05:00`),
    hist(7, ID.caso4, 'por_programar', 'atendido', ID.pTec2, `${ayer}T17:15:00-05:00`),
    hist(8, ID.caso5, null, 'programado', ID.pCoord, `${ayer}T16:40:00-05:00`),
    hist(9, ID.caso5, 'programado', 'en_espera', ID.pCoord, `${ayer}T18:00:00-05:00`, 'Pieza o repuesto'),
    hist(10, ID.caso6, null, 'por_programar', ID.pCoord, `${anteayer}T12:00:00-05:00`),
    hist(11, ID.caso6, 'por_programar', 'anulado', ID.pCoord, `${ayer}T09:00:00-05:00`, 'Duplicado'),
  ];

  return { casos, reportes, reporte_repuestos, adjuntos, notas, posventas, historial_estados, envios_reporte };
}

function caso(
  id: string,
  numero: string,
  cliente_id: string,
  sede_id: string,
  contacto_id: string,
  telefono: string,
  equipo_id: string,
  incidencia: string,
  tipo_servicio_id: string,
  modo_servicio_id: string,
  estado: EstadoCaso,
  creado_en: string,
  motivo_espera_id: string | null = null,
  empresa_id: string = ID.empRp,
  canal_id: string = CAT.canalLlamada,
  modalidad_id: string = CAT.modPresencial,
  creado_por: string = ID.pCoord,
): Caso {
  return {
    id,
    empresa_id,
    numero,
    canal_id,
    cliente_id,
    sede_id,
    contacto_id,
    telefono,
    equipo_id,
    incidencia,
    tipo_servicio_id,
    modalidad_id,
    modo_sugerido_id: modo_servicio_id,
    modo_servicio_id,
    motivo_cambio_modo: null,
    estado,
    motivo_espera_id,
    caso_origen_id: null,
    reaperturas: 0,
    creado_por,
    cerrado_por: null,
    cerrado_en: null,
    anulado_por: null,
    anulado_en: null,
    motivo_anulacion: null,
    creado_en,
  };
}

function visita(
  id: string,
  caso_id: string,
  numero_visita: number,
  tecnico_id: string,
  fecha: string,
  hora: string,
  adjunto: string | null,
  extra: Partial<Reporte> = {},
): Reporte {
  return {
    id,
    caso_id,
    numero_visita,
    numero: null,
    numero_fisico: null,
    tecnico_id,
    tecnico_adjunto_id: adjunto,
    fecha_programada: fecha,
    hora_programada: hora,
    hora_llegada: null,
    hora_salida: null,
    horas: null,
    estado_equipo: null,
    ultimo_mantenimiento: null,
    limpieza: null,
    estado_cabezales: null,
    sistema_proteccion: null,
    sistema_proteccion_otro: null,
    tinta: null,
    voltaje_ln: null,
    voltaje_lt: null,
    voltaje_nt: null,
    operador: null,
    procedimiento: null,
    conclusion: null,
    recomendaciones: null,
    resultado: null,
    requerimiento: null,
    firma_operador: null,
    nombre_operador_firma: null,
    firma_cliente: null,
    nombre_cliente_firma: null,
    cerrado: false,
    cerrado_en: null,
    pdf: null,
    ...extra,
  };
}

function adjunto(n: number, reporte_id: string, tipo: 'foto_ingreso' | 'foto_salida', nombre: string, subido_por: string): Adjunto {
  return {
    id: uid(21, n),
    reporte_id,
    tipo,
    ruta: `${reporte_id}/${nombre}`,
    nombre_archivo: nombre,
    tipo_mime: 'image/jpeg',
    subido_por,
  };
}

function hist(
  n: number,
  caso_id: string,
  estado_anterior: EstadoCaso | null,
  estado_nuevo: EstadoCaso,
  usuario_id: string,
  fecha: string,
  motivo: string | null = null,
): HistorialEstado {
  return { id: uid(19, n), caso_id, estado_anterior, estado_nuevo, usuario_id, motivo, fecha };
}
