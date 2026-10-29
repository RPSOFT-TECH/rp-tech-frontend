import { UseFormReturn } from 'react-hook-form';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface BloqueSolicitudProps {
  form: UseFormReturn<NuevoCasoFormValues>;
}

export function BloqueSolicitud({ form }: BloqueSolicitudProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = form;

  const canalActual = watch('canal');

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-semibold">Solicitud</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <Label>Canal de atención</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('canal', 'Llamada', { shouldValidate: true })}
            className={`h-11 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              canalActual === 'Llamada'
                ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                : 'border-input bg-background hover:bg-muted text-foreground'
            }`}
          >
            Llamada
          </button>
          <button
            type="button"
            onClick={() => setValue('canal', 'WhatsApp', { shouldValidate: true })}
            className={`h-11 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              canalActual === 'WhatsApp'
                ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                : 'border-input bg-background hover:bg-muted text-foreground'
            }`}
          >
            WhatsApp
          </button>
        </div>
        {errors.canal && (
          <p className="text-xs text-destructive mt-1">{errors.canal.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
