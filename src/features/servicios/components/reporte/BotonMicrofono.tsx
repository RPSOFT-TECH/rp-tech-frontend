'use client';

import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BotonMicrofonoProps {
  onTexto: (dictado: string) => void;
  className?: string;
}

export function BotonMicrofono({ onTexto, className }: BotonMicrofonoProps) {
  const [escuchando, setEscuchando] = useState(false);

  const toggleGrabacion = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tu navegador o celular no soporta reconocimiento de voz nativo. Puedes usar el micrófono de tu teclado.');
      return;
    }

    if (escuchando) {
      setEscuchando(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-PE';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setEscuchando(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const texto = event.results[0]?.[0]?.transcript;
        if (texto) {
          onTexto(texto);
        }
      };

      recognition.onerror = () => {
        setEscuchando(false);
      };

      recognition.onend = () => {
        setEscuchando(false);
      };

      recognition.start();
    } catch {
      setEscuchando(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleGrabacion}
      className={`h-8 gap-1.5 text-xs font-medium transition-all ${
        escuchando
          ? 'border-red-500 bg-red-50 text-red-600 animate-pulse dark:bg-red-950/40 dark:text-red-400'
          : 'text-muted-foreground hover:text-foreground'
      } ${className ?? ''}`}
      title={escuchando ? 'Detener dictado' : 'Dictar con el micrófono'}
    >
      {escuchando ? (
        <>
          <MicOff className="size-3.5 text-red-500" />
          <span>Escuchando...</span>
        </>
      ) : (
        <>
          <Mic className="size-3.5" />
          <span>Dictar</span>
        </>
      )}
    </Button>
  );
}
