import { idCatalogo } from '../ids';
import type { Catalogo, Repuesto } from '../types';
import { ID } from './referencias';

const TIPOS = [
  'Inspección y diagnóstico',
  'Instalación',
  'Mantenimiento',
  'Capacitación',
  'Perfilación de color',
];
const MODOS = ['Garantía del equipo', 'Garantía de soporte técnico', 'Facturado'];
const MODALIDADES = ['Presencial', 'Remoto', 'En taller'];
const CANALES = ['Llamada', 'WhatsApp'];
const LINEAS = [
  'Sublimación',
  'DTF',
  'DTF UV',
  'Calandra',
  'UV cama plana',
  'Ecosolvente',
  'Láser',
  'Láser textil',
];
const CABEZALES = [
  'Epson i3200',
  'Epson i1600',
  'Epson 4720',
  'Epson DX5',
  'Epson DX7',
  'Epson XP600',
  'Epson TX800',
  'Konica 512i',
  'Otro',
];
const ESPERA = [
  'Pieza o repuesto',
  'Aprobación de cotización',
  'Reprogramación del cliente',
  'Continúa otro día',
  'Otro',
];

const REPUESTOS: [string, string, boolean][] = [
  ['RP-DAM-01', 'Damper Epson i3200', true],
  ['RP-DAM-02', 'Damper Epson i1600', true],
  ['RP-CAP-01', 'Capping station', true],
  ['RP-WIP-01', 'Wiper de limpieza', true],
  ['RP-TIN-01', 'Tinta de sublimación', true],
  ['RP-TIN-02', 'Tinta DTF', true],
  ['RP-TIN-03', 'Tinta UV', true],
  ['RP-FIL-01', 'Filtro de tinta', true],
  ['RP-TUB-01', 'Manguera de tinta', true],
  ['RP-LIM-01', 'Solución de limpieza', true],
  ['RP-PAD-01', 'Pad de limpieza', true],
  ['RP-BOM-01', 'Bomba de tinta', true],
  ['RP-CHI-01', 'Chip de cartucho', true],
  ['RP-CAB-01', 'Cabezal Epson i3200', false],
  ['RP-CAB-02', 'Cabezal Epson i1600', false],
  ['RP-PLA-01', 'Placa principal', false],
  ['RP-FUE-01', 'Fuente de poder', false],
  ['RP-MOT-01', 'Motor de carro', false],
  ['RP-COR-01', 'Correa de carro', false],
  ['RP-SEN-01', 'Sensor de papel', false],
  ['RP-ROD-01', 'Rodillo de arrastre', false],
  ['RP-GUA-01', 'Guía lineal', false],
  ['RP-VEN-01', 'Ventilador de cabezal', false],
  ['RP-TAR-01', 'Tarjeta de cabezales', false],
  ['RP-ENC-01', 'Encoder strip', false],
  ['RP-CAL-01', 'Resistencia de calandra', false],
];

function filas(tabla: number, empresaId: string, slot: number, nombres: string[]): Catalogo[] {
  return nombres.map((nombre, indice) => ({
    id: idCatalogo(tabla, slot, indice + 1),
    empresa_id: empresaId,
    nombre,
    orden: indice + 1,
    activo: true,
  }));
}

export function sembrarCatalogos(empresaId: string, slot: number) {
  return {
    tipos_servicio: filas(11, empresaId, slot, TIPOS),
    modos_servicio: filas(12, empresaId, slot, MODOS),
    modalidades: filas(13, empresaId, slot, MODALIDADES).map((m) => ({ ...m, remota: m.nombre === 'Remoto' })),
    canales: filas(14, empresaId, slot, CANALES),
    lineas_maquina: filas(15, empresaId, slot, LINEAS),
    modelos_cabezal: filas(16, empresaId, slot, CABEZALES),
    motivos_espera: filas(17, empresaId, slot, ESPERA),
    repuestos: REPUESTOS.map((item, indice): Repuesto => ({
      id: idCatalogo(18, slot, indice + 1),
      empresa_id: empresaId,
      codigo: item[0],
      descripcion: item[1],
      consumible: item[2],
      orden: indice + 1,
      activo: true,
    })),
  };
}

export const EMPRESA_RP = ID.empRp;
