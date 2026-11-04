'use client';

import { useState } from 'react';
import { crear_equipo, type EquipoVista, type Sede } from '@/lib/datos/actions';
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
const claseCampo = 'w-full min-h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground';

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
          <Label htmlFor="equipo_linea">Línea</Label>
          <select id="equipo_linea" value={lineaId} onChange={(e) => setLineaId(e.target.value)} className={claseCampo}>
            {lineas.map((linea) => (
              <option key={linea.id} value={linea.id}>
                {linea.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="equipo_cabezal">Cabezal</Label>
          <select id="equipo_cabezal" value={cabezalId} onChange={(e) => setCabezalId(e.target.value)} className={claseCampo}>
            {cabezales.map((cabezal) => (
              <option key={cabezal.id} value={cabezal.id}>
                {cabezal.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="equipo_sede">Sede</Label>
          <select id="equipo_sede" value={sedeId} onChange={(e) => setSedeId(e.target.value)} className={claseCampo}>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="equipo_cantidad">Cantidad de cabezales</Label>
          <select
            id="equipo_cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className={claseCampo}
          >
            {CANTIDADES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="equipo_fecha">Fecha de instalación</Label>
        <input id="equipo_fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={claseCampo} />
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
