'use client';

import * as React from 'react';
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
  isLoading: boolean;
  error: string;
  onSubmit: (email: string, password: string) => void;
}

export function LoginForm({ isLoading, error, onSubmit }: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
          Bienvenido de nuevo
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="size-4 shrink-0" strokeWidth={2} />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">
            Correo electrónico
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="coordinador@rptech.test"
            autoComplete="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 min-h-11 text-xs rounded-xl bg-muted/40 border-border/60 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/10 placeholder:text-muted-foreground/40 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 min-h-11 pr-11 text-xs rounded-xl bg-muted/40 border-border/60 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/10 placeholder:text-muted-foreground/40 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="size-4" strokeWidth={1.8} />
              ) : (
                <Eye className="size-4" strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 min-h-11 rounded-xl text-xs font-bold gap-2 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all w-full cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Ingresando...
            </>
          ) : (
            <>
              <LogIn className="size-4" strokeWidth={2.5} />
              Ingresar al Sistema
            </>
          )}
        </Button>
      </form>

      <div className="rounded-xl bg-muted/40 border border-border/50 p-3 text-[11px] text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground/80">Credenciales de prueba:</p>
        <p>Password común: <code className="bg-background/80 px-1.5 py-0.5 rounded font-mono text-primary font-bold">Rptech2026!</code></p>
        <p>Coordinador: <span className="font-mono text-foreground/90">coordinador@rptech.test</span></p>
        <p>Técnico: <span className="font-mono text-foreground/90">tecnico1@rptech.test</span></p>
      </div>

      <p className="text-center text-[11px] text-muted-foreground/60 border-t border-border/40 pt-4 leading-relaxed">
        ¿Problemas para acceder? Contacta al{' '}
        <span className="font-semibold text-foreground/80">administrador del sistema</span>
      </p>
    </div>
  );
}
