import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function SinAccesoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Sin acceso</h1>
        <p className="text-muted-foreground">
          Tu usuario no tiene acceso. Pide al administrador que revise tu rol.
        </p>
        <Link href="/login" className={buttonVariants({ variant: 'outline' })}>
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
