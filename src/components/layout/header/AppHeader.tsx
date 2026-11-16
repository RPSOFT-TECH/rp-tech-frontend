'use client';

import { usePathname } from 'next/navigation';
import { Archive,
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
  '/historico': {
    titulo: 'Histórico',
    descripcion: 'Reportes en papel digitalizados',
    icon: Archive,
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
  if (pathname.startsWith('/historico/')) {
    return { titulo: 'Reporte en papel', descripcion: 'Reporte histórico digitalizado por SIREP', icon: Archive };
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
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-3 text-sidebar-foreground sm:border-border sm:bg-card sm:px-6 sm:text-foreground">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger
              className="size-9 shrink-0 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground sm:text-muted-foreground sm:hover:bg-muted sm:hover:text-foreground"
              aria-label={etiquetaMenu}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6} className="text-xs font-semibold">
            {etiquetaMenu}
          </TooltipContent>
        </Tooltip>
        <Icon className="size-5 shrink-0 text-sidebar-primary sm:hidden" strokeWidth={2.2} />
        <div className="min-w-0">
          {subtitulo ? <p className="hidden truncate text-xs leading-tight text-muted-foreground sm:block">{subtitulo}</p> : null}
          <h1 className="truncate text-base leading-tight font-bold tracking-tight text-sidebar-foreground sm:text-lg sm:text-foreground">{titulo}</h1>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
