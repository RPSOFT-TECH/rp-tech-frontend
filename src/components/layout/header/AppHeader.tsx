'use client';

import { usePathname } from 'next/navigation';
import {
  Bell,
  Calendar,
  ClipboardList,
  FileText,
  PlusCircle,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePageTitle } from '@/components/layout/header/PageTitleContext';
import { ThemeToggle } from '@/components/layout/header/ThemeToggle';

interface RutaMeta {
  titulo: string;
  descripcion?: string;
  icon: LucideIcon;
}

const RUTAS_META: Record<string, RutaMeta> = {
  '/casos': {
    titulo: 'Casos',
    descripcion: 'Listado y seguimiento de órdenes de servicio',
    icon: ClipboardList,
  },
  '/casos/nuevo': {
    titulo: 'Nuevo caso',
    descripcion: 'Apertura de orden técnica de atención',
    icon: PlusCircle,
  },
  '/mis-servicios': {
    titulo: 'Mis servicios',
    descripcion: 'Órdenes asignadas y visitas técnicas',
    icon: Wrench,
  },
  '/administracion': {
    titulo: 'Administración',
    descripcion: 'Gestión del sistema y perfiles',
    icon: ShieldCheck,
  },
  '/agenda': {
    titulo: 'Agenda',
    descripcion: 'Visitas del día por técnico',
    icon: Calendar,
  },
};

function resolverRuta(pathname: string): RutaMeta {
  if (pathname.includes('/reporte')) {
    return {
      titulo: 'Reporte de servicio',
      descripcion: 'Informe de atención técnica, repuestos y firmas',
      icon: FileText,
    };
  }
  if (pathname.startsWith('/casos/') && pathname !== '/casos/nuevo') {
    return {
      titulo: 'Detalle de caso',
      descripcion: 'Información y estado del servicio',
      icon: ClipboardList,
    };
  }
  return RUTAS_META[pathname] ?? {
    titulo: 'RP-TECH',
    descripcion: 'Gestión de servicio técnico',
    icon: ClipboardList,
  };
}

export function AppHeader() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const pagina = usePageTitle();
  const respaldo = resolverRuta(pathname);
  const etiquetaMenu = state === 'collapsed' ? 'Expandir menú' : 'Contraer menú';
  const titulo = pagina.title || respaldo.titulo;
  const subtitulo = pagina.subtitle || respaldo.descripcion;
  const Icon = pagina.icon || respaldo.icon;

  return (
    <header className="glass sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between gap-3 border-b border-border/30 px-4 md:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger
              className="size-9 shrink-0 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              aria-label={etiquetaMenu}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6} className="text-xs font-semibold">
            {etiquetaMenu}
          </TooltipContent>
        </Tooltip>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-3.5 text-primary" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14.5px] leading-tight font-black text-foreground">{titulo}</p>
            {subtitulo ? (
              <p className="hidden truncate text-[11px] leading-tight text-muted-foreground md:block">{subtitulo}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="relative inline-flex size-9 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-2xs hover:bg-muted"
              aria-label="Notificaciones"
            >
              <Bell className="size-4 text-muted-foreground" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-card" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs font-semibold">Notificaciones</TooltipContent>
        </Tooltip>
        <ThemeToggle />
      </div>
    </header>
  );
}
