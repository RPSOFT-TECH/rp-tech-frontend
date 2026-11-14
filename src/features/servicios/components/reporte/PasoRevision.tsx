'use client';

import { Input } from '@/components/ui/input';
import { SelectorFecha } from '@/components/ui/selector-fecha';
import { Segmentado } from '@/components/ui/segmentado';
import { CampoReporte, SeccionReporte } from './SeccionReporte';
import type { FormularioReporte } from './tipo';

export function PasoRevision({ form }: { form: FormularioReporte }) {
  const {
    esPasoEditable,
    remota,
    estadoEquipo,
    setEstadoEquipo,
    limpieza,
    setLimpieza,
    estadoCabezales,
    setEstadoCabezales,
    sistemaProteccion,
    setSistemaProteccion,
    sistemaProteccionOtro,
    setSistemaProteccionOtro,
    tinta,
    setTinta,
    voltajeLn,
    setVoltajeLn,
    voltajeLt,
    setVoltajeLt,
    voltajeNt,
    setVoltajeNt,
    operador,
    setOperador,
    ultimoMantenimiento,
    setUltimoMantenimiento,
    numeroFisico,
    setNumeroFisico,
  } = form;
  const bloqueado = !esPasoEditable;

  return (
    <>
      <SeccionReporte titulo="Estado al llegar">
        <CampoReporte etiqueta="Estado del equipo">
          <Segmentado
            tamano="grande"
            disabled={bloqueado}
            value={estadoEquipo}
            onChange={setEstadoEquipo}
            opciones={[
              { value: 'operativo', label: 'Operativo', tono: 'ok' },
              { value: 'inoperativo', label: 'Inoperativo', tono: 'alerta' },
            ]}
          />
        </CampoReporte>
        {!remota && (
          <CampoReporte etiqueta="Limpieza">
            <Segmentado
              tamano="grande"
              disabled={bloqueado}
              value={limpieza}
              onChange={setLimpieza}
              opciones={[
                { value: 'limpio', label: 'Limpio' },
                { value: 'sucio', label: 'Sucio' },
              ]}
            />
          </CampoReporte>
        )}
        <CampoReporte etiqueta="Cabezales">
          <Segmentado
            tamano="grande"
            disabled={bloqueado}
            value={estadoCabezales}
            onChange={setEstadoCabezales}
            opciones={[
              { value: 'bueno', label: 'Bueno', tono: 'ok' },
              { value: 'regular', label: 'Regular' },
              { value: 'malo', label: 'Malo', tono: 'alerta' },
            ]}
          />
        </CampoReporte>
        <CampoReporte etiqueta="Tinta" htmlFor="tinta">
          <Input id="tinta" value={tinta} onChange={(e) => setTinta(e.target.value)} disabled={bloqueado} placeholder="Marca o tipo de tinta" />
        </CampoReporte>
      </SeccionReporte>

      {!remota && (
        <SeccionReporte titulo="Instalación eléctrica">
          <CampoReporte etiqueta="Sistema de protección">
            <Segmentado
              tamano="grande"
              disabled={bloqueado}
              value={sistemaProteccion}
              onChange={setSistemaProteccion}
              opciones={[
                { value: 'estabilizador', label: 'Estabilizador' },
                { value: 'ups', label: 'UPS' },
                { value: 'otro', label: 'Otro' },
              ]}
            />
          </CampoReporte>
          {sistemaProteccion === 'otro' && (
            <CampoReporte etiqueta="¿Cuál?" htmlFor="proteccion_otro">
              <Input id="proteccion_otro" value={sistemaProteccionOtro} onChange={(e) => setSistemaProteccionOtro(e.target.value)} disabled={bloqueado} />
            </CampoReporte>
          )}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Voltajes</p>
            <div className="grid grid-cols-3 gap-2">
              <Voltaje id="voltaje_ln" etiqueta="L+N" value={voltajeLn} onChange={setVoltajeLn} bloqueado={bloqueado} />
              <Voltaje id="voltaje_lt" etiqueta="L+T" value={voltajeLt} onChange={setVoltajeLt} bloqueado={bloqueado} />
              <Voltaje id="voltaje_nt" etiqueta="N+T" value={voltajeNt} onChange={setVoltajeNt} bloqueado={bloqueado} />
            </div>
          </div>
        </SeccionReporte>
      )}

      <SeccionReporte titulo="Otros datos">
        <CampoReporte etiqueta="Operador del equipo" htmlFor="operador">
          <Input id="operador" value={operador} onChange={(e) => setOperador(e.target.value)} disabled={bloqueado} placeholder="Nombre de quien opera la máquina" />
        </CampoReporte>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CampoReporte etiqueta="Último mantenimiento">
            <SelectorFecha value={ultimoMantenimiento} onChange={setUltimoMantenimiento} disabled={bloqueado} />
          </CampoReporte>
          <CampoReporte etiqueta={<>N° de reporte físico <span className="font-normal text-muted-foreground">(si hay)</span></>} htmlFor="numero_fisico">
            <Input id="numero_fisico" value={numeroFisico} onChange={(e) => setNumeroFisico(e.target.value)} disabled={bloqueado} inputMode="numeric" />
          </CampoReporte>
        </div>
      </SeccionReporte>
    </>
  );
}

function Voltaje({
  id,
  etiqueta,
  value,
  onChange,
  bloqueado,
}: {
  id: string;
  etiqueta: string;
  value: string;
  onChange: (valor: string) => void;
  bloqueado: boolean;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {etiqueta}
      </label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={bloqueado}
          className="pr-7 tabular-nums"
        />
        <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">V</span>
      </div>
    </div>
  );
}
