import { UseFormReturn } from 'react-hook-form';
import { SugerenciaModo } from '@/lib/datos/actions';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { CustomSelect } from '@/components/ui/custom-select';
import { Segmentado } from '@/components/ui/segmentado';
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

  const modalidades = catalogos.modalidades;
  const err = (m?: string) => (m ? <p className="text-xs text-destructive">{m}</p> : null);

  return (
    <>
      <hr className="border-border md:col-span-12" />
      <div className="space-y-1.5 md:col-span-6 lg:col-span-3">
        <Label htmlFor="tipo_servicio_id">
          Tipo de servicio<span aria-hidden className="-ml-1.5 text-destructive">*</span>
        </Label>
        <CustomSelect
          id="tipo_servicio_id"
          value={watch('tipo_servicio_id') || ''}
          onChange={(valor) => setValue('tipo_servicio_id', valor, { shouldValidate: true, shouldDirty: true })}
          placeholder="Selecciona tipo..."
          options={catalogos.tipos_servicio.map((item) => ({ value: item.id, label: item.nombre }))}
        />
        {err(errors.tipo_servicio_id?.message)}
      </div>

      <div className="space-y-1.5 md:col-span-6 lg:col-span-4">
        <Label htmlFor="modalidad_id">
          Modalidad<span aria-hidden className="-ml-1.5 text-destructive">*</span>
        </Label>
        {modalidades.length > 0 && modalidades.length <= 3 ? (
          <Segmentado
            ariaLabel="Modalidad"
            value={watch('modalidad_id')}
            onChange={(valor) => setValue('modalidad_id', valor, { shouldValidate: true, shouldDirty: true })}
            opciones={modalidades.map((item) => ({ value: item.id, label: item.nombre }))}
          />
        ) : (
          <CustomSelect
            id="modalidad_id"
            value={watch('modalidad_id') || ''}
            onChange={(valor) => setValue('modalidad_id', valor, { shouldValidate: true, shouldDirty: true })}
            placeholder="Selecciona modalidad..."
            options={modalidades.map((item) => ({ value: item.id, label: item.nombre }))}
          />
        )}
        {err(errors.modalidad_id?.message)}
      </div>

      <div className="space-y-1.5 md:col-span-12 lg:col-span-5">
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

      {requiereMotivo && (
        <div className="space-y-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3 md:col-span-12 dark:border-amber-900 dark:bg-amber-950/40">
          <Label htmlFor="motivo_cambio_modo">
            Motivo del cambio de modo<span aria-hidden className="-ml-1.5 text-destructive">*</span>
          </Label>
          <Textarea
            id="motivo_cambio_modo"
            placeholder="Explica por qué cambias el modo de servicio respecto al sugerido..."
            rows={2}
            {...register('motivo_cambio_modo')}
            className={errors.motivo_cambio_modo ? 'border-destructive' : ''}
          />
          {err(errors.motivo_cambio_modo?.message)}
        </div>
      )}

      <div className="space-y-1.5 md:col-span-12">
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
    </>
  );
}
