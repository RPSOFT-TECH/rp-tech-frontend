import { useState, useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import {
  buscarClientes,
  obtenerContactos,
  obtenerSedes,
  obtenerEquipos,
  obtenerCatalogos,
  sugerirModoServicio,
  SugerenciaModo,
} from '@/lib/datos-simulados/actions';
import { Cliente } from '@/lib/datos-simulados/clientes';
import { Contacto } from '@/lib/datos-simulados/contactos';
import { Sede } from '@/lib/datos-simulados/sedes';
import { Equipo } from '@/lib/datos-simulados/equipos';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';

export function useNuevoCasoForm(setValue: UseFormSetValue<NuevoCasoFormValues>) {
  const [queryCliente, setQueryCliente] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [clientesResultados, setClientesResultados] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [sinResultados, setSinResultados] = useState(false);

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);
  const [sugerencia, setSugerencia] = useState<SugerenciaModo | null>(null);

  const [catalogos, setCatalogos] = useState<{
    tipos_servicio: { id: number; nombre: string }[];
    modos_servicio: { id: number; nombre: string }[];
    modalidades: { id: number; nombre: string }[];
    canales: { id: number; nombre: string }[];
  }>({
    tipos_servicio: [],
    modos_servicio: [],
    modalidades: [],
    canales: [],
  });

  useEffect(() => {
    async function cargarCat() {
      const data = await obtenerCatalogos();
      setCatalogos({
        tipos_servicio: data.tipos_servicio,
        modos_servicio: data.modos_servicio,
        modalidades: data.modalidades,
        canales: data.canales,
      });
    }
    cargarCat();
  }, []);

  useEffect(() => {
    if (clienteSeleccionado) return;

    const queryLimpia = queryCliente.trim();
    if (queryLimpia.length < 2) {
      setClientesResultados([]);
      setSinResultados(false);
      return;
    }

    setBuscando(true);
    const timer = setTimeout(async () => {
      try {
        const res = await buscarClientes(queryLimpia);
        setClientesResultados(res);
        setSinResultados(res.length === 0);
      } catch {
        setClientesResultados([]);
        setSinResultados(true);
      } finally {
        setBuscando(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [queryCliente, clienteSeleccionado]);

  const handleSeleccionarCliente = async (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setQueryCliente(cliente.razon_social);
    setClientesResultados([]);
    setSinResultados(false);
    setValue('cliente_id', String(cliente.id), { shouldValidate: true });

    const [conts, seds, eqs] = await Promise.all([
      obtenerContactos(cliente.id),
      obtenerSedes(cliente.id),
      obtenerEquipos(cliente.id),
    ]);

    setContactos(conts);
    setSedes(seds);
    setEquipos(eqs);

    if (conts.length > 0) {
      const primerContacto = conts[0];
      setValue('contacto_id', String(primerContacto.id), { shouldValidate: true });
      setValue('telefono', primerContacto.telefono || cliente.telefono || '', {
        shouldValidate: true,
      });
    } else {
      setValue('contacto_id', '');
      setValue('telefono', cliente.telefono || '');
    }

    if (seds.length > 0) {
      const principal = seds.find((s) => s.principal) || seds[0];
      setValue('sede_id', String(principal.id), { shouldValidate: true });
    } else {
      setValue('sede_id', '');
    }

    if (eqs.length === 1) {
      const unico = eqs[0];
      aplicarEquipo(unico, cliente);
    } else {
      setEquipoSeleccionado(null);
      setSugerencia(null);
      setValue('equipo_id', '');
    }
  };

  const aplicarEquipo = (eq: Equipo, cli: Cliente) => {
    setEquipoSeleccionado(eq);
    setValue('equipo_id', String(eq.id), { shouldValidate: true });

    if (eq.sede_id) {
      setValue('sede_id', String(eq.sede_id), { shouldValidate: true });
    }

    const sug = sugerirModoServicio(eq, cli);
    setSugerencia(sug);
    setValue('modo_sugerido', sug.modo);
    setValue('modo_servicio', sug.modo, { shouldValidate: true });
    setValue('motivo_cambio_modo', '');
  };

  const handleCambiarCliente = () => {
    setClienteSeleccionado(null);
    setQueryCliente('');
    setClientesResultados([]);
    setSinResultados(false);
    setContactos([]);
    setSedes([]);
    setEquipos([]);
    setEquipoSeleccionado(null);
    setSugerencia(null);

    setValue('cliente_id', '', { shouldValidate: true });
    setValue('contacto_id', '');
    setValue('sede_id', '');
    setValue('telefono', '');
    setValue('equipo_id', '');
    setValue('modo_sugerido', '');
    setValue('modo_servicio', '');
    setValue('motivo_cambio_modo', '');
  };

  const handleContactoChange = (contactoIdStr: string) => {
    setValue('contacto_id', contactoIdStr, { shouldValidate: true });
    const contacto = contactos.find((c) => String(c.id) === contactoIdStr);
    if (contacto) {
      setValue('telefono', contacto.telefono || clienteSeleccionado?.telefono || '', {
        shouldValidate: true,
      });
    }
  };

  const handleEquipoChange = (equipoIdStr: string) => {
    setValue('equipo_id', equipoIdStr, { shouldValidate: true });
    const eq = equipos.find((e) => String(e.id) === equipoIdStr);
    if (eq && clienteSeleccionado) {
      aplicarEquipo(eq, clienteSeleccionado);
    } else {
      setEquipoSeleccionado(null);
      setSugerencia(null);
    }
  };

  return {
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
  };
}
