'use client';

import { useEffect } from 'react';
import { Check, CircleAlert, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Segmentado } from '@/components/ui/segmentado';
import { Textarea } from '@/components/ui/textarea';
import { horaLimaStr, pasoDeFalta } from '../../reporte/pasos';
import { LienzoFirma } from './LienzoFirma';
import { BloqueAdjuntos } from './PasoFotos';
import { ResumenCliente } from './ResumenCliente';
import { CampoReporte, SeccionReporte } from './SeccionReporte';
import type { FormularioReporte } from './tipo';

export function PasoCierreConformidad({ form }: { form: FormularioReporte }) {
  const {
    esPasoEditable,
    guardando,
    remota,
    reporte,
    resultado,
    setResultado,
    requerimiento,
    setRequerimiento,
    horaSalida,
    setHoraSalida,
    textoConformidad,
    setTextoConformidad,
    nombreOperadorFirma,
    setNombreOperadorFirma,
    firmaOperador,
    setFirmaOperador,
    nombreClienteFirma,
    setNombreClienteFirma,
    firmaCliente,
    setFirmaCliente,
    guardarFirmas,
    calcularFaltas,
    irAlPaso,
    cerrarReporte,
    reporteCerrado,
  } = form;

  const bloqueado = !esPasoEditable || guardando;
  const faltas = calcularFaltas();

  useEffect(() => {
    if (!horaSalida && !reporteCerrado) {
      setHoraSalida(horaLimaStr());
    }
  }, [horaSalida, reporteCerrado, setHoraSalida]);

  const calcularHoras = () => {
    if (!reporte?.hora_llegada || !horaSalida) return null;
    const [h1, m1] = reporte.hora_llegada.split(':').map(Number);
    const [h2, m2] = horaSalida.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;
    const mins = h2 * 60 + m2 - (h1 * 60 + m1);
    if (mins <= 0) return '0 hrs';
    const hrs = (mins / 60).toFixed(1);
    return `${hrs.endsWith('.0') ? hrs.slice(0, -2) : hrs} hrs`;
  };

  const horasCalculadas = calcularHoras();

  return (
    <div className="space-y-3">
      {/* ── 1. Resultado + Hora salida (compacto en una sola fila) ── */}
      <SeccionReporte titulo="Resultado del servicio" className="p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
          {/* Resultado final: 5 columnas */}
          <div className="space-y-1 sm:col-span-5">
            <Label className="text-xs font-semibold text-foreground">
              Resultado final<span className="text-destructive">*</span>
            </Label>
            <Segmentado
              disabled={bloqueado}
              value={resultado}
              onChange={setResultado}
              opciones={[
                { value: 'resuelto', label: 'Resuelto', tono: 'ok' },
                { value: 'pendiente', label: 'Queda pendiente', tono: 'alerta' },
              ]}
              className="w-full"
            />
          </div>

          {/* Hora de salida: 4 columnas (suficiente espacio para input time + botón Ahora) */}
          <div className="space-y-1 sm:col-span-4">
            <Label htmlFor="hora_salida" className="text-xs font-semibold text-foreground">
              Hora de salida
            </Label>
            <div className="flex items-center gap-1.5">
              <Input
                id="hora_salida"
                type="time"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
                disabled={bloqueado}
                className="h-9 min-w-0 flex-1 font-mono text-xs font-semibold px-2 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHoraSalida(horaLimaStr())}
                disabled={bloqueado}
                className="shrink-0 h-9 text-xs gap-1 px-2 font-medium"
                title="Hora actual"
              >
                <Clock className="size-3.5" /> Ahora
              </Button>
            </div>
          </div>

          {/* Tiempo total: 3 columnas */}
          <div className="space-y-1 sm:col-span-3">
            <span className="text-xs font-semibold text-foreground block">
              Tiempo total
            </span>
            <div className="flex h-9 items-center justify-center rounded-md border border-input bg-muted/40 font-mono text-sm font-bold text-foreground">
              {horasCalculadas || '—'}
            </div>
          </div>
        </div>

        {resultado === 'pendiente' && (
          <div className="mt-2.5 pt-2 border-t border-border">
            <Label htmlFor="requerimiento" className="text-xs font-semibold text-foreground">
              ¿Qué se requiere?<span className="text-destructive">*</span>
            </Label>
            <Input
              id="requerimiento"
              value={requerimiento}
              onChange={(e) => setRequerimiento(e.target.value)}
              disabled={bloqueado}
              placeholder="Repuesto, cotización, segunda visita..."
              className="h-8 text-sm mt-0.5"
            />
          </div>
        )}

        {/* Foto de salida */}
        <div className="mt-2.5 pt-2 border-t border-border">
          <BloqueAdjuntos
            form={form}
            tipo="foto_salida"
            titulo="Foto de salida"
            ayuda="Cómo queda la máquina al terminar."
            obligatorio={!remota}
          />
        </div>
      </SeccionReporte>

      {/* ── 2. Resumen para el cliente ── */}
      <ResumenCliente form={form} />

      {/* ── 3. Firmas ── */}
      <SeccionReporte titulo="Conformidad del servicio" className="p-3">
        <CampoReporte etiqueta="Texto de conformidad" htmlFor="texto_conformidad">
          <Textarea
            id="texto_conformidad"
            value={textoConformidad}
            onChange={(e) => setTextoConformidad(e.target.value)}
            disabled={bloqueado}
            rows={2}
            className="text-xs text-muted-foreground"
          />
        </CampoReporte>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
          <LienzoFirma
            titulo="Firma del operador"
            nombre={nombreOperadorFirma}
            onNombre={setNombreOperadorFirma}
            firma={firmaOperador}
            editable={esPasoEditable && !guardando}
            onFirma={(imagen) => {
              setFirmaOperador(imagen);
              void guardarFirmas(imagen, firmaCliente, nombreOperadorFirma, nombreClienteFirma);
            }}
            onBorrar={() => {
              setFirmaOperador(null);
              void guardarFirmas(null, firmaCliente, nombreOperadorFirma, nombreClienteFirma);
            }}
          />

          <LienzoFirma
            titulo="Firma del cliente"
            nombre={nombreClienteFirma}
            onNombre={setNombreClienteFirma}
            firma={firmaCliente}
            editable={esPasoEditable && !guardando}
            onFirma={(imagen) => {
              setFirmaCliente(imagen);
              void guardarFirmas(firmaOperador, imagen, nombreOperadorFirma, nombreClienteFirma);
            }}
            onBorrar={() => {
              setFirmaCliente(null);
              void guardarFirmas(firmaOperador, null, nombreOperadorFirma, nombreClienteFirma);
            }}
          />
        </div>
      </SeccionReporte>

      {/* ── 4. Para cerrar falta + Botón Cerrar ── */}
      <div className="rounded-xl border border-border bg-card p-3 space-y-3 shadow-sm">
        {faltas.length > 0 ? (
          <div className="rounded-lg bg-amber-50 p-2.5 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
              <CircleAlert className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span>Para cerrar falta:</span>
            </div>
            <ul className="list-inside list-disc space-y-0.5 text-xs">
              {faltas.map((falta) => (
                <li key={falta}>
                  <button
                    type="button"
                    onClick={() => irAlPaso(pasoDeFalta(falta))}
                    className="font-semibold text-amber-800 underline hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100"
                  >
                    {falta}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <Check className="size-3.5 text-emerald-600" />
            <span>Todo listo. Puedes cerrar el reporte.</span>
          </div>
        )}

        <Button
          type="button"
          onClick={() => void cerrarReporte()}
          disabled={bloqueado || faltas.length > 0 || reporteCerrado}
          className="h-10 w-full gap-2 bg-primary font-bold text-sm shadow-md cursor-pointer"
        >
          <Send className="size-4" />
          Cerrar reporte y generar PDF
        </Button>
      </div>
    </div>
  );
}
