import type { ReactNode } from 'react';

export function FiltroSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-lg px-2.5 py-2 text-sm bg-background text-foreground min-h-11"
      >
        {children}
      </select>
    </div>
  );
}

export function FiltroFecha({ label, value, onChange }: { label: string; value: string; onChange: (valor: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-lg px-2 py-2 text-xs bg-background text-foreground min-h-11"
      />
    </div>
  );
}
