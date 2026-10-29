import { UseFormReturn } from 'react-hook-form';
import { SugerenciaModo } from '@/lib/datos-simulados/actions';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CatalogoSimple {
  id: number;
  nombre: string;
}

interface BloqueServicioProps {
  form: UseFormReturn<NuevoCasoFormValues>;
  catalogos: {
    tipos_servicio: CatalogoSimple[];
    modos_servicio: CatalogoSimple[];
    modalidades: CatalogoSimple[];
  };
  sugerencia: SugerenciaModo | null;
}

export function BloqueServicio({ form, catalogos, sugerencia }: BloqueServicioProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const modoElegido = watch('modo_servicio');
  const modoSugerido = watch('modo_sugerido');
  const requiereMotivo = !!modoSugerido && modoElegido !== modoSugerido;

  return (
    <Card className="md:col-span-2 shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-semibold">Servicio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo_servicio">Tipo de servicio</Label>
            <select
              id="tipo_servicio"
              {...register('tipo_servicio')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Selecciona tipo...</option>
              {catalogos.tipos_servicio.map((item) => (
                <option key={item.id} value={item.nombre}>
                  {item.nombre}
                </option>
              ))}
            </select>
            {errors.tipo_servicio && (
              <p className="text-xs text-destructive">{errors.tipo_servicio.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modalidad">Modalidad</Label>
            <select
              id="modalidad"
              {...register('modalidad')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Selecciona modalidad...</option>
              {catalogos.modalidades.map((item) => (
                <option key={item.id} value={item.nombre}>
                  {item.nombre}
                </option>
              ))}
            </select>
            {errors.modalidad && (
              <p className="text-xs text-destructive">{errors.modalidad.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modo_servicio">Modo de servicio</Label>
            <select
              id="modo_servicio"
              {...register('modo_servicio')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Selecciona modo...</option>
              {catalogos.modos_servicio.map((item) => (
                <option key={item.id} value={item.nombre}>
                  {item.nombre}
                </option>
              ))}
            </select>
            {errors.modo_servicio && (
              <p className="text-xs text-destructive">{errors.modo_servicio.message}</p>
            )}
            {sugerencia && (
              <p className="text-xs text-primary bg-primary/10 p-1.5 rounded border border-border mt-1">
                {sugerencia.motivo}
              </p>
            )}
          </div>
        </div>

        {requiereMotivo && (
          <div className="space-y-1.5 bg-accent/60 p-3 rounded-lg border border-border">
            <Label htmlFor="motivo_cambio_modo" className="text-accent-foreground font-medium">
              Motivo del cambio de modo <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivo_cambio_modo"
              placeholder="Explica por qué cambias el modo de servicio respecto al sugerido..."
              rows={2}
              {...register('motivo_cambio_modo')}
              className={`bg-background ${errors.motivo_cambio_modo ? 'border-destructive' : 'border-border'}`}
            />
            {errors.motivo_cambio_modo && (
              <p className="text-xs text-destructive">{errors.motivo_cambio_modo.message}</p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="incidencia">Incidencia</Label>
          <Textarea
            id="incidencia"
            placeholder="Qué reporta el cliente..."
            rows={4}
            {...register('incidencia')}
            className={errors.incidencia ? 'border-destructive' : ''}
          />
          {errors.incidencia && (
            <p className="text-xs text-destructive">{errors.incidencia.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
