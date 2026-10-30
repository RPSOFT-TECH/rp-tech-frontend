import { Caso } from './types';
import { casosPrincipales } from './casos-principales';
import { casosAdicionales } from './casos-adicionales';

export const casosSimulados: Caso[] = [
  ...casosPrincipales,
  ...casosAdicionales,
];
