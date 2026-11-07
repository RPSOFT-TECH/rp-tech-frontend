'use client';

import { Suspense, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { crear_caso, programar_visita, tecnicos } from '@/lib/datos-simulados/actions';
import { nuevoCasoSchema, NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { useNuevoCasoForm } from '../hooks/useNuevoCasoForm';
import {
  BloqueSolicitud,
  BloqueCliente,
  BloqueEquipo,
  BloqueServicio,
} from '../components';
import { BloqueProgramar, type ProgramacionVisita } from '../components/BloqueProgramar';
import { EncabezadoNuevoCaso } from '../components/EncabezadoNuevoCaso';
import { ConfirmacionCaso, type ConfirmacionCasoDatos } from '../components/ConfirmacionCaso';
import { PlusCircle } from 'lucide-react';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const programacionVacia: ProgramacionVisita = { tecnicoId: '', adjuntoId: '', fecha: '', hora: '' };

export function NuevoCasoView() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando formulario...</div>}>
      <NuevoCasoContenido />
    </Suspense>
  );
}

function NuevoCasoContenido() {
  const router = useRouter();
  const origenInicial = useSearchParams().get('origen');
  const [, startTransition] = useTransition();
  const [clave, setClave] = useState(0);
  const [origenId, setOrigenId] = useState(origenInicial);
  const [confirmacion, setConfirmacion] = useState<ConfirmacionCasoDatos | null>(null);
  useRegistrarTitulo('Nuevo caso', 'Apertura de orden técnica de atención', PlusCircle);

  if (confirmacion) {
    return (
      <ConfirmacionCaso
        datos={confirmacion}
        onOtro={() => {
          setConfirmacion(null);
          setOrigenId(null);
          setClave((valor) => valor + 1);
          startTransition(() => router.replace('/casos/nuevo'));
        }}
      />
    );
  }

  return <FormularioNuevoCaso key={clave} origenId={origenId} onConfirmado={setConfirmacion} />;
}

function FormularioNuevoCaso({
  origenId,
  onConfirmado,
}: {
  origenId: string | null;
  onConfirmado: (datos: ConfirmacionCasoDatos) => void;
}) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [programar, setProgramar] = useState(false);
  const [programacion, setProgramacion] = useState<ProgramacionVisita>(programacionVacia);

  const form = useForm<NuevoCasoFormValues>({
    resolver: zodResolver(nuevoCasoSchema),
    defaultValues: {
      canal_id: '',
      cliente_id: '',
      sede_id: '',
      contacto_id: '',
      telefono: '',
      equipo_id: '',
      incidencia: '',
      tipo_servicio_id: '',
      modalidad_id: '',
      modo_sugerido_id: '',
      modo_servicio_id: '',
      motivo_cambio_modo: '',
    },
  });

  const datos = useNuevoCasoForm(form.setValue, origenId);

  const onSubmit = async (values: NuevoCasoFormValues) => {
    setGuardando(true);
    setErrorGlobal(null);
    if (programar && (!programacion.tecnicoId || !programacion.fecha || !programacion.hora)) {
      setErrorGlobal('Para programar la visita elige técnico, fecha y hora.');
      setGuardando(false);
      return;
    }
    if (programar && programacion.adjuntoId && programacion.adjuntoId === programacion.tecnicoId) {
      setErrorGlobal('El técnico adjunto debe ser distinto del técnico asignado.');
      setGuardando(false);
      return;
    }

    const resultado = await crear_caso({
      canal_id: values.canal_id,
      cliente_id: values.cliente_id,
      sede_id: values.sede_id,
      contacto_id: values.contacto_id,
      telefono: values.telefono,
      equipo_id: values.equipo_id,
      incidencia: values.incidencia.trim(),
      tipo_servicio_id: values.tipo_servicio_id,
      modalidad_id: values.modalidad_id,
      modo_sugerido_id: values.modo_sugerido_id || null,
      modo_servicio_id: values.modo_servicio_id,
      motivo_cambio_modo: values.motivo_cambio_modo || null,
      caso_origen_id: datos.casoOrigenId,
    });

    if (!resultado.ok) {
      setErrorGlobal(resultado.error);
      setGuardando(false);
      return;
    }

    let errorProgramacion: string | null = null;
    if (programar) {
      const visita = await programar_visita(
        resultado.datos.id,
        programacion.tecnicoId,
        programacion.fecha,
        programacion.hora,
        programacion.adjuntoId || null,
      );
      if (!visita.ok) errorProgramacion = visita.error;
    }

    const lista = await tecnicos();
    const nombre = (id: string) => lista.find((item) => item.id === id)?.nombre_completo ?? null;
    setGuardando(false);
    onConfirmado({
      id: resultado.datos.id,
      numero: resultado.datos.numero,
      creadoEn: resultado.datos.creado_en,
      cliente: datos.clienteSeleccionado?.razon_social ?? '',
      programado: programar && !errorProgramacion,
      tecnico: programar && !errorProgramacion ? nombre(programacion.tecnicoId) : null,
      adjunto: programar && !errorProgramacion && programacion.adjuntoId ? nombre(programacion.adjuntoId) : null,
      fecha: programar && !errorProgramacion ? programacion.fecha : null,
      hora: programar && !errorProgramacion ? programacion.hora : null,
      errorProgramacion,
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto overflow-x-hidden">
      <EncabezadoNuevoCaso numeroOrigen={datos.numeroOrigen} />

      {errorGlobal && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <BloqueSolicitud form={form} canales={datos.catalogos.canales} />
          </div>
          <BloqueCliente
            form={form}
            queryCliente={datos.queryCliente}
            setQueryCliente={datos.setQueryCliente}
            clienteSeleccionado={datos.clienteSeleccionado}
            clientesResultados={datos.clientesResultados}
            buscando={datos.buscando}
            sedes={datos.sedes}
            contactos={datos.contactos}
            onSeleccionarCliente={datos.handleSeleccionarCliente}
            onCambiarCliente={datos.handleCambiarCliente}
            onContactoChange={datos.handleContactoChange}
            onSedeCreada={datos.registrarSede}
            onContactoCreado={datos.registrarContacto}
          />
          <BloqueEquipo
            form={form}
            clienteId={datos.clienteSeleccionado?.id ?? null}
            equipos={datos.equipos}
            equipoSeleccionado={datos.equipoSeleccionado}
            sedes={datos.sedes}
            lineas={datos.catalogos.lineas_maquina}
            cabezales={datos.catalogos.modelos_cabezal}
            onEquipoChange={datos.handleEquipoChange}
            onEquipoCreado={datos.registrarEquipo}
          />
          <BloqueServicio form={form} catalogos={datos.catalogos} sugerencia={datos.sugerencia} />
          <BloqueProgramar valor={programacion} onChange={setProgramacion} activo={programar} onActivoChange={setProgramar} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" className="min-h-11" onClick={() => router.back()} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" className="min-h-11" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar caso'}
          </Button>
        </div>
      </form>
    </div>
  );
}
