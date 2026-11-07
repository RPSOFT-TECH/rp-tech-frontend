import { UseFormReturn } from 'react-hook-form';
import { SugerenciaModo } from '@/lib/datos/actions';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { CustomSelect } from '@/components/ui/custom-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CatalogoSimple {
  id: string;
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
    setValue,
    formState: { errors },
  } = form;

  const modoElegido = watch('modo_servicio_id');
  const modoSugerido = watch('modo_sugerido_id');
  const requiereMotivo = !!modoSugerido && modoElegido !== modoSugerido;

  return (
    <Card className="md:col-span-2 shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-semibold">Servicio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo_servicio_id">Tipo de servicio</Label>
            <CustomSelect
              id="tipo_servicio_id"
              value={watch('tipo_servicio_id') || ''}
              onChange={(valor) => setValue('tipo_servicio_id', valor, { shouldValidate: true, shouldDirty: true })}
              placeholder="Selecciona tipo..."
              options={catalogos.tipos_servicio.map((item) => ({ value: item.id, label: item.nombre }))}
            />
            {errors.tipo_servicio_id && (
              <p className="text-xs text-destructive">{errors.tipo_servicio_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modalidad_id">Modalidad</Label>
            <CustomSelect
              id="modalidad_id"
              value={watch('modalidad_id') || ''}
              onChange={(valor) => setValue('modalidad_id', valor, { shouldValidate: true, shouldDirty: true })}
              placeholder="Selecciona modalidad..."
              options={catalogos.modalidades.map((item) => ({ value: item.id, label: item.nombre }))}
            />
            {errors.modalidad_id && (
              <p className="text-xs text-destructive">{errors.modalidad_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="modo_servicio_id">Modo de servicio</Label>
            <CustomSelect
              id="modo_servicio_id"
              value={watch('modo_servicio_id') || ''}
              onChange={(valor) => setValue('modo_servicio_id', valor, { shouldValidate: true, shouldDirty: true })}
              placeholder="Selecciona modo..."
              options={catalogos.modos_servicio.map((item) => ({
                value: item.id,
                label: sugerencia?.modo_id === item.id ? `${item.nombre} · Sugerido` : item.nombre,
              }))}
            />
            {errors.modo_servicio_id && (
              <p className="text-xs text-destructive">{errors.modo_servicio_id.message}</p>
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
