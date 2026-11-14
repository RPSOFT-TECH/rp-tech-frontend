'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { actualizar_parametros, leerSesionEstable, parametros_actuales } from '@/lib/datos/actions';
import { Button } from '@/components/ui';
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

  return (
    <form
      className="space-y-4 bg-card border border-border rounded-xl p-4"
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Campo id="formato-caso" label="Formato de caso" value={formatoCaso} onChange={setFormatoCaso} />
        <Campo id="formato-reporte" label="Formato de reporte" value={formatoReporte} onChange={setFormatoReporte} />
        <Campo id="garantia" label="Meses de garantía" value={garantia} onChange={setGarantia} tipo="number" />
        <Campo id="plazo" label="Plazo de misma falla (horas)" value={plazo} onChange={setPlazo} tipo="number" />
        <Campo id="tarifa" label="Tarifa no cubierta" value={tarifa} onChange={setTarifa} />
      </div>
      <Area id="conformidad" label="Texto de conformidad" value={conformidad} onChange={setConformidad} />
      <Area id="legal" label="Texto legal" value={legal} onChange={setLegal} />
      <label className="flex items-center gap-2 min-h-11 text-sm">
        <input type="checkbox" checked={correo} onChange={(e) => setCorreo(e.target.checked)} className="size-4" />
        Envío por correo
      </label>
      <label className="flex items-center gap-2 min-h-11 text-sm">
        <input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} className="size-4" />
        Envío por WhatsApp
      </label>
      <div className="space-y-2 border-t border-border pt-3">
        <p className="text-sm font-medium text-foreground">Datos del PDF</p>
        <label className="block space-y-1 text-sm" htmlFor="logo">
          <span className="font-medium text-foreground">Logo</span>
          <input id="logo" type="file" accept="image/*" onChange={(e) => leerLogo(e.target.files?.[0])} className={claseCampo} />
        </label>
        {logo && (
          <Image src={logo} alt="Vista previa del logo" width={160} height={64} className="h-16 w-auto object-contain" />
        )}
        {logo && (
          <Button type="button" variant="outline" className="min-h-11" onClick={() => setLogo(null)}>
            Quitar logo
          </Button>
        )}
        {[0, 1].map((indice) => (
          <div key={indice} className="space-y-2">
            <label className="block space-y-1 text-sm" htmlFor={`marcas-${indice}`}>
              <span className="font-medium text-foreground">
                Logos de marcas ({indice === 0 ? 'a la izquierda' : 'a la derecha'} del logo)
              </span>
              <input
                id={`marcas-${indice}`}
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => leerImagen(e.target.files?.[0], (valor) => cambiarMarca(indice, valor))}
                className={claseCampo}
              />
            </label>
            {marcas[indice] && (
              <div className="flex flex-wrap items-center gap-3">
                <Image src={marcas[indice] as string} alt="Vista previa de las marcas" width={280} height={48} className="h-12 w-auto object-contain" />
                <Button type="button" variant="outline" className="min-h-11" onClick={() => cambiarMarca(indice, null)}>
                  Quitar
                </Button>
              </div>
            )}
          </div>
        ))}
        <label className="flex items-center gap-3 text-sm" htmlFor="color-pdf">
          <span className="font-medium text-foreground">Color del PDF</span>
          <input id="color-pdf" type="color" value={colorPdf} onChange={(e) => setColorPdf(e.target.value)} className="h-10 w-14 cursor-pointer rounded border border-input bg-card" />
          <span className="font-mono text-xs text-muted-foreground">{colorPdf}</span>
        </label>
        <Campo id="direccion" label="Dirección" value={direccion} onChange={setDireccion} />
        <Campo id="telefonos" label="Teléfonos" value={telefonos} onChange={setTelefonos} placeholder="Separados por coma" />
        <Campo id="correos" label="Correos" value={correos} onChange={setCorreos} placeholder="Separados por coma" />
        <Campo id="redes" label="Redes" value={redes} onChange={setRedes} placeholder="Separadas por coma" />
      </div>
      <div className="flex justify-end">
        <Button type="submit" className="min-h-11">
          Guardar parámetros
        </Button>
      </div>
    </form>
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
    <label className="block space-y-1 text-sm" htmlFor={id}>
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
    <label className="block space-y-1 text-sm" htmlFor={id}>
      <span className="font-medium text-foreground">{label}</span>
      <textarea id={id} rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={claseCampo} />
    </label>
  );
}
