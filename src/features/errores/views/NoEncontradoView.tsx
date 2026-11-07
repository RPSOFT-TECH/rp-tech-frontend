import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export function NoEncontradoView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">RP-TECH</p>
      <h1 className="text-3xl font-black">Página no encontrada</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        La ruta no existe en el sistema de órdenes de servicio.
      </p>
      <Link href="/casos" className={buttonVariants({ variant: 'default', className: 'min-h-11' })}>
        Ir a casos
      </Link>
    </div>
  );
}
