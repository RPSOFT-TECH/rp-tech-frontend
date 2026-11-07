'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Loader2 } from 'lucide-react';

interface LoadingActionModalProps {
  open: boolean;
  title?: string;
  description?: string;
}

export function LoadingActionModal({
  open,
  title = 'Procesando...',
  description = 'Espera un momento.',
}: LoadingActionModalProps) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[101] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-8 text-center outline-none">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-primary" />
          <Dialog.Title className="text-lg font-bold text-foreground">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">{description}</Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
