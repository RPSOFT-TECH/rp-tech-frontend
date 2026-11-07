'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { guardarAviso } from '@/components/avisos-sonner';
import { login, guardarSesion } from '@/lib/datos-simulados/actions';
import { pantallaInicio } from '@/lib/permisos';
import { AuthFormWrapper } from '../components/AuthFormWrapper';
import { LoginForm } from '../components/LoginForm';

export function LoginView() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(email: string, password: string) {
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
      const nombre = sesion.usuario.nombre_completo.split(' ')[0] || 'Usuario';
      guardarAviso(
        {
          variant: 'success',
          title: `Bienvenido, ${nombre}`,
          description: 'Inicio de sesión exitoso.',
        },
        true,
      );
      router.replace(pantallaInicio(sesion.rolesVigentes, sesion.empresa.permisos_consulta));
    } catch {
      setError('Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <AuthFormWrapper>
      <LoginForm
        isLoading={cargando}
        error={error}
        onSubmit={handleLogin}
      />
    </AuthFormWrapper>
  );
}
