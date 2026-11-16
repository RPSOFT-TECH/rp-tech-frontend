// Reduce las fotos antes de subirlas: lado mayor de 1600 px y JPEG al 80 %.
// Así el PDF del reporte queda en pocos MB (el correo rechaza adjuntos grandes)
// y las fotos HEIC del iPhone llegan como JPEG, que es lo que acepta el PDF.
const LADO_MAXIMO = 1600;
const CALIDAD = 0.8;
const TAMANO_SIN_TOCAR = 400 * 1024;

function cargar(archivo: File): Promise<HTMLImageElement> {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();
    imagen.onload = () => {
      URL.revokeObjectURL(url);
      resolver(imagen);
    };
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error('No se pudo leer la imagen'));
    };
    imagen.src = url;
  });
}

export async function comprimirImagen(archivo: File): Promise<File> {
  if (!archivo.type.startsWith('image/') && !/\.(heic|heif)$/i.test(archivo.name)) return archivo;
  if (archivo.type === 'image/gif' || archivo.type === 'image/svg+xml') return archivo;
  const yaLiviana = (archivo.type === 'image/jpeg' || archivo.type === 'image/png') && archivo.size <= TAMANO_SIN_TOCAR;
  if (yaLiviana) return archivo;
  try {
    const imagen = await cargar(archivo);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.naturalWidth, imagen.naturalHeight));
    const ancho = Math.round(imagen.naturalWidth * escala);
    const alto = Math.round(imagen.naturalHeight * escala);
    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    const contexto = lienzo.getContext('2d');
    if (!contexto) return archivo;
    contexto.fillStyle = '#fff';
    contexto.fillRect(0, 0, ancho, alto);
    contexto.drawImage(imagen, 0, 0, ancho, alto);
    const blob = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, 'image/jpeg', CALIDAD));
    if (!blob || (blob.size >= archivo.size && archivo.type === 'image/jpeg')) return archivo;
    const nombre = archivo.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], nombre, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    // El navegador no sabe abrirla (p. ej. HEIC fuera de Safari): se sube tal cual.
    return archivo;
  }
}
