import { RepuestoItem } from '../types';

interface RepuestosListProps {
  repuestos: RepuestoItem[];
  setRepuestos: (items: RepuestoItem[]) => void;
  agregarRepuesto: () => void;
  quitarRepuesto: (index: number) => void;
}

export function RepuestosList({
  repuestos,
  setRepuestos,
  agregarRepuesto,
  quitarRepuesto,
}: RepuestosListProps) {
  return (
    <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Repuestos / Insumos Utilizados
        </h3>
        <button
          type="button"
          onClick={agregarRepuesto}
          className="text-xs text-primary hover:underline font-semibold min-h-11 inline-flex items-center"
        >
          + Agregar repuesto
        </button>
      </div>

      <div className="space-y-2">
        {repuestos.map((item, index) => (
          <div key={item.id} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Descripción del repuesto"
              value={item.descripcion}
              onChange={(e) => {
                const nuevos = [...repuestos];
                nuevos[index].descripcion = e.target.value;
                setRepuestos(nuevos);
              }}
              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground min-h-11"
            />
            <input
              type="number"
              min="1"
              value={item.cantidad}
              onChange={(e) => {
                const nuevos = [...repuestos];
                nuevos[index].cantidad = parseInt(e.target.value) || 1;
                setRepuestos(nuevos);
              }}
              className="w-20 border border-border rounded-lg px-3 py-2 text-sm text-center bg-background text-foreground min-h-11"
            />
            <button
              type="button"
              onClick={() => quitarRepuesto(index)}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 px-3 py-2 rounded-lg text-sm font-medium min-h-11 inline-flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
