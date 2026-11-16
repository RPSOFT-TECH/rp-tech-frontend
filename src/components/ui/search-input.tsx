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
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`h-11 w-full rounded-lg border border-input bg-card pr-10 pl-10 text-sm font-medium text-foreground transition-colors outline-none placeholder:font-normal placeholder:text-muted-foreground md:h-10 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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
