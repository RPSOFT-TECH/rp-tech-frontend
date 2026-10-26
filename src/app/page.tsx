import { redirect } from 'next/navigation';

/**
 * La raíz del sitio redirige siempre a /login.
 * La lógica de sesión y permisos vive en el middleware (Tarea 2).
 */
export default function RootPage() {
  redirect('/login');
}
