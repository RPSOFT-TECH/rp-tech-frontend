'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  crear_equipo,
  guardar_equipo,
  obtener_catalogos,
  type EquipoVista,
  type Sede,
} from '@/lib/datos-simulados/actions';
import { Button, CustomSelect, Modal, SelectorFecha } from '@/components/ui';
import { claseCampo } from './clases';
import { HistorialEquipo } from './HistorialCliente';

const CANTIDADES = [1, 2, 3, 4, 6, 8];

export function EditorEquipos({
  clienteId,
  sedes,
  equipos,
  onCambio,
}: {
  clienteId: string;
  sedes: Sede[];
  equipos: EquipoVista[];
  onCambio: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<EquipoVista | null>(null);
  const [historialId, setHistorialId] = useState<string | null>(null);
  const [lineas, setLineas] = useState<{ id: string; nombre: string }[]>([]);
  const [cabezales, setCabezales] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    obtener_catalogos().then((datos) => {
      setLineas(datos.lineas_maquina);
      setCabezales(datos.modelos_cabezal);
    });
  }, []);

  const desactivar = async (equipo: EquipoVista) => {
    const resultado = await guardar_equipo({ ...equipo, activo: !equipo.activo });
    if (!resultado.ok) {
      toast.error(resultado.error);
      return;
    }
    onCambio();
  };

  return (
    <div className="space-y-3">
      <Button type="button" className="min-h-11" onClick={() => { setEditando(null); setAbierto(true); }}>
        + Crear
      </Button>
      {equipos.map((equipo) => (
        <div key={equipo.id} className="bg-card border border-border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
          <div>
            <p className="font-medium text-foreground">
              {equipo.numero_serie} {!equipo.activo && '· Inactivo'}
            </p>
            <p className="text-xs text-muted-foreground">
              {equipo.linea_nombre} · {equipo.modelo} · {equipo.cabezal_nombre} · {equipo.cabezal_cantidad}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setHistorialId(equipo.id)}>
              Historial
            </Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => { setEditando(equipo); setAbierto(true); }}>
              Editar
            </Button>
            <Button type="button" variant="ghost" className="min-h-11" onClick={() => void desactivar(equipo)}>
              {equipo.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </div>
      ))}
      <Modal abierto={abierto} onCerrar={() => setAbierto(false)} titulo={editando ? 'Editar equipo' : 'Crear equipo'} tamano="lg">
        {abierto ? (
          <Formulario
            clienteId={clienteId}
            equipo={editando}
            sedes={sedes.filter((sede) => sede.activo)}
            lineas={lineas}
            cabezales={cabezales}
            onListo={() => {
              setAbierto(false);
              onCambio();
            }}
          />
        ) : null}
      </Modal>
      <Modal abierto={!!historialId} onCerrar={() => setHistorialId(null)} titulo="Historial del equipo">
        {historialId ? <HistorialEquipo equipoId={historialId} abierto /> : null}
      </Modal>
    </div>
  );
}

function Formulario({
  clienteId,
  equipo,
  sedes,
  lineas,
  cabezales,
  onListo,
}: {
  clienteId: string;
  equipo: EquipoVista | null;
  sedes: Sede[];
  lineas: { id: string; nombre: string }[];
  cabezales: { id: string; nombre: string }[];
  onListo: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const guardar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const comun = {
      sede_id: String(datos.get('sede_id') ?? ''),
      numero_serie: String(datos.get('numero_serie') ?? ''),
      linea_id: String(datos.get('linea_id') ?? ''),
      modelo: String(datos.get('modelo') ?? ''),
      cabezal_modelo_id: String(datos.get('cabezal_modelo_id') ?? ''),
      cabezal_cantidad: Number(datos.get('cabezal_cantidad') ?? 1) as EquipoVista['cabezal_cantidad'],
      fecha_instalacion: String(datos.get('fecha_instalacion') ?? ''),
    };
    const resultado = equipo
      ? await guardar_equipo({ ...equipo, ...comun, activo: equipo.activo })
      : await crear_equipo({ cliente_id: clienteId, ...comun });
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    toast.success(equipo ? 'Equipo actualizado' : 'Equipo creado');
    onListo();
  };
  return (
    <form className="space-y-3" onSubmit={(e) => void guardar(e)}>
      <Campo nombre="numero_serie" label="Serie" valor={equipo?.numero_serie ?? ''} />
      <Campo nombre="modelo" label="Modelo" valor={equipo?.modelo ?? ''} />
      <Select nombre="linea_id" label="Línea" valor={equipo?.linea_id ?? lineas[0]?.id ?? ''} opciones={lineas} />
      <Select nombre="cabezal_modelo_id" label="Cabezal" valor={equipo?.cabezal_modelo_id ?? cabezales[0]?.id ?? ''} opciones={cabezales} />
      <Select nombre="sede_id" label="Sede" valor={equipo?.sede_id ?? sedes[0]?.id ?? ''} opciones={sedes.map((sede) => ({ id: sede.id, nombre: sede.nombre }))} />
      <CantidadCabezales inicial={equipo?.cabezal_cantidad ?? 1} />
      <Campo nombre="fecha_instalacion" label="Fecha de instalación" valor={equipo?.fecha_instalacion ?? ''} tipo="date" />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" className="min-h-11" disabled={sedes.length === 0}>Guardar</Button>
    </form>
  );
}

function CampoFecha({ nombre, label, valor }: { nombre: string; label: string; valor: string }) {
  const [actual, setActual] = useState(valor);
  return (
    <div className="block space-y-1 text-sm">
      <input type="hidden" name={nombre} value={actual} />
      <SelectorFecha label={label} value={actual} onChange={setActual} />
    </div>
  );
}

function Campo({ nombre, label, valor, tipo = 'text' }: { nombre: string; label: string; valor: string; tipo?: string }) {
  if (tipo === 'date') return <CampoFecha nombre={nombre} label={label} valor={valor} />;
  return (
    <label className="block space-y-1 text-sm">
      <span>{label}</span>
      <input name={nombre} type={tipo} defaultValue={valor} className={claseCampo} />
    </label>
  );
}

function Select({ nombre, label, valor, opciones }: { nombre: string; label: string; valor: string; opciones: { id: string; nombre: string }[] }) {
  const [actual, setActual] = useState(valor);
  return (
    <div className="block space-y-1 text-sm">
      <input type="hidden" name={nombre} value={actual} />
      <CustomSelect
        label={label}
        value={actual}
        onChange={setActual}
        options={opciones.map((opcion) => ({ value: opcion.id, label: opcion.nombre }))}
      />
    </div>
  );
}

function CantidadCabezales({ inicial }: { inicial: number }) {
  const [actual, setActual] = useState(String(inicial));
  return (
    <div className="block space-y-1 text-sm">
      <input type="hidden" name="cabezal_cantidad" value={actual} />
      <CustomSelect
        label="Cantidad de cabezales"
        value={actual}
        onChange={setActual}
        options={CANTIDADES.map((cantidad) => ({ value: String(cantidad), label: String(cantidad) }))}
      />
    </div>
  );
}
