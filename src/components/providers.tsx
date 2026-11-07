'use client';

import { ThemeProvider } from 'next-themes';
import { ToastProvider } from '@/contexts/ToastContext';
import { SonnerToaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ToastProvider>
        {children}
        <SonnerToaster />
      </ToastProvider>
    </ThemeProvider>
  );
}
