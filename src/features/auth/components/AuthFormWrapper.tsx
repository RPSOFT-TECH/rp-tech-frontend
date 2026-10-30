import * as React from 'react';
import { Wrench } from 'lucide-react';
import { AuthBrandPanel } from './AuthBrandPanel';
import { FloatingBubbles } from './FloatingBubbles';

interface AuthFormWrapperProps {
  children: React.ReactNode;
}

export function AuthFormWrapper({ children }: AuthFormWrapperProps) {
  return (
    <div className="min-h-screen flex">
      <AuthBrandPanel />

      <section className="flex-1 relative flex flex-col items-center justify-center bg-background px-6 py-12 overflow-hidden">
        <FloatingBubbles />

        <div className="flex lg:hidden items-center gap-3 mb-8 relative z-10">
          <div className="size-11 rounded-2xl bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center">
            <Wrench className="size-6 text-primary" strokeWidth={2} />
          </div>
          <span className="text-xl font-extrabold text-foreground">
            RP-<span className="text-primary">TECH</span>
          </span>
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
