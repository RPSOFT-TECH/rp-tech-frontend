'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
feature/lista-casos
import { login, guardarSesion } from '@/lib/datos-simulados/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { login, guardarSesion } from '@/lib/datos-simulados/actions';
import { pantallaInicio } from '@/lib/permisos';
 main

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
feature/lista-casos
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const usuario = await login(email, password);
      if (!usuario) {
        setError('Credenciales incorrectas o contraseña inválida.');
        setCargando(false);
        return;
      }

      guardarSesion(usuario);

      // Redirección según rol especificado en el sistema
      if (usuario.rol === 'tecnico') {
        router.push('/mis-servicios');
      } else if (!usuario.activo || usuario.rol === 'ventas' as any) {
        router.push('/sin-acceso');
      } else {
        router.push('/casos');
      }
    } catch (err) {
      setError('Ocurrió un error al iniciar sesión.');
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">RP-TECH S.A.C.</h1>
          <p className="text-xs text-gray-500 mt-1">Sistema de Gestión de Servicios</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ej. coordinadora@rptech.test"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {cargando ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Contraseña general para pruebas: <span className="font-semibold text-gray-600">rptech123</span>
        </div>
      </div>
    </div>
  );
}
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const usuario = await login(email, password);

      if (!usuario) {
        setError('Correo o contraseña incorrectos');
        return;
      }

      // Usuario inactivo (ventas) → sin acceso
      if (!usuario.activo) {
        guardarSesion(usuario);
        router.push('/sin-acceso');
        return;
      }

      // Guardar sesión y redirigir a la pantalla de inicio del rol
      guardarSesion(usuario);
      router.push(pantallaInicio(usuario.rol));
    } catch {
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Título */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            RP-TECH
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sistema de órdenes de servicio técnico
          </p>
        </div>

        {/* Formulario */}
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
      </div>
    </div>
  );
}
main
