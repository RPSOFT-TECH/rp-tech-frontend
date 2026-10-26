import { redirect } from 'next/navigation';

// Forzar render dinámico para que el redirect ocurra en runtime,
// no durante el prerender estático de Next.js.
export const dynamic = 'force-dynamic';

/**
 * La raíz del sitio redirige siempre a /login.
 * La lógica de sesión y permisos vive en el middleware (Tarea 2).
 */
export default function RootPage() {
  redirect('/login');
}
