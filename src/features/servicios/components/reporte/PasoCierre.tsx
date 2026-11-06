'use client';

import { Button, Card } from '@/components/ui';
import { fechaHoraLima } from '../../reporte/pasos';
import type { FormularioReporte } from './tipo';

export function PasoCierre({ form }: { form: FormularioReporte }) {
  const {
    esPasoEditable,
    guardando,
    resultado,
    setResultado,
    requerimiento,
    setRequerimiento,
    horaSalida,
    setHoraSalida,
    calcularFaltas,
    cerrarReporte,
  } = form;
  const faltasCierre = calcularFaltas();

  return (
    <Card className="p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">7. Cierre</h3>
      {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-muted-foreground">¿Qué falta?</h4>
        {faltasCierre.length === 0 ? (
          <p className="text-xs text-green-700 bg-green-50 rounded p-2">Todo listo para cerrar.</p>
        ) : (
          <ul className="text-xs text-amber-800 bg-amber-50 rounded p-2 space-y-1">
            {faltasCierre.map((falta) => (
              <li key={falta}>• {falta}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Resultado</label>
        <div className="flex gap-4">
          <label className={`flex items-center gap-2 cursor-pointer ${!esPasoEditable ? 'opacity-50' : ''}`}>
            <input
              type="radio"
              name="resultado"
              value="resuelto"
              checked={resultado === 'resuelto'}
              onChange={() => setResultado('resuelto')}
              disabled={!esPasoEditable}
              className="w-4 h-4 text-primary"
            />
            Resuelto
          </label>
          <label className={`flex items-center gap-2 cursor-pointer ${!esPasoEditable ? 'opacity-50' : ''}`}>
            <input
              type="radio"
              name="resultado"
              value="pendiente"
              checked={resultado === 'pendiente'}
              onChange={() => setResultado('pendiente')}
              disabled={!esPasoEditable}
              className="w-4 h-4 text-primary"
            />
            Pendiente
          </label>
        </div>
      </div>
      {resultado === 'pendiente' && (
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-xs font-semibold text-muted-foreground">¿Qué se requiere?</label>
          <input
            value={requerimiento}
            onChange={(evento) => setRequerimiento(evento.target.value)}
            disabled={!esPasoEditable}
            className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
          />
        </div>
      )}
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">Hora de salida</label>
        <input
          type="time"
          value={horaSalida}
          onChange={(evento) => setHoraSalida(evento.target.value)}
          disabled={!esPasoEditable}
          className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
        />
      </div>
      <Button
        onClick={cerrarReporte}
        disabled={!esPasoEditable || guardando || faltasCierre.length > 0}
        className="w-full min-h-11"
      >
        {guardando ? 'Cerrando...' : 'Cerrar reporte'}
      </Button>
    </Card>
  );
}

export function AvisoCierre({ form }: { form: FormularioReporte }) {
  const { reporte, reporteCerrado } = form;
  if (!reporte || !reporteCerrado) return null;
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <h3 className="text-xs font-semibold text-green-900 mb-2">Reporte cerrado</h3>
      <p className="text-xs text-green-800">El reporte está bloqueado y solo se pueden agregar notas.</p>
      {reporte.cerrado_en && (
        <p className="text-xs text-green-600 mt-1">Cerrado el {fechaHoraLima(reporte.cerrado_en)}</p>
      )}
    </div>
  );
}
