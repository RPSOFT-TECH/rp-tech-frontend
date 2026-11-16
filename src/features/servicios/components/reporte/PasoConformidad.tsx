'use client';

import { Textarea } from '@/components/ui/textarea';
import { SeccionReporte } from './SeccionReporte';
import type { FormularioReporte } from './tipo';
import { LienzoFirma } from './LienzoFirma';

export function PasoConformidad({ form }: { form: FormularioReporte }) {
  const {
    esPasoEditable,
    guardando,
    textoConformidad,
    setTextoConformidad,
    nombreOperadorFirma,
    setNombreOperadorFirma,
    firmaOperador,
    setFirmaOperador,
    nombreClienteFirma,
    setNombreClienteFirma,
    firmaCliente,
    setFirmaCliente,
    guardarFirmas,
  } = form;

  return (
    <>
      <SeccionReporte titulo="Texto de conformidad" ayuda="El cliente lo lee antes de firmar.">
        <Textarea
          id="texto_conformidad"
          value={textoConformidad}
          onChange={(e) => setTextoConformidad(e.target.value)}
          disabled={!esPasoEditable || guardando}
          rows={3}
          placeholder="Escribe el texto de conformidad..."
        />
      </SeccionReporte>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LienzoFirma
          titulo="Firma del operador"
          nombre={nombreOperadorFirma}
          onNombre={setNombreOperadorFirma}
          firma={firmaOperador}
          editable={esPasoEditable && !guardando}
          onFirma={(imagen) => {
            setFirmaOperador(imagen);
            void guardarFirmas(imagen, firmaCliente, nombreOperadorFirma, nombreClienteFirma);
          }}
          onBorrar={() => {
            setFirmaOperador(null);
            void guardarFirmas(null, firmaCliente, nombreOperadorFirma, nombreClienteFirma);
          }}
        />
        <LienzoFirma
          titulo="Firma del cliente"
          nombre={nombreClienteFirma}
          onNombre={setNombreClienteFirma}
          firma={firmaCliente}
          editable={esPasoEditable && !guardando}
          onFirma={(imagen) => {
            setFirmaCliente(imagen);
            void guardarFirmas(firmaOperador, imagen, nombreOperadorFirma, nombreClienteFirma);
          }}
          onBorrar={() => {
            setFirmaCliente(null);
            void guardarFirmas(firmaOperador, null, nombreOperadorFirma, nombreClienteFirma);
          }}
        />
      </div>
    </>
  );
}
