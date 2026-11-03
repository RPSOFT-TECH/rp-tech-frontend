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
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full h-11 pl-9 pr-9 text-sm bg-background text-foreground border border-border rounded-lg shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {tieneValor && onClear && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors"
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
