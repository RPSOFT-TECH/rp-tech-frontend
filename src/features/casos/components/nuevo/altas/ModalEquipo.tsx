'use client';

import { useState } from 'react';
import { crear_equipo, type EquipoVista, type Sede } from '@/lib/datos-simulados/actions';
import { CustomSelect } from '@/components/ui/custom-select';
import { SelectorFecha } from '@/components/ui/selector-fecha';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';

interface Opcion {
  id: string;
  nombre: string;
}

interface ModalEquipoProps {
  abierto: boolean;
  clienteId: string;
  sedes: Sede[];
  lineas: Opcion[];
  cabezales: Opcion[];
  onCerrar: () => void;
  onCreado: (equipo: EquipoVista) => void;
}

const CANTIDADES = [1, 2, 3, 4, 6, 8];
export function ModalEquipo({ abierto, clienteId, sedes, lineas, cabezales, onCerrar, onCreado }: ModalEquipoProps) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Crear equipo" tamano="lg">
      {abierto ? (
        <FormularioEquipo
          clienteId={clienteId}
          sedes={sedes}
          lineas={lineas}
          cabezales={cabezales}
          onCerrar={onCerrar}
          onCreado={onCreado}
        />
      ) : null}
    </Modal>
  );
}

function FormularioEquipo({ clienteId, sedes, lineas, cabezales, onCerrar, onCreado }: Omit<ModalEquipoProps, 'abierto'>) {
  const [serie, setSerie] = useState('');
  const [modelo, setModelo] = useState('');
  const [lineaId, setLineaId] = useState(lineas[0]?.id ?? '');
  const [cabezalId, setCabezalId] = useState(cabezales[0]?.id ?? '');
  const [sedeId, setSedeId] = useState(sedes[0]?.id ?? '');
  const [cantidad, setCantidad] = useState(1);
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    const resultado = await crear_equipo({
      cliente_id: clienteId,
      sede_id: sedeId,
      numero_serie: serie,
      linea_id: lineaId,
      modelo,
      cabezal_modelo_id: cabezalId,
      cabezal_cantidad: cantidad,
      fecha_instalacion: fecha,
    });
    setGuardando(false);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    onCreado(resultado.datos);
    onCerrar();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
      className="space-y-3"
    >
      {sedes.length === 0 && (
        <p className="text-sm text-muted-foreground">Crea una sede del cliente antes de registrar el equipo.</p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="equipo_serie">Serie</Label>
        <Input id="equipo_serie" value={serie} onChange={(e) => setSerie(e.target.value)} className="min-h-11" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="equipo_modelo">Modelo</Label>
        <Input id="equipo_modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} className="min-h-11" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <CustomSelect
            id="equipo_linea"
            label="Línea"
            value={lineaId}
            onChange={setLineaId}
            options={lineas.map((linea) => ({ value: linea.id, label: linea.nombre }))}
          />
        </div>
        <div className="space-y-1.5">
          <CustomSelect
            id="equipo_cabezal"
            label="Cabezal"
            value={cabezalId}
            onChange={setCabezalId}
            options={cabezales.map((cabezal) => ({ value: cabezal.id, label: cabezal.nombre }))}
          />
        </div>
        <div className="space-y-1.5">
          <CustomSelect
            id="equipo_sede"
            label="Sede"
            value={sedeId}
            onChange={setSedeId}
            options={sedes.map((sede) => ({ value: sede.id, label: sede.nombre }))}
          />
        </div>
        <div className="space-y-1.5">
          <CustomSelect
            id="equipo_cantidad"
            label="Cantidad de cabezales"
            value={String(cantidad)}
            onChange={(valor) => setCantidad(Number(valor))}
            options={CANTIDADES.map((item) => ({ value: String(item), label: String(item) }))}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <SelectorFecha id="equipo_fecha" label="Fecha de instalación" value={fecha} onChange={setFecha} />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" className="min-h-11" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" className="min-h-11" disabled={guardando || sedes.length === 0}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
