'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, guardarSesion } from '@/lib/datos-simulados/actions';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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