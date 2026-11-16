'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { actualizar_parametros, leerSesionEstable, parametros_actuales } from '@/lib/datos/actions';
import { Button } from '@/components/ui';
import { Switch } from '@/components/ui/switch';
import { claseCampo } from '../comun/clases';

function unir(valores: string[]): string {
  return valores.join(', ');
}

function partir(texto: string): string[] {
  return texto
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ParametrosAdmin() {
  const [listo, setListo] = useState(false);
  const [formatoCaso, setFormatoCaso] = useState('');
  const [formatoReporte, setFormatoReporte] = useState('');
  const [garantia, setGarantia] = useState('');
  const [plazo, setPlazo] = useState('');
  const [tarifa, setTarifa] = useState('');
  const [conformidad, setConformidad] = useState('');
  const [legal, setLegal] = useState('');
  const [correo, setCorreo] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [direccion, setDireccion] = useState('');
  const [telefonos, setTelefonos] = useState('');
  const [correos, setCorreos] = useState('');
  const [redes, setRedes] = useState('');
  const [marcas, setMarcas] = useState<(string | null)[]>([null, null]);
  const [colorPdf, setColorPdf] = useState('#8a3d8f');

  useEffect(() => {
    let vigente = true;
    parametros_actuales().then((datos) => {
      if (!vigente || !datos) {
        if (vigente) setListo(true);
        return;
      }
      setFormatoCaso(datos.formato_caso);
      setFormatoReporte(datos.formato_reporte);
      setGarantia(String(datos.garantia_meses));
      setPlazo(String(datos.plazo_misma_falla_horas));
      setTarifa(datos.tarifa_no_cubierta);
      setConformidad(datos.texto_conformidad);
      setLegal(datos.texto_legal);
      setCorreo(datos.envio_correo);
      setWhatsapp(datos.envio_whatsapp);
      setLogo(datos.pdf.logo);
      setDireccion(datos.pdf.direccion);
      setTelefonos(unir(datos.pdf.telefonos));
      setCorreos(unir(datos.pdf.correos));
      setRedes(unir(datos.pdf.redes));
      setMarcas([datos.pdf.marcas?.[0] ?? null, datos.pdf.marcas?.[1] ?? null]);
      if (datos.pdf.color) setColorPdf(datos.pdf.color);
      setListo(true);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const leerImagen = (archivo: File | undefined, guardarEn: (valor: string) => void) => {
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result === 'string') guardarEn(lector.result);
    };
    lector.readAsDataURL(archivo);
  };
  const leerLogo = (archivo: File | undefined) => leerImagen(archivo, setLogo);
  const cambiarMarca = (indice: number, valor: string | null) =>
    setMarcas((actual) => actual.map((m, i) => (i === indice ? valor : m)));

  const guardar = async () => {
    const empresaId = leerSesionEstable()?.empresa.id;
    if (!empresaId) {
      toast.error('Inicia sesión para continuar.');
      return;
    }
    const meses = Number(garantia);
    const horas = Number(plazo);
    if (!Number.isFinite(meses) || meses < 0 || !Number.isFinite(horas) || horas < 0) {
      toast.error('Indica meses de garantía y plazo en horas.');
      return;
    }
    const resultado = await actualizar_parametros(empresaId, {
      formato_caso: formatoCaso.trim(),
      formato_reporte: formatoReporte.trim(),
      garantia_meses: meses,
      plazo_misma_falla_horas: horas,
      tarifa_no_cubierta: tarifa.trim(),
      texto_conformidad: conformidad.trim(),
      texto_legal: legal.trim(),
      envio_correo: correo,
      envio_whatsapp: whatsapp,
      pdf: {
        logo,
        direccion: direccion.trim(),
        telefonos: partir(telefonos),
        correos: partir(correos),
        redes: partir(redes),
        marcas,
        color: /^#[0-9a-f]{6}$/i.test(colorPdf) ? colorPdf : null,
      },
    });
    if (!resultado.ok) {
      toast.error(resultado.error);
      return;
    }
    toast.success('Parámetros guardados');
  };

  if (!listo) return <p className="text-sm text-muted-foreground">Cargando parámetros...</p>;

  const colorValido = /^#[0-9a-f]{6}$/i.test(colorPdf) ? colorPdf : '#2563eb';
  return (
    <form
      id="form-parametros"
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
    >
      <Seccion titulo="Numeración" ayuda="Formato del número de caso y del número de reporte.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo id="formato-caso" label="Formato de caso" value={formatoCaso} onChange={setFormatoCaso} />
          <Campo id="formato-reporte" label="Formato de reporte" value={formatoReporte} onChange={setFormatoReporte} />
        </div>
      </Seccion>
      <Seccion titulo="Garantía y plazos" ayuda="Se usan para detectar visitas en garantía y la misma falla.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Campo id="garantia" label="Meses de garantía" value={garantia} onChange={setGarantia} tipo="number" />
          <Campo id="plazo" label="Plazo de misma falla (horas)" value={plazo} onChange={setPlazo} tipo="number" />
          <Campo id="tarifa" label="Tarifa no cubierta" value={tarifa} onChange={setTarifa} />
        </div>
      </Seccion>
      <Seccion titulo="Textos del reporte" ayuda="Aparecen al pie del reporte que firma el cliente.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Area id="conformidad" label="Texto de conformidad" value={conformidad} onChange={setConformidad} />
          <Area id="legal" label="Texto legal" value={legal} onChange={setLegal} />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border pt-3">
          <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
            <Switch checked={correo} onCheckedChange={setCorreo} />
            Enviar el reporte por correo
          </label>
          <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
            <Switch checked={whatsapp} onCheckedChange={setWhatsapp} />
            Enviar el reporte por WhatsApp
          </label>
        </div>
      </Seccion>
      <Seccion titulo="PDF del reporte" ayuda="Así se ve el encabezado y pie del reporte que recibe el cliente.">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_15rem]">
          <div className="space-y-4">
            <div className="space-y-1.5 text-sm">
              <span className="font-medium text-foreground">Logo</span>
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-input p-3">
                <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                  {logo ? <Image src={logo} alt="Logo" width={56} height={56} className="size-14 object-contain" /> : <span className="text-xs text-muted-foreground">Sin logo</span>}
                </div>
                <label htmlFor="logo" className="flex-1 cursor-pointer text-muted-foreground">
                  <span className="font-semibold text-primary">Elegir imagen</span> · PNG o JPG
                  <input id="logo" type="file" accept="image/*" onChange={(e) => leerLogo(e.target.files?.[0])} className="sr-only" />
                </label>
                {logo && (
                  <Button type="button" variant="ghost" className="h-9" onClick={() => setLogo(null)}>
                    Quitar
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[0, 1].map((indice) => (
                <div key={indice} className="space-y-1.5 text-sm">
                  <span className="font-medium text-foreground">Marcas a la {indice === 0 ? 'izquierda' : 'derecha'}</span>
                  <div className="flex min-h-14 items-center gap-2 rounded-lg border border-dashed border-input p-2">
                    {marcas[indice] ? (
                      <Image src={marcas[indice] as string} alt="Marcas" width={160} height={40} className="h-10 w-auto flex-1 object-contain object-left" />
                    ) : (
                      <span className="flex-1 px-1 text-muted-foreground">Sin imagen</span>
                    )}
                    <label htmlFor={`marcas-${indice}`} className="cursor-pointer rounded-md px-2 py-1 font-semibold text-primary hover:bg-accent">
                      {marcas[indice] ? 'Cambiar' : 'Elegir'}
                      <input
                        id={`marcas-${indice}`}
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={(e) => leerImagen(e.target.files?.[0], (valor) => cambiarMarca(indice, valor))}
                        className="sr-only"
                      />
                    </label>
                    {marcas[indice] && (
                      <button type="button" onClick={() => cambiarMarca(indice, null)} className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted">
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_1fr]">
              <label className="block space-y-1.5 text-sm" htmlFor="color-pdf">
                <span className="font-medium text-foreground">Color</span>
                <span className="flex items-center gap-2">
                  <input id="color-pdf" type="color" value={colorValido} onChange={(e) => setColorPdf(e.target.value)} className="h-10 w-12 cursor-pointer rounded-md border border-input bg-card" />
                  <span className="font-mono text-xs text-muted-foreground">{colorPdf}</span>
                </span>
              </label>
              <Campo id="telefonos" label="Teléfonos" value={telefonos} onChange={setTelefonos} placeholder="Separados por coma" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo id="correos" label="Correos" value={correos} onChange={setCorreos} placeholder="Separados por coma" />
              <Campo id="redes" label="Redes" value={redes} onChange={setRedes} placeholder="Separadas por coma" />
            </div>
            <Campo id="direccion" label="Dirección" value={direccion} onChange={setDireccion} />
          </div>
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Vista previa</span>
            <div className="flex aspect-[8.5/11] flex-col overflow-hidden rounded-lg border border-border bg-white text-neutral-800 shadow-md">
              <div className="h-2" style={{ background: '#3a3a47', borderBottom: `3px solid ${colorValido}` }} />
              <div className="flex items-center justify-between gap-1 px-2 py-2">
                <div className="h-6 w-14">{marcas[0] && <Image src={marcas[0]} alt="" width={56} height={24} className="h-6 w-14 object-contain" />}</div>
                <div className="grid size-10 place-items-center overflow-hidden rounded-full bg-neutral-100">
                  {logo && <Image src={logo} alt="" width={40} height={40} className="size-10 object-contain" />}
                </div>
                <div className="h-6 w-14">{marcas[1] && <Image src={marcas[1]} alt="" width={56} height={24} className="h-6 w-14 object-contain" />}</div>
              </div>
              <p className="text-center text-[8px] font-bold">
                REPORTE TÉCNICO <span className="text-red-600">N° {formatoReporte || 'RT-0001'}</span>
              </p>
              <div className="flex flex-col gap-1 px-2.5 py-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-2 rounded-sm border border-neutral-300" />
                ))}
                <div className="h-8 rounded border border-neutral-300" />
                <div className="h-3 rounded border border-neutral-300" />
              </div>
              <div className="mt-auto px-2 pb-1 text-center text-[6px] text-neutral-500">{direccion}</div>
              <div className="h-4" style={{ background: '#3a3a47', borderTop: `2px solid ${colorValido}` }} />
            </div>
          </div>
        </div>
      </Seccion>
      <div className="sticky bottom-0 z-10 -mx-1 flex justify-end rounded-xl border border-border bg-card/95 p-3 shadow-md backdrop-blur">
        <Button type="submit" className="h-11 px-5 md:h-10">
          Guardar parámetros
        </Button>
      </div>
    </form>
  );
}

function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <header>
        <h3 className="text-base font-semibold">{titulo}</h3>
        <p className="text-sm text-muted-foreground">{ayuda}</p>
      </header>
      {children}
    </section>
  );
}

function Campo({
  id,
  label,
  value,
  onChange,
  tipo = 'text',
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  tipo?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm" htmlFor={id}>
      <span className="font-medium text-foreground">{label}</span>
      <input
        id={id}
        type={tipo}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={claseCampo}
      />
    </label>
  );
}

function Area({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (valor: string) => void }) {
  return (
    <label className="block space-y-1.5 text-sm" htmlFor={id}>
      <span className="font-medium text-foreground">{label}</span>
      <textarea id={id} rows={4} value={value} onChange={(e) => onChange(e.target.value)} className={`${claseCampo} h-auto py-2 md:h-auto`} />
    </label>
  );
}
