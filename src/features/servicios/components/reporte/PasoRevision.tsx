'use client';

import { Button, Card, CustomSelect } from '@/components/ui';
import type { FormularioReporte } from './tipo';

function Opcion({
  nombre,
  valor,
  marcado,
  etiqueta,
  editable,
  onElegir,
}: {
  nombre: string;
  valor: string;
  marcado: boolean;
  etiqueta: string;
  editable: boolean;
  onElegir: () => void;
}) {
  return (
    <label className={`flex items-center gap-1 cursor-pointer ${!editable ? 'opacity-50' : ''}`}>
      <input
        type="radio"
        name={nombre}
        value={valor}
        checked={marcado}
        onChange={onElegir}
        disabled={!editable}
        className="w-4 h-4 text-primary"
      />
      {etiqueta}
    </label>
  );
}

export function PasoRevision({ form }: { form: FormularioReporte }) {
  const {
    esPasoEditable,
    guardando,
    avanzarPaso,
    retrocederPaso,
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
    guardarRevision,
  } = form;

  return (
    <Card className="p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">2. Revisión inicial</h3>
      {!esPasoEditable && <p className="text-xs text-muted-foreground mb-4">Modo lectura.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Estado del equipo</label>
          <div className="flex gap-2">
            <Opcion nombre="estado_equipo" valor="operativo" marcado={estadoEquipo === 'operativo'} etiqueta="Operativo" editable={esPasoEditable} onElegir={() => setEstadoEquipo('operativo')} />
            <Opcion nombre="estado_equipo" valor="inoperativo" marcado={estadoEquipo === 'inoperativo'} etiqueta="Inoperativo" editable={esPasoEditable} onElegir={() => setEstadoEquipo('inoperativo')} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-muted-foreground">Limpieza</label>
          <div className="flex gap-2">
            <Opcion nombre="limpieza" valor="limpio" marcado={limpieza === 'limpio'} etiqueta="Limpio" editable={esPasoEditable} onElegir={() => setLimpieza('limpio')} />
            <Opcion nombre="limpieza" valor="sucio" marcado={limpieza === 'sucio'} etiqueta="Sucio" editable={esPasoEditable} onElegir={() => setLimpieza('sucio')} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <CustomSelect
            label="Cabezales"
            value={estadoCabezales ?? ''}
            disabled={!esPasoEditable}
            placeholder="Selecciona"
            onChange={(valor) => setEstadoCabezales((valor || null) as 'bueno' | 'regular' | 'malo' | null)}
            options={[
              { value: 'bueno', label: 'Bueno' },
              { value: 'regular', label: 'Regular' },
              { value: 'malo', label: 'Malo' },
            ]}
          />
        </div>
        <div className="flex flex-col gap-1">
          <CustomSelect
            label="Protección"
            value={sistemaProteccion ?? ''}
            disabled={!esPasoEditable}
            placeholder="Selecciona"
            onChange={(valor) => setSistemaProteccion((valor || null) as 'estabilizador' | 'ups' | 'otro' | null)}
            options={[
              { value: 'estabilizador', label: 'Estabilizador' },
              { value: 'ups', label: 'UPS' },
              { value: 'otro', label: 'Otro' },
            ]}
          />
        </div>
      </div>
      {sistemaProteccion === 'otro' && (
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-xs font-semibold text-muted-foreground">¿Cuál?</label>
          <input
            value={sistemaProteccionOtro}
            onChange={(evento) => setSistemaProteccionOtro(evento.target.value)}
            disabled={!esPasoEditable}
            className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
          />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Campo etiqueta="Tinta" value={tinta} onChange={setTinta} editable={esPasoEditable} />
        <Campo etiqueta="Voltaje L+N" value={voltajeLn} onChange={setVoltajeLn} editable={esPasoEditable} tipo="number" />
        <Campo etiqueta="Voltaje L+T" value={voltajeLt} onChange={setVoltajeLt} editable={esPasoEditable} tipo="number" />
        <Campo etiqueta="Voltaje N+T" value={voltajeNt} onChange={setVoltajeNt} editable={esPasoEditable} tipo="number" />
        <Campo etiqueta="Operador" value={operador} onChange={setOperador} editable={esPasoEditable} />
        <Campo etiqueta="Último mantenimiento" value={ultimoMantenimiento} onChange={setUltimoMantenimiento} editable={esPasoEditable} tipo="date" />
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <label className="text-xs font-semibold text-muted-foreground">N° de reporte físico</label>
        <input
          value={numeroFisico}
          onChange={(evento) => setNumeroFisico(evento.target.value)}
          disabled={!esPasoEditable}
          className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={retrocederPaso} disabled={guardando} className="min-h-11">
          Atrás
        </Button>
        <Button
          onClick={() => {
            if (esPasoEditable) void guardarRevision();
            avanzarPaso();
          }}
          disabled={guardando}
          className="min-h-11 flex-1"
        >
          {guardando ? 'Guardando...' : 'Siguiente'}
        </Button>
      </div>
    </Card>
  );
}

function Campo({
  etiqueta,
  value,
  onChange,
  editable,
  tipo = 'text',
}: {
  etiqueta: string;
  value: string;
  onChange: (valor: string) => void;
  editable: boolean;
  tipo?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-muted-foreground">{etiqueta}</label>
      <input
        type={tipo}
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
        disabled={!editable}
        className="min-h-10 border border-border rounded-lg px-2 py-2 text-sm"
      />
    </div>
  );
}
