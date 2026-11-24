'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Archive,
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
  '/historico': Archive,
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
                'relative flex size-10 items-center justify-center rounded-lg transition-colors',
                activo ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
              )}
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={activo ? 2.25 : 2} />
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
          'group flex h-10 w-full items-center gap-3 rounded-lg px-3 transition-colors select-none',
          activo
            ? 'bg-sidebar-accent font-semibold text-white shadow-[inset_0_0_0_1px_oklch(1_0_0/0.06)]'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white',
        )}
      >
        <Icon
          className={cn('size-[18px] shrink-0', activo ? 'text-sidebar-primary' : 'opacity-85')}
          strokeWidth={activo ? 2.25 : 2}
        />
        <span className="truncate text-sm leading-none">{item.label}</span>
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
  const iniciales = (sesion.usuario.nombre_completo || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('');
  const rol = NOMBRE_ROL[sesion.rolesVigentes[0]] ?? sesion.rolesVigentes[0];
  const principales = menu.filter((item) => item.href !== '/administracion');
  const gestion = menu.filter((item) => item.href === '/administracion');

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className={cn('bg-sidebar', colapsado ? 'items-center px-1 py-4' : 'px-4 pt-5 pb-4')}>
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="GO SERVICE LATAM"
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-full object-contain shadow-sm"
          />
          {colapsado ? null : (
            <span className="min-w-0 leading-tight">
              <span className="block text-[14px] font-bold tracking-wide text-white">GO SERVICE</span>
              <span className="block text-xs font-semibold text-sidebar-foreground/70 tracking-wider">LATAM</span>
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className={colapsado ? 'items-center px-1 py-2' : 'px-3 py-2'}>
        <SidebarGroup className="p-0">
          <SidebarMenu className="gap-1">
            {principales.map((item) => (
              <ItemMenu key={item.href} item={item} activo={item.href === activo} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {gestion.length > 0 && (
          <SidebarGroup className="mt-3 border-t border-sidebar-border p-0 pt-3">
            {colapsado ? null : (
              <SidebarGroupLabel className="mb-1 h-auto px-3 text-xs font-semibold text-sidebar-foreground/60">Gestión</SidebarGroupLabel>
            )}
            <SidebarMenu className="gap-1">
              {gestion.map((item) => (
                <ItemMenu key={item.href} item={item} activo={item.href === activo} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="bg-sidebar p-3">
        <div className={cn('flex items-center rounded-lg', colapsado ? 'flex-col gap-1.5' : 'gap-2.5 bg-white/5 p-2.5')}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
            {iniciales}
          </span>
          {colapsado ? null : (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-white">{sesion.usuario.nombre_completo}</span>
              <span className="block truncate text-xs text-sidebar-foreground/70">{rol}</span>
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Cerrar sesión"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/80 hover:bg-white/10 hover:text-white"
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

const NOMBRE_ROL: Record<string, string> = {
  superadmin: 'Superadmin',
  gerente: 'Gerente',
  coordinador: 'Coordinador',
  tecnico: 'Técnico',
  consulta: 'Consulta',
  ventas: 'Ventas',
};
