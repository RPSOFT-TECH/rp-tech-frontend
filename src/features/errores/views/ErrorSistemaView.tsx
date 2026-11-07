'use client';

import { Button } from '@/components/ui/button';

export function ErrorSistemaView({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">RP-TECH</p>
      <h1 className="text-3xl font-black">No se pudo mostrar esta pantalla</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Ocurrió un error al cargar el módulo. Puedes reintentar sin perder la sesión.
      </p>
      <Button type="button" onClick={reset} className="min-h-11">
        Reintentar
      </Button>
    </div>
  );
}
