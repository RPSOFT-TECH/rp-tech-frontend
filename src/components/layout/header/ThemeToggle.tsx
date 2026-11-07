'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-9 rounded-xl" aria-label="Cambiar tema">
              <Sun className="size-4 scale-100 rotate-0 text-primary transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute size-4 scale-0 rotate-90 text-primary transition-all dark:scale-100 dark:rotate-0" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6} className="text-xs font-semibold">
          Cambiar tema
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="rounded-2xl border-border/60 p-1">
        <DropdownMenuItem onSelect={() => setTheme('light')} className="h-10 gap-3 rounded-xl">
          <Sun className="size-4 text-primary" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme('dark')} className="h-10 gap-3 rounded-xl">
          <Moon className="size-4 text-primary" />
          Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme('system')} className="h-10 gap-3 rounded-xl">
          <Monitor className="size-4 text-muted-foreground" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
