import { UseFormReturn } from 'react-hook-form';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { Segmentado } from '@/components/ui/segmentado';
import { Label } from '@/components/ui/label';

interface CanalOpcion {
  id: string;
  nombre: string;
}

interface BloqueSolicitudProps {
  form: UseFormReturn<NuevoCasoFormValues>;
  canales: CanalOpcion[];
}

export function BloqueSolicitud({ form, canales }: BloqueSolicitudProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = form;
  const canalActual = watch('canal_id');

  return (
    <div className="space-y-1.5 md:col-span-5 lg:col-span-3">
      <Label>
        Canal<span aria-hidden className="-ml-1.5 text-destructive">*</span>
      </Label>
      <Segmentado
        ariaLabel="Canal de atención"
        value={canalActual}
        onChange={(valor) => setValue('canal_id', valor, { shouldValidate: true })}
        opciones={canales.map((canal) => ({ value: canal.id, label: canal.nombre }))}
      />
      {errors.canal_id && <p className="text-xs text-destructive">{errors.canal_id.message}</p>}
    </div>
  );
}
