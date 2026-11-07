import { useState, useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import {
  buscar_clientes,
  casos_lista,
  obtener_contactos,
  obtener_sedes,
  obtener_equipos,
  obtener_catalogos,
  sugerir_modo_servicio,
  type CatalogosActivos,
  type Cliente,
  type Contacto,
  type Sede,
  type EquipoVista,
  type SugerenciaModo,
} from '@/lib/datos/actions';
import { NuevoCasoFormValues } from '@/lib/validaciones/caso';

const catalogosVacios: CatalogosActivos = {
  tipos_servicio: [],
  modos_servicio: [],
  modalidades: [],
  canales: [],
  lineas_maquina: [],
  modelos_cabezal: [],
  motivos_espera: [],
  repuestos: [],
};

export function useNuevoCasoForm(setValue: UseFormSetValue<NuevoCasoFormValues>, origenId: string | null) {
  const [queryCliente, setQueryCliente] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [clientesResultados, setClientesResultados] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [sinResultados, setSinResultados] = useState(false);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [equipos, setEquipos] = useState<EquipoVista[]>([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<EquipoVista | null>(null);
  const [sugerencia, setSugerencia] = useState<SugerenciaModo | null>(null);
  const [catalogos, setCatalogos] = useState<CatalogosActivos>(catalogosVacios);
  const [numeroOrigen, setNumeroOrigen] = useState<string | null>(null);
  const [casoOrigenId, setCasoOrigenId] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    obtener_catalogos().then((data) => {
      if (!activo) return;
      setCatalogos(data);
      if (data.canales[0]) setValue('canal_id', data.canales[0].id);
    });
    return () => {
      activo = false;
    };
  }, [setValue]);

  useEffect(() => {
    if (clienteSeleccionado) return;
    const queryLimpia = queryCliente.trim();
    if (queryLimpia.length < 2) return;
    let cancelado = false;
    const timer = setTimeout(() => {
      setBuscando(true);
      buscar_clientes(queryLimpia)
        .then((res) => {
          if (cancelado) return;
          setClientesResultados(res);
          setSinResultados(res.length === 0);
        })
        .catch(() => {
          if (cancelado) return;
          setClientesResultados([]);
          setSinResultados(true);
        })
        .finally(() => {
          if (!cancelado) setBuscando(false);
        });
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [queryCliente, clienteSeleccionado]);

  const aplicarEquipo = async (eq: EquipoVista) => {
    setEquipoSeleccionado(eq);
    setValue('equipo_id', eq.id, { shouldValidate: true });
    if (eq.sede_id) setValue('sede_id', eq.sede_id, { shouldValidate: true });
    const res = await sugerir_modo_servicio(eq.id);
    if (!res.ok) {
      setSugerencia(null);
      return;
    }
    setSugerencia(res.datos);
    setValue('modo_sugerido_id', res.datos.modo_id);
    setValue('modo_servicio_id', res.datos.modo_id, { shouldValidate: true });
    setValue('motivo_cambio_modo', '');
  };

  const handleSeleccionarCliente = async (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setQueryCliente(cliente.razon_social);
    setClientesResultados([]);
    setSinResultados(false);
    setValue('cliente_id', cliente.id, { shouldValidate: true });

    const [conts, seds, eqs] = await Promise.all([
      obtener_contactos(cliente.id),
      obtener_sedes(cliente.id),
      obtener_equipos(cliente.id),
    ]);
    setContactos(conts);
    setSedes(seds);
    setEquipos(eqs);

    const primerContacto = conts[0];
    setValue('contacto_id', primerContacto?.id ?? '');
    setValue('telefono', primerContacto?.telefono || cliente.telefono || '', { shouldValidate: true });
    const principal = seds.find((sede) => sede.principal) || seds[0];
    setValue('sede_id', principal?.id ?? '');
    if (eqs.length === 1) {
      await aplicarEquipo(eqs[0]);
    } else {
      setEquipoSeleccionado(null);
      setSugerencia(null);
      setValue('equipo_id', '');
    }
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
    setValue('modo_sugerido_id', '');
    setValue('modo_servicio_id', '');
    setValue('motivo_cambio_modo', '');
  };

  const handleContactoChange = (contactoId: string) => {
    setValue('contacto_id', contactoId, { shouldValidate: true });
    const contacto = contactos.find((item) => item.id === contactoId);
    if (contacto) {
      setValue('telefono', contacto.telefono || clienteSeleccionado?.telefono || '', { shouldValidate: true });
    }
  };

  const handleEquipoChange = (equipoId: string) => {
    const eq = equipos.find((item) => item.id === equipoId);
    if (eq) {
      void aplicarEquipo(eq);
      return;
    }
    setValue('equipo_id', equipoId, { shouldValidate: true });
    setEquipoSeleccionado(null);
    setSugerencia(null);
  };

  const registrarSede = (sede: Sede) => {
    setSedes((prev) => {
      const base = sede.principal ? prev.map((item) => ({ ...item, principal: false })) : prev;
      return [...base.filter((item) => item.id !== sede.id), sede];
    });
    setValue('sede_id', sede.id, { shouldValidate: true });
  };

  const registrarContacto = (contacto: Contacto) => {
    setContactos((prev) => [...prev.filter((item) => item.id !== contacto.id), contacto]);
    setValue('contacto_id', contacto.id, { shouldValidate: true });
    setValue('telefono', contacto.telefono || clienteSeleccionado?.telefono || '', { shouldValidate: true });
  };

  const registrarEquipo = (equipo: EquipoVista) => {
    setEquipos((prev) => [...prev.filter((item) => item.id !== equipo.id), equipo]);
    void aplicarEquipo(equipo);
  };

  useEffect(() => {
    if (!origenId) return;
    let cancelado = false;
    casos_lista().then(async (lista) => {
      if (cancelado) return;
      const caso = lista.find((item) => item.id === origenId);
      if (!caso) return;
      setNumeroOrigen(caso.numero);
      setCasoOrigenId(caso.id);
      const hallados = await buscar_clientes(caso.cliente_razon_social);
      if (cancelado) return;
      const cliente = hallados.find((item) => item.id === caso.cliente_id);
      if (!cliente) return;
      setClienteSeleccionado(cliente);
      setQueryCliente(cliente.razon_social);
      setClientesResultados([]);
      setSinResultados(false);
      setValue('cliente_id', cliente.id, { shouldValidate: true });
      const [conts, seds, eqs] = await Promise.all([
        obtener_contactos(cliente.id),
        obtener_sedes(cliente.id),
        obtener_equipos(cliente.id),
      ]);
      if (cancelado) return;
      setContactos(conts);
      setSedes(seds);
      setEquipos(eqs);
      const equipo = eqs.find((item) => item.id === caso.equipo_id);
      if (equipo) {
        setEquipoSeleccionado(equipo);
        setValue('equipo_id', equipo.id, { shouldValidate: true });
        const sugerido = await sugerir_modo_servicio(equipo.id);
        if (!cancelado && sugerido.ok) {
          setSugerencia(sugerido.datos);
          setValue('modo_sugerido_id', sugerido.datos.modo_id);
          setValue('modo_servicio_id', sugerido.datos.modo_id, { shouldValidate: true });
          setValue('motivo_cambio_modo', '');
        }
      }
      if (cancelado) return;
      setValue('sede_id', caso.sede_id, { shouldValidate: true });
      setValue('contacto_id', caso.contacto_id, { shouldValidate: true });
      setValue('telefono', caso.telefono, { shouldValidate: true });
    });
    return () => {
      cancelado = true;
    };
  }, [origenId, setValue]);

  return {
    queryCliente,
    setQueryCliente,
    buscando,
    clientesResultados: clienteSeleccionado || queryCliente.trim().length < 2 ? [] : clientesResultados,
    clienteSeleccionado,
    sinResultados: !clienteSeleccionado && queryCliente.trim().length >= 2 && sinResultados,
    sedes,
    contactos,
    equipos,
    equipoSeleccionado,
    sugerencia,
    catalogos,
    numeroOrigen,
    casoOrigenId,
    handleSeleccionarCliente,
    handleCambiarCliente,
    handleContactoChange,
    handleEquipoChange,
    registrarSede,
    registrarContacto,
    registrarEquipo,
  };
}
