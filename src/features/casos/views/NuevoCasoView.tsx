'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { crearCaso, obtenerUsuarioActual } from '@/lib/datos-simulados/actions';
import { nuevoCasoSchema, NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { useNuevoCasoForm } from '../hooks/useNuevoCasoForm';

import {
  BloqueSolicitud,
  BloqueCliente,
  BloqueEquipo,
  BloqueServicio,
} from '../components';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function NuevoCasoView() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  const form = useForm<NuevoCasoFormValues>({
    resolver: zodResolver(nuevoCasoSchema),
    defaultValues: {
      canal: 'Llamada',
      cliente_id: '',
      sede_id: '',
      contacto_id: '',
      telefono: '',
      equipo_id: '',
      incidencia: '',
      tipo_servicio: '',
      modalidad: '',
      modo_sugerido: '',
      modo_servicio: '',
      motivo_cambio_modo: '',
    },
  });

  const {
    queryCliente,
    setQueryCliente,
    buscando,
    clientesResultados,
    clienteSeleccionado,
    sinResultados,
    sedes,
    contactos,
    equipos,
    equipoSeleccionado,
    sugerencia,
    catalogos,
    handleSeleccionarCliente,
    handleCambiarCliente,
    handleContactoChange,
    handleEquipoChange,
  } = useNuevoCasoForm(form.setValue);

  const onSubmit = async (values: NuevoCasoFormValues) => {
    setGuardando(true);
    setErrorGlobal(null);

    const sesion = obtenerUsuarioActual();

    try {
      const nuevoCaso = await crearCaso({
        canal: values.canal,
        creado_por: sesion?.usuario.email || 'coordinador@rptech.test',
        cliente_id: values.cliente_id,
        sede_id: values.sede_id,
        contacto_id: values.contacto_id,
        telefono: values.telefono,
        equipo_id: values.equipo_id,
        incidencia: values.incidencia.trim(),
        tipo_servicio: values.tipo_servicio,
        modalidad: values.modalidad,
        modo_sugerido: values.modo_sugerido || values.modo_servicio,
        modo_servicio: values.modo_servicio,
        motivo_cambio_modo: values.motivo_cambio_modo,
        prioridad: 'Consulta',
        tecnico_id: null,
        fecha_programada: null,
        hora_programada: null,
      });

      toast.success(`Caso ${nuevoCaso.numero} registrado`);

      startTransition(() => {
        router.push('/casos');
      });
    } catch (err: any) {
      setErrorGlobal(err?.message || 'Error al guardar el caso. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nuevo caso</h1>
      </div>

      {errorGlobal && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <BloqueSolicitud form={form} />
          </div>

          <BloqueCliente
            form={form}
            queryCliente={queryCliente}
            setQueryCliente={setQueryCliente}
            clienteSeleccionado={clienteSeleccionado}
            clientesResultados={clientesResultados}
            sinResultados={sinResultados}
            buscando={buscando}
            sedes={sedes}
            contactos={contactos}
            onSeleccionarCliente={handleSeleccionarCliente}
            onCambiarCliente={handleCambiarCliente}
            onContactoChange={handleContactoChange}
          />

          <BloqueEquipo
            form={form}
            clienteSeleccionado={!!clienteSeleccionado}
            equipos={equipos}
            equipoSeleccionado={equipoSeleccionado}
            sugerencia={sugerencia}
            onEquipoChange={handleEquipoChange}
          />

          <BloqueServicio
            form={form}
            catalogos={catalogos}
            sugerencia={sugerencia}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar caso'}
          </Button>
        </div>
      </form>
    </div>
  );
}
