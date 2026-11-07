'use client';

import { useRef, useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { exportarElementoPdf } from '@/lib/pdf/exportar-elemento';

export function VistaPreviaPdf({
  abierto,
  onCerrar,
  titulo,
  nombreArchivo,
  children,
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  nombreArchivo: string;
  children: React.ReactNode;
}) {
  const hoja = useRef<HTMLDivElement>(null);
  const [exportando, setExportando] = useState(false);

  async function descargar() {
    if (!hoja.current) return;
    setExportando(true);
    try {
      await exportarElementoPdf(hoja.current, nombreArchivo);
    } finally {
      setExportando(false);
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo} tamano="xl">
      <div ref={hoja} className="rounded-xl border border-border bg-card p-4 text-foreground">
        {children}
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={descargar} disabled={exportando} className="min-h-11">
          {exportando ? 'Generando PDF...' : 'Descargar PDF'}
        </Button>
      </div>
    </Modal>
  );
}
