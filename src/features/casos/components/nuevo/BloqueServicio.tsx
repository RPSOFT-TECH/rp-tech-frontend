import { UseFormReturn } from 'react-hook-form';
import { SugerenciaModo } from '@/lib/datos/actions';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { CustomSelect } from '@/components/ui/custom-select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CatalogoSimple {
  id: string;
  nombre: string;
}

interface BloqueServicioProps {
  form: UseFormReturn<NuevoCasoFormValues>;
  catalogos: {
    modos_servicio: CatalogoSimple[];
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

  const err = (m?: string) => (m ? <p className="text-xs text-destructive">{m}</p> : null);

  return (
    <>
      <hr className="border-border md:col-span-12" />
      {/* ── Fila 4: Incidencia + Modo de servicio ── */}
      <div className="space-y-1.5 md:col-span-7 lg:col-span-7">
        <Label htmlFor="incidencia">
          Incidencia<span aria-hidden className="-ml-1.5 text-destructive">*</span>
        </Label>
        <Textarea
          id="incidencia"
          placeholder="Qué reporta el cliente..."
          rows={3}
          {...register('incidencia')}
          className={errors.incidencia ? 'border-destructive' : ''}
        />
        {err(errors.incidencia?.message)}
      </div>

      <div className="space-y-1.5 md:col-span-5 lg:col-span-5">
        <Label htmlFor="modo_servicio_id">
          Modo de servicio<span aria-hidden className="-ml-1.5 text-destructive">*</span>
        </Label>
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
        {err(errors.modo_servicio_id?.message)}
        {sugerencia && <p className="text-xs text-primary">{sugerencia.motivo}</p>}
      </div>
    </>
  );
}
