'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CircleAlert, CircleCheck, Mail, Send } from 'lucide-react';
import {
  correo_config,
  guardar_correo_config,
  leerSesionEstable,
  probar_correo,
  quitar_correo_config,
  type ConfigCorreo,
  type PruebaCorreo,
} from '@/lib/datos/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const PROVEEDORES = [
  { id: 'gmail', nombre: 'Gmail', host: 'smtp.gmail.com', puerto: 465 },
  { id: 'outlook', nombre: 'Outlook / Microsoft 365', host: 'smtp.office365.com', puerto: 587 },
  { id: 'otro', nombre: 'Otro', host: '', puerto: 465 },
] as const;

export function CorreoAdmin() {
  const [empresaId] = useState<string | null>(() => leerSesionEstable()?.empresa.id ?? null);
  const [listo, setListo] = useState(() => !empresaId);
  const [guardado, setGuardado] = useState<ConfigCorreo | null>(null);
  const [host, setHost] = useState('');
  const [puerto, setPuerto] = useState('465');
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [borrarClave, setBorrarClave] = useState(false);
  const [remitente, setRemitente] = useState('');
  const [copia, setCopia] = useState('');
  const [para, setPara] = useState(() => leerSesionEstable()?.usuario.email ?? '');
  const [ocupado, setOcupado] = useState<'guardar' | 'probar' | 'quitar' | null>(null);
  const [prueba, setPrueba] = useState<PruebaCorreo | null>(null);

  const cargarEn = (c: ConfigCorreo | null) => {
    setGuardado(c);
    setHost(c?.host ?? '');
    setPuerto(String(c?.puerto ?? 465));
    setUsuario(c?.usuario ?? '');
    setRemitente(c?.remitente ?? '');
    setCopia(c?.copia ?? '');
    setClave('');
    setBorrarClave(false);
  };

  useEffect(() => {
    let vigente = true;
    if (!empresaId) return;
    correo_config(empresaId).then((r) => {
      if (!vigente) return;
      if (r.ok) cargarEn(r.datos);
      else toast.error(r.error);
      setListo(true);
    });
    return () => {
      vigente = false;
    };
  }, [empresaId]);

  const proveedor = PROVEEDORES.find((p) => p.host && p.host === host.trim())?.id ?? (host ? 'otro' : null);
  const elegirProveedor = (id: (typeof PROVEEDORES)[number]['id']) => {
    const p = PROVEEDORES.find((x) => x.id === id)!;
    setHost(p.host);
    setPuerto(String(p.puerto));
  };

  const guardar = async () => {
    if (!empresaId) return;
    setOcupado('guardar');
    const r = await guardar_correo_config(empresaId, {
      host,
      puerto: Number(puerto),
      usuario,
      remitente,
      copia,
      clave: borrarClave ? '' : clave ? clave : null,
    });
    setOcupado(null);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    cargarEn(r.datos);
    setPrueba(null);
    toast.success('Correo de envío guardado. Envía un correo de prueba para comprobarlo.');
  };

  const probar = async () => {
    if (!empresaId) return;
    setOcupado('probar');
    setPrueba(null);
    const r = await probar_correo(empresaId, para);
    setOcupado(null);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setPrueba(r.datos);
  };

  const quitar = async () => {
    if (!empresaId) return;
    setOcupado('quitar');
    const r = await quitar_correo_config(empresaId);
    setOcupado(null);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    cargarEn(null);
    setPrueba(null);
    toast.success('Se quitó el correo propio. Se usará el configurado en Supabase, si existe.');
  };

  if (!listo) return <p className="text-sm text-muted-foreground">Cargando correo de envío...</p>;

  const cambios = Boolean(clave) || borrarClave ||
    host !== (guardado?.host ?? '') || puerto !== String(guardado?.puerto ?? 465) || usuario !== (guardado?.usuario ?? '') ||
    remitente !== (guardado?.remitente ?? '') || copia !== (guardado?.copia ?? '');

  return (
    <form
      className="space-y-5 rounded-xl border border-border bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
    >
      <header className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Mail className="size-4" />
        </span>
        <div className="flex-1 space-y-0.5">
          <h2 className="text-base font-semibold text-foreground">Correo de envío</h2>
          <p className="text-sm text-muted-foreground">
            Desde esta cuenta se envía el PDF del reporte al cliente al cerrar cada visita.
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
            guardado ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-muted text-muted-foreground',
          )}
        >
          {guardado ? 'Configurado' : 'Sin configurar'}
        </span>
      </header>

      <div className="space-y-1.5">
        <Label>Proveedor</Label>
        <div className="flex flex-wrap gap-2">
          {PROVEEDORES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => elegirProveedor(p.id)}
              className={cn(
                'h-10 rounded-lg border px-3 text-sm font-medium transition-colors',
                proveedor === p.id ? 'border-primary bg-primary/10 text-primary' : 'border-input bg-card hover:bg-muted',
              )}
            >
              {p.nombre}
            </button>
          ))}
        </div>
        {proveedor === 'gmail' && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Gmail no acepta la contraseña normal de la cuenta. Activa la verificación en dos pasos y crea una{' '}
            <b>contraseña de aplicación</b> en la cuenta de Google (Seguridad → Contraseñas de aplicaciones). Usa esa clave de 16 letras aquí.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_8rem]">
        <div className="space-y-1.5">
          <Label htmlFor="smtp-host">Servidor</Label>
          <Input id="smtp-host" value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.gmail.com" autoComplete="off" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="smtp-puerto">Puerto</Label>
          <Input id="smtp-puerto" type="number" inputMode="numeric" value={puerto} onChange={(e) => setPuerto(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="smtp-usuario">Usuario</Label>
          <Input id="smtp-usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="reportes@tuempresa.com" autoComplete="off" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="smtp-clave">Contraseña</Label>
          <Input
            id="smtp-clave"
            type="password"
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              setBorrarClave(false);
            }}
            placeholder={guardado?.tiene_clave && !borrarClave ? 'Guardada · escribe para cambiarla' : 'Contraseña o clave de aplicación'}
            autoComplete="new-password"
          />
          {guardado?.tiene_clave && !clave && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              {borrarClave ? 'Se borrará al guardar.' : 'Hay una contraseña guardada. Nunca se muestra.'}
              <button type="button" onClick={() => setBorrarClave(!borrarClave)} className="font-semibold text-primary hover:underline">
                {borrarClave ? 'Mantenerla' : 'Borrarla'}
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="smtp-remitente">Remitente</Label>
          <Input
            id="smtp-remitente"
            value={remitente}
            onChange={(e) => setRemitente(e.target.value)}
            placeholder="GO Service <reportes@tuempresa.com>"
          />
          <p className="text-xs text-muted-foreground">Nombre y correo que verá el cliente. En Gmail debe ser el mismo correo del usuario.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="smtp-copia">
            Copia a la oficina <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Input id="smtp-copia" type="email" value={copia} onChange={(e) => setCopia(e.target.value)} placeholder="oficina@tuempresa.com" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {guardado && (
          <Button type="button" variant="ghost" className="h-10 text-destructive" disabled={ocupado !== null} onClick={() => void quitar()}>
            {ocupado === 'quitar' ? 'Quitando...' : 'Quitar configuración'}
          </Button>
        )}
        <Button type="submit" className="h-10" disabled={ocupado !== null || !cambios}>
          {ocupado === 'guardar' ? 'Guardando...' : 'Guardar correo'}
        </Button>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Probar el envío</p>
          <p className="text-xs text-muted-foreground">Usa lo último que guardaste. Guarda primero si hiciste cambios.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input type="email" value={para} onChange={(e) => setPara(e.target.value)} placeholder="Correo donde recibir la prueba" aria-label="Correo para la prueba" />
          <Button type="button" variant="outline" className="h-11 shrink-0 gap-2 md:h-10" disabled={ocupado !== null || cambios} onClick={() => void probar()}>
            <Send className="size-4" />
            {ocupado === 'probar' ? 'Enviando...' : 'Enviar correo de prueba'}
          </Button>
        </div>
        {prueba && (
          <div
            role="status"
            className={cn(
              'flex items-start gap-2 rounded-lg p-3 text-sm',
              prueba.estado === 'enviado'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-destructive/10 text-destructive',
            )}
          >
            {prueba.estado === 'enviado' ? <CircleCheck className="mt-0.5 size-4 shrink-0" /> : <CircleAlert className="mt-0.5 size-4 shrink-0" />}
            <span>
              {prueba.estado === 'enviado'
                ? `Correo de prueba enviado a ${prueba.destino}. Revisa la bandeja de entrada (y spam).`
                : prueba.detalle ?? 'No se pudo enviar el correo de prueba.'}
              {prueba.origen === 'supabase' && ' Se usó el correo configurado en Supabase.'}
            </span>
          </div>
        )}
      </div>
    </form>
  );
}
