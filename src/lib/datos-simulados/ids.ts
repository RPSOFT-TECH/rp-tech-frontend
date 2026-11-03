export function uid(tabla: number, n: number): string {
  return `00000000-0000-4000-${tabla.toString(16).padStart(4, '0')}-${n.toString(16).padStart(12, '0')}`;
}

export function idCatalogo(tabla: number, empresaSlot: number, orden: number): string {
  return uid(tabla, empresaSlot * 100 + orden);
}
