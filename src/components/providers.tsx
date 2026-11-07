'use client';

import { Suspense } from 'react';
import { ThemeProvider } from 'next-themes';
import { ConsumirAvisos } from '@/components/avisos-sonner';
import { ToastProvider } from '@/contexts/ToastContext';
import { SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider delayDuration={200}>
        <ToastProvider>
          {children}
          <SonnerToaster />
          <Suspense fallback={null}>
            <ConsumirAvisos />
          </Suspense>
        </ToastProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
