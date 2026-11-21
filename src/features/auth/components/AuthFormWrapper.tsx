import * as React from 'react';
import Image from 'next/image';
import { AuthBrandPanel } from './AuthBrandPanel';
import { FloatingBubbles } from './FloatingBubbles';

interface AuthFormWrapperProps {
  children: React.ReactNode;
}

export function AuthFormWrapper({ children }: AuthFormWrapperProps) {
  return (
    <div className="tema-login min-h-screen flex">
      <AuthBrandPanel />

      <section className="flex-1 relative flex flex-col items-center justify-center bg-background px-6 py-12 overflow-hidden">
        <FloatingBubbles />

        <div className="flex lg:hidden items-center gap-3 mb-8 relative z-10">
          <Image
            src="/logo.png"
            alt="GO SERVICE LATAM"
            width={52}
            height={52}
            className="size-13 rounded-full object-contain shadow-md"
          />
          <div className="leading-tight">
            <span className="block text-xl font-extrabold text-foreground">
              GO SERVICE <span className="text-primary">LATAM</span>
            </span>
            <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Servicio Técnico
            </span>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[420px]">
          <div className="bg-card/90 backdrop-blur-md border border-border/60 rounded-3xl shadow-xl px-8 py-10">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
