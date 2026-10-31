'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wrench,
  ClipboardList,
  PlusCircle,
  ShieldCheck,
  LogOut,
  LucideIcon,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { SesionUsuario } from '@/lib/datos-simulados/actions';
import { MenuItem } from '@/lib/permisos';

interface SidebarProps {
  expanded: boolean;
  mobileOpen: boolean;
  sesion: SesionUsuario;
  menu: MenuItem[];
  onNavigate?: () => void;
  onLogout: () => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  '/casos': ClipboardList,
  '/casos/nuevo': PlusCircle,
  '/mis-servicios': Wrench,
  '/administracion': ShieldCheck,
};

function resolveIcon(href: string): LucideIcon {
  return ICON_MAP[href] || ClipboardList;
}

export function Sidebar({
  expanded,
  mobileOpen,
  sesion,
  menu,
  onNavigate,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  function esActivo(href: string) {
    if (href === '/casos' && pathname.startsWith('/casos/nuevo')) {
      return false;
    }
    return pathname === href || pathname.startsWith(href + '/');
  }

  const inicialUsuario = (sesion.usuario.nombre_completo || 'U')[0].toUpperCase();

  const contenido = (
    <div className="flex flex-col h-full bg-card text-foreground border-r border-border select-none">
      <div className={`flex items-center gap-3 border-b border-border p-4 ${expanded ? 'px-5' : 'justify-center px-2'}`}>
        <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
          <Wrench className="size-5 text-primary" strokeWidth={2.2} />
        </div>
        {expanded && (
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-extrabold tracking-tight text-foreground leading-none">
              RP-<span className="text-primary">TECH</span>
            </h1>
            <p className="text-[11px] font-medium text-muted-foreground mt-1 truncate">
              Gestión de Servicio Técnico
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1">
        <span className={`text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block ${expanded ? 'px-3 pt-2' : 'text-center'}`}>
          {expanded ? 'Menú' : '•••'}
        </span>

        {menu.map((item) => {
          const Icon = resolveIcon(item.href);
          const activo = esActivo(item.href);

          const itemNode = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`relative flex items-center gap-3 h-10 rounded-xl transition-all text-xs font-semibold ${
                expanded ? 'px-3' : 'justify-center w-10 mx-auto'
              } ${
                activo
                  ? 'bg-primary/10 text-primary border-l-4 border-primary font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground border-l-4 border-transparent'
              }`}
            >
              <Icon className="size-4 shrink-0" strokeWidth={activo ? 2.4 : 1.8} />
              {expanded && <span className="truncate">{item.label}</span>}
              {!expanded && activo && (
                <span className="size-1.5 rounded-full bg-primary absolute top-2 right-2" />
              )}
            </Link>
          );

          if (expanded) return itemNode;

          return (
            <Tooltip key={item.href} contenido={item.label} posicion="right">
              {itemNode}
            </Tooltip>
          );
        })}
      </div>

      <div className="border-t border-border p-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block ${expanded ? 'px-3 pt-2' : 'text-center'}`}>
          {expanded ? 'Cuenta' : '•••'}
        </span>

        {expanded ? (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-muted/60 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-full bg-secondary text-secondary-foreground font-bold text-xs flex items-center justify-center shrink-0">
                {inicialUsuario}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate leading-tight">
                  {sesion.usuario.nombre_completo}
                </p>
                <p className="text-[10px] text-muted-foreground truncate capitalize">
                  {sesion.rolesVigentes[0]}
                </p>
              </div>
            </div>
            <LogOut className="size-4 text-muted-foreground group-hover:text-destructive transition-colors shrink-0" />
          </button>
        ) : (
          <Tooltip contenido="Cerrar sesión" posicion="right">
            <button
              type="button"
              onClick={onLogout}
              className="size-10 mx-auto flex items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out ${
          expanded ? 'w-60' : 'w-18'
        }`}
      >
        {contenido}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onNavigate}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {contenido}
          </div>
        </div>
      )}
    </>
  );
}
