// src/app/(app)/layout.tsx
// Server Component — define instant=false y envuelve el layout de cliente en Suspense

import { Suspense } from 'react';
import { AppShell } from '@/components/app-shell';

// Permite que las rutas de este grupo se bloqueen (no prerenderen instantáneamente)
// para poder usar hooks de navegación dinámicos en el AppShell.
export const instant = false;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
