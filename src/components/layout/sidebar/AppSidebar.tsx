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
import type { SesionUsuario } from '@/lib/datos-simulados/actions';
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

function esActivo(href: string, pathname: string) {
  if (href === '/casos' && pathname.startsWith('/casos/nuevo')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ItemMenu({ item, activo }: { item: MenuItem; activo: boolean }) {
  const { state } = useSidebar();
  const Icon = ICONOS[item.href] ?? ClipboardList;
  const colapsado = state === 'collapsed';

  const enlace = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center rounded-xl transition-colors',
        colapsado ? 'size-9 justify-center' : 'h-10 w-full gap-3 px-3',
        activo ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground/80 hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={activo ? 2.4 : 1.8} />
      {colapsado ? null : <span className="truncate text-[13px]">{item.label}</span>}
    </Link>
  );

  return (
    <SidebarMenuItem className={colapsado ? 'flex justify-center' : undefined}>
      {colapsado ? (
        <Tooltip>
          <TooltipTrigger asChild>{enlace}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-semibold">{item.label}</TooltipContent>
        </Tooltip>
      ) : enlace}
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
  const inicial = (sesion.usuario.nombre_completo || 'U')[0]?.toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className={cn('border-b border-sidebar-border', colapsado ? 'items-center px-2' : 'px-4')}>
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <Wrench className="size-5 text-primary" strokeWidth={2.2} />
          </div>
          {colapsado ? null : (
            <div className="min-w-0">
              <p className="text-base leading-none font-extrabold tracking-tight">
                RP-<span className="text-primary">TECH</span>
              </p>
              <p className="mt-1 truncate text-[11px] text-muted-foreground">Gestión de Servicio Técnico</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className={colapsado ? 'items-center px-1.5 py-3' : 'px-3 py-4'}>
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className={cn('text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase', colapsado && 'sr-only')}>
            Menú
          </SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {menu.map((item) => (
              <ItemMenu key={item.href} item={item} activo={esActivo(item.href, pathname)} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            'flex items-center rounded-xl text-left hover:bg-muted/60',
            colapsado ? 'mx-auto size-10 justify-center' : 'w-full justify-between gap-2 px-3 py-2',
          )}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {inicial}
            </span>
            {colapsado ? null : (
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold">{sesion.usuario.nombre_completo}</span>
                <span className="block truncate text-[10px] text-muted-foreground capitalize">{sesion.rolesVigentes[0]}</span>
              </span>
            )}
          </span>
          {colapsado ? null : <LogOut className="size-4 shrink-0 text-muted-foreground" />}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
