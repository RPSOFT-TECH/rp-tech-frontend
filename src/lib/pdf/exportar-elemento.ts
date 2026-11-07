import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PROPIEDADES = ['color', 'backgroundColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor'] as const;

function debeResolver(color: string): boolean {
  if (!color || color === 'transparent' || color.startsWith('rgb')) return false;
  return color.includes('lab') || color.includes('lch') || color.includes('color-mix') || color.includes('hsl') || color.includes('hwb');
}

function colorResuelto(color: string): string {
  if (!debeResolver(color)) return color;
  const lienzo = document.createElement('canvas');
  lienzo.width = 1;
  lienzo.height = 1;
  const ctx = lienzo.getContext('2d', { willReadFrequently: true });
  if (!ctx) return color;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

const FUNCIONES_COLOR = ['color-mix(', 'oklch(', 'oklab(', 'lab(', 'lch(', 'hsl(', 'hwb('];

function sustituirColores(css: string): string {
  let salida = '';
  let i = 0;
  while (i < css.length) {
    const resto = css.slice(i);
    const marca = FUNCIONES_COLOR.find((item) => resto.startsWith(item));
    if (!marca) {
      salida += css[i];
      i += 1;
      continue;
    }
    let profundidad = 0;
    let fin = i;
    for (; fin < css.length; fin += 1) {
      if (css[fin] === '(') profundidad += 1;
      else if (css[fin] === ')') {
        profundidad -= 1;
        if (profundidad === 0) {
          fin += 1;
          break;
        }
      }
    }
    salida += colorResuelto(css.slice(i, fin));
    i = fin;
  }
  return salida;
}

function pintarColores(raiz: HTMLElement, vista: Window) {
  const nodos = [raiz, ...raiz.querySelectorAll<HTMLElement>('*')];
  nodos.forEach((nodo) => {
    const computed = vista.getComputedStyle(nodo);
    PROPIEDADES.forEach((prop) => {
      const valor = computed[prop];
      if (debeResolver(valor)) nodo.style.setProperty(prop.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`), colorResuelto(valor), 'important');
    });
  });
}

export async function exportarElementoPdf(element: HTMLElement, filename: string) {
  const estiloPrevio = element.getAttribute('style');
  element.style.transform = 'none';
  element.style.boxShadow = 'none';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 850,
      onclone: (doc, clon) => {
        const vista = doc.defaultView ?? window;
        doc.documentElement.style.setProperty('background-color', '#ffffff', 'important');
        doc.body?.style.setProperty('background-color', '#ffffff', 'important');
        doc.querySelectorAll('style').forEach((etiqueta) => {
          if (etiqueta.textContent) etiqueta.textContent = sustituirColores(etiqueta.textContent);
        });
        pintarColores(clon, vista);
      },
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const ancho = pdf.internal.pageSize.getWidth();
    const alto = pdf.internal.pageSize.getHeight();
    const altoPx = Math.round(alto * (canvas.width / ancho));
    let inicio = 0;
    let pagina = 0;

    while (inicio < canvas.height) {
      const corte = Math.min(inicio + altoPx, canvas.height);
      const trozo = document.createElement('canvas');
      trozo.width = canvas.width;
      trozo.height = corte - inicio;
      trozo.getContext('2d')?.drawImage(canvas, 0, inicio, canvas.width, trozo.height, 0, 0, canvas.width, trozo.height);
      if (pagina > 0) pdf.addPage();
      pdf.addImage(trozo.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, ancho, (trozo.height * ancho) / canvas.width);
      inicio = corte;
      pagina += 1;
    }

    pdf.save(`${filename}.pdf`);
  } finally {
    if (estiloPrevio) element.setAttribute('style', estiloPrevio);
    else element.removeAttribute('style');
  }
}
