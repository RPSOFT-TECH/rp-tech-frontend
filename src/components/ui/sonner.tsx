'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';

export function SonnerToaster() {
  const { theme = 'system' } = useTheme();

  return (
    <Toaster
      theme={theme as 'light' | 'dark' | 'system'}
      position="top-right"
      offset="16px"
      gap={10}
      visibleToasts={5}
      closeButton={false}
    />
  );
}
