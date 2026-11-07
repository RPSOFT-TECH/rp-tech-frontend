'use client';

import { CustomSelect, type OpcionSelect } from '@/components/ui/custom-select';
import { SelectorFecha } from '@/components/ui/selector-fecha';

export function FiltroSelect({
  label,
  value,
  onChange,
  opciones,
  className,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  opciones: OpcionSelect[];
  className?: string;
}) {
  return <CustomSelect label={label} value={value} onChange={onChange} options={opciones} className={className} />;
}

export function FiltroFecha({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  className?: string;
}) {
  return <SelectorFecha label={label} value={value} onChange={onChange} className={className} />;
}
