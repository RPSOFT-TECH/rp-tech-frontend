import { UseFormReturn } from 'react-hook-form';
import { Cliente } from '@/lib/datos-simulados/clientes';
import { Contacto } from '@/lib/datos-simulados/contactos';
import { Sede } from '@/lib/datos-simulados/sedes';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BloqueClienteProps {
  form: UseFormReturn<NuevoCasoFormValues>;
  queryCliente: string;
  setQueryCliente: (val: string) => void;
  clienteSeleccionado: Cliente | null;
  clientesResultados: Cliente[];
  sinResultados: boolean;
  buscando: boolean;
  sedes: Sede[];
  contactos: Contacto[];
  onSeleccionarCliente: (c: Cliente) => void;
  onCambiarCliente: () => void;
  onContactoChange: (idStr: string) => void;
}

export function BloqueCliente({
  form,
  queryCliente,
  setQueryCliente,
  clienteSeleccionado,
  clientesResultados,
  sinResultados,
  buscando,
  sedes,
  contactos,
  onSeleccionarCliente,
  onCambiarCliente,
  onContactoChange,
}: BloqueClienteProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  return (
    <Card className="h-fit shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Cliente</CardTitle>
        {clienteSeleccionado?.soporte_vigente && (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
            Soporte vigente
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-1.5 relative">
          <Label htmlFor="empresa">Empresa</Label>
          <div className="flex gap-2">
            <Input
              id="empresa"
              type="text"
              placeholder="Buscar por razón social o RUC..."
              value={queryCliente}
              disabled={!!clienteSeleccionado}
              onChange={(e) => setQueryCliente(e.target.value)}
              className={errors.cliente_id ? 'border-destructive' : ''}
            />
            {clienteSeleccionado && (
              <Button type="button" variant="outline" onClick={onCambiarCliente}>
                Cambiar
              </Button>
            )}
          </div>

          {errors.cliente_id && (
            <p className="text-xs text-destructive mt-1">
              {errors.cliente_id.message}
            </p>
          )}

          {!clienteSeleccionado && clientesResultados.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {clientesResultados.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSeleccionarCliente(c)}
                  className="w-full text-left px-3 py-2.5 hover:bg-muted text-sm border-b last:border-b-0 border-border transition-colors"
                >
                  <div className="font-medium text-foreground flex items-center justify-between">
                    <span>{c.razon_social}</span>
                    {c.soporte_vigente && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                        Soporte
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">RUC: {c.ruc}</div>
                </button>
              ))}
            </div>
          )}

          {!clienteSeleccionado && sinResultados && !buscando && queryCliente.length >= 2 && (
            <p className="text-xs text-muted-foreground mt-1.5 p-2 bg-muted/70 rounded-md border border-border">
              Sin resultados. Regístralo en Administración → Clientes
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sede">Sede</Label>
          <select
            id="sede"
            disabled={!clienteSeleccionado}
            value={watch('sede_id')}
            {...register('sede_id')}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona una sede...</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} — {s.direccion} ({s.distrito}) {s.principal ? '• Principal' : ''}
              </option>
            ))}
          </select>
          {errors.sede_id && (
            <p className="text-xs text-destructive">{errors.sede_id.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contacto">Contacto</Label>
          <select
            id="contacto"
            disabled={!clienteSeleccionado}
            value={watch('contacto_id')}
            onChange={(e) => onContactoChange(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona un contacto...</option>
            {contactos.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.nombre} — {ct.cargo}
              </option>
            ))}
          </select>
          {errors.contacto_id && (
            <p className="text-xs text-destructive">{errors.contacto_id.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            type="text"
            placeholder="Número de contacto"
            disabled={!clienteSeleccionado}
            {...register('telefono')}
            className={errors.telefono ? 'border-destructive' : ''}
          />
          {errors.telefono && (
            <p className="text-xs text-destructive">{errors.telefono.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
