'use client';

import { usePathname } from 'next/navigation';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  ClipboardList,
  PlusCircle,
  Wrench,
  ShieldCheck,
  FileText,
  LucideIcon,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

interface HeaderProps {
  expanded: boolean;
  onToggleSidebar: () => void;
}

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
    titulo: 'Nuevo Caso',
    descripcion: 'Apertura de orden técnica de atención',
    icon: PlusCircle,
  },
  '/mis-servicios': {
    titulo: 'Mis Servicios',
    descripcion: 'Órdenes asignadas y visitas técnicas',
    icon: Wrench,
  },
  '/administracion': {
    titulo: 'Administración',
    descripcion: 'Gestión del sistema y perfiles',
    icon: ShieldCheck,
  },
};

function resolverRuta(pathname: string): RutaMeta {
  if (pathname.includes('/reporte')) {
    return {
      titulo: 'Reporte de Servicio',
      descripcion: 'Informe de atención técnica, repuestos y firmas',
      icon: FileText,
    };
  }
  if (pathname.startsWith('/casos/') && pathname !== '/casos/nuevo') {
    return {
      titulo: 'Detalle de Caso',
      descripcion: 'Información y estado del servicio',
      icon: ClipboardList,
    };
  }
  return (
    RUTAS_META[pathname] || {
      titulo: 'RP-TECH',
      descripcion: 'Gestión de servicio técnico',
      icon: ClipboardList,
    }
  );
}

export function Header({ expanded, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const meta = resolverRuta(pathname);
  const Icon = meta.icon;

  const toggleLabel = expanded ? 'Colapsar menú' : 'Expandir menú';

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md select-none">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Tooltip contenido={toggleLabel}>
          <button
            type="button"
            onClick={onToggleSidebar}
            className="size-9 shrink-0 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label={toggleLabel}
          >
            {expanded ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </button>
        </Tooltip>

        <div className="flex min-w-0 items-center gap-2.5">
          <div className="size-8 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Icon className="size-4" strokeWidth={2} />
          </div>
          <div className="flex min-w-0 flex-col justify-center leading-none">
            <h1 className="truncate text-xs sm:text-sm font-bold text-foreground">
              {meta.titulo}
            </h1>
            {meta.descripcion && (
              <p className="mt-1 hidden truncate text-[11px] text-muted-foreground md:block">
                {meta.descripcion}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Tooltip contenido="Notificaciones">
          <button
            type="button"
            className="relative size-9 inline-flex items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
            aria-label="Notificaciones"
          >
            <Bell className="size-4 text-muted-foreground" />
            <span className="size-2 rounded-full bg-primary absolute top-2 right-2 ring-2 ring-card" />
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
