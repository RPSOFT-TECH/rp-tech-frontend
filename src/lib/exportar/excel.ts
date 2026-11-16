// Descarga de tablas a Excel en un solo lugar: cuando se cambie la librería
// (xlsx tiene fallas de seguridad sin corregir, ver RPT-S3-T16) se cambia solo aquí.
import * as XLSX from 'xlsx';

export function descargarHoja(nombreArchivo: string, nombreHoja: string, cabeceras: string[], filas: (string | number | null)[][]) {
  const hoja = XLSX.utils.aoa_to_sheet([cabeceras, ...filas.map((f) => f.map((v) => v ?? ''))]);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);
  XLSX.writeFile(libro, nombreArchivo);
}
