'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  contenedorClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = 'Buscar...', className = '', contenedorClassName = '', disabled, ...props }, ref) => {
    const tieneValor = Boolean(value && String(value).length > 0);

    return (
      <div className={`relative flex items-center w-full ${contenedorClassName}`}>
        <Search className="pointer-events-none absolute left-3.5 size-[18px] text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border border-border bg-card pr-10 pl-11 text-[15px] font-semibold text-foreground shadow-sm transition-colors outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
        {tieneValor && onClear && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
