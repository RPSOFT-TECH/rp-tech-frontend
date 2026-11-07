'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  ClipboardList,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SesionUsuario } from '@/lib/datos/actions';
import type { MenuItem } from '@/lib/permisos';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const ICONOS: Record<string, LucideIcon> = {
  '/casos': ClipboardList,
  '/casos/nuevo': PlusCircle,
  '/mis-servicios': Wrench,
  '/administracion': ShieldCheck,
  '/agenda': Calendar,
};

function hrefActivo(menu: MenuItem[], pathname: string): string | null {
  let mejor: string | null = null;
  for (const item of menu) {
    const coincide = pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (!coincide) continue;
    if (!mejor || item.href.length > mejor.length) mejor = item.href;
  }
  return mejor;
}

function ItemMenu({ item, activo }: { item: MenuItem; activo: boolean }) {
  const { state } = useSidebar();
  const Icon = ICONOS[item.href] ?? ClipboardList;
  const colapsado = state === 'collapsed';

  if (colapsado) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuItem className="flex justify-center">
            <Link
              href={item.href}
              aria-label={item.label}
              className={cn(
                'relative flex size-9 items-center justify-center rounded-lg transition-colors',
                activo ? 'bg-primary/12 text-primary' : 'text-foreground hover:bg-muted/70',
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={activo ? 2.25 : 2} />
              {activo ? <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary" /> : null}
            </Link>
          </SidebarMenuItem>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="text-xs font-semibold">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <SidebarMenuItem>
      <Link
        href={item.href}
        className={cn(
          'group flex h-9 w-full items-center gap-2 rounded-lg px-2.5 transition-colors select-none',
          activo ? 'bg-primary/10 font-semibold text-foreground' : 'text-foreground hover:bg-muted/60',
        )}
      >
        <Icon
          className={cn('size-4 shrink-0', activo ? 'text-primary' : 'text-foreground/80 group-hover:text-foreground')}
          strokeWidth={activo ? 2.25 : 2}
        />
        <span className="truncate text-[13px] leading-none">{item.label}</span>
      </Link>
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  sesion,
  menu,
  onLogout,
}: {
  sesion: SesionUsuario;
  menu: MenuItem[];
  onLogout: () => void;
}) {
  const { state } = useSidebar();
  const pathname = usePathname();
  const colapsado = state === 'collapsed';
  const activo = hrefActivo(menu, pathname);
  const inicial = (sesion.usuario.nombre_completo || 'U')[0]?.toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className={cn('min-h-12 border-b border-sidebar-border bg-sidebar', colapsado ? 'items-center justify-center px-1 py-2' : 'px-3 py-2')}>
        <p className={cn('leading-none font-extrabold tracking-tight', colapsado ? 'text-center text-[10px]' : 'text-base')}>
          RP-<span className="text-primary">TECH</span>
        </p>
      </SidebarHeader>
      <SidebarContent className={colapsado ? 'items-center px-1 py-2' : 'px-2 py-2'}>
        <SidebarGroup className="p-0">
          {colapsado ? (
            <div className="mx-auto my-1 h-px w-5 bg-border/40" />
          ) : (
            <SidebarGroupLabel className="mb-1 h-auto px-2.5 text-[10px] font-bold tracking-[0.16em] text-muted-foreground/70 uppercase">
              Menú
            </SidebarGroupLabel>
          )}
          <SidebarMenu className="gap-0.5">
            {menu.map((item) => (
              <ItemMenu key={item.href} item={item} activo={item.href === activo} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-2">
        <div className={cn('flex items-center', colapsado ? 'flex-col gap-1.5' : 'gap-2 px-1')}>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
            {inicial}
          </span>
          {colapsado ? null : (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold">{sesion.usuario.nombre_completo}</span>
              <span className="block truncate text-[10px] text-muted-foreground capitalize">{sesion.rolesVigentes[0]}</span>
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Cerrar sesión"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              >
                <LogOut className="size-4" strokeWidth={2} />
              </button>
            </TooltipTrigger>
            <TooltipContent side={colapsado ? 'right' : 'top'} sideOffset={8} className="text-xs font-semibold">
              Cerrar sesión
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
