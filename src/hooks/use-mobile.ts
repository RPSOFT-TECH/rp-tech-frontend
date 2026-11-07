'use client';

import { useEffect, useState } from 'react';

const CORTE = 768;

export function useIsMobile(breakpoint: number = CORTE) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const aplicar = () => setIsMobile(media.matches);
    aplicar();
    media.addEventListener('change', aplicar);
    return () => media.removeEventListener('change', aplicar);
  }, [breakpoint]);

  return isMobile;
}
