'use client';

import { Suspense, useEffect, useLayoutEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { actualizar_desarrollo, crear_caso, programar_visita, tecnicos } from '@/lib/datos/actions';
import { nuevoCasoSchema, NuevoCasoFormValues } from '@/lib/validaciones/caso';
import { useNuevoCasoForm } from '../hooks/useNuevoCasoForm';
import {
  BloqueCliente,
  BloqueEquipo,
  BloqueServicio,
} from '../components';
import { BloqueProgramar, type ProgramacionVisita } from '../components/nuevo/BloqueProgramar';
import { EncabezadoNuevoCaso, marcaLima } from '../components/nuevo/EncabezadoNuevoCaso';
import { ConfirmacionCaso, type ConfirmacionCasoDatos } from '../components/nuevo/ConfirmacionCaso';
import { PlusCircle } from 'lucide-react';
import { useRegistrarTitulo } from '@/components/layout/header/PageTitleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const programacionVacia: ProgramacionVisita = {
  tecnicoId: '',
  adjuntoId: '',
  fecha: '',
  hora: '',
  numeroReporte: '',
  desarrolloServicio: '',
  adjuntoNombre: '',
  horaIngreso: '',
  horaSalida: '',
  numeroHoras: '',
  estado: 'por_programar',
};

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

  useLayoutEffect(() => {
    if (!confirmacion) return;
    return () => {
      setConfirmacion(null);
      setOrigenId(null);
      setClave((valor) => valor + 1);
    };
  }, [confirmacion]);

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
  const [programacion, setProgramacion] = useState<ProgramacionVisita>(programacionVacia);
  const [fechaHoraActual, setFechaHoraActual] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setFechaHoraActual(marcaLima()), 0);
    return () => clearTimeout(id);
  }, []);

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

    const tieneTecnico = !!programacion.tecnicoId;
    if (tieneTecnico && (!programacion.fecha || !programacion.hora)) {
      setErrorGlobal('Para programar la visita técnica asigna la fecha y la hora.');
      setGuardando(false);
      return;
    }
    if (tieneTecnico && programacion.adjuntoId && programacion.adjuntoId === programacion.tecnicoId) {
      setErrorGlobal('El técnico adjunto debe ser distinto del técnico asignado.');
      setGuardando(false);
      return;
    }

    const canalFinal = values.canal_id || datos.catalogos.canales[0]?.id || '';
    const modalidadFinal = values.modalidad_id || datos.catalogos.modalidades[0]?.id || '';

    const resultado = await crear_caso({
      canal_id: canalFinal,
      cliente_id: values.cliente_id,
      sede_id: values.sede_id,
      contacto_id: values.contacto_id,
      telefono: values.telefono,
      equipo_id: values.equipo_id,
      incidencia: values.incidencia.trim(),
      tipo_servicio_id: values.tipo_servicio_id,
      modalidad_id: modalidadFinal,
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
    if (tieneTecnico && programacion.fecha && programacion.hora) {
      const horasNum =
        programacion.numeroHoras && !isNaN(Number(programacion.numeroHoras))
          ? Number(programacion.numeroHoras)
          : null;

      const visita = await programar_visita(
        resultado.datos.id,
        programacion.tecnicoId,
        programacion.fecha,
        programacion.hora,
        programacion.adjuntoId || null,
        {
          numero_fisico: programacion.numeroReporte?.trim() || null,
          procedimiento: programacion.desarrolloServicio?.trim() || null,
          hora_llegada: programacion.horaIngreso?.trim() || null,
          hora_salida: programacion.horaSalida?.trim() || null,
          horas: horasNum,
          nombre_adjunto: programacion.adjuntoNombre?.trim() || null,
          estado: programacion.estado || 'programado',
        },
      );
      if (!visita.ok) {
        errorProgramacion = visita.error;
      }
    }

    const lista = await tecnicos();
    const nombre = (id: string) => lista.find((item) => item.id === id)?.nombre_completo ?? null;
    setGuardando(false);
    onConfirmado({
      id: resultado.datos.id,
      numero: resultado.datos.numero,
      creadoEn: resultado.datos.creado_en,
      cliente: datos.clienteSeleccionado?.razon_social ?? '',
      programado: tieneTecnico && !errorProgramacion,
      tecnico: tieneTecnico && !errorProgramacion ? nombre(programacion.tecnicoId) : null,
      adjunto: tieneTecnico && !errorProgramacion && programacion.adjuntoId ? nombre(programacion.adjuntoId) : null,
      fecha: tieneTecnico && !errorProgramacion ? programacion.fecha : null,
      hora: tieneTecnico && !errorProgramacion ? programacion.hora : null,
      errorProgramacion,
    });
  };

  const idsCampo: Partial<Record<keyof NuevoCasoFormValues, string>> = {
    cliente_id: 'empresa',
    sede_id: 'sede',
    contacto_id: 'contacto',
    equipo_id: 'equipo',
  };

  const irAlPrimerError = (errores: Partial<Record<keyof NuevoCasoFormValues, unknown>>) => {
    const orden: (keyof NuevoCasoFormValues)[] = [
      'cliente_id',
      'contacto_id',
      'sede_id',
      'telefono',
      'equipo_id',
      'tipo_servicio_id',
      'incidencia',
      'modo_servicio_id',
    ];
    const primero = orden.find((campo) => errores[campo]);
    if (!primero) return;
    const nodo = document.getElementById(idsCampo[primero] ?? primero);
    nodo?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    nodo?.focus({ preventScroll: true });
  };

  const handleNuevo = () => {
    form.reset();
    datos.handleCambiarCliente();
    setProgramacion(programacionVacia);
    setErrorGlobal(null);
  };

  return (
    <div className="mx-auto w-full max-w-5xl pb-28 md:pb-6">
      <EncabezadoNuevoCaso numeroOrigen={datos.numeroOrigen} />

      {errorGlobal && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorGlobal}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit, irAlPrimerError)} noValidate>
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-12 md:gap-x-4 md:gap-y-4 md:p-6">
            {/* ── Fila 0: N° de Caso + Fecha y Hora ── */}
            <div className="space-y-1.5 md:col-span-6">
              <Label htmlFor="num_caso">N°de Caso</Label>
              <Input
                id="num_caso"
                value="Por asignar"
                disabled
                className="bg-muted font-mono text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5 md:col-span-6">
              <Label htmlFor="fecha_hora">Fecha y Hora</Label>
              <Input
                id="fecha_hora"
                value={fechaHoraActual || 'Hora de Lima'}
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>

            {/* Fila 1: Empresa + Contacto / Fila 2: Dirección + Teléfono */}
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

            {/* Fila 3: Equipo + Cabezales + Tipo de Servicio */}
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
              catalogos={{ tipos_servicio: datos.catalogos.tipos_servicio }}
            />

            {/* Fila 4: Incidencia + Modo de servicio */}
            <BloqueServicio form={form} catalogos={datos.catalogos} sugerencia={datos.sugerencia} />

            {/* Sección 2: Tecnico, Fecha, hora, # Reporte, Desarrollo, Adjunto, Horas, Estado */}
            <BloqueProgramar valor={programacion} onChange={setProgramacion} />
          </div>

          {/* ── Botones de acción inferiores: Guardar, Buscar, Nuevo ── */}
          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-border bg-muted/30 px-6 py-4 rounded-b-xl">
            <Button
              type="submit"
              className="min-w-32 h-10 shadow-sm"
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-w-32 h-10 shadow-sm"
              onClick={() => router.push('/casos')}
            >
              Buscar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-w-32 h-10 shadow-sm"
              onClick={handleNuevo}
              disabled={guardando}
            >
              Nuevo
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
