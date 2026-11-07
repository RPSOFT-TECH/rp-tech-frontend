'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

const ALTO_FILA = 56;
const FILAS_MIN = 1;
const FILAS_MAX = 10;
const FILAS_BASE = 10;
const ALTO_PIE = 52;
const MARGEN = 4;

export function useAjustePagina(contenedorRef: RefObject<HTMLDivElement | null>, activo = true) {
  const altoPieRef = useRef(ALTO_PIE);
  const [cupo, setCupo] = useState(FILAS_BASE);
  const [altoFila, setAltoFila] = useState(ALTO_FILA);

  const medir = useCallback(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor || contenedor.clientHeight === 0) return;

    const scroll = contenedor.querySelector<HTMLElement>('[data-table-scroll]');
    if (!scroll) return;

    const caja = contenedor.getBoundingClientRect();
    const cajaScroll = scroll.getBoundingClientRect();
    const thead = contenedor.querySelector<HTMLElement>('thead');
    const altoCabeza = thead ? thead.getBoundingClientRect().height : 0;
    const pie = contenedor.querySelector<HTMLElement>('[data-pagination-footer]');
    if (pie) {
      const altoPie = pie.getBoundingClientRect().height;
      if (altoPie > 0) altoPieRef.current = altoPie;
    }

    const arriba = cajaScroll.top - caja.top;
    const barraHorizontal = scroll.scrollWidth > scroll.clientWidth + 2
      ? Math.max(0, scroll.offsetHeight - scroll.clientHeight)
      : 0;
    const disponible = contenedor.clientHeight - arriba - altoPieRef.current - altoCabeza - barraHorizontal - MARGEN;
    if (disponible <= 0) return;

    const filas = Math.max(FILAS_MIN, Math.min(FILAS_MAX, Math.floor(disponible / ALTO_FILA)));
    const alto = Math.min(Math.max(ALTO_FILA, Math.floor(disponible / filas)), ALTO_FILA * 2 - 1);

    setCupo((previo) => (previo === filas ? previo : filas));
    setAltoFila((previo) => (previo === alto ? previo : alto));
  }, [contenedorRef]);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!activo || !contenedor) return;

    let marco: number | null = null;
    const observados = new Set<Element>();
    const observar = new ResizeObserver(() => {
      if (marco !== null) cancelAnimationFrame(marco);
      marco = requestAnimationFrame(() => {
        const scroll = contenedor.querySelector('[data-table-scroll]');
        if (scroll && !observados.has(scroll)) {
          observar.observe(scroll);
          observados.add(scroll);
        }
        medir();
      });
    });

    observar.observe(contenedor);
    observados.add(contenedor);
    const scrollInicial = contenedor.querySelector('[data-table-scroll]');
    if (scrollInicial) {
      observar.observe(scrollInicial);
      observados.add(scrollInicial);
    }

    const mutaciones = new MutationObserver(() => {
      if (marco !== null) cancelAnimationFrame(marco);
      marco = requestAnimationFrame(medir);
    });
    mutaciones.observe(contenedor, { childList: true, subtree: true });
    window.addEventListener('resize', medir);
    marco = requestAnimationFrame(medir);

    return () => {
      if (marco !== null) cancelAnimationFrame(marco);
      observar.disconnect();
      mutaciones.disconnect();
      window.removeEventListener('resize', medir);
    };
  }, [activo, contenedorRef, medir]);

  return { cupo, altoFila };
}
