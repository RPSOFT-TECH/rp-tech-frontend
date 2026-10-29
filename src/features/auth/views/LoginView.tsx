'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { login, guardarSesion } from '@/lib/datos-simulados/actions';
import { pantallaInicio } from '@/lib/permisos';

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const sesion = await login(email, password);

      if (!sesion) {
        setError('Correo o contraseña incorrectos');
        return;
      }

      if (sesion.rolesVigentes.length === 0) {
        guardarSesion(sesion);
        router.push('/sin-acceso');
        return;
      }

      guardarSesion(sesion);
      router.push(pantallaInicio(sesion.rolesVigentes));
    } catch {
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            RP-TECH
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sistema de órdenes de servicio técnico
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={cargando}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={cargando}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Credenciales de prueba: password común <code className="bg-muted px-1.5 py-0.5 rounded">rptech123</code></p>
        </div>
      </div>
    </div>
  );
}
