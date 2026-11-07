'use client';

import { ErrorSistemaView } from '@/features/errores/views/ErrorSistemaView';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorSistemaView error={error} reset={reset} />;
}
