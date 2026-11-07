'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';

export function SonnerToaster() {
  const { theme = 'system' } = useTheme();

  return (
    <Toaster
      theme={theme as 'light' | 'dark' | 'system'}
      position="top-right"
      offset={71}
      gap={10}
      visibleToasts={5}
      closeButton={false}
    />
  );
}
