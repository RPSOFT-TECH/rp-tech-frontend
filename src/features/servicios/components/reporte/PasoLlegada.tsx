'use client';

import { Button, Card } from '@/components/ui';
import type { FormularioReporte } from './tipo';

export function PasoLlegada({ form }: { form: FormularioReporte }) {
  const { reporte, esPasoEditable, guardando, registrarLlegada } = form;
  if (!reporte) return null;
  return (
    <Card className="p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">1. Llegada</h3>
      <div className="text-sm text-card-foreground">
        {reporte.hora_llegada ? (
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary">{reporte.hora_llegada}</span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Registrado</span>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">
              Registra tu llegada para generar el número de reporte y habilitar los siguientes pasos.
            </p>
            <Button onClick={registrarLlegada} disabled={!esPasoEditable || guardando} className="w-full min-h-11">
              {guardando ? 'Registrando...' : 'Registrar llegada'}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
