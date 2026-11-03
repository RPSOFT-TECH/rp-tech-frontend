import { UseFormReturn } from 'react-hook-form';
import { EquipoVista, SugerenciaModo } from '@/lib/datos-simulados/actions';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface BloqueEquipoProps {
  form: UseFormReturn<NuevoCasoFormValues>;
  clienteSeleccionado: boolean;
  equipos: EquipoVista[];
  equipoSeleccionado: EquipoVista | null;
  sugerencia: SugerenciaModo | null;
  onEquipoChange: (idStr: string) => void;
}

export function BloqueEquipo({
  form,
  clienteSeleccionado,
  equipos,
  equipoSeleccionado,
  sugerencia,
  onEquipoChange,
}: BloqueEquipoProps) {
  const {
    watch,
    formState: { errors },
  } = form;

  return (
    <Card className="h-fit shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Equipo</CardTitle>
        {sugerencia && (
          <Badge
            variant={sugerencia.en_garantia ? 'default' : 'secondary'}
            className={
              sugerencia.en_garantia
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-accent-foreground border border-border'
            }
          >
            {sugerencia.en_garantia ? 'En garantía' : 'Fuera de garantía'}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <Label htmlFor="equipo">Equipo</Label>
          <select
            id="equipo"
            disabled={!clienteSeleccionado}
            value={watch('equipo_id')}
            onChange={(e) => onEquipoChange(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona un equipo...</option>
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.numero_serie} — {eq.linea_nombre} ({eq.modelo})
              </option>
            ))}
          </select>
          {errors.equipo_id && (
            <p className="text-xs text-destructive">{errors.equipo_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Cabezal</Label>
            <div className="h-9 px-2.5 py-2 rounded-md bg-muted text-xs text-foreground flex items-center border border-border truncate">
              {equipoSeleccionado?.cabezal_nombre || '—'}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cantidad</Label>
            <div className="h-9 px-2.5 py-2 rounded-md bg-muted text-xs text-foreground flex items-center border border-border">
              {equipoSeleccionado?.cabezal_cantidad ?? '—'}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Instalación</Label>
            <div className="h-9 px-2.5 py-2 rounded-md bg-muted text-xs text-foreground flex items-center border border-border truncate">
              {sugerencia?.antiguedad_texto || '—'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
