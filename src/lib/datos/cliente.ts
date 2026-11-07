// Cliente de Supabase del navegador. Solo usa la URL y la clave Publishable:
// la clave Secret nunca va en el frontend. Quien protege los datos es la base (RLS).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const CLAVE_PUBLICA = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

let instancia: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (instancia) return instancia;
  if (!URL_SUPABASE || !CLAVE_PUBLICA) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local (ver .env.example).',
    );
  }
  instancia = createClient(URL_SUPABASE, CLAVE_PUBLICA, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return instancia;
}
